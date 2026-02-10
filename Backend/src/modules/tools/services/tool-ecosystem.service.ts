import { DynamicStructuredTool } from '@langchain/core/tools';
import { Types } from 'mongoose';
import { z } from 'zod';
import { logger } from '../../../shared/utils/logger.util';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  author: string;
  schema: z.ZodObject<any>;
  implementation: (args: any) => Promise<any>;
  metadata?: {
    cost?: number;
    rateLimit?: number;
    timeout?: number;
    requiresAuth?: boolean;
    authType?: 'oauth' | 'api_key' | 'basic' | 'bearer';
    permissions?: string[];
    supportedPlatforms?: string[];
    documentationUrl?: string;
    examples?: Array<{
      input: any;
      output: any;
      description: string;
    }>;
  };
  stats?: {
    usageCount: number;
    successRate: number;
    averageExecutionTime: number;
    lastUsed?: Date;
    errorCount: number;
  };
}

export interface ToolRegistry {
  [category: string]: {
    [toolId: string]: ToolDefinition;
  };
}

export interface ToolExecutionContext {
  userId: Types.ObjectId;
  workflowId?: Types.ObjectId;
  executionId?: string;
  nodeId?: string;
  sessionId?: string;
  correlationId?: string;
}

export interface ToolExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  executionTime: number;
  toolId: string;
  toolVersion: string;
  metadata?: Record<string, any>;
}

export class ToolEcosystemService {
  private toolRegistry: ToolRegistry = {};
  private activeTools: Map<string, DynamicStructuredTool> = new Map();

  /**
   * Register a tool in the ecosystem
   */
  registerTool(toolDef: ToolDefinition): void {
    const category = toolDef.category;

    if (!this.toolRegistry[category]) {
      this.toolRegistry[category] = {};
    }

    this.toolRegistry[category][toolDef.id] = toolDef;

    // Create LangChain tool wrapper
    const langChainTool = new DynamicStructuredTool({
      name: toolDef.name,
      description: toolDef.description,
      schema: toolDef.schema as any,
      func: async (args: any, context?: any) => {
        return this.executeTool(toolDef.id, args, context);
      },
    } as any);

    this.activeTools.set(toolDef.id, langChainTool);

    logger.info('Tool registered in ecosystem', {
      toolId: toolDef.id,
      name: toolDef.name,
      category: toolDef.category,
      version: toolDef.version,
    });
  }

  /**
   * Unregister a tool from the ecosystem
   */
  unregisterTool(toolId: string): boolean {
    let removed = false;

    for (const category of Object.keys(this.toolRegistry)) {
      if (this.toolRegistry[category][toolId]) {
        delete this.toolRegistry[category][toolId];
        removed = true;
        break;
      }
    }

    if (removed) {
      this.activeTools.delete(toolId);
      logger.info('Tool unregistered from ecosystem', { toolId });
    }

    return removed;
  }

  /**
   * Get a tool by ID
   */
  getTool(toolId: string): ToolDefinition | null {
    for (const category of Object.keys(this.toolRegistry)) {
      if (this.toolRegistry[category][toolId]) {
        return this.toolRegistry[category][toolId];
      }
    }
    return null;
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string): ToolDefinition[] {
    return Object.values(this.toolRegistry[category] || {});
  }

  /**
   * Get tools by tags
   */
  getToolsByTags(tags: string[]): ToolDefinition[] {
    const allTools: ToolDefinition[] = [];

    for (const category of Object.keys(this.toolRegistry)) {
      for (const tool of Object.values(this.toolRegistry[category])) {
        if (tags.some(tag => tool.tags.includes(tag))) {
          allTools.push(tool);
        }
      }
    }

    return allTools;
  }

  /**
   * Search tools by name or description
   */
  searchTools(query: string): ToolDefinition[] {
    const allTools: ToolDefinition[] = this.getAllTools();
    const lowerQuery = query.toLowerCase();

    return allTools.filter(tool =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get all registered tools
   */
  getAllTools(): ToolDefinition[] {
    const allTools: ToolDefinition[] = [];

    for (const category of Object.keys(this.toolRegistry)) {
      allTools.push(...Object.values(this.toolRegistry[category]));
    }

    return allTools;
  }

  /**
   * Get tool categories
   */
  getCategories(): string[] {
    return Object.keys(this.toolRegistry);
  }

  /**
   * Get LangChain tool by ID
   */
  getLangChainTool(toolId: string): DynamicStructuredTool | null {
    return this.activeTools.get(toolId) || null;
  }

  /**
   * Get multiple LangChain tools by IDs
   */
  getLangChainTools(toolIds: string[]): DynamicStructuredTool[] {
    return toolIds
      .map(id => this.activeTools.get(id))
      .filter((tool): tool is DynamicStructuredTool => tool !== undefined);
  }

  /**
   * Execute a tool with monitoring and error handling
   */
  async executeTool(
    toolId: string,
    args: any,
    context?: ToolExecutionContext
  ): Promise<any> {
    const toolDef = this.getTool(toolId);
    if (!toolDef) {
      throw new Error(`Tool not found: ${toolId}`);
    }

    const startTime = Date.now();
    let result: ToolExecutionResult;

    try {
      // Execute the tool
      const output = await toolDef.implementation(args);

      const executionTime = Date.now() - startTime;
      result = {
        success: true,
        output,
        executionTime,
        toolId,
        toolVersion: toolDef.version,
        metadata: {
          category: toolDef.category,
          userId: context?.userId?.toString(),
          workflowId: context?.workflowId?.toString(),
          executionId: context?.executionId,
        },
      };

      // Update tool statistics
      this.updateToolStats(toolId, true, executionTime);

      // Log successful execution
      logger.info('Tool executed successfully', {
        toolId,
        toolName: toolDef.name,
        executionTime,
        userId: context?.userId?.toString(),
        workflowId: context?.workflowId?.toString(),
        executionId: context?.executionId,
      });

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      result = {
        success: false,
        error: error.message,
        executionTime,
        toolId,
        toolVersion: toolDef.version,
        metadata: {
          category: toolDef.category,
          userId: context?.userId?.toString(),
          workflowId: context?.workflowId?.toString(),
          executionId: context?.executionId,
          errorType: error.constructor.name,
        },
      };

      // Update tool statistics
      this.updateToolStats(toolId, false, executionTime);

      // Log error
      logger.error('Tool execution failed', {
        toolId,
        toolName: toolDef.name,
        error: error.message,
        executionTime,
        userId: context?.userId?.toString(),
        workflowId: context?.workflowId?.toString(),
        executionId: context?.executionId,
      });
    }

    return result;
  }

  /**
   * Update tool statistics
   */
  private updateToolStats(toolId: string, success: boolean, executionTime: number): void {
    const toolDef = this.getTool(toolId);
    if (!toolDef) return;

    if (!toolDef.stats) {
      toolDef.stats = {
        usageCount: 0,
        successRate: 0,
        averageExecutionTime: 0,
        errorCount: 0,
      };
    }

    const stats = toolDef.stats;
    stats.usageCount++;

    if (success) {
      // Update success rate using rolling average
      const total = stats.usageCount;
      const currentSuccessRate = stats.successRate;
      stats.successRate = ((currentSuccessRate * (total - 1)) + 100) / total;
    } else {
      stats.errorCount++;
      // Update success rate using rolling average
      const total = stats.usageCount;
      const currentSuccessRate = stats.successRate;
      stats.successRate = (currentSuccessRate * (total - 1)) / total;
    }

    // Update average execution time using rolling average
    const total = stats.usageCount;
    const currentAvg = stats.averageExecutionTime;
    stats.averageExecutionTime = ((currentAvg * (total - 1)) + executionTime) / total;

    stats.lastUsed = new Date();
  }

  /**
   * Get tool statistics
   */
  getToolStats(toolId: string): ToolDefinition['stats'] | null {
    const toolDef = this.getTool(toolId);
    return toolDef?.stats || null;
  }

  /**
   * Get ecosystem statistics
   */
  getEcosystemStats(): {
    totalTools: number;
    categories: Record<string, number>;
    totalUsage: number;
    averageSuccessRate: number;
    mostUsedTools: Array<{ toolId: string; usageCount: number; name: string }>;
    failingTools: Array<{ toolId: string; successRate: number; name: string }>;
  } {
    const allTools = this.getAllTools();
    const categories: Record<string, number> = {};
    let totalUsage = 0;
    let totalSuccessRate = 0;
    let toolsWithStats = 0;

    const toolUsage: Array<{ toolId: string; usageCount: number; name: string }> = [];
    const toolSuccess: Array<{ toolId: string; successRate: number; name: string }> = [];

    for (const tool of allTools) {
      // Count categories
      categories[tool.category] = (categories[tool.category] || 0) + 1;

      // Aggregate statistics
      if (tool.stats) {
        totalUsage += tool.stats.usageCount;
        totalSuccessRate += tool.stats.successRate;
        toolsWithStats++;

        toolUsage.push({
          toolId: tool.id,
          usageCount: tool.stats.usageCount,
          name: tool.name,
        });

        toolSuccess.push({
          toolId: tool.id,
          successRate: tool.stats.successRate,
          name: tool.name,
        });
      }
    }

    // Sort and get top/bottom performers
    toolUsage.sort((a, b) => b.usageCount - a.usageCount);
    toolSuccess.sort((a, b) => a.successRate - b.successRate);

    return {
      totalTools: allTools.length,
      categories,
      totalUsage,
      averageSuccessRate: toolsWithStats > 0 ? totalSuccessRate / toolsWithStats : 0,
      mostUsedTools: toolUsage.slice(0, 10),
      failingTools: toolSuccess.filter(t => t.successRate < 80).slice(0, 10),
    };
  }

  /**
   * Validate tool definition
   */
  validateToolDefinition(toolDef: Partial<ToolDefinition>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!toolDef.id) errors.push('Tool ID is required');
    if (!toolDef.name) errors.push('Tool name is required');
    if (!toolDef.description) errors.push('Tool description is required');
    if (!toolDef.category) errors.push('Tool category is required');
    if (!toolDef.version) errors.push('Tool version is required');
    if (!toolDef.author) errors.push('Tool author is required');
    if (!toolDef.schema) errors.push('Tool schema is required');
    if (!toolDef.implementation) errors.push('Tool implementation is required');

    if (toolDef.tags && !Array.isArray(toolDef.tags)) {
      errors.push('Tags must be an array');
    }

    // Validate schema
    if (toolDef.schema && !(toolDef.schema instanceof z.ZodObject)) {
      errors.push('Schema must be a ZodObject');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create a tool from a definition
   */
  createTool(definition: Omit<ToolDefinition, 'id'> & { id?: string }): ToolDefinition {
    const toolDef: ToolDefinition = {
      id: definition.id || `${definition.category}_${definition.name}_${Date.now()}`,
      ...definition,
    };

    const validation = this.validateToolDefinition(toolDef);
    if (!validation.valid) {
      throw new Error(`Invalid tool definition: ${validation.errors.join(', ')}`);
    }

    return toolDef;
  }

  /**
   * Load built-in tools
   */
  async loadBuiltInTools(): Promise<void> {
    // Load built-in integrations
    await this.loadSlackTools();
    await this.loadGitHubTools();
    await this.loadGoogleSheetsTools();
    await this.loadWebScrapingTools();
    await this.loadDatabaseTools();
    await this.loadFileSystemTools();
    await this.loadEmailTools();
    await this.loadHttpTools();
    await this.loadDateTimeTools();
    await this.loadMathTools();
    await this.loadTextProcessingTools();

    logger.info('Built-in tools loaded', {
      totalTools: this.getAllTools().length,
      categories: this.getCategories(),
    });
  }

  // Built-in tool implementations (simplified examples)

  private async loadSlackTools(): Promise<void> {
    const slackMessageTool = this.createTool({
      name: 'slack_send_message',
      description: 'Send a message to a Slack channel',
      category: 'communication',
      tags: ['slack', 'messaging', 'notification'],
      version: '1.0.0',
      author: 'Flowversal',
      schema: z.object({
        channel: z.string().describe('Slack channel name or ID'),
        message: z.string().describe('Message to send'),
        username: z.string().optional().describe('Username to send as'),
      }),
      implementation: async (args) => {
        // Placeholder implementation
        logger.info('Slack message tool called', { channel: args.channel });
        return { success: true, messageId: `msg_${Date.now()}` };
      },
    });

    this.registerTool(slackMessageTool);
  }

  private async loadGitHubTools(): Promise<void> {
    const githubCreateIssueTool = this.createTool({
      name: 'github_create_issue',
      description: 'Create a new issue in a GitHub repository',
      category: 'development',
      tags: ['github', 'issues', 'repository'],
      version: '1.0.0',
      author: 'Flowversal',
      schema: z.object({
        owner: z.string().describe('Repository owner'),
        repo: z.string().describe('Repository name'),
        title: z.string().describe('Issue title'),
        body: z.string().describe('Issue body'),
        labels: z.array(z.string()).optional().describe('Issue labels'),
      }),
      implementation: async (args) => {
        // Placeholder implementation
        logger.info('GitHub create issue tool called', { repo: `${args.owner}/${args.repo}` });
        return { success: true, issueNumber: Math.floor(Math.random() * 1000) };
      },
    });

    this.registerTool(githubCreateIssueTool);
  }

  private async loadGoogleSheetsTools(): Promise<void> {
    const sheetsAppendRowTool = this.createTool({
      name: 'sheets_append_row',
      description: 'Append a row to a Google Sheets spreadsheet',
      category: 'data',
      tags: ['google', 'sheets', 'spreadsheet'],
      version: '1.0.0',
      author: 'Flowversal',
      schema: z.object({
        spreadsheetId: z.string().describe('Google Sheets spreadsheet ID'),
        range: z.string().describe('Range to append to (e.g., "Sheet1!A:B")'),
        values: z.array(z.array(z.any())).describe('Row values to append'),
      }),
      implementation: async (args) => {
        // Placeholder implementation
        logger.info('Google Sheets append tool called', { spreadsheetId: args.spreadsheetId });
        return { success: true, updatedRange: args.range };
      },
    });

    this.registerTool(sheetsAppendRowTool);
  }

  private async loadWebScrapingTools(): Promise<void> {
    const webScrapeTool = this.createTool({
      name: 'web_scrape',
      description: 'Scrape content from a web page',
      category: 'data',
      tags: ['web', 'scraping', 'content'],
      version: '1.0.0',
      author: 'Flowversal',
      schema: z.object({
        url: z.string().url().describe('URL to scrape'),
        selector: z.string().optional().describe('CSS selector to extract specific content'),
        maxLength: z.number().optional().describe('Maximum content length'),
      }),
      implementation: async (args) => {
        // Placeholder implementation
        logger.info('Web scraping tool called', { url: args.url });
        return {
          success: true,
          content: `Scraped content from ${args.url}`,
          length: 100
        };
      },
    });

    this.registerTool(webScrapeTool);
  }

  private async loadDatabaseTools(): Promise<void> {
    const dbQueryTool = this.createTool({
      name: 'database_query',
      description: 'Execute a database query',
      category: 'data',
      tags: ['database', 'query', 'sql'],
      version: '1.0.0',
      author: 'Flowversal',
      schema: z.object({
        connectionString: z.string().describe('Database connection string'),
        query: z.string().describe('SQL query to execute'),
        parameters: z.array(z.any()).optional().describe('Query parameters'),
      }),
      implementation: async (args) => {
        // Placeholder implementation - in real implementation, this would connect to actual database
        logger.info('Database query tool called', { queryLength: args.query.length });
        return { success: true, rows: [], affectedRows: 0 };
      },
    });

    this.registerTool(dbQueryTool);
  }

  private async loadFileSystemTools(): Promise<void> {
    const fileReadTool = this.createTool({
      name: 'file_read',
      description: 'Read content from a file',
      category: 'file_system',
      tags: ['file', 'read', 'content'],
      version: '1.0.0',
      author: 'Flowversal',
      schema: z.object({
        path: z.string().describe('File path to read'),
        encoding: z.string().optional().describe('File encoding (default: utf8)'),
        maxLength: z.number().optional().describe('Maximum bytes to read'),
      }),
      implementation: async (args) => {
        // Placeholder implementation - in real implementation, this would read actual files
        logger.info('File read tool called', { path: args.path });
        return { success: true, content: 'File content', size: 100 };
      },
    });

    this.registerTool(fileReadTool);
  }

  private async loadEmailTools(): Promise<void> {
    const emailSendTool = this.createTool({
      name: 'email_send',
      description: 'Send an email',
      category: 'communication',
      tags: ['email', 'send', 'notification'],
      version: '1.0.0',
      author: 'Flowversal',
      schema: z.object({
        to: z.union([z.string(), z.array(z.string())]).describe('Recipient email(s)'),
        subject: z.string().describe('Email subject'),
        body: z.string().describe('Email body'),
        html: z.boolean().optional().describe('Whether body is HTML'),
        attachments: z.array(z.object({
          filename: z.string(),
          content: z.string(),
          encoding: z.string().optional(),
        })).optional().describe('Email attachments'),
      }),
      implementation: async (args) => {
        // Placeholder implementation
        logger.info('Email send tool called', { to: Array.isArray(args.to) ? args.to.length : 1, subject: args.subject });
        return { success: true, messageId: `email_${Date.now()}` };
      },
    });

    this.registerTool(emailSendTool);
  }

  private async loadHttpTools(): Promise<void> {
    const httpRequestTool = this.createTool({
      name: 'http_request',
      description: 'Make an HTTP request',
      category: 'network',
      tags: ['http', 'api', 'request'],
      version: '1.0.0',
      author: 'Flowversal',
      schema: z.object({
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).describe('HTTP method'),
        url: z.string().url().describe('Request URL'),
        headers: z.record(z.string()).optional().describe('Request headers'),
        body: z.any().optional().describe('Request body'),
        timeout: z.number().optional().describe('Request timeout in milliseconds'),
      }),
      implementation: async (args) => {
        // Placeholder implementation
        logger.info('HTTP request tool called', { method: args.method, url: args.url });
        return {
          success: true,
          status: 200,
          headers: { 'content-type': 'application/json' },
          body: { message: 'Success' }
        };
      },
    });

    this.registerTool(httpRequestTool);
  }

  private async loadDateTimeTools(): Promise<void> {
    const dateFormatTool = this.createTool({
      name: 'date_format',
      description: 'Format a date/time',
      category: 'utility',
      tags: ['date', 'time', 'format'],
      version: '1.0.0',
      author: 'Flowversal',
      schema: z.object({
        date: z.union([z.string(), z.number(), z.date()]).describe('Date to format'),
        format: z.string().optional().describe('Output format (default: ISO string)'),
        timezone: z.string().optional().describe('Timezone (default: UTC)'),
      }),
      implementation: async (args) => {
        const date = new Date(args.date);
        const formatted = args.format ? date.toLocaleString(args.timezone || 'UTC', { dateStyle: 'full', timeStyle: 'full' }) : date.toISOString();
        return { success: true, formatted, original: args.date };
      },
    });

    this.registerTool(dateFormatTool);
  }

  private async loadMathTools(): Promise<void> {
    const mathCalculateTool = this.createTool({
      name: 'math_calculate',
      description: 'Perform mathematical calculations',
      category: 'utility',
      tags: ['math', 'calculation', 'arithmetic'],
      version: '1.0.0',
      author: 'Flowversal',
      schema: z.object({
        expression: z.string().describe('Mathematical expression to evaluate'),
        precision: z.number().optional().describe('Decimal precision for result'),
      }),
      implementation: async (args) => {
        // Simple expression evaluator - in production, use a safe math library
        try {
          // This is unsafe - use a proper math expression evaluator in production
          const result = eval(args.expression);
          return {
            success: true,
            result: args.precision ? Number(result.toFixed(args.precision)) : result,
            expression: args.expression
          };
        } catch (error: any) {
          throw new Error(`Invalid mathematical expression: ${error.message}`);
        }
      },
    });

    this.registerTool(mathCalculateTool);
  }

  private async loadTextProcessingTools(): Promise<void> {
    const textAnalyzeTool = this.createTool({
      name: 'text_analyze',
      description: 'Analyze text content',
      category: 'text',
      tags: ['text', 'analysis', 'nlp'],
      version: '1.0.0',
      author: 'Flowversal',
      schema: z.object({
        text: z.string().describe('Text to analyze'),
        operations: z.array(z.enum(['word_count', 'sentence_count', 'sentiment', 'keywords', 'summary'])).describe('Analysis operations to perform'),
      }),
      implementation: async (args) => {
        const result: any = { success: true, text: args.text };

        if (args.operations.includes('word_count')) {
          result.wordCount = args.text.split(/\s+/).length;
        }

        if (args.operations.includes('sentence_count')) {
          result.sentenceCount = args.text.split(/[.!?]+/).length - 1;
        }

        if (args.operations.includes('sentiment')) {
          // Simple sentiment analysis
          const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful'];
          const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'poor'];

          const words = args.text.toLowerCase().split(/\s+/);
          const positiveCount = words.filter((w: string) => positiveWords.includes(w)).length;
          const negativeCount = words.filter((w: string) => negativeWords.includes(w)).length;

          if (positiveCount > negativeCount) result.sentiment = 'positive';
          else if (negativeCount > positiveCount) result.sentiment = 'negative';
          else result.sentiment = 'neutral';
        }

        if (args.operations.includes('keywords')) {
          // Simple keyword extraction
          const words = args.text.toLowerCase().split(/\s+/);
          const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
          result.keywords = [...new Set(words.filter((w: string) => w.length > 3 && !stopWords.includes(w)))].slice(0, 10);
        }

        if (args.operations.includes('summary')) {
          // Simple text summarization
          const sentences = args.text.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
          result.summary = sentences.slice(0, 2).join('. ') + '.';
        }

        return result;
      },
    });

    this.registerTool(textAnalyzeTool);
  }
}

export const toolEcosystemService = new ToolEcosystemService();
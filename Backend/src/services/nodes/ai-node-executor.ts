import { mcpServer } from '../../agents/mcp/server';
import { langChainAgentService } from '../../modules/ai/services/ai/langchain-agent.service';
import { ChatMessage, langChainService } from '../../modules/ai/services/ai/langchain.service';
import { ModelRoutingOptions } from '../../modules/ai/services/ai/model-decision.types';
// import { modelRouterService } from '../../modules/ai/services/ai/model-router.service';
import { ExecutionContext } from '../../modules/workflows/services/workflow-execution/types/workflow-execution.types';
import { logger } from '../../shared/utils/logger.util';
import { CircuitBreaker } from '../../shared/utils/retry.util';
import { retrievalService } from '../rag/retrieval.service';

export interface AINodeConfig {
  prompt?: string;
  messages?: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  modelType?: 'vllm' | 'openrouter' | 'local';
  remoteModel?: 'gpt4' | 'claude' | 'gemini';
  temperature?: number;
  maxTokens?: number;
  useTools?: boolean;
  tools?: string[];
  systemPrompt?: string;
  rag?: {
    enabled?: boolean;
    query?: string;
    topK?: number;
    minScore?: number;
    modelType?: 'vllm' | 'openrouter' | 'local';
    remoteModel?: 'gpt4' | 'claude' | 'gemini';
  };
}

export class AINodeExecutor {
  // Circuit breaker for AI API calls to prevent cascading failures
  private aiCircuitBreaker = new CircuitBreaker(5, 60000, 30000);

  /**
   * Execute AI chat node with retry logic
   */
  async executeAIChatNode(node: any, context: ExecutionContext): Promise<any> {
    const config: AINodeConfig = node.config || {};
    const ragConfig = config.rag || (node as any).rag;

    // Build messages from context or config
    const messages = this.buildMessages(config, context);

    // Optional RAG augmentation: retrieve context and answer with citations
    if (ragConfig?.enabled) {
      const queryPrompt = this.resolvePrompt(
        ragConfig.query || config.prompt || config.messages?.map((m) => m.content).join('\n') || '',
        context
      );

      const ragResult = await retrievalService.retrieveAndGenerate(queryPrompt, {
        topK: ragConfig.topK,
        minScore: ragConfig.minScore,
        userId: context.execution.userId?.toString?.(),
        modelType: ragConfig.modelType || config.modelType,
        remoteModel: ragConfig.remoteModel || config.remoteModel,
      });

      return {
        response: ragResult.answer,
        model: ragResult.model,
        sources: ragResult.sources,
        rag: true,
        query: queryPrompt,
      };
    }

    // Use intelligent model routing with scoring and fallbacks
    const promptText = config.prompt || config.messages?.map((m) => m.content).join('\n') || '';
    const systemPrompt = config.systemPrompt;

    // Prepare routing options
    const routingOptions: ModelRoutingOptions = {
      taskType: config.modelType as any, // Will be auto-detected if not provided
      userSpecifiedTemperature: config.temperature,
      userTier: 'standard', // Could be extracted from context in the future
      enableScoring: true,
      maxRetries: 2,
    };

    try {
      // Use circuit breaker for the entire routing process
      const routingResult = await this.aiCircuitBreaker.execute(() =>
        modelRouterService.smartRoute(promptText, systemPrompt, routingOptions)
      );

      // Convert routing result to chat completion format
      const chatMessages = messages as ChatMessage[];

      // Use the routed model for chat completion
      const result = await langChainService.chatCompletion(chatMessages, {
        modelType: routingResult.provider as any,
        remoteModel: routingResult.provider === 'openrouter' ? config.remoteModel || 'claude' : undefined,
        temperature: routingResult.temperature,
        maxTokens: config.maxTokens,
        useLangChain: true,
        customModel: routingResult.model, // Pass the routed model directly
      });

      if (!result.success) {
        logger.error('AI chat node execution failed with routed model', result.error, {
          nodeId: node.id,
          executionId: context.execution._id.toString(),
          routedProvider: routingResult.provider,
          confidence: routingResult.confidence,
        });
        throw result.error;
      }

      return {
        response: result.result,
        model: routingResult.provider,
        confidence: routingResult.confidence,
        temperature: routingResult.temperature,
        routingPath: routingResult.routingPath,
        scoreResult: routingResult.scoreResult,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      logger.error('AI chat node routing failed completely', error, {
        nodeId: node.id,
        executionId: context.execution._id.toString(),
        prompt: promptText.substring(0, 200),
      });
      throw error;
    }
  }

  /**
   * Execute AI agent node with tool calling
   */
  async executeAIAgentNode(node: any, context: ExecutionContext): Promise<any> {
    const config: AINodeConfig = node.config || {};
    const sessionId = `workflow-${context.workflow._id}-${context.execution._id}`;
    const userId = context.execution.userId.toString();

    // Build initial prompt
    const prompt = this.resolvePrompt(config.prompt || '', context);
    const systemPrompt = config.systemPrompt || 'You are a helpful AI assistant with access to tools.';

    // If tools are enabled, use LangChain agent with MCP tools
    if (config.useTools && config.tools && config.tools.length > 0) {
      try {
        // Use intelligent model routing for agent selection
        const routingOptions: ModelRoutingOptions = {
          taskType: 'api_execution', // Agents typically need tool execution capabilities
          userSpecifiedTemperature: config.temperature,
          userTier: 'standard',
          enableScoring: true,
          maxRetries: 2,
        };

        const routingResult = await modelRouterService.smartRoute(prompt, systemPrompt, routingOptions);

        const executionId = context.execution._id.toString();
        const agentId = `agent-${node.id}-${executionId}`;

        const agentResult = await langChainAgentService.createAgent(prompt, {
          modelType: routingResult.provider as any,
          remoteModel: config.remoteModel || 'claude',
          temperature: routingResult.temperature,
          maxTokens: config.maxTokens,
          tools: config.tools,
          systemPrompt: systemPrompt,
          // Agent state tracking
          agentId,
          executionId,
          userId: userId,
          nodeId: node.id,
          trackReasoning: true,
          // Pass the routed model for direct usage
          customModel: routingResult.model,
        });

        return {
          response: agentResult.response,
          model: config.remoteModel || 'claude',
          toolsUsed: agentResult.toolsUsed,
          agentExecution: true,
          reasoning: agentResult.reasoning,
          agentId,
        };
      } catch (error: any) {
        // Fallback to simple MCP tool execution
        logger.warn('LangChain agent failed, falling back to MCP', {
          error: error.message || error,
          sessionId,
        });
        return await this.executeAgentWithTools(
          prompt,
          systemPrompt,
          config,
          sessionId,
          userId,
          context
        );
      }
    }

    // Simple AI completion without tools
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ];

    // Use intelligent routing for simple completions
    const routingOptions: ModelRoutingOptions = {
      taskType: 'conversational_chat', // Default for simple completions
      userSpecifiedTemperature: config.temperature,
      userTier: 'standard',
      enableScoring: true,
    };

    const routingResult = await modelRouterService.smartRoute(prompt, systemPrompt, routingOptions);

    const response = await langChainService.chatCompletion(messages, {
      modelType: routingResult.provider as any,
      remoteModel: config.remoteModel || 'claude',
      temperature: routingResult.temperature,
      maxTokens: config.maxTokens,
      useLangChain: true,
      customModel: routingResult.model,
    });

    return {
      response,
      model: config.remoteModel || 'claude',
      toolsUsed: [],
    };
  }

  /**
   * Execute AI agent with tool calling via MCP
   */
  private async executeAgentWithTools(
    prompt: string,
    systemPrompt: string,
    config: AINodeConfig,
    sessionId: string,
    userId: string,
    _context: ExecutionContext
  ): Promise<any> {
    // Get available MCP tools
    const availableTools = config.tools || [];
    const toolDescriptions = availableTools
      .map((toolName) => {
        const tool = mcpServer.getConfig().tools.find((t) => t.name === toolName);
        return tool ? `${tool.name}: ${tool.description}` : null;
      })
      .filter(Boolean)
      .join('\n');

    // Enhanced system prompt with tool information
    const enhancedSystemPrompt = `${systemPrompt}

Available tools:
${toolDescriptions}

You can request tool usage by describing what you need. The system will execute the appropriate tools.`;

    // First, get AI's response and tool requests
    const messages: ChatMessage[] = [
      { role: 'system', content: enhancedSystemPrompt },
      { role: 'user', content: prompt },
    ];

    // Use intelligent routing for tool-based interactions
    const routingOptions: ModelRoutingOptions = {
      taskType: 'api_execution', // Tool usage requires API execution capabilities
      userSpecifiedTemperature: config.temperature,
      userTier: 'standard',
      enableScoring: true,
    };

    const routingResult = await modelRouterService.smartRoute(prompt, enhancedSystemPrompt, routingOptions);

    const aiResponse = await langChainService.chatCompletion(messages, {
      modelType: routingResult.provider as any,
      remoteModel: config.remoteModel || 'claude',
      temperature: routingResult.temperature,
      maxTokens: config.maxTokens,
      useLangChain: true,
      customModel: routingResult.model,
    });

    // Parse tool calls from response (simple pattern matching)
    const toolCalls = this.parseToolCalls(aiResponse, availableTools);

    // Execute tools via MCP
    const toolResults: any[] = [];
    for (const toolCall of toolCalls) {
      try {
        const result = await mcpServer.executeTool(sessionId, userId, {
          tool: toolCall.tool,
          arguments: toolCall.arguments,
        });
        toolResults.push({
          tool: toolCall.tool,
          success: result.success,
          result: result.result,
          error: result.error,
        });
      } catch (error: any) {
        toolResults.push({
          tool: toolCall.tool,
          success: false,
          error: error.message,
        });
      }
    }

    // If tools were used, get final response with tool results
    if (toolResults.length > 0) {
      const followUpPrompt = `Based on the tool results, provide a final answer:

Tool Results:
${toolResults.map((r) => `- ${r.tool}: ${r.success ? JSON.stringify(r.result) : r.error}`).join('\n')}

Original request: ${prompt}`;

      // Use the same routing result for follow-up to maintain consistency
      const finalResponse = await langChainService.chatCompletion(
        [
          { role: 'system' as const, content: enhancedSystemPrompt },
          { role: 'user' as const, content: followUpPrompt },
        ] as ChatMessage[],
        {
          modelType: routingResult.provider as any,
          remoteModel: config.remoteModel || 'claude',
          temperature: routingResult.temperature,
          maxTokens: config.maxTokens,
          useLangChain: true,
          customModel: routingResult.model,
        }
      );

      return {
        response: finalResponse,
        model: config.remoteModel || 'claude',
        toolsUsed: toolResults,
        initialResponse: aiResponse,
      };
    }

    return {
      response: aiResponse,
      model: config.remoteModel || 'claude',
      toolsUsed: [],
    };
  }

  /**
   * Execute AI generate node (text generation)
   */
  async executeAIGenerateNode(node: any, context: ExecutionContext): Promise<any> {
    const config: AINodeConfig = node.config || {};
    const prompt = this.resolvePrompt(config.prompt || '', context);

    // Use intelligent routing for text generation
    const routingOptions: ModelRoutingOptions = {
      taskType: 'creative_writing', // Text generation is typically creative
      userSpecifiedTemperature: config.temperature,
      userTier: 'standard',
      enableScoring: true,
    };

    const routingResult = await modelRouterService.smartRoute(prompt, undefined, routingOptions);

    const response = await langChainService.generateText(prompt, {
      modelType: routingResult.provider as any,
      remoteModel: config.remoteModel || 'claude',
      temperature: routingResult.temperature,
      maxTokens: config.maxTokens,
      useLangChain: true,
      customModel: routingResult.model,
    });

    return {
      generated: response,
      model: routingResult.provider,
      confidence: routingResult.confidence,
      temperature: routingResult.temperature,
      prompt: prompt,
      routingPath: routingResult.routingPath,
    };
  }

  /**
   * Execute AI workflow generator node
   */
  async executeAIWorkflowGeneratorNode(node: any, context: ExecutionContext): Promise<any> {
    const config: AINodeConfig = node.config || {};
    const description = this.resolvePrompt(config.prompt || '', context);

    // Use intelligent routing for workflow generation (requires planning capabilities)
    const routingOptions: ModelRoutingOptions = {
      taskType: 'complex_reasoning', // Workflow generation requires planning
      userSpecifiedTemperature: config.temperature,
      userTier: 'standard',
      enableScoring: true,
    };

    const routingResult = await modelRouterService.smartRoute(description, undefined, routingOptions);

    // Use workflow generator service with routed model
    const { workflowGeneratorService } = await import('../../modules/ai/services/ai/workflow-generator.service');

    const workflow = await workflowGeneratorService.generateWorkflow({
      description,
      modelType: routingResult.provider as any,
      remoteModel: config.remoteModel || 'claude',
      temperature: routingResult.temperature,
      customModel: routingResult.model,
    });

    return {
      workflow,
      generated: true,
      model: routingResult.provider,
      confidence: routingResult.confidence,
      temperature: routingResult.temperature,
      routingPath: routingResult.routingPath,
    };
  }

  /**
   * Build messages from config and context
   */
  private buildMessages(config: AINodeConfig, context: ExecutionContext): ChatMessage[] {
    const messages: ChatMessage[] = [];

    // Add system prompt if provided
    if (config.systemPrompt) {
      messages.push({ role: 'system', content: this.resolvePrompt(config.systemPrompt, context) });
    }

    // Add messages from config or build from prompt
    if (config.messages && config.messages.length > 0) {
      messages.push(
        ...config.messages.map((msg) => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: this.resolvePrompt(msg.content, context),
        }))
      );
    } else if (config.prompt) {
      messages.push({ role: 'user', content: this.resolvePrompt(config.prompt, context) });
    }

    return messages;
  }

  /**
   * Resolve prompt with context variables
   */
  private resolvePrompt(prompt: string, context: ExecutionContext): string {
    let resolved = prompt;

    // Replace context variables
    for (const [key, value] of Object.entries(context.variables)) {
      resolved = resolved.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
      resolved = resolved.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), String(value));
    }

    // Replace step results
    for (const [stepId, result] of context.stepResults.entries()) {
      resolved = resolved.replace(new RegExp(`\\{\\{${stepId}\\}\\}`, 'g'), JSON.stringify(result));
      resolved = resolved.replace(new RegExp(`\\$\\{${stepId}\\}`, 'g'), JSON.stringify(result));
    }

    // Replace input variables
    for (const [key, value] of Object.entries(context.input)) {
      resolved = resolved.replace(new RegExp(`\\{\\{input\\.${key}\\}\\}`, 'g'), String(value));
      resolved = resolved.replace(new RegExp(`\\$\\{input\\.${key}\\}`, 'g'), String(value));
    }

    return resolved;
  }

  /**
   * Parse tool calls from AI response (simple pattern matching)
   * In production, use structured output or function calling
   */
  private parseToolCalls(response: string, availableTools: string[]): Array<{ tool: string; arguments: any }> {
    const toolCalls: Array<{ tool: string; arguments: any }> = [];

    // Simple pattern: look for tool mentions and extract arguments
    for (const tool of availableTools) {
      const toolRegex = new RegExp(`(?:use|call|execute)\\s+${tool}(?:\\s+with\\s+)?(?:\\{([^}]+)\\}|(.*?))`, 'i');
      const match = response.match(toolRegex);
      if (match) {
        try {
          const args = match[1] ? JSON.parse(`{${match[1]}}`) : match[2] ? { query: match[2].trim() } : {};
          toolCalls.push({ tool, arguments: args });
        } catch {
          // If JSON parsing fails, use simple query
          toolCalls.push({ tool, arguments: { query: match[2] || match[1] || '' } });
        }
      }
    }

    return toolCalls;
  }
}

export const aiNodeExecutor = new AINodeExecutor();


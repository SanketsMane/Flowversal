/**
 * Intelligent Tool Selection Service
 * Analyzes task requirements, scores available tools, and selects optimal tool chains
 */

import { mcpServer } from '../../../../agents/mcp/server';
import { logger } from '../../../../shared/utils/logger.util';
import { agentStateService } from './agent-state.service';

export interface ToolScore {
  toolName: string;
  score: number;
  reasons: string[];
  confidence: number;
  estimatedDuration?: number;
  dependencies?: string[];
}

export interface ToolChain {
  tools: string[];
  totalScore: number;
  estimatedDuration: number;
  confidence: number;
  reasoning: string;
}

export interface TaskAnalysis {
  intent: string;
  keywords: string[];
  requiredCapabilities: string[];
  dataTypes: string[];
  complexity: 'simple' | 'medium' | 'complex';
}

export class ToolSelectorService {
  /**
   * Analyze task to understand requirements
   */
  analyzeTask(task: string): TaskAnalysis {
    const lowerTask = task.toLowerCase();
    const keywords: string[] = [];
    const requiredCapabilities: string[] = [];
    const dataTypes: string[] = [];

    // Extract keywords
    const commonKeywords = [
      'email', 'send', 'message', 'notify',
      'search', 'find', 'query', 'lookup',
      'create', 'generate', 'build', 'make',
      'update', 'modify', 'edit', 'change',
      'delete', 'remove', 'clear',
      'read', 'get', 'fetch', 'retrieve',
      'analyze', 'process', 'transform',
      'schedule', 'trigger', 'execute',
    ];

    commonKeywords.forEach((keyword) => {
      if (lowerTask.includes(keyword)) {
        keywords.push(keyword);
      }
    });

    // Determine required capabilities
    if (lowerTask.match(/\b(email|send|message|notify)\b/)) {
      requiredCapabilities.push('communication');
    }
    if (lowerTask.match(/\b(search|find|query|lookup)\b/)) {
      requiredCapabilities.push('search');
    }
    if (lowerTask.match(/\b(create|generate|build|make)\b/)) {
      requiredCapabilities.push('creation');
    }
    if (lowerTask.match(/\b(update|modify|edit|change)\b/)) {
      requiredCapabilities.push('modification');
    }
    if (lowerTask.match(/\b(analyze|process|transform)\b/)) {
      requiredCapabilities.push('analysis');
    }
    if (lowerTask.match(/\b(schedule|trigger|execute)\b/)) {
      requiredCapabilities.push('automation');
    }

    // Detect data types
    if (lowerTask.match(/\b(json|object|data)\b/)) {
      dataTypes.push('object');
    }
    if (lowerTask.match(/\b(text|string|content)\b/)) {
      dataTypes.push('string');
    }
    if (lowerTask.match(/\b(number|count|amount)\b/)) {
      dataTypes.push('number');
    }
    if (lowerTask.match(/\b(file|document|attachment)\b/)) {
      dataTypes.push('file');
    }

    // Determine complexity
    const complexity =
      keywords.length > 5 || requiredCapabilities.length > 2
        ? 'complex'
        : keywords.length > 2 || requiredCapabilities.length > 1
        ? 'medium'
        : 'simple';

    return {
      intent: this.extractIntent(lowerTask),
      keywords,
      requiredCapabilities,
      dataTypes,
      complexity,
    };
  }

  /**
   * Extract intent from task
   */
  private extractIntent(task: string): string {
    if (task.match(/\b(email|send|message)\b/)) return 'communication';
    if (task.match(/\b(search|find|query)\b/)) return 'search';
    if (task.match(/\b(create|generate|build)\b/)) return 'creation';
    if (task.match(/\b(update|modify|edit)\b/)) return 'modification';
    if (task.match(/\b(analyze|process)\b/)) return 'analysis';
    if (task.match(/\b(schedule|automate)\b/)) return 'automation';
    return 'general';
  }

  /**
   * Score available tools based on task analysis
   */
  async scoreTools(
    taskAnalysis: TaskAnalysis,
    availableTools: string[],
    context?: {
      agentId?: string;
      executionId?: string;
      previousToolCalls?: string[];
    }
  ): Promise<ToolScore[]> {
    const allTools = mcpServer.getConfig().tools;
    const scores: ToolScore[] = [];

    for (const toolName of availableTools) {
      const tool = allTools.find((t) => t.name === toolName);
      if (!tool) continue;

      const score = this.calculateToolScore(tool, taskAnalysis, context);
      scores.push(score);
    }

    // Sort by score descending
    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate score for a single tool
   */
  private calculateToolScore(
    tool: any,
    taskAnalysis: TaskAnalysis,
    context?: {
      agentId?: string;
      executionId?: string;
      previousToolCalls?: string[];
    }
  ): ToolScore {
    let score = 0;
    const reasons: string[] = [];
    let confidence = 0.5;

    const toolName = tool.name.toLowerCase();
    const toolDescription = (tool.description || '').toLowerCase();

    // Match keywords
    taskAnalysis.keywords.forEach((keyword) => {
      if (toolName.includes(keyword) || toolDescription.includes(keyword)) {
        score += 10;
        reasons.push(`Matches keyword: ${keyword}`);
        confidence += 0.1;
      }
    });

    // Match capabilities
    taskAnalysis.requiredCapabilities.forEach((capability) => {
      if (toolDescription.includes(capability)) {
        score += 15;
        reasons.push(`Provides capability: ${capability}`);
        confidence += 0.15;
      }
    });

    // Match intent
    if (toolDescription.includes(taskAnalysis.intent)) {
      score += 20;
      reasons.push(`Matches intent: ${taskAnalysis.intent}`);
      confidence += 0.2;
    }

    // Check tool name relevance
    const toolNameWords = toolName.split(/[-_]/);
    taskAnalysis.keywords.forEach((keyword) => {
      if (toolNameWords.some((word: string) => word.includes(keyword))) {
        score += 12;
        reasons.push(`Tool name matches: ${keyword}`);
        confidence += 0.12;
      }
    });

    // Learn from previous tool calls (if context provided)
    if (context?.previousToolCalls?.includes(tool.name)) {
      score += 5;
      reasons.push('Previously used successfully');
      confidence += 0.05;
    }

    // Check for tool usage history (if agent context provided)
    if (context?.agentId && context?.executionId) {
      agentStateService
        .getAgentState(context.agentId, context.executionId)
        .then((agentState) => {
          if (agentState) {
            const toolUsageCount = agentState.toolCalls.filter(
              (tc) => tc.toolName === tool.name && tc.success
            ).length;
            if (toolUsageCount > 0) {
              score += Math.min(toolUsageCount * 2, 10);
              reasons.push(`Used ${toolUsageCount} time(s) before`);
            }
          }
        })
        .catch(() => {
          // Ignore errors in async context
        });
    }

    // Estimate duration based on complexity
    const estimatedDuration = this.estimateToolDuration(tool, taskAnalysis.complexity);

    // Check dependencies
    const dependencies = this.detectDependencies(tool, mcpServer.getConfig().tools);

    confidence = Math.min(confidence, 1.0);

    return {
      toolName: tool.name,
      score: Math.max(score, 0),
      reasons,
      confidence,
      estimatedDuration,
      dependencies,
    };
  }

  /**
   * Estimate tool execution duration
   */
  private estimateToolDuration(tool: any, complexity: 'simple' | 'medium' | 'complex'): number {
    const baseDuration = 1000; // 1 second base
    const complexityMultiplier = {
      simple: 1,
      medium: 2,
      complex: 4,
    };

    // Check if tool description mentions async or long-running operations
    const description = (tool.description || '').toLowerCase();
    if (description.includes('async') || description.includes('background')) {
      return baseDuration * complexityMultiplier[complexity] * 2;
    }

    return baseDuration * complexityMultiplier[complexity];
  }

  /**
   * Detect tool dependencies
   */
  private detectDependencies(tool: any, allTools: any[]): string[] {
    const dependencies: string[] = [];
    const description = (tool.description || '').toLowerCase();

    // Check if tool mentions other tools
    allTools.forEach((otherTool) => {
      if (
        otherTool.name !== tool.name &&
        description.includes(otherTool.name.toLowerCase())
      ) {
        dependencies.push(otherTool.name);
      }
    });

    return dependencies;
  }

  /**
   * Select optimal tool chain for a task
   */
  async selectToolChain(
    task: string,
    availableTools: string[],
    maxTools: number = 5,
    context?: {
      agentId?: string;
      executionId?: string;
      previousToolCalls?: string[];
    }
  ): Promise<ToolChain | null> {
    try {
      const taskAnalysis = this.analyzeTask(task);
      const toolScores = await this.scoreTools(taskAnalysis, availableTools, context);

      if (toolScores.length === 0) {
        logger.warn('No tools available for task', { task });
        return null;
      }

      // Select top tools
      const selectedTools = toolScores
        .slice(0, maxTools)
        .filter((ts) => ts.score > 0)
        .map((ts) => ts.toolName);

      if (selectedTools.length === 0) {
        return null;
      }

      // Build tool chain

      const chain: ToolChain = {
        tools: selectedTools,
        totalScore: toolScores
          .slice(0, selectedTools.length)
          .reduce((sum, ts) => sum + ts.score, 0),
        estimatedDuration: toolScores
          .slice(0, selectedTools.length)
          .reduce((sum, ts) => sum + (ts.estimatedDuration || 1000), 0),
        confidence:
          toolScores.slice(0, selectedTools.length).reduce((sum, ts) => sum + ts.confidence, 0) /
          selectedTools.length,
        reasoning: this.buildChainReasoning(taskAnalysis, toolScores.slice(0, selectedTools.length)),
      };

      logger.info('Tool chain selected', {
        task,
        tools: selectedTools,
        score: chain.totalScore,
        confidence: chain.confidence,
      });

      return chain;
    } catch (error: any) {
      logger.error('Failed to select tool chain', { error: error.message, task });
      return null;
    }
  }

  /**
   * Build reasoning for tool chain selection
   */
  private buildChainReasoning(
    taskAnalysis: TaskAnalysis,
    toolScores: ToolScore[]
  ): string {
    const reasons: string[] = [];

    reasons.push(`Task complexity: ${taskAnalysis.complexity}`);
    reasons.push(`Intent: ${taskAnalysis.intent}`);
    reasons.push(`Selected ${toolScores.length} tool(s)`);

    toolScores.forEach((ts) => {
      if (ts.reasons.length > 0) {
        reasons.push(`${ts.toolName}: ${ts.reasons[0]}`);
      }
    });

    return reasons.join('. ');
  }

  /**
   * Suggest tool improvements based on usage history
   */
  async suggestToolImprovements(
    agentId: string,
    executionId: string
  ): Promise<Array<{ tool: string; suggestion: string; priority: 'high' | 'medium' | 'low' }>> {
    try {
      const agentState = await agentStateService.getAgentState(agentId, executionId);
      if (!agentState || agentState.toolCalls.length === 0) {
        return [];
      }

      const suggestions: Array<{
        tool: string;
        suggestion: string;
        priority: 'high' | 'medium' | 'low';
      }> = [];

      // Analyze tool call patterns
      const toolStats = new Map<string, { count: number; failures: number; avgDuration: number }>();

      agentState.toolCalls.forEach((tc) => {
        const stats = toolStats.get(tc.toolName) || { count: 0, failures: 0, avgDuration: 0 };
        stats.count++;
        if (!tc.success) stats.failures++;
        stats.avgDuration = (stats.avgDuration + (tc.duration || 0)) / stats.count;
        toolStats.set(tc.toolName, stats);
      });

      // Generate suggestions
      toolStats.forEach((stats, toolName) => {
        const failureRate = stats.failures / stats.count;

        if (failureRate > 0.3) {
          suggestions.push({
            tool: toolName,
            suggestion: `High failure rate (${Math.round(failureRate * 100)}%). Consider alternative tools or check tool configuration.`,
            priority: 'high',
          });
        }

        if (stats.avgDuration > 5000) {
          suggestions.push({
            tool: toolName,
            suggestion: `Slow execution (${Math.round(stats.avgDuration)}ms avg). Consider optimization or caching.`,
            priority: 'medium',
          });
        }

        if (stats.count > 10 && failureRate < 0.1) {
          suggestions.push({
            tool: toolName,
            suggestion: `Frequently used and reliable. Consider prioritizing this tool for similar tasks.`,
            priority: 'low',
          });
        }
      });

      return suggestions;
    } catch (error: any) {
      logger.error('Failed to generate tool suggestions', { error: error.message });
      return [];
    }
  }

}

export const toolSelectorService = new ToolSelectorService();

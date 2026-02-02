import { MCPToolCall, MCPToolResult, MCPContext, MCPServerConfig } from './types';
import { mcpToolRegistry } from './registry';
import { MCPExecutor } from './executor';

/**
 * MCP Server
 * Handles MCP protocol operations
 */
export class MCPServer {
  private executor: MCPExecutor;
  private contexts: Map<string, MCPContext> = new Map();

  constructor() {
    this.executor = new MCPExecutor();
  }

  /**
   * Get server configuration
   */
  getConfig(): MCPServerConfig {
    return {
      name: 'Flowversal MCP Server',
      version: '1.0.0',
      tools: mcpToolRegistry.getAll(),
    };
  }

  /**
   * Create or get context
   */
  getContext(sessionId: string, userId: string): MCPContext {
    if (!this.contexts.has(sessionId)) {
      this.contexts.set(sessionId, {
        sessionId,
        userId,
        variables: {},
        history: [],
      });
    }
    return this.contexts.get(sessionId)!;
  }

  /**
   * Execute tool call
   */
  async executeTool(
    sessionId: string,
    userId: string,
    toolCall: MCPToolCall
  ): Promise<MCPToolResult> {
    const context = this.getContext(sessionId, userId);

    // Validate tool exists
    const tool = mcpToolRegistry.get(toolCall.tool);
    if (!tool) {
      return {
        success: false,
        error: `Tool "${toolCall.tool}" not found`,
      };
    }

    // Execute tool
    try {
      const result = await this.executor.execute(toolCall.tool, toolCall.arguments, context);

      // Update context history
      context.history.push(toolCall);

      return {
        success: true,
        result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Tool execution failed',
      };
    }
  }

  /**
   * Execute multiple tool calls
   */
  async executeTools(
    sessionId: string,
    userId: string,
    toolCalls: MCPToolCall[]
  ): Promise<MCPToolResult[]> {
    return Promise.all(
      toolCalls.map((toolCall) => this.executeTool(sessionId, userId, toolCall))
    );
  }

  /**
   * Clear context
   */
  clearContext(sessionId: string): void {
    this.contexts.delete(sessionId);
  }

  /**
   * Get context variables
   */
  getContextVariables(sessionId: string): Record<string, any> {
    const context = this.contexts.get(sessionId);
    return context?.variables || {};
  }

  /**
   * Set context variable
   */
  setContextVariable(sessionId: string, key: string, value: any): void {
    const context = this.getContext(sessionId, '');
    context.variables[key] = value;
  }
}

export const mcpServer = new MCPServer();


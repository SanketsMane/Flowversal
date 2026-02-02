import { MCPContext } from './types';
import { filesystemToolHandler } from './tools/filesystem.tool';
import { databaseToolHandler } from './tools/database.tool';
import { websearchToolHandler } from './tools/websearch.tool';
import { workflowToolHandler } from './tools/workflow.tool';
import { aiToolHandler } from './tools/ai.tool';

/**
 * MCP Tool Executor
 * Executes MCP tools based on tool name
 */
export class MCPExecutor {
  private toolHandlers: Map<string, (args: any, context: MCPContext) => Promise<any>> =
    new Map();

  constructor() {
    // Register tool handlers
    this.registerTool('filesystem', filesystemToolHandler.execute);
    this.registerTool('database', databaseToolHandler.execute);
    this.registerTool('websearch', websearchToolHandler.execute);
    this.registerTool('workflow', workflowToolHandler.execute);
    this.registerTool('ai', aiToolHandler.execute);
  }

  /**
   * Register a tool handler
   */
  registerTool(
    name: string,
    handler: (args: any, context: MCPContext) => Promise<any>
  ): void {
    this.toolHandlers.set(name, handler);
  }

  /**
   * Execute a tool
   */
  async execute(toolName: string, args: any, context: MCPContext): Promise<any> {
    const handler = this.toolHandlers.get(toolName);

    if (!handler) {
      throw new Error(`Tool handler not found: ${toolName}`);
    }

    return handler(args, context);
  }
}


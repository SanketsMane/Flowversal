/**
 * MCP (Model Context Protocol) Types
 */

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPToolCall {
  tool: string;
  arguments: Record<string, any>;
}

export interface MCPToolResult {
  success: boolean;
  result?: any;
  error?: string;
}

export interface MCPContext {
  sessionId: string;
  userId: string;
  variables: Record<string, any>;
  history: MCPToolCall[];
}

export interface MCPServerConfig {
  name: string;
  version: string;
  tools: MCPTool[];
}


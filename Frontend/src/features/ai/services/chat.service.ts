/**
 * Chat Service
 * Centralized service for chat API calls and action execution
 * Reusable across components
 */

import { buildApiUrl, getAuthHeaders } from '@/core/api/api.config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  mode?: 'agent' | 'plan' | 'debug' | 'ask';
  tools?: string[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  context?: string;
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  conversationId?: string;
  toolsUsed?: string[];
  toolResults?: Array<{
    tool: string;
    success: boolean;
    result?: any;
    error?: string;
  }>;
  model?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  error?: string;
}

export interface ToolExecutionResult {
  success: boolean;
  responseType: 'text' | 'html' | 'media' | 'mixed';
  data: any;
  error?: {
    message: string;
    code: number | string;
    details: string;
  };
}

export interface AvailableTool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  confirmationRequired?: boolean;
}

/**
 * Chat Service - Handles all chat-related API calls
 */
export class ChatService {
  private static instance: ChatService;

  private constructor() {}

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  /**
   * Send chat message and get AI response
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const headers = await getAuthHeaders();
      
      // Build messages array for backend
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
      
      // Add system context if provided
      if (request.context) {
        messages.push({ role: 'system', content: request.context });
      }
      
      // Add user message
      messages.push({ role: 'user', content: request.message });
      
      const response = await fetch(buildApiUrl('/ai/chat'), {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          modelType: request.model === 'vllm' ? 'vllm' : 'remote',
          remoteModel: request.model === 'gpt4' ? 'gpt4' : request.model === 'gemini' ? 'gemini' : 'claude',
          temperature: request.temperature || 0.7,
          maxTokens: request.maxTokens || 2000,
          useLangChain: true, // Always use LangChain for tool support
          tools: request.tools || [],
          mode: request.mode || 'agent',
          conversationId: request.conversationId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Failed to get AI response');
      }

      const data = await response.json();
      
      // Handle backend response format - backend returns { success: true, data: { response, model, conversationId, ... } }
      if (data.success && data.data) {
        const chatData = data.data;
        return {
          success: true,
          response: chatData.response,
          conversationId: chatData.conversationId || request.conversationId,
          toolsUsed: chatData.toolsUsed || [],
          toolResults: chatData.toolResults,
          model: chatData.model,
          usage: chatData.usage,
        };
      }
      
      // Fallback for different response formats
      return {
        success: data.success || true,
        response: data.response || data.data?.response || '',
        conversationId: data.conversationId || data.data?.conversationId || request.conversationId,
        toolsUsed: data.toolsUsed || data.data?.toolsUsed || [],
        toolResults: data.toolResults || data.data?.toolResults,
        model: data.model || data.data?.model,
        usage: data.usage || data.data?.usage,
      };
    } catch (error: any) {
      console.error('[ChatService] Error sending message:', error);
      return {
        success: false,
        error: error.message || 'Failed to send message',
      };
    }
  }

  /**
   * Get available tools
   */
  async getAvailableTools(): Promise<AvailableTool[]> {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(buildApiUrl('/ai/mcp/config'), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tools');
      }

      const data = await response.json();
      const tools = data.data?.tools || data.tools || [];
      
      return tools.map((tool: any) => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema || tool.parameters,
        confirmationRequired: tool.confirmationRequired || false,
      }));
    } catch (error: any) {
      console.error('[ChatService] Error fetching tools:', error);
      return [];
    }
  }

  /**
   * Execute a tool
   */
  async executeTool(toolName: string, parameters: Record<string, any>, sessionId?: string): Promise<ToolExecutionResult> {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(buildApiUrl('/ai/mcp/execute'), {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: toolName,
          arguments: parameters,
          sessionId: sessionId || `chat-${Date.now()}`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          responseType: 'text',
          data: {},
          error: {
            message: error.error || error.message || 'Tool execution failed',
            code: error.error?.code || response.status,
            details: error.error?.details || '',
          },
        };
      }

      const data = await response.json();
      return {
        success: data.success || true,
        responseType: 'mixed',
        data: data.data || data.result,
      };
    } catch (error: any) {
      console.error('[ChatService] Error executing tool:', error);
      return {
        success: false,
        responseType: 'text',
        data: {},
        error: {
          message: error.message || 'Tool execution failed',
          code: 500,
          details: 'Internal error',
        },
      };
    }
  }

  /**
   * Generate workflow from description
   */
  async generateWorkflow(description: string, mode: string, tools: string[]): Promise<any> {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(buildApiUrl('/ai/generate-workflow'), {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          mode,
          tools,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate workflow');
      }

      const data = await response.json();
      return data.workflow || data.data?.workflow;
    } catch (error: any) {
      console.error('[ChatService] Error generating workflow:', error);
      throw error;
    }
  }
}

export const chatService = ChatService.getInstance();

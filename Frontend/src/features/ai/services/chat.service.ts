/**
 * Chat Service
 * Centralized service for chat API calls, streaming, and image generation
 * Author: Sanket
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

export interface ImageResponse {
  success: boolean;
  url?: string;
  revisedPrompt?: string;
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
 * Chat Service — handles chat, streaming, and image generation API calls
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
   * Build the messages array for the backend from a ChatRequest.
   * Always injects a system prompt so the AI responds confidently.
   * Author: Sanket
   */
  private buildMessages(request: ChatRequest): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    // Author: Sanket — default system prompt ensures confident, direct answers
    // without hedging or pretending to search the internet
    const defaultSystemPrompt = `You are Flowversal AI, a knowledgeable and confident assistant.
Answer questions directly and decisively from your knowledge.
Do NOT say things like "I cannot browse the internet", "I don't have access to recent news", or "I can search for more information".
If asked about opinions, rankings, or subjective topics, give a clear, well-reasoned answer.
Be concise, helpful, and confident. Format responses with markdown when appropriate.`;

    const systemContent = request.context || defaultSystemPrompt;
    messages.push({ role: 'system', content: systemContent });
    messages.push({ role: 'user', content: request.message });
    return messages;
  }

  /**
   * Send chat message and get full AI response (non-streaming)
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const headers = await getAuthHeaders();
      const messages = this.buildMessages(request);

      const response = await fetch(buildApiUrl('/ai/chat'), {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          modelType: request.model === 'vllm' ? 'vllm' : 'remote',
          remoteModel: request.model === 'gpt4' ? 'gpt4' : request.model === 'gemini' ? 'gemini' : 'claude',
          temperature: request.temperature || 0.7,
          maxTokens: request.maxTokens || 2000,
          useLangChain: true,
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
      return { success: false, error: error.message || 'Failed to send message' };
    }
  }

  /**
   * Stream chat message — calls /ai/chat/stream and yields tokens via SSE
   * Author: Sanket — enables typewriter effect in the UI
   * @param request Chat request
   * @param onToken Callback called for each token chunk received
   * @param onDone Callback called when streaming is complete
   * @param onError Callback called on error
   */
  async streamMessage(
    request: ChatRequest,
    onToken: (token: string) => void,
    onDone: (conversationId?: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      const messages = this.buildMessages(request);

      const response = await fetch(buildApiUrl('/ai/chat/stream'), {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          temperature: request.temperature || 0.7,
          maxTokens: request.maxTokens || 2000,
          conversationId: request.conversationId,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Stream request failed' }));
        throw new Error(error.error || 'Stream request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body for streaming');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const payload = trimmed.slice(6);
          if (payload === '[DONE]') {
            onDone(request.conversationId);
            return;
          }

          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) {
              onError(parsed.error);
              return;
            }
            if (parsed.token) {
              onToken(parsed.token);
            }
          } catch {
            // Ignore malformed SSE lines
          }
        }
      }

      onDone(request.conversationId);
    } catch (error: any) {
      console.error('[ChatService] Stream error:', error);
      onError(error.message || 'Streaming failed');
    }
  }

  /**
   * Generate an image from a text prompt via DALL-E 3
   * Author: Sanket — routes image requests to the dedicated /ai/chat/image endpoint
   */
  async generateImage(prompt: string): Promise<ImageResponse> {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(buildApiUrl('/ai/chat/image'), {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Image generation failed' };
      }

      return { success: true, url: data.data?.url, revisedPrompt: data.data?.revisedPrompt };
    } catch (error: any) {
      console.error('[ChatService] Image generation error:', error);
      return { success: false, error: error.message || 'Image generation failed' };
    }
  }

  /**
   * Get available tools
   */
  async getAvailableTools(): Promise<AvailableTool[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(buildApiUrl('/ai/mcp/config'), { method: 'GET', headers });
      if (!response.ok) throw new Error('Failed to fetch tools');
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
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: toolName, arguments: parameters, sessionId: sessionId || `chat-${Date.now()}` }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          responseType: 'text',
          data: {},
          error: { message: error.error || 'Tool execution failed', code: response.status, details: '' },
        };
      }

      const data = await response.json();
      return { success: data.success || true, responseType: 'mixed', data: data.data || data.result };
    } catch (error: any) {
      console.error('[ChatService] Error executing tool:', error);
      return { success: false, responseType: 'text', data: {}, error: { message: error.message, code: 500, details: '' } };
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
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, mode, tools }),
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

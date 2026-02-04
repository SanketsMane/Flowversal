import { BaseChatModel, BaseChatModelParams } from '@langchain/core/language_models/chat_models';
import { AIMessage, BaseMessage, HumanMessage, SystemMessage, ChatMessage, AIMessageChunk } from '@langchain/core/messages';
import { ChatGenerationChunk, ChatResult } from '@langchain/core/outputs';
import { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager';
import axios from 'axios';

export interface FlowversalAIInput extends BaseChatModelParams {
  apiKey: string;
  baseUrl: string;
  modelName: string;
  provider?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Custom LangChain Chat Model for Flowversal AI API
 */
export class FlowversalChatModel extends BaseChatModel {
  private apiKey: string;
  private baseUrl: string;
  private modelName: string;
  private provider: string;
  private temperature: number;
  private maxTokens: number;

  constructor(fields: FlowversalAIInput) {
    super(fields);
    this.apiKey = fields.apiKey;
    this.baseUrl = fields.baseUrl;
    this.modelName = fields.modelName;
    this.provider = fields.provider || 'ollama';
    this.temperature = fields.temperature ?? 0.7;
    this.maxTokens = fields.maxTokens ?? 2048;
  }

  _llmType(): string {
    return 'flowversal';
  }

  /**
   * Main implementation for non-streaming calls
   */
  async _generate(
    messages: BaseMessage[],
    options: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun
  ): Promise<ChatResult> {
    const formattedMessages = messages.map(msg => ({
      role: this._getRole(msg),
      content: msg.content as string
    }));

    try {
      console.log(`[FlowversalAI] Calling ${this.baseUrl} for non-streaming response...`);
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: formattedMessages,
          data: {
            provider: this.provider,
            model: this.modelName
          }
        }),
        signal: options.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[FlowversalAI] API Error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Flowversal AI API Error: ${response.status} - ${errorText || response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Flowversal AI API Error: No response body received');
      }

      let text = '';
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data.trim() === '[DONE]') continue;
            
            try {
              const json = JSON.parse(data);
              // Target server sends delta for chunks
              text += json.delta || json.content || '';
            } catch (e) {
              // Not JSON, maybe raw text?
            }
          } else if (line.trim() && !line.startsWith(':')) {
            // Not a data line, could be raw JSON if server isn't using SSE
            try {
              const json = JSON.parse(line);
              text += json.content || json.response || '';
            } catch (e) {}
          }
        }
      }

      console.log(`[FlowversalAI] Collected response (${text.length} chars)`);
      
      if (!text) {
        console.warn('[FlowversalAI] Warning: Collected text is empty!');
      }

      return {
        generations: [
          {
            text,
            message: new AIMessage(text)
          }
        ]
      };
    } catch (error: any) {
      console.error('[FlowversalAI] Request failed:', error);
      throw error;
    }
  }

  /**
   * Role mapping for Flowversal API
   */
  private _getRole(message: BaseMessage): string {
    if (message instanceof HumanMessage) return 'user';
    if (message instanceof AIMessage) return 'assistant';
    if (message instanceof SystemMessage) return 'system';
    if (message instanceof ChatMessage) return message.role;
    return 'user';
  }

  /**
   * Helper to handle streaming (standard LangChain)
   */
  async *_streamResponseChunks(
    messages: BaseMessage[],
    options: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun
  ): AsyncGenerator<ChatGenerationChunk> {
    const formattedMessages = messages.map(msg => ({
      role: this._getRole(msg),
      content: msg.content as string
    }));

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: formattedMessages,
        data: {
          provider: this.provider,
          model: this.modelName
        }
      }),
      signal: options.signal
    });

    if (!response.ok) {
      throw new Error(`Flowversal AI Streaming Error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data.trim() === '[DONE]') continue;
          
          try {
            const json = JSON.parse(data);
            const delta = json.delta || '';
            yield new ChatGenerationChunk({
              text: delta,
              message: new AIMessageChunk({ content: delta })
            });
            await runManager?.handleLLMNewToken(delta);
          } catch (e) {}
        }
      }
    }
  }
}

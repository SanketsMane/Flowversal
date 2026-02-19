import axios from 'axios';
import { IncomingMessage } from 'http';

/**
 * OpenAI Service - Direct integration with OpenAI API
 * Author: Sanket
 * Provides instant chat responses using OpenAI's GPT models
 */

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export interface OpenAIResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIService {
  private baseUrl: string;
  private apiKey: string;
  private model: string;
  private enabled: boolean;

  constructor() {
    // Read configuration from environment
    this.baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.enabled = process.env.OPENAI_ENABLED === 'true';

    if (!this.apiKey && this.enabled) {
      console.warn('OpenAI API key not configured');
    }
  }

  /**
   * Check if OpenAI service is enabled and configured
   */
  isAvailable(): boolean {
    return this.enabled && !!this.apiKey;
  }

  /**
   * Generate chat completion using OpenAI
   */
  async chatCompletion(
    messages: OpenAIMessage[],
    options: OpenAIOptions = {}
  ): Promise<OpenAIResponse> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI service is not enabled or configured');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 2048,
          top_p: options.top_p,
          stream: options.stream || false,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 seconds timeout for fast responses
        }
      );

      return response.data;
    } catch (error: any) {
      // Provide detailed error logging for debugging
      const errorMessage = error.response?.data?.error?.message || error.message;
      console.error('[OpenAI Service] Error:', errorMessage);
      throw new Error(`OpenAI API error: ${errorMessage}`);
    }
  }

  /**
   * Stream chat completion — yields token chunks as they arrive from OpenAI
   * Author: Sanket — implements SSE streaming for typewriter effect
   */
  async *streamChatCompletion(
    messages: OpenAIMessage[],
    options: OpenAIOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI service is not enabled or configured');
    }

    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 2000,
        stream: true,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        responseType: 'stream',
        timeout: 120000,
      }
    );

    const stream = response.data as IncomingMessage;
    let buffer = '';

    for await (const chunk of stream) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      // Keep the last (possibly incomplete) line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const token = json.choices?.[0]?.delta?.content;
          if (token) yield token;
        } catch {
          // Ignore malformed SSE lines
        }
      }
    }
  }

  /**
   * Generate an image using DALL-E 3
   * Author: Sanket — routes image generation requests to DALL-E
   */
  async generateImage(prompt: string): Promise<{ url: string; revisedPrompt?: string }> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI service is not enabled or configured');
    }

    const response = await axios.post(
      `${this.baseUrl}/images/generations`,
      {
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );

    const data = response.data?.data?.[0];
    if (!data?.url) throw new Error('No image URL returned from DALL-E');

    return { url: data.url, revisedPrompt: data.revised_prompt };
  }

  /**
   * Generate simple text completion (convenience method)
   */
  async generateText(
    prompt: string,
    options: OpenAIOptions = {}
  ): Promise<string> {
    const messages: OpenAIMessage[] = [
      { role: 'user', content: prompt }
    ];

    const response = await this.chatCompletion(messages, options);
    return response.choices[0]?.message?.content || '';
  }

  /**
   * Generate completion with system prompt
   */
  async generateWithContext(
    systemPrompt: string,
    userMessage: string,
    options: OpenAIOptions = {}
  ): Promise<string> {
    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    const response = await this.chatCompletion(messages, options);
    return response.choices[0]?.message?.content || '';
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();

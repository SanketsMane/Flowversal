import axios from 'axios';

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

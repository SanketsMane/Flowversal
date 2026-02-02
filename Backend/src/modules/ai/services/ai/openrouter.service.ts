import axios from 'axios';
import { openRouterConfig } from '../../../../core/config/openrouter.config';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterOptions {
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface OpenRouterResponse {
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

export class OpenRouterService {
  private baseUrl: string;
  private apiKey: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = openRouterConfig.baseUrl;
    this.apiKey = openRouterConfig.apiKey;
    this.defaultHeaders = openRouterConfig.defaultHeaders;
  }

  /**
   * Generate chat completion
   */
  async chatCompletion(
    model: string,
    messages: OpenRouterMessage[],
    options: OpenRouterOptions = {}
  ): Promise<OpenRouterResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: model,
          messages: messages,
          temperature: options.temperature ?? 0.7,
          top_p: options.top_p,
          top_k: options.top_k,
          max_tokens: options.max_tokens ?? 2048,
          stream: options.stream || false,
        },
        {
          headers: this.defaultHeaders,
          timeout: 120000, // 2 minutes timeout
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(`OpenRouter API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Generate completion using GPT-4.1
   */
  async gpt4Completion(
    messages: OpenRouterMessage[],
    options: OpenRouterOptions = {}
  ): Promise<string> {
    const response = await this.chatCompletion(openRouterConfig.models.gpt4, messages, options);
    return response.choices[0]?.message?.content || '';
  }

  /**
   * Generate completion using Claude 3.5
   */
  async claudeCompletion(
    messages: OpenRouterMessage[],
    options: OpenRouterOptions = {}
  ): Promise<string> {
    const response = await this.chatCompletion(openRouterConfig.models.claude, messages, options);
    return response.choices[0]?.message?.content || '';
  }

  /**
   * Generate completion using Gemini 2.0
   */
  async geminiCompletion(
    messages: OpenRouterMessage[],
    options: OpenRouterOptions = {}
  ): Promise<string> {
    const response = await this.chatCompletion(openRouterConfig.models.gemini, messages, options);
    return response.choices[0]?.message?.content || '';
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        timeout: 10000,
      });
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      return [];
    }
  }
}

export const openRouterService = new OpenRouterService();


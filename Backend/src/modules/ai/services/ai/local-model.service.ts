import axios from 'axios';

export interface LocalModelResponse {
  response: string;
  model: string;
  done: boolean;
}

export interface LocalModelOptions {
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
  stream?: boolean;
}

export class LocalModelService {
  private baseUrl: string;
  private modelName: string;
  private enabled: boolean;

  constructor() {
    // Ollama support removed - use direct APIs instead
    this.baseUrl = '';
    this.modelName = '';
    this.enabled = false;
  }

  /**
   * Check if local model is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000,
      });
      const models = response.data?.models || [];
      return models.some((m: any) => m.name === this.modelName);
    } catch (error) {
      console.warn('Local model not available:', error);
      return false;
    }
  }

  /**
   * Generate completion using local model
   */
  async generateCompletion(
    prompt: string,
    options: LocalModelOptions = {}
  ): Promise<string> {
    if (!this.enabled) {
      throw new Error('Local model is not enabled');
    }

    const isAvailable = await this.isAvailable();
    if (!isAvailable) {
      throw new Error(`Local model ${this.modelName} is not available`);
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model: this.modelName,
          prompt: prompt,
          stream: options.stream || false,
          options: {
            temperature: options.temperature ?? 0.7,
            top_p: options.top_p ?? 0.9,
            top_k: options.top_k ?? 40,
            num_predict: options.max_tokens ?? 2048,
          },
        },
        {
          timeout: 300000, // 5 minutes timeout
        }
      );

      return response.data?.response || '';
    } catch (error: any) {
      throw new Error(`Local model generation failed: ${error.message}`);
    }
  }

  /**
   * Chat completion using local model
   */
  async chatCompletion(
    messages: Array<{ role: string; content: string }>,
    options: LocalModelOptions = {}
  ): Promise<string> {
    if (!this.enabled) {
      throw new Error('Local model is not enabled');
    }

    const isAvailable = await this.isAvailable();
    if (!isAvailable) {
      throw new Error(`Local model ${this.modelName} is not available`);
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/chat`,
        {
          model: this.modelName,
          messages: messages,
          stream: options.stream || false,
          options: {
            temperature: options.temperature ?? 0.7,
            top_p: options.top_p ?? 0.9,
            top_k: options.top_k ?? 40,
            num_predict: options.max_tokens ?? 2048,
          },
        },
        {
          timeout: 300000, // 5 minutes timeout
        }
      );

      return response.data?.message?.content || '';
    } catch (error: any) {
      throw new Error(`Local model chat failed: ${error.message}`);
    }
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000,
      });
      return (response.data?.models || []).map((m: any) => m.name);
    } catch (error) {
      return [];
    }
  }
}

export const localModelService = new LocalModelService();


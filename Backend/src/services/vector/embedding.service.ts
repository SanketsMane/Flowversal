import axios from 'axios';
import { aiConfig } from '../../core/config/ai.config';

export interface EmbeddingOptions {
  model?: 'local' | 'openai' | 'cohere';
  dimensions?: number;
}

export class EmbeddingService {
  /**
   * Generate embeddings for text
   */
  async generateEmbedding(text: string, options: EmbeddingOptions = {}): Promise<number[]> {
    const model = options.model || 'local';

    switch (model) {
      case 'local':
        return this.generateLocalEmbedding(text);
      case 'openai':
        return this.generateOpenAIEmbedding(text);
      case 'cohere':
        return this.generateCohereEmbedding(text);
      default:
        throw new Error(`Unknown embedding model: ${model}`);
    }
  }

  /**
   * Generate embeddings for multiple texts
   */
  async generateEmbeddings(texts: string[], options: EmbeddingOptions = {}): Promise<number[][]> {
    const model = options.model || 'local';

    switch (model) {
      case 'local':
        return Promise.all(texts.map((text) => this.generateLocalEmbedding(text)));
      case 'openai':
        return this.generateOpenAIEmbeddings(texts);
      case 'cohere':
        return Promise.all(texts.map((text) => this.generateCohereEmbedding(text)));
      default:
        throw new Error(`Unknown embedding model: ${model}`);
    }
  }

  /**
   * Generate embedding using local model (Ollama)
   */
  private async generateLocalEmbedding(text: string): Promise<number[]> {
    try {
      // Local embeddings removed - use Pinecone or other vector stores
      throw new Error('Local embeddings not supported. Use Pinecone or other vector stores.');

      const response = await axios.post(
        `removed/api/embeddings`,
        {
          model: 'removed',
          prompt: text,
        },
        {
          timeout: 30000,
        }
      );

      return response.data?.embedding || [];
    } catch (error: any) {
      throw new Error(`Local embedding generation failed: ${error.message}`);
    }
  }

  /**
   * Generate embedding using OpenAI (via OpenRouter)
   */
  private async generateOpenAIEmbedding(text: string): Promise<number[]> {
    try {
      const response = await axios.post(
        `${aiConfig.remote.baseUrl}/embeddings`,
        {
          model: 'text-embedding-ada-002',
          input: text,
        },
        {
          headers: {
            'Authorization': `Bearer ${aiConfig.remote.apiKey}`,
          },
          timeout: 30000,
        }
      );

      return response.data?.data?.[0]?.embedding || [];
    } catch (error: any) {
      throw new Error(`OpenAI embedding generation failed: ${error.message}`);
    }
  }

  /**
   * Generate embeddings for multiple texts using OpenAI
   */
  private async generateOpenAIEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await axios.post(
        `${aiConfig.remote.baseUrl}/embeddings`,
        {
          model: 'text-embedding-ada-002',
          input: texts,
        },
        {
          headers: {
            'Authorization': `Bearer ${aiConfig.remote.apiKey}`,
          },
          timeout: 60000,
        }
      );

      return (response.data?.data || []).map((item: any) => item.embedding);
    } catch (error: any) {
      throw new Error(`OpenAI embeddings generation failed: ${error.message}`);
    }
  }

  /**
   * Generate embedding using Cohere (via OpenRouter)
   */
  private async generateCohereEmbedding(text: string): Promise<number[]> {
    try {
      const response = await axios.post(
        `${aiConfig.remote.baseUrl}/embeddings`,
        {
          model: 'cohere/embed-english-v3.0',
          input: text,
        },
        {
          headers: {
            'Authorization': `Bearer ${aiConfig.remote.apiKey}`,
          },
          timeout: 30000,
        }
      );

      return response.data?.data?.[0]?.embedding || [];
    } catch (error: any) {
      throw new Error(`Cohere embedding generation failed: ${error.message}`);
    }
  }
}

export const embeddingService = new EmbeddingService();


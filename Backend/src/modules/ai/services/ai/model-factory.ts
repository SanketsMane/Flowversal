import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatOpenAI } from '@langchain/openai';
import { aiConfig } from '../../../../core/config/ai.config';
import { directApiConfigs, DirectApiProvider } from '../../../../core/config/direct-apis.config';
import { openRouterConfig } from '../../../../core/config/openrouter.config';

export type ModelProvider = 'vllm' | 'openrouter' | DirectApiProvider;

export interface ModelFactoryOptions {
  temperature?: number;
  maxTokens?: number;
  modelName?: string;
}

/**
 * Factory for creating LangChain chat models
 * Priority: vLLM (Flowversal AI) > OpenRouter > Ollama
 */
export class ModelFactory {
  /**
   * Create a vLLM model (Flowversal AI Model - Priority 1)
   * vLLM uses OpenAI-compatible API
   */
  static createVLLMModel(options: ModelFactoryOptions = {}): BaseChatModel {
    if (!aiConfig.vllm.enabled) {
      throw new Error('vLLM is not enabled');
    }

    return new ChatOpenAI({
      modelName: options.modelName || aiConfig.vllm.modelName,
      openAIApiKey: aiConfig.vllm.apiKey || 'not-required',
      configuration: {
        baseURL: aiConfig.vllm.baseUrl,
      },
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? 2048,
    }) as unknown as BaseChatModel;
  }

  /**
   * Create an OpenRouter model (Priority 2)
   */
  static createOpenRouterModel(
    modelName: string,
    options: ModelFactoryOptions = {}
  ): BaseChatModel {
    const apiKey = openRouterConfig.apiKey || process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.error('❌ CRITICAL: OpenRouter API Key is missing in ModelFactory! Check env vars.');
    }

    // Use OpenAI client with OpenRouter endpoint
    return new ChatOpenAI({
      modelName: modelName,
      // explicit fallback to process.env to be absolutely sure
      openAIApiKey: apiKey,
      apiKey: apiKey, // redundancy for compatibility
      configuration: {
        baseURL: openRouterConfig.baseUrl, // Fix: Use baseUrl from config directly (already has /api/v1)
        defaultHeaders: openRouterConfig.defaultHeaders,
      },
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? 2048,
    }) as unknown as BaseChatModel;
  }

  /**
   * Create Direct OpenAI Model
   */
  static createDirectOpenAIModel(options: ModelFactoryOptions = {}): BaseChatModel {
    const config = directApiConfigs.openai;
    if (!config.enabled || !config.apiKey) {
      throw new Error('Direct OpenAI not enabled or API key not configured');
    }

    return new ChatOpenAI({
      modelName: options.modelName || config.models.gpt4,
      openAIApiKey: config.apiKey,
      configuration: {
        baseURL: config.baseUrl,
      },
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? config.capabilities.maxTokens,
    }) as unknown as BaseChatModel;
  }

  /**
   * Create Direct Google Gemini Model
   */
  static createDirectGeminiModel(options: ModelFactoryOptions = {}): BaseChatModel {
    const config = directApiConfigs.gemini;
    if (!config.enabled || !config.apiKey) {
      throw new Error('Direct Gemini not enabled or API key not configured');
    }

    // Gemini uses a different client - for now, we'll use OpenAI-compatible wrapper
    // In production, you'd use Google's official SDK
    return new ChatOpenAI({
      modelName: options.modelName || config.models.pro,
      openAIApiKey: config.apiKey,
      configuration: {
        baseURL: config.baseUrl,
      },
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? config.capabilities.maxTokens,
    }) as unknown as BaseChatModel;
  }

  /**
   * Create Direct Anthropic Claude Model
   */
  static createDirectClaudeModel(options: ModelFactoryOptions = {}): BaseChatModel {
    const config = directApiConfigs.claude;
    if (!config.enabled || !config.apiKey) {
      throw new Error('Direct Claude not enabled or API key not configured');
    }

    // Claude uses Anthropic's SDK - for now, we'll use OpenAI-compatible wrapper
    // In production, you'd use Anthropic's official SDK
    return new ChatOpenAI({
      modelName: options.modelName || config.models.opus,
      openAIApiKey: config.apiKey,
      configuration: {
        baseURL: config.baseUrl,
        defaultHeaders: {
          'anthropic-version': '2023-06-01',
        },
      },
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? config.capabilities.maxTokens,
    }) as unknown as BaseChatModel;
  }

  /**
   * Create Direct xAI Grok Model
   */
  static createDirectGrokModel(options: ModelFactoryOptions = {}): BaseChatModel {
    const config = directApiConfigs.grok;
    if (!config.enabled || !config.apiKey) {
      throw new Error('Direct Grok not enabled or API key not configured');
    }

    return new ChatOpenAI({
      modelName: options.modelName || config.models.grok1,
      openAIApiKey: config.apiKey,
      configuration: {
        baseURL: config.baseUrl,
      },
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? config.capabilities.maxTokens,
    }) as unknown as BaseChatModel;
  }

  /**
   * Create Direct Deepseek Model
   */
  static createDirectDeepseekModel(options: ModelFactoryOptions = {}): BaseChatModel {
    const config = directApiConfigs.deepseek;
    if (!config.enabled || !config.apiKey) {
      throw new Error('Direct Deepseek not enabled or API key not configured');
    }

    return new ChatOpenAI({
      modelName: options.modelName || config.models.coder,
      openAIApiKey: config.apiKey,
      configuration: {
        baseURL: config.baseUrl,
      },
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? config.capabilities.maxTokens,
    }) as unknown as BaseChatModel;
  }

  /**
   * Create model with automatic priority fallback
   * Priority: vLLM > Direct APIs > OpenRouter
   */
  static createModelWithFallback(
    options: ModelFactoryOptions = {}
  ): BaseChatModel {
    // Try vLLM first (Priority 1)
    if (aiConfig.vllm.enabled) {
      try {
        return this.createVLLMModel(options);
      } catch (error) {
        console.warn('vLLM model creation failed, falling back to direct APIs:', error);
      }
    }

    // Try Direct APIs (Priority 2)
    if (aiConfig.directApis.enabled) {
      // Try each direct API provider in order of preference
      const directProviders: DirectApiProvider[] = ['openai', 'claude', 'gemini', 'deepseek', 'grok'];

      for (const provider of directProviders) {
        const config = directApiConfigs[provider];
        if (config.enabled && config.apiKey) {
          try {
            switch (provider) {
              case 'openai':
                return this.createDirectOpenAIModel(options);
              case 'claude':
                return this.createDirectClaudeModel(options);
              case 'gemini':
                return this.createDirectGeminiModel(options);
              case 'deepseek':
                return this.createDirectDeepseekModel(options);
              case 'grok':
                return this.createDirectGrokModel(options);
            }
          } catch (error) {
            console.warn(`${provider} direct API failed, trying next provider:`, error);
          }
        }
      }
    }

    // Fallback to OpenRouter (Priority 3)
    if (aiConfig.remote.enabled && openRouterConfig.apiKey) {
      try {
        return this.createOpenRouterModel(
          options.modelName || openRouterConfig.models.claude,
          options
        );
      } catch (error) {
        console.warn('OpenRouter model creation failed:', error);
      }
    }

    throw new Error('No available model providers. Please enable at least one model provider (vLLM, Direct APIs, or OpenRouter).');
  }

  /**
   * Create model based on type
   */
  static createModel(
    provider: ModelProvider,
    options: ModelFactoryOptions = {}
  ): BaseChatModel {
    switch (provider) {
      case 'vllm':
        return this.createVLLMModel(options);
      case 'openrouter':
        return this.createOpenRouterModel(
          options.modelName || openRouterConfig.models.claude,
          options
        );
      case 'openai':
        return this.createDirectOpenAIModel(options);
      case 'gemini':
        return this.createDirectGeminiModel(options);
      case 'claude':
        return this.createDirectClaudeModel(options);
      case 'grok':
        return this.createDirectGrokModel(options);
      case 'deepseek':
        return this.createDirectDeepseekModel(options);
      default:
        throw new Error(`Unknown model provider: ${provider}`);
    }
  }

  /**
   * Create GPT-4 model via OpenRouter
   */
  static createGPT4Model(options: ModelFactoryOptions = {}): BaseChatModel {
    return this.createOpenRouterModel(openRouterConfig.models.gpt4, options);
  }

  /**
   * Create Claude model via OpenRouter
   */
  static createClaudeModel(options: ModelFactoryOptions = {}): BaseChatModel {
    return this.createOpenRouterModel(openRouterConfig.models.claude, options);
  }

  /**
   * Create Gemini model via OpenRouter
   */
  static createGeminiModel(options: ModelFactoryOptions = {}): BaseChatModel {
    return this.createOpenRouterModel(openRouterConfig.models.gemini, options);
  }
}


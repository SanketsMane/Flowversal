import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { aiConfig } from '../../../../core/config/ai.config';
import { ModelFactory, ModelProvider } from './model-factory';
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
export interface LangChainOptions {
  modelType?: 'vllm' | 'openrouter' | 'local' | 'openai';
  remoteModel?: 'gpt4' | 'claude' | 'gemini';
  temperature?: number;
  maxTokens?: number;
  useLangChain?: boolean; // Whether to use LangChain or direct API calls
  enableAccuracyCheck?: boolean; // Enable accuracy-based model selection
  accuracyThreshold?: number; // Minimum accuracy threshold (default: 0.6)
  customModel?: BaseChatModel; // Custom model instance to use directly
}
export interface ModelAccuracyResult {
  model: string;
  accuracy: number;
  response: string;
  processingTime: number;
}
export class LangChainService {
  /**
   * Intelligent model selection with accuracy checking
   * Priority: vLLM (with accuracy check) → OpenRouter → Other models
   */
  async createModelWithAccuracyCheck(options: LangChainOptions = {}): Promise<{
    model: BaseChatModel;
    provider: ModelProvider;
    accuracy?: number;
  }> {
    const enableAccuracyCheck = options.enableAccuracyCheck ?? true;
    const accuracyThreshold = options.accuracyThreshold ?? 0.6;
    // Always try vLLM first (Priority 1)
    if (aiConfig.vllm.enabled) {
      try {
        const vllmModel = ModelFactory.createVLLMModel({
          temperature: options.temperature,
          maxTokens: options.maxTokens,
          modelName: options.remoteModel === 'gpt4' ? aiConfig.vllm.modelName : undefined,
        });
        if (!enableAccuracyCheck) {
          return { model: vllmModel, provider: 'vllm' };
        }
        // For accuracy checking, we'd need to make a test call
        // For now, assume vLLM passes accuracy threshold
        // In production, you'd implement actual accuracy checking
        const accuracy = await this.estimateModelAccuracy(vllmModel);
        if (accuracy >= accuracyThreshold) {
          return { model: vllmModel, provider: 'vllm', accuracy };
        }
      } catch (error) {
        console.warn('vLLM model creation failed, trying OpenRouter:', error);
      }
    }
    // Try OpenRouter (Priority 2)
    try {
      const openRouterModel = ModelFactory.createModelWithFallback({
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        modelName: this.getModelNameForProvider(options.remoteModel),
      });
      const accuracy = enableAccuracyCheck ? await this.estimateModelAccuracy(openRouterModel) : undefined;
      return {
        model: openRouterModel,
        provider: 'openrouter',
        accuracy
      };
    } catch (error) {
      console.warn('OpenRouter model creation failed, trying local model:', error);
    }
    // No local model fallback available - Ollama removed
    throw new Error('No available model providers. Please enable vLLM, direct APIs, or OpenRouter.');
  }
  /**
   * Estimate model accuracy (simplified implementation)
   * In production, this could analyze response quality, confidence scores, etc.
   */
  private async estimateModelAccuracy(model: BaseChatModel): Promise<number> {
    try {
      // Simple accuracy estimation based on model type and configuration
      // In production, you'd implement actual accuracy testing
      if (model.constructor.name.includes('ChatOpenAI') && aiConfig.vllm.enabled) {
        // vLLM models get high confidence
        return 0.85;
      }
      if (model.constructor.name.includes('ChatOpenAI') && !aiConfig.vllm.enabled) {
        // OpenRouter models get good confidence
        return 0.75;
      }
      // Local models removed - Ollama no longer supported
      // Default confidence
      return 0.7;
    } catch (error) {
      console.warn('Error estimating model accuracy:', error);
      return 0.5; // Conservative default
    }
  }
  /**
   * Create a chat model based on configuration
   * Priority: vLLM > OpenRouter > Ollama
   */
  private createModel(options: LangChainOptions = {}): BaseChatModel {
    const useLangChain = options.useLangChain ?? true;
    if (!useLangChain) {
      throw new Error('Direct API calls should use modelRouterService instead');
    }
    const modelType = options.modelType || aiConfig.selection.defaultType;
    // Use priority-based selection
    if (modelType === 'vllm' || (modelType === 'local' && aiConfig.vllm.enabled)) {
      try {
        return ModelFactory.createVLLMModel({
          temperature: options.temperature,
          maxTokens: options.maxTokens,
          modelName: options.remoteModel === 'gpt4' ? aiConfig.vllm.modelName : undefined,
        });
      } catch (error) {
        console.warn('vLLM model creation failed, falling back:', error);
      }
    }
    // Fallback to OpenRouter or Ollama based on strategy
    const strategy = aiConfig.selection.strategy;
    if (strategy === 'vllm-first' || strategy === 'smart') {
      return ModelFactory.createModelWithFallback({
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        modelName: this.getModelNameForProvider(options.remoteModel),
      });
    }
    // Use explicit provider
    let provider: ModelProvider;
    if (modelType === 'openrouter') {
      provider = 'openrouter';
    } else if (modelType === 'direct') {
      provider = 'openai'; // Default direct provider
    } else {
      provider = 'vllm';
    }
    return ModelFactory.createModel(provider, {
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      modelName: this.getModelNameForProvider(options.remoteModel),
    });
  }
  /**
   * Get model name based on remote model type
   */
  private getModelNameForProvider(remoteModel?: 'gpt4' | 'claude' | 'gemini'): string | undefined {
    if (!remoteModel) return undefined;
    switch (remoteModel) {
      case 'gpt4':
        return aiConfig.remote.models.gpt4;
      case 'gemini':
        return aiConfig.remote.models.gemini;
      case 'claude':
      default:
        return aiConfig.remote.models.claude;
    }
  }
  /**
   * Convert chat messages to LangChain messages
   */
  private convertMessages(messages: ChatMessage[]): BaseMessage[] {
    return messages.map((msg) => {
      switch (msg.role) {
        case 'system':
          return new SystemMessage(msg.content);
        case 'user':
          return new HumanMessage(msg.content);
        case 'assistant':
          return new AIMessage(msg.content);
        default:
          return new HumanMessage(msg.content);
      }
    });
  }
  /**
   * Generate chat completion using LangChain with intelligent model selection
   */
  async chatCompletion(
    messages: ChatMessage[],
    options: LangChainOptions = {}
  ): Promise<string> {
    // Use intelligent model selection with accuracy checking for agent/chat scenarios
    const enableAccuracyCheck = options.enableAccuracyCheck ?? (options.modelType === 'vllm' || !options.modelType);
    let model: BaseChatModel;
    let selectedProvider: ModelProvider;
    let accuracy: number | undefined;
    
    if (options.customModel) {
        model = options.customModel;
        selectedProvider = 'unknown' as any;
    } else if (enableAccuracyCheck) {
      const result = await this.createModelWithAccuracyCheck(options);
      model = result.model;
      selectedProvider = result.provider;
      accuracy = result.accuracy;
    } else {
      model = this.createModel(options);
      selectedProvider = 'vllm'; // Default assumption
    }
    const langchainMessages = this.convertMessages(messages);
    const response = await model.invoke(langchainMessages);
    return response.content as string;
  }
  /**
   * Create a prompt template chain
   */
  async createPromptChain(
    template: string,
    variables: Record<string, any> = {},
    options: LangChainOptions = {}
  ): Promise<string> {
    const model = this.createModel(options);
    const prompt = ChatPromptTemplate.fromTemplate(template);
    const chain = RunnableSequence.from([prompt, model]);
    const response = await chain.invoke(variables);
    return response.content as string;
  }
  /**
   * Create a chain with memory (conversation history)
   */
  async createChainWithMemory(
    systemPrompt: string,
    messages: ChatMessage[],
    options: LangChainOptions = {}
  ): Promise<string> {
    const model = this.createModel(options);
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', systemPrompt],
      new MessagesPlaceholder('history'),
      ['human', '{input}'],
    ]);
    const chain = RunnableSequence.from([prompt, model]);
    const history = this.convertMessages(messages.slice(0, -1)); // All but last message
    const lastMessage = messages[messages.length - 1];
    const response = await chain.invoke({
      history: history,
      input: lastMessage.content,
    });
    return response.content as string;
  }
  /**
   * Generate text with a simple prompt using intelligent model selection
   */
  async generateText(
    prompt: string,
    options: LangChainOptions = {}
  ): Promise<string> {
    // Use intelligent model selection for text generation as well
    const enableAccuracyCheck = options.enableAccuracyCheck ?? true;
    let model: BaseChatModel;
    
    if (options.customModel) {
        model = options.customModel;
    } else if (enableAccuracyCheck) {
      const result = await this.createModelWithAccuracyCheck(options);
      model = result.model;
    } else {
      model = this.createModel(options);
    }
    const response = await model.invoke([new HumanMessage(prompt)]);
    return response.content as string;
  }
}
export const langChainService = new LangChainService();

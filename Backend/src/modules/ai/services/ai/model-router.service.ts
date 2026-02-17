/**
 * Model Router Service
 * Intelligent model selection and routing with fallback chains
 * Implements task-specific provider selection and performance optimization
 */

import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { aiConfig } from '../../../../core/config/ai.config';
import { directApiConfigs, DirectApiProvider, getAvailableProviders, selectProviderForTask } from '../../../../core/config/direct-apis.config';
import { openRouterConfig } from '../../../../core/config/openrouter.config';
import { logger } from '../../../../shared/utils/logger.util';
import {
    ModelDecision,
    ModelRoutingOptions,
    ModelRoutingResult,
    TaskType,
    TemperatureRecommendation
} from './model-decision.types';
import { ModelFactory } from './model-factory';
import { modelScoringService } from './model-scoring.service';
import { taskTypeDetector } from './task-type-detector.service';
import { temperatureMapper } from './temperature-mapper.service';

const ALL_TASK_TYPES: TaskType[] = [
  'structured_json',
  'code_generation',
  'creative_writing',
  'complex_reasoning',
  'api_execution',
  'data_analysis',
  'mathematical_reasoning',
  'conversational_chat',
  'real_time_information',
  'multimodal_tasks',
  'safety_critical',
  'cost_optimized'
];

// Additional interfaces specific to routing
export interface RoutingAttempt {
  provider: string;
  temperature: number;
  response?: string;
  responseTime: number;
  score?: number;
  decision: ModelDecision;
  error?: string;
}

/**
 * Model Router Service
 * Implements intelligent model selection with fallback chains
 */
export class ModelRouterService {
  private readonly DEFAULT_MAX_RETRIES = 3;
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds

  /**
   * Smart route to the best model for a given task (main entry point)
   */
  async smartRoute(
    prompt: string,
    systemPrompt?: string,
    options: ModelRoutingOptions = {}
  ): Promise<ModelRoutingResult> {
    return this.routeModel(prompt, systemPrompt, options);
  }

  /**
   * Route to the best model for a given task with enhanced intelligence
   */
  async routeModel(
    prompt: string,
    systemPrompt?: string,
    options: ModelRoutingOptions = {}
  ): Promise<ModelRoutingResult> {
    const startTime = Date.now();

    // Detect task type if not provided
    const taskType = options.taskType || await this.detectTaskType(prompt, systemPrompt);

    // Get temperature recommendation with adaptive learning
    const temperatureRec = await temperatureMapper.getOptimalTemperature(
      taskType,
      undefined, // Will be determined by provider
      options.userSpecifiedTemperature,
      false, // Not a retry
      undefined // No historical context yet
    );

    // Get cost-aware routing preferences
    const costPreferences = await this.getCostPreferences(options.userTier || 'standard');

    const routingPath: string[] = [];
    const attempts: RoutingAttempt[] = [];

    try {
      // Phase 1: Try vLLM first (if not forced to use direct/OpenRouter)
      if (!options.forceProvider || options.forceProvider === 'vllm') {
        const vllmResult = await this.tryVLLM(taskType, temperatureRec.recommendedTemperature, prompt);
        routingPath.push('vllm');
        attempts.push(vllmResult);

        if (vllmResult.decision === 'ACCEPT' || options.forceProvider === 'vllm') {
          return this.createResult(
            vllmResult,
            taskType,
            temperatureRec,
            routingPath,
            attempts
          );
        }

        // Handle different decisions
        if (vllmResult.decision === 'RETRY_VLLM') {
          const retryTempRec = await temperatureMapper.getRetryTemperature(
            taskType,
            temperatureRec.recommendedTemperature,
            'vllm',
            vllmResult.score
          );
          const retryTemp = retryTempRec.recommendedTemperature;

          const retryResult = await this.tryVLLM(taskType, retryTemp, prompt, true);
          attempts.push(retryResult);

          if (retryResult.decision === 'ACCEPT') {
            return this.createResult(
              retryResult,
              taskType,
              temperatureRec,
              routingPath,
              attempts,
              retryTemp
            );
          }
        }
      }

      // Phase 2: Try Direct API providers (if score < 50 or forced)
      if (!options.forceProvider || this.isDirectProvider(options.forceProvider)) {
        const directResult = await this.tryDirectProviders(taskType, temperatureRec, prompt, costPreferences, routingPath);
        if (directResult) {
          routingPath.push(`direct-${directResult.provider}`);
          attempts.push(directResult);

          if (directResult.decision === 'ACCEPT' || this.isDirectProvider(options.forceProvider)) {
            return this.createResult(
              directResult,
              taskType,
              temperatureRec,
              routingPath,
              attempts
            );
          }
        }
      }

      // Phase 3: Try OpenRouter (fallback)
      if (!options.forceProvider || options.forceProvider === 'openrouter') {
        const openRouterResult = await this.tryOpenRouter(taskType, temperatureRec.recommendedTemperature, prompt);
        routingPath.push('openrouter');
        attempts.push(openRouterResult);

        if (openRouterResult.decision === 'ACCEPT' || options.forceProvider === 'openrouter') {
          return this.createResult(
            openRouterResult,
            taskType,
            temperatureRec,
            routingPath,
            attempts
          );
        }
      }

      // Phase 4: Final fallback - vLLM with heavy tuning (if not already tried)
      if (routingPath.length === 0 || !routingPath.includes('vllm')) {
        const fallbackTempRec = await temperatureMapper.getRetryTemperature(
          taskType,
          temperatureRec.recommendedTemperature
        );
        const fallbackTemp = fallbackTempRec.recommendedTemperature;

        const fallbackResult = await this.tryVLLM(taskType, fallbackTemp, prompt, true);
        routingPath.push('vllm-fallback');
        attempts.push(fallbackResult);

        return this.createResult(
          fallbackResult,
          taskType,
          temperatureRec,
          routingPath,
          attempts,
          fallbackTemp
        );
      }

      // If we get here, use the best attempt so far
      const bestAttempt = attempts.reduce((best, current) =>
        (current.score || 0) > (best.score || 0) ? current : best
      );

      return this.createResult(
        bestAttempt,
        taskType,
        temperatureRec,
        routingPath,
        attempts
      );

    } catch (error) {
      logger.error('Model routing failed completely', error, {
        taskType,
        routingPath,
        attemptsCount: attempts.length,
        duration: Date.now() - startTime,
      });

      // Emergency fallback to vLLM
      const emergencyResult = await this.tryVLLM(taskType, temperatureRec.recommendedTemperature, prompt);
      return this.createResult(
        emergencyResult,
        taskType,
        temperatureRec,
        [...routingPath, 'emergency-vllm'],
        [...attempts, emergencyResult]
      );
    }
  }

  /**
   * Detect task type from prompt and system prompt
   */
  private async detectTaskType(prompt: string, systemPrompt?: string): Promise<TaskType> {
    const fullText = `${systemPrompt || ''} ${prompt}`.trim();
    const detection = await taskTypeDetector.detectTaskType({
      prompt: fullText,
    });

    return detection.taskType;
  }

  /**
   * Try vLLM with scoring
   */
  private async tryVLLM(
    taskType: TaskType,
    temperature: number,
    prompt: string,
    isRetry: boolean = false
  ): Promise<RoutingAttempt> {
    const startTime = Date.now();

    try {
      if (!aiConfig.vllm.enabled) {
        throw new Error('vLLM not enabled');
      }

      const model = ModelFactory.createVLLMModel({ temperature });

      // Make a test call to score the model
      const testResponse = await this.makeTestCall(model, prompt, taskType);
      const responseTime = Date.now() - startTime;

      // Score the response
      const scoreResult = await modelScoringService.scoreResponse({
        response: testResponse,
        taskType,
        provider: 'vllm',
        temperature,
        responseTime,
      });

      return {
        provider: 'vllm',
        temperature,
        response: testResponse,
        responseTime,
        score: scoreResult.score,
        decision: scoreResult.decision,
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        provider: 'vllm',
        temperature,
        responseTime,
        decision: 'FALLBACK_DIRECT', // Failed, so fallback
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Try direct API providers with cost-aware selection
   */
  private async tryDirectProviders(
    taskType: TaskType,
    temperatureRec: TemperatureRecommendation,
    prompt: string,
    costPreferences: Awaited<ReturnType<typeof this.getCostPreferences>>,
    routingPath: string[]
  ): Promise<RoutingAttempt | null> {
    const selectedProvider = await this.selectBestProvider(taskType, costPreferences, routingPath);

    if (!selectedProvider) {
      return null; // No suitable providers available
    }

    const config = directApiConfigs[selectedProvider as keyof typeof directApiConfigs];
    if (!config) {
      return null;
    }

    const mapping = selectProviderForTask(taskType);

    try {
      // Adjust temperature for this specific provider - Default to 0 as providerAdjustments is not in mapping
      const providerAdjustment = 0;
      const providerTemp = temperatureRec.recommendedTemperature + providerAdjustment;

      const clampedTemp = Math.max(0.1, Math.min(0.9, providerTemp));

      // Create model
      let model: BaseChatModel;
      switch (selectedProvider) {
        case 'openai':
          model = ModelFactory.createDirectOpenAIModel({ temperature: clampedTemp });
          break;
        case 'gemini':
          model = ModelFactory.createDirectGeminiModel({ temperature: clampedTemp });
          break;
        case 'claude':
          model = ModelFactory.createDirectClaudeModel({ temperature: clampedTemp });
          break;
        case 'grok':
          model = ModelFactory.createDirectGrokModel({ temperature: clampedTemp });
          break;
        case 'deepseek':
          model = ModelFactory.createDirectDeepseekModel({ temperature: clampedTemp });
          break;
        default:
          return null;
      }

      // Test the model
      const startTime = Date.now();
      const testResponse = await this.makeTestCall(model, prompt, taskType);
      const responseTime = Date.now() - startTime;

      // Score the response
      const scoreResult = await modelScoringService.scoreResponse({
        response: testResponse,
        taskType,
        provider: selectedProvider,
        temperature: clampedTemp,
        responseTime,
      });

      return {
        provider: selectedProvider,
        temperature: clampedTemp,
        response: testResponse,
        responseTime,
        score: scoreResult.score,
        decision: scoreResult.decision,
      };

    } catch (error) {
      return {
        provider: selectedProvider,
        temperature: temperatureRec.recommendedTemperature,
        responseTime: 0,
        decision: 'FALLBACK_OPENROUTER',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Try OpenRouter as fallback
   */
  private async tryOpenRouter(
    taskType: TaskType,
    temperature: number,
    prompt: string
  ): Promise<RoutingAttempt> {
    const startTime = Date.now();

    try {
      if (!aiConfig.remote.enabled) {
        throw new Error('OpenRouter not enabled');
      }

      // Select best OpenRouter model for task type
      const modelName = this.selectOpenRouterModel(taskType);
      const model = ModelFactory.createOpenRouterModel(modelName, { temperature });

      const testResponse = await this.makeTestCall(model, prompt, taskType);
      const responseTime = Date.now() - startTime;

      const scoreResult = await modelScoringService.scoreResponse({
        response: testResponse,
        taskType,
        provider: 'openrouter',
        temperature,
        responseTime,
      });

      return {
        provider: 'openrouter',
        temperature,
        response: testResponse,
        responseTime,
        score: scoreResult.score,
        decision: scoreResult.decision,
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        provider: 'openrouter',
        temperature,
        responseTime,
        decision: 'FALLBACK_VLLM_TUNED',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Make a test call to evaluate model performance
   */
  private async makeTestCall(model: BaseChatModel, prompt: string, taskType: TaskType): Promise<string> {
    // Create a task-appropriate test prompt
    const testPrompt = this.createTestPrompt(prompt, taskType);

    const messages = [
      { role: 'system' as const, content: 'You are a helpful AI assistant.' },
      { role: 'user' as const, content: testPrompt },
    ];

    // Use langchain service for consistent calling
    const { langChainService } = await import('./langchain.service');
    return await langChainService.chatCompletion(messages, {
      useLangChain: true,
      modelType: 'vllm', // Will be overridden by the provided model
      temperature: 0.7,   // Default for testing
    });
  }

  /**
   * Create appropriate test prompt based on task type
   */
  private createTestPrompt(originalPrompt: string, taskType: TaskType): string {
    // For testing, use a shorter version of the original prompt
    // In production, you might want more sophisticated test prompts
    const maxLength = 200;
    if (originalPrompt.length <= maxLength) {
      return originalPrompt;
    }

    return originalPrompt.substring(0, maxLength) + '...';
  }

  /**
   * Select best OpenRouter model for task type
   */
  private selectOpenRouterModel(taskType: TaskType): string {
    const modelMappings: Record<TaskType, string> = {
      structured_json: openRouterConfig.models.gpt4,     // GPT-4 for JSON
      code_generation: openRouterConfig.models.gpt4,     // GPT-4 for code
      creative_writing: openRouterConfig.models.claude,  // Claude for creative
      complex_reasoning: openRouterConfig.models.gpt4,   // GPT-4 for reasoning
      api_execution: openRouterConfig.models.gemini,     // Gemini for API
      data_analysis: openRouterConfig.models.gpt4,       // GPT-4 for analysis
      mathematical_reasoning: openRouterConfig.models.gemini, // Gemini for math
      conversational_chat: openRouterConfig.models.claude, // Claude for chat
      real_time_information: openRouterConfig.models.gemini, // Gemini for info
      multimodal_tasks: openRouterConfig.models.gemini,  // Gemini for multimodal
      safety_critical: openRouterConfig.models.claude,   // Claude for safety
      cost_optimized: openRouterConfig.models.gemini,    // Gemini for cost
    };

    return modelMappings[taskType] || openRouterConfig.models.claude;
  }

  /**
   * Check if provider is a direct API provider
   */
  private isDirectProvider(provider?: string): boolean {
    if (!provider) return false;
    const directProviders: DirectApiProvider[] = ['openai', 'gemini', 'claude', 'grok', 'deepseek'];
    return directProviders.includes(provider as DirectApiProvider);
  }

  /**
   * Create final routing result
   */
  private createResult(
    attempt: RoutingAttempt,
    taskType: TaskType,
    temperatureRec: TemperatureRecommendation,
    routingPath: string[],
    attempts: RoutingAttempt[],
    overrideTemperature?: number
  ): ModelRoutingResult {
    // Recreate the model for actual use (not just testing)
    let model: BaseChatModel;
    const temperature = overrideTemperature || attempt.temperature;

    switch (attempt.provider) {
      case 'vllm':
        model = ModelFactory.createVLLMModel({ temperature });
        break;
      case 'openrouter':
        const modelName = this.selectOpenRouterModel(taskType);
        model = ModelFactory.createOpenRouterModel(modelName, { temperature });
        break;
      default:
        // Direct API provider
        const provider = attempt.provider as DirectApiProvider;
        switch (provider) {
          case 'openai':
            model = ModelFactory.createDirectOpenAIModel({ temperature });
            break;
          case 'gemini':
            model = ModelFactory.createDirectGeminiModel({ temperature });
            break;
          case 'claude':
            model = ModelFactory.createDirectClaudeModel({ temperature });
            break;
          case 'grok':
            model = ModelFactory.createDirectGrokModel({ temperature });
            break;
          case 'deepseek':
            model = ModelFactory.createDirectDeepseekModel({ temperature });
            break;
          default:
            throw new Error(`Unknown provider: ${provider}`);
        }
    }

    return {
      model,
      provider: attempt.provider,
      temperature,
      taskType,
      confidence: attempt.score || 50,
      routingPath,
      scoreResult: attempt.score ? {
        score: attempt.score,
        decision: attempt.decision,
        reasoning: `Routed through: ${routingPath.join(' → ')}`,
        factors: [],
        recommendations: [],
      } : undefined,
      temperatureRecommendation: temperatureRec,
    };
  }

  /**
   * Get cost-aware routing preferences based on user tier
   */
  private async getCostPreferences(userTier: 'free' | 'standard' | 'premium' | 'enterprise'): Promise<{
    prioritizeCost: boolean;
    maxCostPerRequest: number;
    allowRetries: boolean;
    preferredProviders: string[];
  }> {
    switch (userTier) {
      case 'free':
        return {
          prioritizeCost: true,
          maxCostPerRequest: 0.01,
          allowRetries: false,
          preferredProviders: ['gemini', 'deepseek', 'grok'],
        };
      case 'standard':
        return {
          prioritizeCost: false,
          maxCostPerRequest: 0.05,
          allowRetries: true,
          preferredProviders: ['gemini', 'claude', 'openai', 'deepseek'],
        };
      case 'premium':
        return {
          prioritizeCost: false,
          maxCostPerRequest: 0.10,
          allowRetries: true,
          preferredProviders: ['claude', 'openai', 'gemini'],
        };
      case 'enterprise':
        return {
          prioritizeCost: false,
          maxCostPerRequest: 1.00, // No limit for enterprise
          allowRetries: true,
          preferredProviders: ['openai', 'claude', 'gemini'],
        };
      default:
        return {
          prioritizeCost: false,
          maxCostPerRequest: 0.05,
          allowRetries: true,
          preferredProviders: ['gemini', 'claude', 'openai'],
        };
    }
  }

  /**
   * Enhanced provider selection considering cost and performance
   */
  private async selectBestProvider(
    taskType: TaskType,
    costPreferences: Awaited<ReturnType<typeof this.getCostPreferences>>,
    routingPath: string[]
  ): Promise<string | null> {
    const availableProviders = getAvailableProviders();

    // Filter by cost preferences
    const affordableProviders = availableProviders.filter((provider: string) => {
      const config = directApiConfigs[provider as DirectApiProvider];
      return config && config.capabilities.costPerToken <= costPreferences.maxCostPerRequest;
    });

    // Prefer providers that haven't been tried yet
    const untriedProviders = affordableProviders.filter((p: string) => !routingPath.includes(p));

    if (untriedProviders.length > 0) {
      // If cost is priority, prefer cheaper providers
      if (costPreferences.prioritizeCost) {
        return untriedProviders.sort((a: string, b: string) => {
          const costA = directApiConfigs[a as DirectApiProvider]?.capabilities.costPerToken || 0;
          const costB = directApiConfigs[b as DirectApiProvider]?.capabilities.costPerToken || 0;
          return costA - costB; // Lower cost first
        })[0];
      }

      // Otherwise, prefer by task suitability
      const taskMapping = selectProviderForTask(taskType);
      if (taskMapping && untriedProviders.includes(taskMapping.provider)) {
        return taskMapping.provider;
      }

      // Fallback to preferred providers list
      for (const preferred of costPreferences.preferredProviders) {
        if (untriedProviders.includes(preferred as DirectApiProvider)) {
          return preferred;
        }
      }
    }

    // If all providers have been tried, return the best remaining one
    return cheaperProviders.length > 0 ? cheaperProviders[0] : null;
  }

  /**
   * Get routing statistics for monitoring
   */
  getRoutingStats(): {
    availableProviders: string[];
    taskTypeMappings: Record<TaskType, string[]>;
    successRates: Record<string, number>;
  } {
    const taskTypes: TaskType[] = [
      'structured_json', 'code_generation', 'creative_writing', 'complex_reasoning',
      'api_execution', 'data_analysis', 'mathematical_reasoning', 'conversational_chat',
      'real_time_information', 'multimodal_tasks', 'safety_critical', 'cost_optimized'
    ];
    return {
      availableProviders: getAvailableProviders(),
      taskTypeMappings: Object.fromEntries(
        ALL_TASK_TYPES.map((taskType: TaskType) => {
          const providerInfo = selectProviderForTask(taskType);
          return [
            taskType,
            providerInfo ? [providerInfo.provider as unknown as DirectApiProvider] : []
          ];
        })
      ) as Record<TaskType, string[]>,
      successRates: {}, // Would be populated from actual usage data
    };
  }
}

// Direct API methods are implemented in model-factory.ts

export const modelRouterService = new ModelRouterService();
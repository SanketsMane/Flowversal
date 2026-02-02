/**
 * Temperature Mapper Service
 * Intelligently maps task types to optimal temperature settings
 * Provides dynamic temperature adjustment for retries and performance optimization
 */

import { TaskType, TemperatureConfig, TemperatureRecommendation } from './model-decision.types';

/**
 * Temperature configurations for different task types
 * Based on extensive testing and best practices
 */
const TEMPERATURE_CONFIGS: Record<TaskType, TemperatureConfig> = {
  // Structured JSON: Low temperature for consistency and precision
  structured_json: {
    baseTemperature: 0.2,
    minTemperature: 0.1,
    maxTemperature: 0.3,
    retryAdjustment: -0.05, // Decrease for more precision on retry
    providerAdjustments: {
      openai: 0.0, // OpenAI GPT-4 has excellent JSON mode, use lowest temp
      claude: 0.1, // Claude is good but needs slightly higher temp
      gemini: 0.2, // Gemini needs higher temp for JSON consistency
    },
  },

  // Code Generation: Low temperature for syntactical correctness
  code_generation: {
    baseTemperature: 0.1,
    minTemperature: 0.05,
    maxTemperature: 0.3,
    retryAdjustment: -0.02, // Slight decrease for syntax fixes
    providerAdjustments: {
      deepseek: -0.05, // Deepseek performs best at very low temp
      openai: 0.0, // GPT-4 is deterministic for code
      grok: 0.1, // Grok needs slightly higher for creative code
    },
  },

  // Creative Writing: Higher temperature for variety and engagement
  creative_writing: {
    baseTemperature: 0.8,
    minTemperature: 0.6,
    maxTemperature: 0.9,
    retryAdjustment: 0.05, // Increase for more variety on retry
    providerAdjustments: {
      claude: 0.1, // Claude excels at creative writing
      grok: 0.05, // Grok adds personality
      openai: 0.0, // GPT-4 is solid baseline
    },
  },

  // Complex Reasoning: Medium temperature for balanced creativity and logic
  complex_reasoning: {
    baseTemperature: 0.4,
    minTemperature: 0.3,
    maxTemperature: 0.6,
    retryAdjustment: -0.05, // Decrease for more focused reasoning
    providerAdjustments: {
      openai: -0.05, // GPT-4 is best at step-by-step reasoning
      claude: 0.0, // Claude is also excellent
      gemini: 0.1, // Gemini needs higher temp for complex tasks
    },
  },

  // API Execution: Very low temperature for reliable tool calls
  api_execution: {
    baseTemperature: 0.1,
    minTemperature: 0.05,
    maxTemperature: 0.2,
    retryAdjustment: -0.03, // Decrease for more reliable API calls
    providerAdjustments: {
      gemini: 0.0, // Gemini is cost-effective for API tasks
      openai: -0.02, // GPT-4 is precise but expensive
      claude: -0.01, // Claude is reliable
    },
  },

  // Data Analysis: Low temperature for consistent analysis
  data_analysis: {
    baseTemperature: 0.2,
    minTemperature: 0.1,
    maxTemperature: 0.4,
    retryAdjustment: -0.05, // Decrease for more consistent analysis
    providerAdjustments: {
      openai: -0.05, // GPT-4 excels at data insights
      gemini: 0.0, // Gemini handles large datasets well
      claude: 0.05, // Claude provides good analysis
    },
  },

  // Mathematical Reasoning: Very low temperature for accuracy
  mathematical_reasoning: {
    baseTemperature: 0.1,
    minTemperature: 0.05,
    maxTemperature: 0.2,
    retryAdjustment: -0.03, // Decrease for more accurate calculations
    providerAdjustments: {
      gemini: -0.02, // Gemini has strong math capabilities
      deepseek: 0.0, // Deepseek is good at math
      openai: -0.01, // GPT-4 is mathematically sound
    },
  },

  // Conversational Chat: Medium temperature for natural responses
  conversational_chat: {
    baseTemperature: 0.7,
    minTemperature: 0.5,
    maxTemperature: 0.8,
    retryAdjustment: 0.03, // Slight increase for more natural responses
    providerAdjustments: {
      claude: 0.05, // Claude provides most natural conversations
      grok: 0.08, // Grok adds humor and personality
      openai: 0.0, // GPT-4 is solid baseline
    },
  },

  // Real-time Information: Medium temperature for current context
  real_time_information: {
    baseTemperature: 0.6,
    minTemperature: 0.4,
    maxTemperature: 0.7,
    retryAdjustment: 0.02, // Slight increase for broader information
    providerAdjustments: {
      grok: 0.1, // Grok has real-time knowledge
      gemini: 0.0, // Gemini has good search integration
      openai: -0.05, // GPT-4 knowledge cutoff affects current events
    },
  },

  // Multimodal Tasks: Low-medium temperature for accurate descriptions
  multimodal_tasks: {
    baseTemperature: 0.3,
    minTemperature: 0.2,
    maxTemperature: 0.5,
    retryAdjustment: -0.05, // Decrease for more precise descriptions
    providerAdjustments: {
      gemini: 0.1, // Gemini leads in multimodal
      claude: 0.05, // Claude has good vision capabilities
      openai: 0.0, // GPT-4 has solid vision
    },
  },

  // Safety Critical: Low temperature for responsible outputs
  safety_critical: {
    baseTemperature: 0.3,
    minTemperature: 0.2,
    maxTemperature: 0.4,
    retryAdjustment: -0.05, // Decrease for more conservative responses
    providerAdjustments: {
      claude: -0.05, // Claude is designed for safety
      openai: 0.0, // GPT-4 has good safety measures
      gemini: 0.05, // Gemini is also safe but needs higher temp
    },
  },

  // Cost Optimized: Balanced temperature for efficiency
  cost_optimized: {
    baseTemperature: 0.5,
    minTemperature: 0.3,
    maxTemperature: 0.7,
    retryAdjustment: -0.05, // Optimize for consistency
    providerAdjustments: {
      gemini: -0.1, // Lowest cost, adjust temp accordingly
      deepseek: -0.05, // Cost-effective alternative
      grok: 0.0, // Balanced cost-performance
    },
  },
};

/**
 * Temperature Mapper Service
 */
export class TemperatureMapperService {
  /**
   * Get optimal temperature for a task type and provider with adaptive learning
   */
  async getOptimalTemperature(
    taskType: TaskType,
    provider?: string,
    userSpecifiedTemp?: number,
    isRetry: boolean = false,
    historicalContext?: {
      recentScores?: number[];
      averagePerformance?: number;
    }
  ): Promise<TemperatureRecommendation> {
    // If user specified a temperature, respect it but provide alternatives
    if (userSpecifiedTemp !== undefined) {
      return {
        recommendedTemperature: userSpecifiedTemp,
        reasoning: `Using user-specified temperature: ${userSpecifiedTemp}`,
        confidence: 0.9,
        alternatives: this.generateAlternatives(userSpecifiedTemp, taskType),
      };
    }

    const config = TEMPERATURE_CONFIGS[taskType];
    if (!config) {
      // Fallback for unknown task types
      return {
        recommendedTemperature: 0.5,
        reasoning: 'Unknown task type, using balanced default temperature',
        confidence: 0.5,
        alternatives: [0.3, 0.7, 0.8],
      };
    }

    // Start with base temperature
    let temperature = config.baseTemperature;

    // Apply historical performance adjustments
    if (historicalContext?.recentScores && historicalContext.recentScores.length > 0) {
      const avgRecentScore = historicalContext.recentScores.reduce((a, b) => a + b, 0) / historicalContext.recentScores.length;

      // If recent performance is poor (< 60), increase temperature slightly for more variety
      if (avgRecentScore < 60) {
        temperature += 0.1;
      }
      // If recent performance is excellent (> 85), decrease temperature slightly for consistency
      else if (avgRecentScore > 85) {
        temperature -= 0.05;
      }
    }

    // Apply provider-specific adjustments
    if (provider && config.providerAdjustments[provider]) {
      temperature += config.providerAdjustments[provider];
    }

    // Apply retry adjustments with more intelligence
    if (isRetry) {
      temperature += config.retryAdjustment;

      // For retries, also consider if we should adjust more based on task type
      if (taskType === 'structured_json' || taskType === 'mathematical_reasoning') {
        temperature -= 0.02; // Be more conservative for precision tasks
      } else if (taskType === 'creative_writing') {
        temperature += 0.05; // Try more variety for creative tasks
      }
    }

    // Apply real-time API performance adjustments
    const apiAdjustment = await this.getApiPerformanceAdjustment(provider);
    temperature += apiAdjustment;

    // Clamp to valid range
    temperature = Math.max(config.minTemperature, Math.min(config.maxTemperature, temperature));

    // Generate reasoning
    const reasoning = this.generateReasoning(taskType, temperature, provider, isRetry, historicalContext);

    return {
      recommendedTemperature: temperature,
      reasoning,
      confidence: this.calculateConfidence(taskType, provider, isRetry, historicalContext),
      alternatives: this.generateAlternatives(temperature, taskType),
    };
  }

  /**
   * Get API performance adjustment based on real-time metrics
   */
  private async getApiPerformanceAdjustment(provider?: string): Promise<number> {
    if (!provider) return 0;

    try {
      // In a real implementation, this would check current API performance
      // For now, return a small adjustment based on known provider characteristics

      const performanceAdjustments: Record<string, number> = {
        openai: 0,        // Baseline
        claude: 0.02,     // Slightly warmer for better creativity
        gemini: -0.01,    // Slightly cooler for consistency
        grok: 0.03,       // Warmer for personality
        deepseek: -0.02,  // Cooler for precision
      };

      return performanceAdjustments[provider] || 0;
    } catch (error) {
      return 0; // No adjustment if we can't determine performance
    }
  }

  /**
   * Get temperature for retry scenarios with enhanced intelligence
   */
  async getRetryTemperature(
    taskType: TaskType,
    previousTemperature: number,
    provider?: string,
    performanceScore?: number,
    historicalContext?: {
      recentScores?: number[];
      failurePatterns?: string[];
    }
  ): Promise<TemperatureRecommendation> {
    const config = TEMPERATURE_CONFIGS[taskType];

    // Adjust based on previous performance with more granularity
    let retryTemp = previousTemperature;

    if (performanceScore !== undefined) {
      if (performanceScore < 30) {
        // Very poor performance: significant adjustment
        retryTemp = Math.max(config.minTemperature, previousTemperature - 0.15);
      } else if (performanceScore < 50) {
        // Poor performance: decrease temperature for more precision
        retryTemp = Math.max(config.minTemperature, previousTemperature - 0.1);
      } else if (performanceScore < 70) {
        // Moderate performance: slight adjustment
        retryTemp += config.retryAdjustment;
      } else if (performanceScore > 90) {
        // Excellent performance: slight increase for even better results
        retryTemp += 0.02;
      }
      // Good performance (70-90): keep similar temperature
    } else {
      // Default retry adjustment
      retryTemp += config.retryAdjustment;
    }

    // Consider failure patterns
    if (historicalContext?.failurePatterns) {
      if (historicalContext.failurePatterns.includes('too_random')) {
        retryTemp -= 0.05; // Reduce randomness
      } else if (historicalContext.failurePatterns.includes('too_deterministic')) {
        retryTemp += 0.05; // Increase variety
      }
    }

    // Apply API performance adjustment
    const apiAdjustment = await this.getApiPerformanceAdjustment(provider);
    retryTemp += apiAdjustment;

    // Clamp to valid range
    retryTemp = Math.max(config.minTemperature, Math.min(config.maxTemperature, retryTemp));

    const performanceContext = performanceScore ? ` (previous score: ${performanceScore})` : '';
    return {
      recommendedTemperature: retryTemp,
      reasoning: `Retry temperature adjustment for ${taskType} task (previous: ${previousTemperature.toFixed(2)}, new: ${retryTemp.toFixed(2)})${performanceContext}`,
      confidence: 0.7, // Lower confidence for retry recommendations
      alternatives: this.generateAlternatives(retryTemp, taskType),
    };
  }

  /**
   * Generate alternative temperatures to try
   */
  private generateAlternatives(baseTemp: number, taskType: TaskType): number[] {
    const config = TEMPERATURE_CONFIGS[taskType];
    const alternatives: number[] = [];

    // Generate 2-3 alternatives within valid range
    const range = config.maxTemperature - config.minTemperature;
    const step = range / 4; // Quarter steps

    for (let i = 1; i <= 3; i++) {
      const alt = baseTemp + (i * step);
      if (alt >= config.minTemperature && alt <= config.maxTemperature) {
        alternatives.push(Math.round(alt * 100) / 100); // Round to 2 decimal places
      }
    }

    // Ensure we have at least 2 alternatives
    if (alternatives.length < 2) {
      alternatives.push(config.baseTemperature);
      alternatives.push(config.baseTemperature + 0.1);
    }

    return alternatives.slice(0, 3);
  }

  /**
   * Generate reasoning text for temperature recommendation
   */
  private generateReasoning(
    taskType: TaskType,
    temperature: number,
    provider?: string,
    isRetry: boolean = false,
    historicalContext?: {
      recentScores?: number[];
      averagePerformance?: number;
    }
  ): string {
    const config = TEMPERATURE_CONFIGS[taskType];
    const taskName = taskType.replace('_', ' ');
    const retryText = isRetry ? ' (retry adjustment)' : '';

    let reasoning = `Temperature ${temperature.toFixed(2)} for ${taskName} task${retryText}. `;

    // Add historical context to reasoning
    if (historicalContext?.recentScores && historicalContext.recentScores.length > 0) {
      const avgScore = historicalContext.recentScores.reduce((a, b) => a + b, 0) / historicalContext.recentScores.length;
      if (avgScore < 60) {
        reasoning += 'Increased slightly due to recent performance challenges. ';
      } else if (avgScore > 85) {
        reasoning += 'Optimized based on excellent recent performance. ';
      }
    }

    // Add task-specific reasoning
    switch (taskType) {
      case 'structured_json':
        reasoning += 'Low temperature ensures consistent JSON formatting and schema adherence.';
        break;
      case 'code_generation':
        reasoning += 'Very low temperature prevents syntax errors and ensures code correctness.';
        break;
      case 'creative_writing':
        reasoning += 'Higher temperature allows for creative expression and varied content.';
        break;
      case 'complex_reasoning':
        reasoning += 'Balanced temperature enables logical thinking with some creative problem-solving.';
        break;
      case 'api_execution':
        reasoning += 'Very low temperature ensures reliable and precise API interactions.';
        break;
      case 'safety_critical':
        reasoning += 'Conservative temperature prioritizes safety and responsible outputs.';
        break;
      case 'cost_optimized':
        reasoning += 'Balanced temperature optimizes for both quality and cost-efficiency.';
        break;
      default:
        reasoning += `Optimal for ${taskName} based on task requirements.`;
    }

    // Add provider-specific notes
    if (provider && config.providerAdjustments[provider]) {
      const adjustment = config.providerAdjustments[provider];
      if (adjustment !== 0) {
        const direction = adjustment > 0 ? 'increased' : 'decreased';
        reasoning += ` ${Math.abs(adjustment * 100)}% ${direction} for ${provider} provider characteristics.`;
      }
    }

    return reasoning;
  }

  /**
   * Calculate confidence in the temperature recommendation
   */
  private calculateConfidence(
    taskType: TaskType,
    provider?: string,
    isRetry: boolean = false,
    historicalContext?: {
      recentScores?: number[];
      averagePerformance?: number;
    }
  ): number {
    let confidence = 0.8; // Base confidence

    // Higher confidence for well-known task types
    const highConfidenceTasks: TaskType[] = [
      'structured_json',
      'code_generation',
      'api_execution',
      'mathematical_reasoning',
      'safety_critical'
    ];

    if (highConfidenceTasks.includes(taskType)) {
      confidence += 0.1;
    }

    // Lower confidence for creative tasks (more subjective)
    const creativeTasks: TaskType[] = ['creative_writing', 'conversational_chat'];
    if (creativeTasks.includes(taskType)) {
      confidence -= 0.1;
    }

    // Provider-specific confidence adjustments
    if (provider) {
      const config = TEMPERATURE_CONFIGS[taskType];
      if (config.providerAdjustments[provider]) {
        confidence += 0.05; // Slightly higher confidence when we have provider-specific tuning
      }
    }

    // Historical performance boosts confidence
    if (historicalContext?.recentScores && historicalContext.recentScores.length >= 3) {
      confidence += 0.05; // We have data to work with
    }

    // Lower confidence for retries (less predictable)
    if (isRetry) {
      confidence -= 0.1;
    }

    return Math.max(0.5, Math.min(0.95, confidence)); // Clamp between 0.5 and 0.95
  }

  /**
   * Get temperature range for a task type
   */
  getTemperatureRange(taskType: TaskType): { min: number; max: number; optimal: number } {
    const config = TEMPERATURE_CONFIGS[taskType];
    if (!config) {
      return { min: 0.1, max: 0.9, optimal: 0.5 };
    }

    return {
      min: config.minTemperature,
      max: config.maxTemperature,
      optimal: config.baseTemperature,
    };
  }

  /**
   * Validate temperature is within acceptable range for task type
   */
  validateTemperature(taskType: TaskType, temperature: number): boolean {
    const config = TEMPERATURE_CONFIGS[taskType];
    if (!config) return temperature >= 0 && temperature <= 1;

    return temperature >= config.minTemperature && temperature <= config.maxTemperature;
  }
}

export const temperatureMapper = new TemperatureMapperService();
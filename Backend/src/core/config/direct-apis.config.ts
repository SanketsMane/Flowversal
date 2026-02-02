import { env } from './env';

/**
 * Direct API Provider Configuration
 * Supports OpenAI, Google Gemini, Anthropic Claude, xAI Grok, and Deepseek
 */

export type DirectApiProvider = 'openai' | 'gemini' | 'claude' | 'grok' | 'deepseek';

export interface DirectApiConfig {
  enabled: boolean;
  apiKey: string;
  baseUrl: string;
  models: Record<string, string>;
  capabilities: {
    jsonMode: boolean;
    functionCalling: boolean;
    vision: boolean;
    streaming: boolean;
    maxTokens: number;
    costPerToken: number;
  };
  specialties: string[]; // What this provider excels at
}

export interface TaskTypeMapping {
  taskType: string;
  primaryProvider: DirectApiProvider;
  secondaryProviders: DirectApiProvider[];
  reasoning: string;
  optimalTemperature: number;
  requiredCapabilities: string[];
}

/**
 * Direct API Configurations
 */
export const directApiConfigs: Record<DirectApiProvider, DirectApiConfig> = {
  openai: {
    enabled: env.DIRECT_OPENAI_ENABLED ?? false,
    apiKey: env.OPENAI_API_KEY || '',
    baseUrl: 'https://api.openai.com/v1',
    models: {
      gpt4: 'gpt-4',
      gpt4Turbo: 'gpt-4-turbo-preview',
      gpt35Turbo: 'gpt-3.5-turbo',
    },
    capabilities: {
      jsonMode: true, // Excellent JSON mode
      functionCalling: true,
      vision: true,
      streaming: true,
      maxTokens: 128000,
      costPerToken: 0.03, // Higher cost but best quality
    },
    specialties: [
      'structured_json',
      'code_generation',
      'precise_instructions',
      'function_calling',
      'data_analysis',
      'mathematical_reasoning'
    ],
  },

  gemini: {
    enabled: env.DIRECT_GEMINI_ENABLED ?? false,
    apiKey: env.GEMINI_API_KEY || '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: {
      pro: 'gemini-pro',
      proVision: 'gemini-pro-vision',
      ultra: 'gemini-ultra',
    },
    capabilities: {
      jsonMode: false, // Limited JSON mode
      functionCalling: true,
      vision: true,
      streaming: true,
      maxTokens: 32768,
      costPerToken: 0.001, // Most cost-effective
    },
    specialties: [
      'cost_effective',
      'multimodal',
      'real_world_knowledge',
      'search_augmented',
      'api_execution',
      'mathematical_reasoning',
      'multilingual'
    ],
  },

  claude: {
    enabled: env.DIRECT_CLAUDE_ENABLED ?? false,
    apiKey: env.ANTHROPIC_API_KEY || '',
    baseUrl: 'https://api.anthropic.com/v1',
    models: {
      opus: 'claude-3-opus-20240229',
      sonnet: 'claude-3-sonnet-20240229',
      haiku: 'claude-3-haiku-20240307',
    },
    capabilities: {
      jsonMode: true,
      functionCalling: true,
      vision: true,
      streaming: true,
      maxTokens: 200000,
      costPerToken: 0.015,
    },
    specialties: [
      'creative_writing',
      'long_form_content',
      'analysis',
      'ethical_reasoning',
      'complex_instructions',
      'conversational',
      'safety_focused',
      'context_handling'
    ],
  },

  grok: {
    enabled: env.DIRECT_GROK_ENABLED ?? false,
    apiKey: env.GROK_API_KEY || '',
    baseUrl: 'https://api.x.ai/v1',
    models: {
      grok1: 'grok-1',
      grok1beta: 'grok-beta',
    },
    capabilities: {
      jsonMode: false,
      functionCalling: true,
      vision: false,
      streaming: true,
      maxTokens: 8192,
      costPerToken: 0.01,
    },
    specialties: [
      'real_time_information',
      'humor_wit',
      'coding',
      'technical_questions',
      'current_events',
      'independent_thinking',
      'x_ai_integration'
    ],
  },

  deepseek: {
    enabled: env.DIRECT_DEEPSEEK_ENABLED ?? false,
    apiKey: env.DEEPSEEK_API_KEY || '',
    baseUrl: 'https://api.deepseek.com/v1',
    models: {
      coder: 'deepseek-coder',
      chat: 'deepseek-chat',
    },
    capabilities: {
      jsonMode: true,
      functionCalling: true,
      vision: false,
      streaming: true,
      maxTokens: 32768,
      costPerToken: 0.002,
    },
    specialties: [
      'code_generation',
      'coding_assistance',
      'mathematical_reasoning',
      'algorithmic_tasks',
      'technical_writing',
      'cost_effective_coding'
    ],
  },
};

/**
 * Intelligent Task-to-Provider Mapping
 * Based on performance characteristics, cost, and model specialties
 */
export const taskTypeMappings: TaskTypeMapping[] = [
  {
    taskType: 'structured_json',
    primaryProvider: 'openai',
    secondaryProviders: ['claude', 'gemini'],
    reasoning: 'OpenAI has the best JSON mode and structured output capabilities. Claude is good backup for complex schemas.',
    optimalTemperature: 0.2,
    requiredCapabilities: ['jsonMode'],
  },
  {
    taskType: 'code_generation',
    primaryProvider: 'deepseek',
    secondaryProviders: ['openai', 'grok', 'claude'],
    reasoning: 'Deepseek specializes in coding tasks with excellent performance. OpenAI GPT-4 is best for complex code architecture.',
    optimalTemperature: 0.1,
    requiredCapabilities: ['functionCalling'],
  },
  {
    taskType: 'creative_writing',
    primaryProvider: 'claude',
    secondaryProviders: ['openai', 'grok'],
    reasoning: 'Claude excels at creative writing, long-form content, and nuanced expression. Grok adds humor and personality.',
    optimalTemperature: 0.8,
    requiredCapabilities: ['streaming'],
  },
  {
    taskType: 'complex_reasoning',
    primaryProvider: 'openai',
    secondaryProviders: ['claude', 'gemini'],
    reasoning: 'GPT-4 has superior reasoning capabilities for complex multi-step problems. Claude is excellent for analysis.',
    optimalTemperature: 0.4,
    requiredCapabilities: ['functionCalling'],
  },
  {
    taskType: 'api_execution',
    primaryProvider: 'gemini',
    secondaryProviders: ['openai', 'claude'],
    reasoning: 'Gemini is cost-effective for API tasks and handles schemas well. OpenAI provides precision when needed.',
    optimalTemperature: 0.1,
    requiredCapabilities: ['functionCalling'],
  },
  {
    taskType: 'data_analysis',
    primaryProvider: 'openai',
    secondaryProviders: ['gemini', 'claude'],
    reasoning: 'OpenAI GPT-4 is excellent at data analysis and generating insights. Gemini handles large datasets efficiently.',
    optimalTemperature: 0.2,
    requiredCapabilities: ['jsonMode'],
  },
  {
    taskType: 'mathematical_reasoning',
    primaryProvider: 'gemini',
    secondaryProviders: ['deepseek', 'openai'],
    reasoning: 'Gemini and Deepseek excel at mathematical reasoning. OpenAI provides verification capabilities.',
    optimalTemperature: 0.1,
    requiredCapabilities: [],
  },
  {
    taskType: 'conversational_chat',
    primaryProvider: 'claude',
    secondaryProviders: ['grok', 'openai'],
    reasoning: 'Claude provides natural, safe conversations. Grok adds personality and humor.',
    optimalTemperature: 0.7,
    requiredCapabilities: ['streaming'],
  },
  {
    taskType: 'real_time_information',
    primaryProvider: 'grok',
    secondaryProviders: ['gemini', 'openai'],
    reasoning: 'Grok has access to real-time information and current events. Gemini provides comprehensive knowledge.',
    optimalTemperature: 0.6,
    requiredCapabilities: [],
  },
  {
    taskType: 'multimodal_tasks',
    primaryProvider: 'gemini',
    secondaryProviders: ['claude', 'openai'],
    reasoning: 'Gemini leads in multimodal capabilities (vision, audio). Claude and GPT-4 provide analysis of multimodal content.',
    optimalTemperature: 0.3,
    requiredCapabilities: ['vision'],
  },
  {
    taskType: 'safety_critical',
    primaryProvider: 'claude',
    secondaryProviders: ['openai', 'gemini'],
    reasoning: 'Claude is designed with safety and ethics as primary concerns. OpenAI provides balanced safety measures.',
    optimalTemperature: 0.3,
    requiredCapabilities: [],
  },
  {
    taskType: 'cost_optimized',
    primaryProvider: 'gemini',
    secondaryProviders: ['deepseek', 'grok'],
    reasoning: 'Gemini offers the best cost-performance ratio. Deepseek and Grok provide cost-effective alternatives.',
    optimalTemperature: 0.5,
    requiredCapabilities: [],
  },
];

/**
 * Get available providers for a task type
 */
export function getProvidersForTask(taskType: string): {
  primary: DirectApiProvider;
  secondary: DirectApiProvider[];
  config: TaskTypeMapping;
} | null {
  const mapping = taskTypeMappings.find(m => m.taskType === taskType);
  if (!mapping) return null;

  return {
    primary: mapping.primaryProvider,
    secondary: mapping.secondaryProviders,
    config: mapping,
  };
}

/**
 * Check if a provider is available and enabled
 */
export function isProviderAvailable(provider: DirectApiProvider): boolean {
  const config = directApiConfigs[provider];
  return config.enabled && !!config.apiKey;
}

/**
 * Get all available providers
 */
export function getAvailableProviders(): DirectApiProvider[] {
  return Object.keys(directApiConfigs).filter(provider =>
    isProviderAvailable(provider as DirectApiProvider)
  ) as DirectApiProvider[];
}

/**
 * Get provider config with availability check
 */
export function getProviderConfig(provider: DirectApiProvider): DirectApiConfig | null {
  if (!isProviderAvailable(provider)) return null;
  return directApiConfigs[provider];
}

/**
 * Find best provider for task with fallback logic
 */
export function selectProviderForTask(taskType: string): {
  provider: DirectApiProvider;
  config: DirectApiConfig;
  mapping: TaskTypeMapping;
} | null {
  const taskMapping = taskTypeMappings.find(m => m.taskType === taskType);
  if (!taskMapping) return null;

  // Try primary provider first
  if (isProviderAvailable(taskMapping.primaryProvider)) {
    const config = getProviderConfig(taskMapping.primaryProvider);
    if (config) {
      return {
        provider: taskMapping.primaryProvider,
        config,
        mapping: taskMapping,
      };
    }
  }

  // Try secondary providers
  for (const provider of taskMapping.secondaryProviders) {
    if (isProviderAvailable(provider)) {
      const config = getProviderConfig(provider);
      if (config) {
        return {
          provider,
          config,
          mapping: taskMapping,
        };
      }
    }
  }

  return null;
}
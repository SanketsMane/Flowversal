import { env } from './env';

export const aiConfig = {
  // vLLM / Flowversal AI Model (Priority 1)
  vllm: {
    enabled: env.VLLM_ENABLED,
    baseUrl: env.VLLM_BASE_URL,
    modelName: env.VLLM_MODEL_NAME,
    apiKey: env.VLLM_API_KEY,
  },
  // OpenRouter (Priority 2)
  remote: {
    enabled: env.REMOTE_MODELS_ENABLED,
    baseUrl: env.OPENROUTER_BASE_URL,
    apiKey: env.OPENROUTER_API_KEY,
    models: {
      gpt4: env.REMOTE_MODEL_GPT4,
      claude: env.REMOTE_MODEL_CLAUDE,
      gemini: env.REMOTE_MODEL_GEMINI,
    },
  },
  // Direct API Providers (Priority 2.5 - between OpenRouter and fallback)
  directApis: {
    enabled: env.DIRECT_OPENAI_ENABLED || env.DIRECT_GEMINI_ENABLED || env.DIRECT_CLAUDE_ENABLED ||
             env.DIRECT_GROK_ENABLED || env.DIRECT_DEEPSEEK_ENABLED,
    providers: {
      openai: env.DIRECT_OPENAI_ENABLED,
      gemini: env.DIRECT_GEMINI_ENABLED,
      claude: env.DIRECT_CLAUDE_ENABLED,
      grok: env.DIRECT_GROK_ENABLED,
      deepseek: env.DIRECT_DEEPSEEK_ENABLED,
    },
  },
  selection: {
    defaultType: env.DEFAULT_MODEL_TYPE,
    fallbackToRemote: env.FALLBACK_TO_REMOTE,
    strategy: env.MODEL_SELECTION_STRATEGY,
  },
};


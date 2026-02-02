import { env } from './env';

export const openRouterConfig = {
  baseUrl: env.OPENROUTER_BASE_URL,
  apiKey: env.OPENROUTER_API_KEY,
  models: {
    gpt4: env.REMOTE_MODEL_GPT4,
    claude: env.REMOTE_MODEL_CLAUDE,
    gemini: env.REMOTE_MODEL_GEMINI,
  },
  defaultHeaders: {
    'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
    'HTTP-Referer': 'https://flowversal.com',
    'X-Title': 'Flowversal AI',
  },
};


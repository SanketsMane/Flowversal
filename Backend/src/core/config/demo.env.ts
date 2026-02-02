import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvConfig {
  // Server
  NODE_ENV: string;
  PORT: number;
  API_VERSION: string;

  // MongoDB
  MONGODB_URI: string;
  MONGODB_DB_NAME: string;

  // Pinecone
  PINECONE_API_KEY: string;
  PINECONE_ENVIRONMENT: string;
  PINECONE_INDEX_NAME: string;

  // Supabase
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;

  // Local AI Models (Ollama)
  OLLAMA_BASE_URL: string;
  LOCAL_MODEL_ENABLED: boolean;
  LOCAL_MODEL_NAME: string;
  LOCAL_MODEL_FALLBACK: boolean;

  // OpenRouter
  OPENROUTER_API_KEY: string;
  OPENROUTER_BASE_URL: string;
  REMOTE_MODELS_ENABLED: boolean;
  REMOTE_MODEL_GPT4: string;
  REMOTE_MODEL_CLAUDE: string;
  REMOTE_MODEL_GEMINI: string;

  // Model Selection
  DEFAULT_MODEL_TYPE: 'local' | 'remote';
  FALLBACK_TO_REMOTE: boolean;
  MODEL_SELECTION_STRATEGY: 'smart' | 'local-first' | 'remote-first';

  // Inngest
  INNGEST_EVENT_KEY: string;
  INNGEST_SIGNING_KEY: string;
  INNGEST_BASE_URL: string;

  // JWT
  JWT_SECRET: string;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue || '';
}

function getEnvBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  if (isNaN(num)) return defaultValue;
  return num;
}

export const env: EnvConfig = {
  // Server
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: getEnvNumber('PORT', 3001),
  API_VERSION: getEnvVar('API_VERSION', 'v1'),

  // MongoDB
  MONGODB_URI: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/flowversal'),
  MONGODB_DB_NAME: getEnvVar('MONGODB_DB_NAME', 'flowversal'),

  // Pinecone
  PINECONE_API_KEY: getEnvVar('PINECONE_API_KEY'),
  PINECONE_ENVIRONMENT: getEnvVar('PINECONE_ENVIRONMENT', 'us-east-1'),
  PINECONE_INDEX_NAME: getEnvVar('PINECONE_INDEX_NAME', 'flowversal-index'),

  // Supabase
  SUPABASE_URL: getEnvVar('SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),

  // Local AI Models
  OLLAMA_BASE_URL: getEnvVar('OLLAMA_BASE_URL', 'http://localhost:11434'),
  LOCAL_MODEL_ENABLED: getEnvBoolean('LOCAL_MODEL_ENABLED', true),
  LOCAL_MODEL_NAME: getEnvVar('LOCAL_MODEL_NAME', 'llama3:70b'),
  LOCAL_MODEL_FALLBACK: getEnvBoolean('LOCAL_MODEL_FALLBACK', true),

  // OpenRouter
  OPENROUTER_API_KEY: getEnvVar('OPENROUTER_API_KEY'),
  OPENROUTER_BASE_URL: getEnvVar('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
  REMOTE_MODELS_ENABLED: getEnvBoolean('REMOTE_MODELS_ENABLED', true),
  REMOTE_MODEL_GPT4: getEnvVar('REMOTE_MODEL_GPT4', 'openai/gpt-4.1'),
  REMOTE_MODEL_CLAUDE: getEnvVar('REMOTE_MODEL_CLAUDE', 'anthropic/claude-3.5-sonnet'),
  REMOTE_MODEL_GEMINI: getEnvVar('REMOTE_MODEL_GEMINI', 'google/gemini-2.0-flash-exp'),

  // Model Selection
  DEFAULT_MODEL_TYPE: (getEnvVar('DEFAULT_MODEL_TYPE', 'local') as 'local' | 'remote'),
  FALLBACK_TO_REMOTE: getEnvBoolean('FALLBACK_TO_REMOTE', true),
  MODEL_SELECTION_STRATEGY: (getEnvVar('MODEL_SELECTION_STRATEGY', 'smart') as 'smart' | 'local-first' | 'remote-first'),

  // Inngest
  INNGEST_EVENT_KEY: getEnvVar('INNGEST_EVENT_KEY'),
  INNGEST_SIGNING_KEY: getEnvVar('INNGEST_SIGNING_KEY'),
  INNGEST_BASE_URL: getEnvVar('INNGEST_BASE_URL', 'https://api.inngest.com'),

  // JWT
  JWT_SECRET: getEnvVar('JWT_SECRET', 'your-secret-key-change-in-production'),
};

// Validate critical environment variables in production
if (env.NODE_ENV === 'production') {
  const requiredVars = [
    'MONGODB_URI',
    'PINECONE_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables in production: ${missing.join(', ')}`);
  }
}


import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import path from 'path';

// Load environment variables
// Priority 1: Current directory (Backend/.env)
dotenv.config();

// Priority 2: Root directory (../../.env) - for monorepo setups
const rootEnvPath = path.resolve(__dirname, '../../.env');
if (!process.env.PORT && existsSync(rootEnvPath)) {
  console.log(`Loading .env from root: ${rootEnvPath}`);
  dotenv.config({ path: rootEnvPath });
} else if (!process.env.PORT) {
  // If still no PORT, warn but don't crash yet
  console.warn(`⚠️ .env file not found in current directory or at ${rootEnvPath}`);
}

// Debug: Log if Pinecone key is loaded (only show first few chars for security)
if (process.env.PINECONE_API_KEY) {
  const keyPreview = process.env.PINECONE_API_KEY.substring(0, 10) + '...';
  console.log(`✅ Pinecone API key loaded from .env (${keyPreview})`);
} else {
  console.error('❌ PINECONE_API_KEY not found in environment variables!');
}

interface EnvConfig {
  // Server
  NODE_ENV: string;
  PORT: number;
  API_VERSION: string;
  USE_INNGEST_FOR_EXECUTIONS: boolean;
  MAX_EXECUTION_PAGE_SIZE: number;
  REDIS_URL: string;
  API_KEY_ALLOWLIST: string[];
  CACHE_MAX_AGE: number;
  CACHE_STALE_WHILE_REVALIDATE: number;
  // Auth
  MFA_ENFORCED: boolean;
  PASSWORD_MIN_LENGTH: number;
  PASSWORD_REQUIRE_SYMBOL: boolean;
  PASSWORD_REQUIRE_NUMBER: boolean;
  PASSWORD_REQUIRE_UPPER: boolean;
  // Storage
  GCS_BUCKET: string;
  GCS_PROJECT_ID: string;
  GCS_CLIENT_EMAIL: string;
  GCS_PRIVATE_KEY: string;

  // MongoDB
  MONGODB_URI: string;
  MONGODB_DB_NAME: string;

  // Pinecone
  PINECONE_API_KEY: string;
  PINECONE_ENVIRONMENT: string;
  PINECONE_INDEX_NAME: string;
  PINECONE_HOST: string;
  
  // Supabase
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;

  // vLLM / Flowversal AI Model (Priority 1)
  VLLM_BASE_URL: string;
  VLLM_ENABLED: boolean;
  VLLM_MODEL_NAME: string;
  VLLM_API_KEY: string;

  // OpenRouter (Fallback option)
  OPENROUTER_API_KEY: string;
  OPENROUTER_BASE_URL: string;
  REMOTE_MODELS_ENABLED: boolean;
  REMOTE_MODEL_GPT4: string;
  REMOTE_MODEL_CLAUDE: string;
  REMOTE_MODEL_GEMINI: string;

  // Direct API Providers
  DIRECT_OPENAI_ENABLED: boolean;
  OPENAI_API_KEY: string;
  DIRECT_GEMINI_ENABLED: boolean;
  GEMINI_API_KEY: string;
  DIRECT_CLAUDE_ENABLED: boolean;
  ANTHROPIC_API_KEY: string;
  DIRECT_GROK_ENABLED: boolean;
  GROK_API_KEY: string;
  DIRECT_DEEPSEEK_ENABLED: boolean;
  DEEPSEEK_API_KEY: string;

  // Monitoring & Error Tracking
  SENTRY_DSN?: string;
  ENABLE_METRICS: boolean;

  // Model Selection
  DEFAULT_MODEL_TYPE: 'vllm' | 'openrouter' | 'direct';
  FALLBACK_TO_REMOTE: boolean;
  MODEL_SELECTION_STRATEGY: 'smart' | 'vllm-first' | 'openrouter-first' | 'direct-first';

  // Inngest
  INNGEST_EVENT_KEY: string;
  INNGEST_SIGNING_KEY: string;
  INNGEST_BASE_URL: string;

  // JWT
  JWT_SECRET: string;

  // Encryption
  ENCRYPTION_SECRET: string;

  // Workflow Execution
  WORKFLOW_EXECUTION_TIMEOUT: number; // in milliseconds
  WORKFLOW_NODE_TIMEOUT: number; // in milliseconds

  // Neon PostgreSQL (Auth Database)
  NEON_DATABASE_URL: string;
  JWT_EXPIRES_IN: string;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
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
  PORT: getEnvNumber('PORT', 8000),
  API_VERSION: getEnvVar('API_VERSION', 'v1'),
  USE_INNGEST_FOR_EXECUTIONS: getEnvBoolean('USE_INNGEST_FOR_EXECUTIONS', false),
  MAX_EXECUTION_PAGE_SIZE: getEnvNumber('MAX_EXECUTION_PAGE_SIZE', 100),
  // Storage
  GCS_BUCKET: getEnvVar('GCS_BUCKET', ''),
  GCS_PROJECT_ID: getEnvVar('GCS_PROJECT_ID', ''),
  GCS_CLIENT_EMAIL: getEnvVar('GCS_CLIENT_EMAIL', ''),
  GCS_PRIVATE_KEY: getEnvVar('GCS_PRIVATE_KEY', ''),

  // MongoDB
  MONGODB_URI: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/flowversal'),
  MONGODB_DB_NAME: getEnvVar('MONGODB_DB_NAME', 'flowversal'),

  // Pinecone
  PINECONE_API_KEY: getEnvVar('PINECONE_API_KEY'),
  PINECONE_ENVIRONMENT: getEnvVar('PINECONE_ENVIRONMENT', 'us-east-1'),
  PINECONE_INDEX_NAME: getEnvVar('PINECONE_INDEX_NAME', 'flowversalidx'),
  PINECONE_HOST: getEnvVar('PINECONE_HOST', ''),

  // Supabase
  SUPABASE_URL: getEnvVar('SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),

  // vLLM / Flowversal AI Model (Priority 1)
  VLLM_BASE_URL: getEnvVar('VLLM_BASE_URL', 'http://localhost:8000/v1'),
  VLLM_ENABLED: getEnvBoolean('VLLM_ENABLED', true),
  VLLM_MODEL_NAME: getEnvVar('VLLM_MODEL_NAME', 'flowversal-ai'),
  VLLM_API_KEY: getEnvVar('VLLM_API_KEY', ''),

  // OpenRouter (Fallback option)
  OPENROUTER_API_KEY: getEnvVar('OPENROUTER_API_KEY'),
  OPENROUTER_BASE_URL: getEnvVar('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
  REMOTE_MODELS_ENABLED: getEnvBoolean('REMOTE_MODELS_ENABLED', true),
  REMOTE_MODEL_GPT4: getEnvVar('REMOTE_MODEL_GPT4', 'openai/gpt-4o'),
  REMOTE_MODEL_CLAUDE: getEnvVar('REMOTE_MODEL_CLAUDE', 'anthropic/claude-3.5-sonnet'),
  REMOTE_MODEL_GEMINI: getEnvVar('REMOTE_MODEL_GEMINI', 'google/gemini-2.0-flash-exp'),

  // Direct API Providers
  DIRECT_OPENAI_ENABLED: getEnvBoolean('DIRECT_OPENAI_ENABLED', false),
  OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY', ''),
  DIRECT_GEMINI_ENABLED: getEnvBoolean('DIRECT_GEMINI_ENABLED', false),
  GEMINI_API_KEY: getEnvVar('GEMINI_API_KEY', ''),
  DIRECT_CLAUDE_ENABLED: getEnvBoolean('DIRECT_CLAUDE_ENABLED', false),
  ANTHROPIC_API_KEY: getEnvVar('ANTHROPIC_API_KEY', ''),
  DIRECT_GROK_ENABLED: getEnvBoolean('DIRECT_GROK_ENABLED', false),
  GROK_API_KEY: getEnvVar('GROK_API_KEY', ''),
  DIRECT_DEEPSEEK_ENABLED: getEnvBoolean('DIRECT_DEEPSEEK_ENABLED', false),
  DEEPSEEK_API_KEY: getEnvVar('DEEPSEEK_API_KEY', ''),

  // Model Selection
  DEFAULT_MODEL_TYPE: (getEnvVar('DEFAULT_MODEL_TYPE', 'vllm') as 'vllm' | 'openrouter' | 'direct'),
  FALLBACK_TO_REMOTE: getEnvBoolean('FALLBACK_TO_REMOTE', true),
  MODEL_SELECTION_STRATEGY: (getEnvVar('MODEL_SELECTION_STRATEGY', 'smart') as 'smart' | 'vllm-first' | 'openrouter-first' | 'direct-first'),

  // Inngest
  INNGEST_EVENT_KEY: getEnvVar('INNGEST_EVENT_KEY'),
  INNGEST_SIGNING_KEY: getEnvVar('INNGEST_SIGNING_KEY'),
  INNGEST_BASE_URL: getEnvVar('INNGEST_BASE_URL', 'https://api.inngest.com'),

  // JWT
  JWT_SECRET: getEnvVar('JWT_SECRET', 'your-secret-key-change-in-production'),

  // Encryption
  ENCRYPTION_SECRET: getEnvVar('ENCRYPTION_SECRET', 'change-this-encryption-secret-in-production'),

  // Workflow Execution
  WORKFLOW_EXECUTION_TIMEOUT: getEnvNumber('WORKFLOW_EXECUTION_TIMEOUT', 300000), // 5 minutes default
  WORKFLOW_NODE_TIMEOUT: getEnvNumber('WORKFLOW_NODE_TIMEOUT', 60000), // 1 minute per node default

  // Monitoring & Error Tracking
  SENTRY_DSN: getEnvVar('SENTRY_DSN', ''),
  ENABLE_METRICS: getEnvBoolean('ENABLE_METRICS', true),

  // Distributed cache / rate limit
  REDIS_URL: getEnvVar('REDIS_URL', ''),

  // API Keys
  API_KEY_ALLOWLIST: getEnvVar('API_KEY_ALLOWLIST', '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean),

  // Neon PostgreSQL
  NEON_DATABASE_URL: getEnvVar('NEON_DATABASE_URL', ''),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '7d'),

  // Auth policies
  MFA_ENFORCED: getEnvBoolean('MFA_ENFORCED', false),
  PASSWORD_MIN_LENGTH: getEnvNumber('PASSWORD_MIN_LENGTH', 8),
  PASSWORD_REQUIRE_SYMBOL: getEnvBoolean('PASSWORD_REQUIRE_SYMBOL', true),
  PASSWORD_REQUIRE_NUMBER: getEnvBoolean('PASSWORD_REQUIRE_NUMBER', true),
  PASSWORD_REQUIRE_UPPER: getEnvBoolean('PASSWORD_REQUIRE_UPPER', true),

  // HTTP caching
  CACHE_MAX_AGE: getEnvNumber('CACHE_MAX_AGE', 60),
  CACHE_STALE_WHILE_REVALIDATE: getEnvNumber('CACHE_STALE_WHILE_REVALIDATE', 300),
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


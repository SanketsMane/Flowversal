import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import path from 'path';

// Load environment variables
dotenv.config();
const rootEnvPath = path.resolve(__dirname, '../../.env');
if (!process.env.PORT && existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
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

  // vLLM / Flowversal AI Model
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

  // Flowversal Remote
  FLOWVERSAL_REMOTE_ENABLED: boolean;
  FLOWVERSAL_REMOTE_API_KEY: string;
  FLOWVERSAL_REMOTE_URL: string;

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
  WORKFLOW_EXECUTION_TIMEOUT: number;
  WORKFLOW_NODE_TIMEOUT: number;

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
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: getEnvNumber('PORT', 8000),
  API_VERSION: getEnvVar('API_VERSION', 'v1'),
  USE_INNGEST_FOR_EXECUTIONS: getEnvBoolean('USE_INNGEST_FOR_EXECUTIONS', false),
  MAX_EXECUTION_PAGE_SIZE: getEnvNumber('MAX_EXECUTION_PAGE_SIZE', 100),
  REDIS_URL: getEnvVar('REDIS_URL', ''),
  API_KEY_ALLOWLIST: getEnvVar('API_KEY_ALLOWLIST', '').split(',').map(k => k.trim()).filter(Boolean),
  CACHE_MAX_AGE: getEnvNumber('CACHE_MAX_AGE', 60),
  CACHE_STALE_WHILE_REVALIDATE: getEnvNumber('CACHE_STALE_WHILE_REVALIDATE', 300),

  MFA_ENFORCED: getEnvBoolean('MFA_ENFORCED', false),
  PASSWORD_MIN_LENGTH: getEnvNumber('PASSWORD_MIN_LENGTH', 8),
  PASSWORD_REQUIRE_SYMBOL: getEnvBoolean('PASSWORD_REQUIRE_SYMBOL', true),
  PASSWORD_REQUIRE_NUMBER: getEnvBoolean('PASSWORD_REQUIRE_NUMBER', true),
  PASSWORD_REQUIRE_UPPER: getEnvBoolean('PASSWORD_REQUIRE_UPPER', true),

  GCS_BUCKET: getEnvVar('GCS_BUCKET', ''),
  GCS_PROJECT_ID: getEnvVar('GCS_PROJECT_ID', ''),
  GCS_CLIENT_EMAIL: getEnvVar('GCS_CLIENT_EMAIL', ''),
  GCS_PRIVATE_KEY: getEnvVar('GCS_PRIVATE_KEY', ''),

  MONGODB_URI: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/flowversal'),
  MONGODB_DB_NAME: getEnvVar('MONGODB_DB_NAME', 'flowversal'),

  PINECONE_API_KEY: getEnvVar('PINECONE_API_KEY'),
  PINECONE_ENVIRONMENT: getEnvVar('PINECONE_ENVIRONMENT', 'us-east-1'),
  PINECONE_INDEX_NAME: getEnvVar('PINECONE_INDEX_NAME', 'flowversalidx'),
  PINECONE_HOST: getEnvVar('PINECONE_HOST', ''),

  VLLM_BASE_URL: getEnvVar('VLLM_BASE_URL', 'http://localhost:8000/v1'),
  VLLM_ENABLED: getEnvBoolean('VLLM_ENABLED', true),
  VLLM_MODEL_NAME: getEnvVar('VLLM_MODEL_NAME', 'flowversal-ai'),
  VLLM_API_KEY: getEnvVar('VLLM_API_KEY', ''),

  OPENROUTER_API_KEY: getEnvVar('OPENROUTER_API_KEY'),
  OPENROUTER_BASE_URL: getEnvVar('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
  REMOTE_MODELS_ENABLED: getEnvBoolean('REMOTE_MODELS_ENABLED', true),
  REMOTE_MODEL_GPT4: getEnvVar('REMOTE_MODEL_GPT4', 'openai/gpt-4o'),
  REMOTE_MODEL_CLAUDE: getEnvVar('REMOTE_MODEL_CLAUDE', 'anthropic/claude-3.5-sonnet'),
  REMOTE_MODEL_GEMINI: getEnvVar('REMOTE_MODEL_GEMINI', 'google/gemini-2.0-flash-exp'),

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

  FLOWVERSAL_REMOTE_ENABLED: getEnvBoolean('FLOWVERSAL_REMOTE_ENABLED', false),
  FLOWVERSAL_REMOTE_API_KEY: getEnvVar('FLOWVERSAL_REMOTE_API_KEY', ''),
  FLOWVERSAL_REMOTE_URL: getEnvVar('FLOWVERSAL_REMOTE_URL', 'http://139.84.155.227:3000/api/tanchat'),

  SENTRY_DSN: getEnvVar('SENTRY_DSN', ''),
  ENABLE_METRICS: getEnvBoolean('ENABLE_METRICS', true),

  DEFAULT_MODEL_TYPE: getEnvVar('DEFAULT_MODEL_TYPE', 'vllm') as any,
  FALLBACK_TO_REMOTE: getEnvBoolean('FALLBACK_TO_REMOTE', true),
  MODEL_SELECTION_STRATEGY: getEnvVar('MODEL_SELECTION_STRATEGY', 'smart') as any,

  INNGEST_EVENT_KEY: getEnvVar('INNGEST_EVENT_KEY'),
  INNGEST_SIGNING_KEY: getEnvVar('INNGEST_SIGNING_KEY'),
  INNGEST_BASE_URL: getEnvVar('INNGEST_BASE_URL', 'https://api.inngest.com'),

  JWT_SECRET: getEnvVar('JWT_SECRET', 'your-secret-key-change-in-production'),
  ENCRYPTION_SECRET: getEnvVar('ENCRYPTION_SECRET', 'change-this-encryption-secret-in-production'),

  WORKFLOW_EXECUTION_TIMEOUT: getEnvNumber('WORKFLOW_EXECUTION_TIMEOUT', 300000),
  WORKFLOW_NODE_TIMEOUT: getEnvNumber('WORKFLOW_NODE_TIMEOUT', 60000),

  NEON_DATABASE_URL: getEnvVar('NEON_DATABASE_URL', ''),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '7d'),
};
// Validate critical environment variables in production
// Author: Sanket — Supabase removed; Neon Auth is the active auth provider
if (env.NODE_ENV === 'production') {
  const requiredVars = [
    'MONGODB_URI',
    'PINECONE_API_KEY',
    'NEON_DATABASE_URL',
    'JWT_SECRET',
    'ENCRYPTION_SECRET'
  ];
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables in production: ${missing.join(', ')}`);
  }
}

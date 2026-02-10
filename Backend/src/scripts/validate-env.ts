/**
 * Environment Variable Validation Script
 * Author: Sanket - Validate all required environment variables are set
 * 
 * Run this before deployment to ensure all necessary configuration is present
 */

import { config } from 'dotenv';
import { exit } from 'process';

// Load environment variables
config();

interface EnvVarDefinition {
  name: string;
  required: boolean;
  defaultValue?: string;
  validator?: (value: string) => boolean;
  description?: string;
}

const ENV_VARS: EnvVarDefinition[] = [
  // Server Configuration
  {
    name: 'NODE_ENV',
    required: true,
    defaultValue: 'development',
    validator: (val) => ['development', 'production', 'test'].includes(val),
    description: 'Application environment',
  },
  {
    name: 'PORT',
    required: false,
    defaultValue: '4000',
    validator: (val) => !isNaN(parseInt(val)),
    description: 'Server port',
  },

  // MongoDB
  {
    name: 'MONGODB_URI',
    required: true,
    validator: (val) => val.startsWith('mongodb'),
    description: 'MongoDB connection string',
  },

  // Neon PostgreSQL
  {
    name: 'NEON_DATABASE_URL',
    required: true,
    validator: (val) => val.startsWith('postgresql'),
    description: 'Neon PostgreSQL connection string',
  },

  // Supabase
  {
    name: 'SUPABASE_URL',
    required: true,
    validator: (val) => val.startsWith('https://'),
    description: 'Supabase project URL',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    validator: (val) => val.length > 50,
    description: 'Supabase service role key',
  },

  // Pinecone
  {
    name: 'PINECONE_API_KEY',
    required: true,
    validator: (val) => val.length > 20,
    description: 'Pinecone API key',
  },

  // Redis (Critical for production)
  {
    name: 'REDIS_HOST',
    required: false,
    defaultValue: 'localhost',
    description: 'Redis host (REQUIRED for production)',
  },
  {
    name: 'REDIS_PORT',
    required: false,
    defaultValue: '6379',
    validator: (val) => !isNaN(parseInt(val)),
    description: 'Redis port',
  },
  {
    name: 'REDIS_PASSWORD',
    required: false,
    description: 'Redis password (recommended for production)',
  },

  // JWT
  {
    name: 'JWT_SECRET',
    required: true,
    validator: (val) => val.length >= 32,
    description: 'JWT secret key (min 32 characters)',
  },

  // AI Services (Optional)
  {
    name: 'OPENROUTER_API_KEY',
    required: false,
    description: 'OpenRouter API key for remote AI models',
  },

  // Inngest
  {
    name: 'INNGEST_EVENT_KEY',
    required: false,
    description: 'Inngest event key for workflow automation',
  },
  {
    name: 'INNGEST_SIGNING_KEY',
    required: false,
    description: 'Inngest signing key',
  },
];

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

/**
 * Validate all environment variables
 */
function validateEnvironment(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    info: [],
  };

  console.log('🔍 Validating environment variables...\n');
  console.log('='.repeat(70));

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name];

    // Check if required variable is missing
    if (envVar.required && !value) {
      result.valid = false;
      result.errors.push(`❌ ${envVar.name}: REQUIRED but not set`);
      if (envVar.description) {
        result.errors.push(`   Description: ${envVar.description}`);
      }
      continue;
    }

    // Use default value if not set
    if (!value && envVar.defaultValue) {
      result.warnings.push(
        `⚠️  ${envVar.name}: Not set, using default: ${envVar.defaultValue}`
      );
      if (envVar.description) {
        result.info.push(`   Description: ${envVar.description}`);
      }
      continue;
    }

    // Optional variable not set
    if (!value && !envVar.required) {
      result.info.push(`ℹ️  ${envVar.name}: Optional, not set`);
      continue;
    }

    // Validate value if validator exists
    if (value && envVar.validator && !envVar.validator(value)) {
      result.valid = false;
      result.errors.push(`❌ ${envVar.name}: Invalid value`);
      if (envVar.description) {
        result.errors.push(`   Description: ${envVar.description}`);
      }
      continue;
    }

    // Value is valid
    const maskedValue =
      envVar.name.includes('KEY') ||
      envVar.name.includes('SECRET') ||
      envVar.name.includes('PASSWORD') ||
      envVar.name.includes('URI') ||
      envVar.name.includes('URL')
        ? '***REDACTED***'
        : value;

    console.log(`✅ ${envVar.name.padEnd(30)} = ${maskedValue}`);
  }

  console.log('='.repeat(70));
  console.log();

  return result;
}

/**
 * Production-specific validation
 */
function validateProduction(): string[] {
  const prodWarnings: string[] = [];

  if (process.env.NODE_ENV === 'production') {
    // Redis is critical for production
    if (!process.env.REDIS_HOST || process.env.REDIS_HOST === 'localhost') {
      prodWarnings.push(
        '⚠️  PRODUCTION WARNING: Redis is not configured or using localhost'
      );
      prodWarnings.push('   In-memory rate limiting is NOT suitable for production!');
    }

    // Check if using default/weak secrets
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 64) {
      prodWarnings.push(
        '⚠️  PRODUCTION WARNING: JWT_SECRET is less than 64 characters'
      );
      prodWarnings.push('   Recommended: Use a 256-bit or longer secret');
    }

    // Check if demo/test values are still present
    const demoPatterns = ['demo', 'test', 'example', 'localhost'];
    for (const [key, value] of Object.entries(process.env)) {
      if (
        value &&
        (key.includes('URL') || key.includes('URI')) &&
        demoPatterns.some((pattern) => value.toLowerCase().includes(pattern))
      ) {
        prodWarnings.push(`⚠️  PRODUCTION WARNING: ${key} may contain demo/test value`);
      }
    }
  }

  return prodWarnings;
}

/**
 * Main validation function
 */
function main() {
  const result = validateEnvironment();

  // Show warnings
  if (result.warnings.length > 0) {
    console.log('⚠️  Warnings:\n');
    result.warnings.forEach((w) => console.log(w));
    console.log();
  }

  // Show info
  if (result.info.length > 0) {
    console.log('ℹ️  Optional variables not set:\n');
    result.info.forEach((i) => console.log(i));
    console.log();
  }

  // Show production-specific warnings
  const prodWarnings = validateProduction();
  if (prodWarnings.length > 0) {
    console.log('🔴 Production Warnings:\n');
    prodWarnings.forEach((w) => console.log(w));
    console.log();
  }

  // Show errors
  if (result.errors.length > 0) {
    console.error('❌ Validation Errors:\n');
    result.errors.forEach((e) => console.error(e));
    console.error();
    console.error('⚠️  Environment validation FAILED!\n');
    exit(1);
  }

  // Summary
  if (result.valid && prodWarnings.length === 0) {
    console.log('✅ All environment variables validated successfully!\n');
    exit(0);
  } else if (result.valid) {
    console.log('✅ Environment variables validated (with warnings)\n');
    console.log('⚠️  Review warnings before deploying to production\n');
    exit(0);
  }
}

main();

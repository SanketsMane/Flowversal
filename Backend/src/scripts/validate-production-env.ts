/**
 * Production Environment Validation Script
 * Author: Sanket
 * Validates all required environment variables before starting server
 * Run before production deployment to ensure configuration is correct
 */

const requiredProductionVars = [
  'NODE_ENV',
  'MONGODB_URI',
  'JWT_SECRET',
  'ENCRYPTION_SECRET',
  'NEON_DATABASE_URL',
  'OPENAI_API_KEY',
];

const optionalVars = [
  'PINECONE_API_KEY',
  'SUPABASE_URL',
  'REDIS_HOST',
  'SENTRY_DSN',
  'OPENROUTER_API_KEY',
];

export function validateProductionEnv(): void {
  if (process.env.NODE_ENV !== 'production') {
    console.log('ℹ️  Skipping production environment validation (NODE_ENV !== production)');
    return;
  }

  console.log('🔍 Validating production environment variables...');

  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const varName of requiredProductionVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Check optional but recommended
  for (const varName of optionalVars) {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  }

  // Security checks
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    missing.push('JWT_SECRET (must be at least 32 characters)');
  }

  if (process.env.ENCRYPTION_SECRET && process.env.ENCRYPTION_SECRET.length < 32) {
    missing.push('ENCRYPTION_SECRET (must be at least 32 characters)');
  }

  // Check for default/weak secrets
  const weakSecrets = [
    'your-jwt-secret',
    'default-secret',
    'change-this',
    'test-secret',
  ];

  if (process.env.JWT_SECRET && weakSecrets.some(weak => process.env.JWT_SECRET?.includes(weak))) {
    missing.push('JWT_SECRET (contains weak/default value)');
  }

  if (process.env.ENCRYPTION_SECRET && weakSecrets.some(weak => process.env.ENCRYPTION_SECRET?.includes(weak))) {
    missing.push('ENCRYPTION_SECRET (contains weak/default value)');
  }

  // Report results
  if (missing.length > 0) {
    console.error('\n❌ Missing or invalid required environment variables:');
    missing.forEach(v => console.error(`  - ${v}`));
    console.error('\n💡 Add these variables to your .env file or environment configuration\n');
    throw new Error('Production environment validation failed');
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Optional environment variables not set:');
    warnings.forEach(v => console.warn(`  - ${v}`));
    console.warn('Some features may be disabled\n');
  }

  console.log('✅ Production environment validation passed\n');
}

// Allow running as a standalone script
if (require.main === module) {
  try {
    require('dotenv').config();
    validateProductionEnv();
    console.log('✅ Environment validation successful');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Environment validation failed:', error.message);
    process.exit(1);
  }
}

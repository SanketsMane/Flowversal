
import { secretsService } from './core/config/secrets.service';

/**
 * Bootstrap the application
 * 1. Load secrets from AWS Secrets Manager (if configured)
 * 2. Import and start the server
 */
async function bootstrap() {
  try {
    console.log('🚀 Bootstrapping application...');

    // 1. Load secrets from AWS Secrets Manager
    // This populates process.env before any compliance checks in env.ts runs (when server is imported)
    await secretsService.loadSecretsToEnv();

    // 2. Import server (dynamic import ensures env.ts runs AFTER secrets are loaded)
    console.log('📦 Importing server module...');
    const { start } = await import('./server');

    // 3. Start server
    await start();
  } catch (error) {
    console.error('❌ Bootstrap failed:', error);
    process.exit(1);
  }
}

bootstrap();

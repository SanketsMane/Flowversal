import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';
import apiDeploymentPlugin from './core/api/api-deployment.plugin';
import responseCachePlugin from './core/cache/response-cache.plugin';
import { env } from './core/config/env';
import { connectMongoDB } from './core/database/mongodb';
import { connectPinecone } from './core/database/pinecone';
import authPlugin from './core/middleware/plugins/auth.plugin';
import cacheControlPlugin from './core/middleware/plugins/cache-control.plugin';
import corsPlugin from './core/middleware/plugins/cors.plugin';
import errorHandlerPlugin from './core/middleware/plugins/error-handler.plugin';
import rateLimitPlugin from './core/middleware/plugins/rate-limit.plugin';
import requestIdPlugin from './core/middleware/plugins/request-id.plugin';
import securityPlugin from './core/middleware/plugins/security.plugin';
import { initializeErrorTracking } from './core/monitoring/error-tracking';
import metricsPlugin from './core/monitoring/metrics.plugin';
import observabilityPlugin from './core/observability/observability.plugin';
import { registerRoutes } from './routes';
import { setLogger } from './shared/utils/logger.util';
async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      // In development, use pino-pretty for readable logs
      // In production, use default JSON logs
      ...(env.NODE_ENV === 'development' && {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      }),
    },
  });
  // ============================================================================
  // CRITICAL: CORS MUST BE REGISTERED FIRST
  // ============================================================================
  // Register CORS plugin FIRST, before ANY other plugins
  // This ensures CORS headers are ALWAYS present, even on errors
  await fastify.register(corsPlugin);
  // ============================================================================
  // SECURITY PLUGINS
  // ============================================================================
  // Register enhanced security plugin (includes Helmet with CSP)
  await fastify.register(securityPlugin);
  // Register rate limiting (basic rate limit plugin)
  await fastify.register(rateLimit, {
    max: 100, // Maximum number of requests
    timeWindow: '1 minute',
  });
  // Register multipart for file uploads
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });
  // Initialize structured logger
  setLogger(fastify.log);
  // Initialize error tracking (Sentry)
  initializeErrorTracking();
  // Initialize comprehensive observability (tracing, metrics, logging)
  await fastify.register(observabilityPlugin, {
    serviceName: 'flowversal-backend',
    serviceVersion: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    enableTracing: process.env.OTEL_TRACING_ENABLED !== 'false',
    enableMetrics: process.env.METRICS_ENABLED !== 'false',
    enableEnhancedLogging: process.env.ENHANCED_LOGGING_ENABLED !== 'false',
    tracingSampleRate: parseFloat(process.env.OTEL_SAMPLING_RATE || '1.0'),
    logLevel: (process.env.LOG_LEVEL as any) || 'info',
    redactFields: ['password', 'token', 'apiKey', 'secret', 'authorization'],
  });
  // Initialize tool ecosystem with built-in tools
  const { toolEcosystemService } = await import('./modules/tools/services/tool-ecosystem.service');
  await toolEcosystemService.loadBuiltInTools();
  // Initialize production-ready API deployment features
  await fastify.register(apiDeploymentPlugin, {
    enableCompression: false, // Temporarily disabled due to Fastify version compatibility
    enableCors: false, // Temporarily disabled due to route conflict
    enableHelmet: process.env.API_HELMET_ENABLED !== 'false',
    enableRateLimiting: process.env.API_RATE_LIMITING_ENABLED !== 'false',
    enableCaching: process.env.API_CACHING_ENABLED !== 'false',
    enableCircuitBreaker: process.env.API_CIRCUIT_BREAKER_ENABLED !== 'false',
    enableApiVersioning: false, // Temporarily disabled due to constraint conflict
    enableDocumentation: process.env.API_DOCUMENTATION_ENABLED !== 'false',
    rateLimitMax: parseInt(process.env.API_RATE_LIMIT_MAX || '100'),
    rateLimitTimeWindow: process.env.API_RATE_LIMIT_WINDOW || '1 minute',
    rateLimitSkipSuccessfulRequests: process.env.API_RATE_LIMIT_SKIP_SUCCESS === 'true',
    rateLimitSkipErrorRequests: process.env.API_RATE_LIMIT_SKIP_ERRORS === 'true',
    cacheTTL: parseInt(process.env.API_CACHE_TTL || '300'),
    cacheMaxSize: parseInt(process.env.API_CACHE_MAX_SIZE || '1000'),
    circuitBreakerFailureThreshold: parseInt(process.env.API_CIRCUIT_BREAKER_THRESHOLD || '5'),
    circuitBreakerRecoveryTimeout: parseInt(process.env.API_CIRCUIT_BREAKER_RECOVERY || '30000'),
    defaultVersion: process.env.API_DEFAULT_VERSION || 'v1',
    supportedVersions: (process.env.API_SUPPORTED_VERSIONS || 'v1,v2').split(','),
    compressionThreshold: parseInt(process.env.API_COMPRESSION_THRESHOLD || '1024'),
  });
  // Register request ID plugin (must be before other plugins)
  await fastify.register(requestIdPlugin);
  // Cache-Control headers for GET responses
  await fastify.register(cacheControlPlugin);
  // Response cache (Redis-backed). Safe to register even if Redis not set.
  await fastify.register(responseCachePlugin, { ttlSeconds: 30 });
  // Metrics hooks (HTTP durations, counters)
  await fastify.register(metricsPlugin);
  // Register rate limiting (after request ID, before auth)
  await fastify.register(rateLimitPlugin);
  // API Key guard (optional; only activates if allowlist is set)
  await fastify.register(require('./core/middleware/plugins/api-key.plugin').default, {
    skip: [
      '/health',
      '/api/v1/health',
      '/api/v1/health/live',
      '/api/v1/health/ready',
      '/api/v1/health/detailed',
      '/api/v1/auth/signup',
      '/api/v1/auth/login',
      '/api/v1/auth/refresh',
    ],
  });
  // Register error handler
  await fastify.register(errorHandlerPlugin);
  // Register auth plugin FIRST (before routes, so hooks apply to all routes)
  await fastify.register(authPlugin, {
    skipAuth: [
      '/health',
      '/api/v1/health',
      '/api/v1/health/live',
      '/api/v1/health/ready',
      '/api/v1/health/detailed',
      '/api/v1/auth/signup',
      '/api/v1/auth/login',
      '/api/v1/auth/refresh',
    ],
  });
  // Register Swagger/OpenAPI documentation
  await fastify.register(require('./core/api/swagger').default);
  // Register routes (after auth plugin so hooks apply)
  await fastify.register(registerRoutes);
  // Health check endpoint at root
  fastify.get('/', async (_request, reply) => {
    return reply.send({
      name: 'Flowversal Backend API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
    });
  });
  return fastify;
}
async function start() {
  try {
    // Import logger after server is built
    const { logger } = await import('./shared/utils/logger.util');
    // Connect to databases
    logger.info('🔄 Connecting to databases...');
    await connectMongoDB();
    // Connect to Pinecone (non-blocking - server will start even if this fails)
    try {
      await connectPinecone();
      logger.info('✅ Pinecone connected successfully');
    } catch (pineconeError: any) {
      logger.warn('⚠️ Pinecone connection failed, but continuing server startup...', {
        error: pineconeError.message || pineconeError,
      });
      logger.warn('⚠️ Vector search features will be unavailable until Pinecone is connected.');
      // Don't throw - allow server to start without Pinecone
    }
    // Build and start server
    const server = await buildServer();
    await server.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });
    logger.info('🚀 Server started successfully', {
      port: env.PORT,
      apiVersion: env.API_VERSION,
      environment: env.NODE_ENV,
      url: `http://localhost:${env.PORT}`,
    });
    // ⚠️ SECURITY WARNING: Display temporary fixes warning in development
    // Development mode info
    if (env.NODE_ENV === 'development') {
    }
  } catch (error) {
    const { logger } = await import('./shared/utils/logger.util');
    logger.fatal('❌ Error starting server', error);
    process.exit(1);
  }
}
// Handle unhandled promise rejections
process.on('unhandledRejection', async (error) => {
  const { logger } = await import('./shared/utils/logger.util');
  logger.fatal('Unhandled promise rejection', error);
  process.exit(1);
});
// Start the server
if (require.main === module) {
  start();
}
export { buildServer, start };

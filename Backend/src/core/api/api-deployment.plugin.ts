import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { APIDeploymentConfig, APIDeploymentService } from './api-deployment.service';

declare module 'fastify' {
  interface FastifyInstance {
    apiDeployment: APIDeploymentService;
  }
}

const apiDeploymentPlugin: FastifyPluginAsync<Partial<APIDeploymentConfig>> = async (
  fastify,
  options = {}
) => {
  const config: APIDeploymentConfig = {
    enableCompression: options.enableCompression ?? true,
    enableCors: options.enableCors ?? true,
    enableHelmet: options.enableHelmet ?? true,
    enableRateLimiting: options.enableRateLimiting ?? true,
    enableCaching: options.enableCaching ?? true,
    enableCircuitBreaker: options.enableCircuitBreaker ?? true,
    enableApiVersioning: options.enableApiVersioning ?? true,
    enableDocumentation: options.enableDocumentation ?? true,
    rateLimitMax: options.rateLimitMax ?? 100,
    rateLimitTimeWindow: options.rateLimitTimeWindow ?? '1 minute',
    rateLimitSkipSuccessfulRequests: options.rateLimitSkipSuccessfulRequests ?? false,
    rateLimitSkipErrorRequests: options.rateLimitSkipErrorRequests ?? false,
    cacheTTL: options.cacheTTL ?? 300, // 5 minutes
    cacheMaxSize: options.cacheMaxSize ?? 1000,
    circuitBreakerFailureThreshold: options.circuitBreakerFailureThreshold ?? 5,
    circuitBreakerRecoveryTimeout: options.circuitBreakerRecoveryTimeout ?? 30000, // 30 seconds
    defaultVersion: options.defaultVersion ?? 'v1',
    supportedVersions: options.supportedVersions ?? ['v1', 'v2'],
    compressionThreshold: options.compressionThreshold ?? 1024, // 1KB
  };

  // Create and initialize API deployment service
  const apiDeploymentService = new APIDeploymentService(config);

  // Apply deployment features to Fastify
  await apiDeploymentService.applyToFastify(fastify);

  // Add deployment service to Fastify instance
  fastify.decorate('apiDeployment', apiDeploymentService);

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    await apiDeploymentService.shutdown();
  });

  fastify.log.info(`API deployment features initialized - compression: ${config.enableCompression}, cors: ${config.enableCors}, rateLimiting: ${config.enableRateLimiting}, caching: ${config.enableCaching}, circuitBreaker: ${config.enableCircuitBreaker}, apiVersioning: ${config.enableApiVersioning}, documentation: ${config.enableDocumentation}`);
};

export default fp(apiDeploymentPlugin, {
  name: 'api-deployment',
  fastify: '4.x',
});

// Export utilities for creating endpoints
export {
  createAPIEndpoint,
  createCachedEndpoint, createProtectedEndpoint, createRateLimitedEndpoint
} from './api-deployment.service';

export { APIDeploymentConfig };

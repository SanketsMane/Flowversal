import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { loggingService } from './logging.service';
import { metricsService } from './metrics.service';
import { tracingService } from './tracing.service';

export interface ObservabilityConfig {
  serviceName?: string;
  serviceVersion?: string;
  environment?: string;
  enableTracing?: boolean;
  enableMetrics?: boolean;
  enableEnhancedLogging?: boolean;
  tracingSampleRate?: number;
  logLevel?: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  redactFields?: string[];
}

const observabilityPlugin: FastifyPluginAsync<ObservabilityConfig> = async (
  fastify,
  options = {}
) => {
  const config: Required<ObservabilityConfig> = {
    serviceName: options.serviceName || 'flowversal-backend',
    serviceVersion: options.serviceVersion || process.env.npm_package_version || '1.0.0',
    environment: options.environment || process.env.NODE_ENV || 'development',
    enableTracing: options.enableTracing ?? true,
    enableMetrics: options.enableMetrics ?? true,
    enableEnhancedLogging: options.enableEnhancedLogging ?? true,
    tracingSampleRate: options.tracingSampleRate ?? 1.0,
    logLevel: options.logLevel || 'info',
    redactFields: options.redactFields || ['password', 'token', 'apiKey', 'secret'],
  };

  // Initialize enhanced logging if enabled
  if (config.enableEnhancedLogging) {
    // Replace the default logger with our enhanced logging service
    fastify.log = loggingService.child({
      service: config.serviceName,
      version: config.serviceVersion,
      environment: config.environment,
    });

    // Add request logging middleware
    // TODO: Fix createRequestLogger() signature to match Fastify hooks
    // fastify.addHook('preHandler', loggingService.createRequestLogger());
  }

  // Initialize tracing if enabled
  if (config.enableTracing) {
    // Add tracing middleware to all routes
    // TODO: Fix createTracingMiddleware() signature to match Fastify hooks
    // fastify.addHook('preHandler', tracingService.createTracingMiddleware());

    fastify.log.info(`Distributed tracing enabled - serviceName: ${config.serviceName}, sampleRate: ${config.tracingSampleRate}`);
  }

  // Initialize metrics collection if enabled
  if (config.enableMetrics) {
    // Add metrics collection middleware
    fastify.addHook('onResponse', (request, reply, done) => {
      const duration = Date.now() - (request as any).startTime || 0;

      // Record HTTP request metrics
      metricsService.recordHttpRequest(
        request.method,
        request.url,
        reply.statusCode,
        duration / 1000 // Convert to seconds
      );

      done();
    });

    // Add active connections tracking
    let activeConnections = 0;
    fastify.addHook('onRequest', (request, reply, done) => {
      activeConnections++;
      metricsService.updateActiveConnections(activeConnections);

      // Track when request completes
      reply.raw.on('finish', () => {
        activeConnections = Math.max(0, activeConnections - 1);
        metricsService.updateActiveConnections(activeConnections);
      });

      done();
    });

    fastify.log.info(`Metrics collection enabled - serviceName: ${config.serviceName}`);
  }

  // Add observability decorators to the Fastify instance
  fastify.decorate('tracing', tracingService);
  fastify.decorate('metrics', metricsService);
  fastify.decorate('observabilityLogger', loggingService);

  // Add utility methods for common observability patterns
  fastify.decorate('traceOperation', async function <T>(
    operationName: string,
    fn: (span: any) => Promise<T>,
    options?: { attributes?: Record<string, any> }
  ): Promise<T> {
    return tracingService.withSpan(operationName, fn, options);
  });

  fastify.decorate('logBusinessEvent', function (
    event: string,
    properties: Record<string, any>,
    context?: any
  ) {
    loggingService.logBusinessEvent(event, properties, context);
  });

  fastify.decorate('logPerformance', function (
    operation: string,
    duration: number,
    context?: any
  ) {
    loggingService.logPerformance(operation, duration, context);
  });

  fastify.decorate('logUserAction', function (
    userId: string,
    action: string,
    details: Record<string, any>,
    context?: any
  ) {
    loggingService.logUserAction(userId, action, details, context);
  });

  // Health check endpoint with observability
  fastify.get('/health/observability', {
    schema: {
      description: 'Observability health check',
      tags: ['Health', 'Observability'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            observability: {
              type: 'object',
              properties: {
                tracing: { type: 'boolean' },
                metrics: { type: 'boolean' },
                logging: { type: 'boolean' },
              },
            },
            services: {
              type: 'object',
              properties: {
                serviceName: { type: 'string' },
                serviceVersion: { type: 'string' },
                environment: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      observability: {
        tracing: config.enableTracing,
        metrics: config.enableMetrics,
        logging: config.enableEnhancedLogging,
      },
      services: {
        serviceName: config.serviceName,
        serviceVersion: config.serviceVersion,
        environment: config.environment,
      },
    };

    // Record health check metrics
    if (config.enableMetrics) {
      metricsService.recordHealthCheck('observability', 'healthy', 0);
    }

    return reply.send(health);
  });

  // Observability status endpoint
  fastify.get('/observability/status', {
    schema: {
      description: 'Get observability system status',
      tags: ['Observability'],
      response: {
        200: {
          type: 'object',
          properties: {
            tracing: {
              type: 'object',
              properties: {
                enabled: { type: 'boolean' },
                currentTraceContext: { type: 'object' },
              },
            },
            metrics: {
              type: 'object',
              properties: {
                enabled: { type: 'boolean' },
              },
            },
            logging: {
              type: 'object',
              properties: {
                enabled: { type: 'boolean' },
                level: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const status = {
      tracing: {
        enabled: config.enableTracing,
        currentTraceContext: config.enableTracing ? tracingService.getCurrentTraceContext() : null,
      },
      metrics: {
        enabled: config.enableMetrics,
      },
      logging: {
        enabled: config.enableEnhancedLogging,
        level: config.logLevel,
      },
    };

    return reply.send(status);
  });
};

export default fp(observabilityPlugin, {
  name: 'observability',
  fastify: '4.x',
});

import { FastifyInstance } from 'fastify';
import { CacheManager } from '../cache/cache-manager';
import { CircuitBreaker } from '../utils/circuit-breaker.util';
import { RateLimiter } from '../utils/rate-limiter.util';

export interface APIDeploymentConfig {
  enableCompression: boolean;
  enableCors: boolean;
  enableHelmet: boolean;
  enableRateLimiting: boolean;
  enableCaching: boolean;
  enableCircuitBreaker: boolean;
  enableApiVersioning: boolean;
  enableDocumentation: boolean;

  // Rate limiting
  rateLimitMax: number;
  rateLimitTimeWindow: string;
  rateLimitSkipSuccessfulRequests: boolean;
  rateLimitSkipErrorRequests: boolean;

  // Caching
  cacheTTL: number;
  cacheMaxSize: number;

  // Circuit breaker
  circuitBreakerFailureThreshold: number;
  circuitBreakerRecoveryTimeout: number;

  // API versioning
  defaultVersion: string;
  supportedVersions: string[];

  // Compression
  compressionThreshold: number;
}

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  handler: (request: any, reply: any) => Promise<any>;
  options?: {
    rateLimit?: {
      max: number;
      timeWindow: string;
    };
    cache?: {
      ttl: number;
      keyGenerator?: (request: any) => string;
    };
    circuitBreaker?: {
      enabled: boolean;
      failureThreshold?: number;
    };
    auth?: boolean;
    schema?: any;
    deprecated?: boolean;
    version?: string;
  };
}

export class APIDeploymentService {
  private config: APIDeploymentConfig;
  private circuitBreaker: CircuitBreaker | null = null;
  private cacheManager: CacheManager | null = null;
  private rateLimiter: RateLimiter | null = null;
  private endpoints: Map<string, APIEndpoint> = new Map();

  constructor(config: APIDeploymentConfig) {
    this.config = config;
    this.initializeServices();
  }

  private initializeServices(): void {
    if (this.config.enableCircuitBreaker) {
      this.circuitBreaker = new CircuitBreaker({
        failureThreshold: this.config.circuitBreakerFailureThreshold,
        recoveryTimeout: this.config.circuitBreakerRecoveryTimeout,
      });
    }

    if (this.config.enableCaching) {
      this.cacheManager = new CacheManager({
        ttl: this.config.cacheTTL,
        maxSize: this.config.cacheMaxSize,
      });
    }

    if (this.config.enableRateLimiting) {
      this.rateLimiter = new RateLimiter({
        max: this.config.rateLimitMax,
        timeWindow: this.config.rateLimitTimeWindow,
        skipSuccessfulRequests: this.config.rateLimitSkipSuccessfulRequests,
        skipErrorRequests: this.config.rateLimitSkipErrorRequests,
      });
    }
  }

  /**
   * Register an API endpoint with deployment features
   */
  registerEndpoint(endpoint: APIEndpoint): void {
    const key = `${endpoint.method}:${endpoint.path}`;
    this.endpoints.set(key, endpoint);
  }

  /**
   * Apply deployment features to a Fastify instance
   */
  async applyToFastify(fastify: FastifyInstance): Promise<void> {
    // Apply global middleware
    await this.applyGlobalMiddleware(fastify);

    // Register endpoints
    for (const endpoint of this.endpoints.values()) {
      await this.registerEndpointWithFeatures(fastify, endpoint);
    }

    // Apply final middleware
    await this.applyFinalMiddleware(fastify);
  }

  /**
   * Apply global middleware to Fastify
   */
  private async applyGlobalMiddleware(fastify: FastifyInstance): Promise<void> {
    // Compression
    if (this.config.enableCompression) {
      await fastify.register(require('@fastify/compress'), {
        threshold: this.config.compressionThreshold,
        encodings: ['gzip', 'deflate'],
      });
    }

    // CORS
    if (this.config.enableCors) {
      await fastify.register(require('@fastify/cors'), {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
        credentials: true,
      });
    }

    // Security headers
    if (this.config.enableHelmet) {
      await fastify.register(require('@fastify/helmet'), {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
          },
        },
      });
    }

    // API versioning
    if (this.config.enableApiVersioning) {
      await fastify.register(require('./api-versioning'), {
        defaultVersion: this.config.defaultVersion,
        supportedVersions: this.config.supportedVersions,
      });
    }
  }

  /**
   * Register a single endpoint with all deployment features
   */
  private async registerEndpointWithFeatures(
    fastify: FastifyInstance,
    endpoint: APIEndpoint
  ): Promise<void> {
    const routeOptions: any = {
      method: endpoint.method,
      url: endpoint.path,
      handler: this.createWrappedHandler(endpoint, fastify),
      schema: endpoint.options?.schema,
    };

    // Add deprecation warning
    if (endpoint.options?.deprecated) {
      routeOptions.preHandler = (request: any, reply: any, done: () => void) => {
        reply.header('Deprecation', 'true');
        reply.header('Warning', '299 - This endpoint is deprecated and will be removed in a future version');
        done();
      };
    }

    // Add version constraint
    if (endpoint.options?.version) {
      routeOptions.constraints = {
        version: endpoint.options.version,
      };
    }

    // Register the route
    fastify.route(routeOptions);
  }

  /**
   * Create a wrapped handler with all deployment features
   */
  private createWrappedHandler(endpoint: APIEndpoint, fastify: any) {
    return async (request: any, reply: any) => {
      const startTime = Date.now();

      try {
        // Rate limiting
        if (this.config.enableRateLimiting && this.rateLimiter) {
          const rateLimitConfig = endpoint.options?.rateLimit || {
            max: this.config.rateLimitMax,
            timeWindow: this.config.rateLimitTimeWindow,
          };

          const allowed = await this.rateLimiter.checkLimit(
            request.ip,
            rateLimitConfig.max,
            rateLimitConfig.timeWindow
          );

          if (!allowed) {
            reply.code(429).send({
              error: 'Too Many Requests',
              message: 'Rate limit exceeded. Please try again later.',
              retryAfter: Math.ceil(parseInt(rateLimitConfig.timeWindow) / 1000),
            });
            return;
          }
        }

        // Caching check for GET requests
        if (endpoint.method === 'GET' && this.config.enableCaching && this.cacheManager) {
          const cacheKey = endpoint.options?.cache?.keyGenerator?.(request) ||
            `${endpoint.method}:${endpoint.path}:${JSON.stringify(request.query)}`;

          const cachedResponse = await this.cacheManager.get(cacheKey);
          if (cachedResponse) {
            reply.header('X-Cache', 'HIT');
            reply.send(cachedResponse);
            return;
          }
          reply.header('X-Cache', 'MISS');
        }

        // Circuit breaker
        if (this.config.enableCircuitBreaker && this.circuitBreaker) {
          const circuitBreakerConfig = endpoint.options?.circuitBreaker;

          if (circuitBreakerConfig?.enabled !== false) {
            const circuitOpen = await this.circuitBreaker.isOpen(endpoint.path);

            if (circuitOpen) {
              reply.code(503).send({
                error: 'Service Unavailable',
                message: 'Service is temporarily unavailable due to high error rates.',
              });
              return;
            }
          }
        }

        // Execute the actual handler
        let result;
        if (this.config.enableCircuitBreaker && this.circuitBreaker) {
          result = await this.circuitBreaker.execute(
            endpoint.path,
            () => endpoint.handler(request, reply)
          );
        } else {
          result = await endpoint.handler(request, reply);
        }

        // Cache the response for GET requests
        if (endpoint.method === 'GET' && this.config.enableCaching && this.cacheManager) {
          const cacheKey = endpoint.options?.cache?.keyGenerator?.(request) ||
            `${endpoint.method}:${endpoint.path}:${JSON.stringify(request.query)}`;

          const ttl = endpoint.options?.cache?.ttl || this.config.cacheTTL;
          await this.cacheManager.set(cacheKey, result, ttl);
        }

        // Record success metrics
        const duration = Date.now() - startTime;
        if (fastify.metrics) {
          fastify.metrics.recordHttpRequest(endpoint.method, endpoint.path, 200, duration / 1000);
        }

        return result;

      } catch (error: any) {
        const duration = Date.now() - startTime;

        // Record failure in circuit breaker
        if (this.config.enableCircuitBreaker && this.circuitBreaker) {
          await this.circuitBreaker.recordFailure(endpoint.path);
        }

        // Record error metrics
        if (fastify.metrics) {
          fastify.metrics.recordError('api_error', 'endpoint_handler', error.message);
          fastify.metrics.recordHttpRequest(endpoint.method, endpoint.path, 500, duration / 1000);
        }

        // Log error with observability
        if (fastify.observabilityLogger) {
          fastify.observabilityLogger.logErrorWithStack(error, {
            endpoint: `${endpoint.method} ${endpoint.path}`,
            userId: request.user?.id,
            correlationId: request.correlationId,
          });
        }

        throw error;
      }
    };
  }

  /**
   * Apply final middleware to Fastify
   */
  private async applyFinalMiddleware(fastify: FastifyInstance): Promise<void> {
    // API documentation
    if (this.config.enableDocumentation) {
      await fastify.register(require('@fastify/swagger'), {
        routePrefix: '/documentation',
        swagger: {
          info: {
            title: 'Flowversal API',
            description: 'Production-ready API for Flowversal workflow platform',
            version: process.env.npm_package_version || '1.0.0',
          },
          host: process.env.API_HOST || 'localhost:3000',
          schemes: ['http', 'https'],
          consumes: ['application/json'],
          produces: ['application/json'],
          securityDefinitions: {
            Bearer: {
              type: 'apiKey',
              name: 'Authorization',
              in: 'header',
            },
          },
        },
        uiConfig: {
          docExpansion: 'full',
          deepLinking: false,
        },
        staticCSP: true,
        transformStaticCSP: (header: string) => header,
      });

      // Swagger UI
      await fastify.register(require('@fastify/swagger-ui'), {
        routePrefix: '/docs',
        uiConfig: {
          docExpansion: 'full',
          deepLinking: false,
        },
      });
    }

    // Health checks with detailed status
    fastify.get('/health/deployment', {
      schema: {
        description: 'API deployment health check',
        tags: ['Health', 'Deployment'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              deployment: {
                type: 'object',
                properties: {
                  compression: { type: 'boolean' },
                  cors: { type: 'boolean' },
                  rateLimiting: { type: 'boolean' },
                  caching: { type: 'boolean' },
                  circuitBreaker: { type: 'boolean' },
                  apiVersioning: { type: 'boolean' },
                  documentation: { type: 'boolean' },
                },
              },
              services: {
                type: 'object',
                properties: {
                  circuitBreaker: { type: 'string' },
                  cache: { type: 'string' },
                  rateLimiter: { type: 'string' },
                },
              },
            },
          },
        },
      },
    }, async (request, reply) => {
      const circuitBreakerStatus = this.circuitBreaker ? 'healthy' : 'disabled';
      const cacheStatus = this.cacheManager ? 'healthy' : 'disabled';
      const rateLimiterStatus = this.rateLimiter ? 'healthy' : 'disabled';

      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        deployment: {
          compression: this.config.enableCompression,
          cors: this.config.enableCors,
          rateLimiting: this.config.enableRateLimiting,
          caching: this.config.enableCaching,
          circuitBreaker: this.config.enableCircuitBreaker,
          apiVersioning: this.config.enableApiVersioning,
          documentation: this.config.enableDocumentation,
        },
        services: {
          circuitBreaker: circuitBreakerStatus,
          cache: cacheStatus,
          rateLimiter: rateLimiterStatus,
        },
      };

      return reply.send(health);
    });
  }

  /**
   * Get deployment statistics
   */
  getDeploymentStats(): {
    endpointsRegistered: number;
    circuitBreakerStatus?: any;
    cacheStats?: any;
    rateLimiterStats?: any;
  } {
    return {
      endpointsRegistered: this.endpoints.size,
      circuitBreakerStatus: this.circuitBreaker?.getStats(),
      cacheStats: this.cacheManager?.getStats(),
      rateLimiterStats: this.rateLimiter?.getStats(),
    };
  }

  /**
   * Gracefully shutdown deployment services
   */
  async shutdown(): Promise<void> {
    if (this.cacheManager) {
      await this.cacheManager.close();
    }

    if (this.circuitBreaker) {
      await this.circuitBreaker.close();
    }

    if (this.rateLimiter) {
      await this.rateLimiter.close();
    }
  }
}

// Utility functions for creating endpoints

export function createAPIEndpoint(endpoint: APIEndpoint): APIEndpoint {
  return endpoint;
}

export function createCachedEndpoint(
  endpoint: Omit<APIEndpoint, 'options'>,
  cacheOptions: { ttl: number; keyGenerator?: (request: any) => string }
): APIEndpoint {
  return {
    ...endpoint,
    options: {
      cache: cacheOptions,
    },
  };
}

export function createRateLimitedEndpoint(
  endpoint: Omit<APIEndpoint, 'options'>,
  rateLimitOptions: { max: number; timeWindow: string }
): APIEndpoint {
  return {
    ...endpoint,
    options: {
      rateLimit: rateLimitOptions,
    },
  };
}

export function createProtectedEndpoint(
  endpoint: Omit<APIEndpoint, 'options'>,
  authRequired: boolean = true
): APIEndpoint {
  return {
    ...endpoint,
    options: {
      auth: authRequired,
    },
  };
}
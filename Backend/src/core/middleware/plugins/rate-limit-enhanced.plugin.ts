import rateLimit from '@fastify/rate-limit';
import { FastifyPluginAsync } from 'fastify';
import Redis from 'ioredis';
import { env } from '../../config/env';

const rateLimitEnhancedPlugin: FastifyPluginAsync = async (fastify) => {
  // Optional Redis client for distributed limits
  let redisClient: Redis | undefined;
  if (env.REDIS_URL) {
    redisClient = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 1 });
  }

  // Global rate limiting
  await fastify.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    cache: 10000,
    // store: redisClient ? { type: 'redis', client: redisClient } : undefined, // Invalid type for store
    allowList: ['127.0.0.1', '::1'],
    skipOnError: false,
    keyGenerator: (request) => {
      // Use user ID for authenticated requests, IP for anonymous
      const user = (request as any).user;
      return user?.id || request.ip;
    },
    errorResponseBuilder: (request, context) => {
      return {
        success: false,
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${context.after} seconds.`,
        retryAfter: context.after,
      };
    },
  });

  // Stricter limits for sensitive endpoints
  fastify.addHook('onRoute', (routeOptions) => {
    if (routeOptions.url.includes('/auth/login') || routeOptions.url.includes('/auth/register')) {
      fastify.register(rateLimit, {
        max: 5,
        timeWindow: '15 minutes',
        cache: 10000,
        // store: redisClient ? { type: 'redis', client: redisClient } : undefined,
        keyGenerator: (request) => request.ip,
      });
    }

    if (routeOptions.url.includes('/workflows') && routeOptions.method === 'POST') {
      fastify.register(rateLimit, {
        max: 20,
        timeWindow: '1 minute',
        cache: 10000,
        // store: redisClient ? { type: 'redis', client: redisClient } : undefined,
        keyGenerator: (request) => {
          const user = (request as any).user;
          return user?.id || request.ip;
        },
      });
    }
  });
};

export default rateLimitEnhancedPlugin;


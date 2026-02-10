/**
 * Rate Limiting Plugin
 * Author: Sanket - Refactored to use Redis for production scalability
 * 
 * Provides rate limiting per user and subscription tier using Redis
 */

import { FastifyPluginAsync } from 'fastify';
import { logger } from '../../../shared/utils/logger.util';
import { rateLimiter } from '../../services/redis-rate-limiter.service';

interface RateLimitPluginOptions {
  enabled?: boolean;
}

const rateLimitPlugin: FastifyPluginAsync<RateLimitPluginOptions> = async (
  fastify,
  options
) => {
  const enabled = options.enabled !== false;

  if (!enabled) {
    logger.warn('Rate limiting is DISABLED');
    return;
  }

  // Log rate limiter status
  const status = rateLimiter.getStatus();
  if (status.redis) {
    logger.info('Rate limiting initialized with Redis backend');
  } else {
    logger.warn('Rate limiting using in-memory fallback (NOT production-ready!)');
  }

  /**
   * Pre-handler hook for rate limiting
   */
  fastify.addHook('preHandler', async (request, reply) => {
    // Skip rate limiting for health checks and metrics
    if (
      request.url.startsWith('/health') ||
      request.url.startsWith('/metrics') ||
      request.url.startsWith('/api/v1/health')
    ) {
      return;
    }

    // Get user ID from request (set by auth plugin)
    const userId = (request as any).user?.id;

    if (!userId) {
      // No user ID, skip rate limiting (will be caught by auth middleware)
      return;
    }

    // Check rate limit
    try {
      const result = await rateLimiter.checkRateLimit(userId, request.url);

      // Set rate limit headers
      reply.header('X-RateLimit-Limit', result.remaining + (result.allowed ? 1 : 0));
      reply.header('X-RateLimit-Remaining', result.remaining);
      reply.header('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

      if (!result.allowed) {
        logger.warn(`Rate limit exceeded for user ${userId} on ${request.url}`);
        return reply.status(429).send({
          success: false,
          error: 'Too Many Requests',
          message: result.message || 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        });
      }
    } catch (error) {
      logger.error('Rate limit check failed:', error);
      // On error, allow the request (fail open)
      // In production, you might want to fail closed instead
    }
  });

  // Cleanup on server close
  fastify.addHook('onClose', async () => {
    await rateLimiter.close();
  });

  logger.info('Rate limiting plugin registered');
};

export default rateLimitPlugin;

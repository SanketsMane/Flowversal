/**
 * Rate Limiting Plugin
 * Provides rate limiting per user and subscription tier
 */

import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { logger } from '../../../shared/utils/logger.util';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
}

// Rate limits per subscription tier (requests per minute)
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  free: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'Rate limit exceeded. Free tier: 60 requests per minute.',
  },
  basic: {
    windowMs: 60 * 1000,
    maxRequests: 300, // 300 requests per minute
    message: 'Rate limit exceeded. Basic tier: 300 requests per minute.',
  },
  pro: {
    windowMs: 60 * 1000,
    maxRequests: 1000, // 1000 requests per minute
    message: 'Rate limit exceeded. Pro tier: 1000 requests per minute.',
  },
  enterprise: {
    windowMs: 60 * 1000,
    maxRequests: 10000, // 10000 requests per minute (effectively unlimited)
    message: 'Rate limit exceeded. Enterprise tier: 10000 requests per minute.',
  },
};

// In-memory rate limit store (in production, use Redis)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Get subscription tier for user (defaults to 'free')
 * In production, this would query the database
 */
function getUserTier(userId: string): string {
  // TODO: Query user's subscription tier from database
  // For now, default to 'free' tier
  return 'free';
}

/**
 * Get rate limit key for user
 */
function getRateLimitKey(userId: string, path: string): string {
  return `ratelimit:${userId}:${path}`;
}

/**
 * Check if request should be rate limited
 */
function checkRateLimit(userId: string, path: string): { allowed: boolean; remaining: number; resetTime: number } {
  const tier = getUserTier(userId);
  const config = RATE_LIMITS[tier] || RATE_LIMITS.free;
  const key = getRateLimitKey(userId, path);
  
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetTime,
    });
    
    // Clean up old entries periodically
    if (rateLimitStore.size > 10000) {
      cleanupRateLimitStore();
    }
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

const rateLimitPlugin: FastifyPluginAsync = async (fastify) => {
  // Apply rate limiting to all authenticated routes
  // NOTE: This runs AFTER CORS plugin, so CORS headers are already set
  fastify.addHook('onRequest', async (request: FastifyRequest, reply) => {
    // Skip OPTIONS requests (CORS preflight)
    if (request.method === 'OPTIONS') {
      return;
    }

    // Skip rate limiting for health checks and public endpoints
    if (
      request.url.startsWith('/health') ||
      request.url.startsWith('/api/v1/health')
    ) {
      return;
    }

    // Only rate limit authenticated requests
    if (!request.user) {
      return;
    }

    const userId = request.user.id;
    const path = request.url.split('?')[0]; // Remove query params

    const rateLimitResult = checkRateLimit(userId, path);

    // Add rate limit headers
    reply.header('X-RateLimit-Limit', RATE_LIMITS[getUserTier(userId)]?.maxRequests || 60);
    reply.header('X-RateLimit-Remaining', rateLimitResult.remaining);
    reply.header('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

    if (!rateLimitResult.allowed) {
      const tier = getUserTier(userId);
      const config = RATE_LIMITS[tier] || RATE_LIMITS.free;
      
      logger.warn('Rate limit exceeded', {
        userId,
        path,
        tier,
        limit: config.maxRequests,
      });

      return reply.code(429).send({
        success: false,
        error: 'Too Many Requests',
        message: config.message || 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
      });
    }
  });
};

export default rateLimitPlugin;


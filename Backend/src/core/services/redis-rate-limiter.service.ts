/**
 * Redis Rate Limiting Service
 * Author: Sanket - Production-ready rate limiting with Redis backend
 * 
 * Replaces in-memory Map with Redis for scalability across multiple instances
 */

import Redis from 'ioredis';
import { logger } from '../../shared/utils/logger.util';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  message?: string;
}

// Rate limits per subscription tier
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  free: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'Rate limit exceeded. Free tier: 60 requests per minute.',
  },
  basic: {
    windowMs: 60 * 1000,
    maxRequests: 300,
    message: 'Rate limit exceeded. Basic tier: 300 requests per minute.',
  },
  pro: {
    windowMs: 60 * 1000,
    maxRequests: 1000,
    message: 'Rate limit exceeded. Pro tier: 1000 requests per minute.',
  },
  enterprise: {
    windowMs: 60 * 1000,
    maxRequests: 10000,
    message: 'Rate limit exceeded. Enterprise tier: 10000 requests per minute.',
  },
};

/**
 * Redis Rate Limiter Class
 */
export class RedisRateLimiter {
  private redis: Redis | null = null;
  private fallbackMap: Map<string, { count: number; resetTime: number }>;
  private isRedisAvailable: boolean = false;

  constructor() {
    this.fallbackMap = new Map();
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis() {
    // Skip Redis in test environment
    if (process.env.NODE_ENV === 'test') {
      logger.warn('[RedisRateLimiter] Test environment detected, using in-memory fallbacks');
      this.isRedisAvailable = false;
      return;
    }

    // Check if Redis URL or Host is provided
    if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
      logger.warn('[RedisRateLimiter] No Redis configuration found, using in-memory fallback');
      this.isRedisAvailable = false;
      return;
    }

    try {
      const redisConfig = process.env.REDIS_URL 
        ? process.env.REDIS_URL 
        : {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            maxRetriesPerRequest: 3,
            retryStrategy: (times: number) => {
              if (times > 3) return null; // Stop retrying after 3 attempts
              return Math.min(times * 50, 2000); // Exponential backoff
            },
          };

      this.redis = new Redis(redisConfig as any);

      this.redis.on('connect', () => {
        logger.info('Redis connected for rate limiting');
        this.isRedisAvailable = true;
      });

      this.redis.on('error', (error) => {
        // Only log error if we haven't already fallen back to memory to avoid noise
        if (this.isRedisAvailable) {
          logger.warn('Redis connection error, switching to in-memory fallback:', error.message);
        }
        this.isRedisAvailable = false;
      });

      // Quick test
      await this.redis.ping().catch(() => {
        this.isRedisAvailable = false;
        logger.warn('Initial Redis ping failed, using in-memory fallback');
      });
      
    } catch (error) {
      logger.warn('Redis initialization failed, falling back to in-memory rate limiting');
      this.isRedisAvailable = false;
    }
  }

  /**
   * Get user subscription tier from database
   * Author: Sanket - Currently returns 'free' tier by default
   * TODO: Implement subscription tier when User model is updated with subscription field
   */
  private async getUserTier(userId: string): Promise<string> {
    // Default to free tier for now - subscription feature not yet implemented
    return 'free';
  }

  /**
   * Check rate limit using Redis (sliding window)
   */
  private async checkRateLimitRedis(
    userId: string,
    path: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    if (!this.redis || !this.isRedisAvailable) {
      throw new Error('Redis not available');
    }

    const key = `ratelimit:${userId}:${path}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
      // Use Redis sorted set for sliding window
      // Remove old entries outside the current window
      await this.redis.zremrangebyscore(key, 0, windowStart);

      // Count requests in current window
      const count = await this.redis.zcard(key);

      if (count >= config.maxRequests) {
        // Get oldest entry to calculate reset time
        const oldestEntries = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
        const oldestTimestamp = oldestEntries[1] ? parseInt(oldestEntries[1]) : now;
        const resetTime = oldestTimestamp + config.windowMs;

        return {
          allowed: false,
          remaining: 0,
          resetTime,
          message: config.message,
        };
      }

      // Add current request
      await this.redis.zadd(key, now, `${now}-${Math.random()}`);

      // Set expiry on key (cleanup)
      await this.redis.expire(key, Math.ceil(config.windowMs / 1000) + 1);

      return {
        allowed: true,
        remaining: config.maxRequests - count - 1,
        resetTime: now + config.windowMs,
      };
    } catch (error) {
      logger.error('Redis rate limit check failed:', error);
      throw error;
    }
  }

  /**
   * Check rate limit using in-memory fallback
   */
  private checkRateLimitMemory(
    userId: string,
    path: string,
    config: RateLimitConfig
  ): RateLimitResult {
    const key = `${userId}:${path}`;
    const now = Date.now();
    const entry = this.fallbackMap.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new window
      this.fallbackMap.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs,
      };
    }

    if (entry.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        message: config.message,
      };
    }

    entry.count++;
    this.fallbackMap.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Check rate limit (main method)
   */
  async checkRateLimit(userId: string, path: string): Promise<RateLimitResult> {
    // Get user's subscription tier
    const tier = await this.getUserTier(userId);
    const config = RATE_LIMITS[tier] || RATE_LIMITS.free;

    // Try Redis first, fall back to memory if unavailable
    if (this.isRedisAvailable) {
      try {
        return await this.checkRateLimitRedis(userId, path, config);
      } catch (error) {
        logger.warn('Redis rate limit failed, using in-memory fallback');
        this.isRedisAvailable = false;
      }
    }

    return this.checkRateLimitMemory(userId, path, config);
  }

  /**
   * Reset rate limit for a user (useful for testing or admin overrides)
   */
  async resetRateLimit(userId: string, path?: string): Promise<void> {
    if (this.isRedisAvailable && this.redis) {
      const pattern = path ? `ratelimit:${userId}:${path}` : `ratelimit:${userId}:*`;
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    }

    // Also clear from memory
    if (path) {
      this.fallbackMap.delete(`${userId}:${path}`);
    } else {
      // Clear all for user
      for (const key of this.fallbackMap.keys()) {
        if (key.startsWith(`${userId}:`)) {
          this.fallbackMap.delete(key);
        }
      }
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  /**
   * Get Redis connection status
   */
  getStatus(): { redis: boolean; fallback: boolean } {
    return {
      redis: this.isRedisAvailable,
      fallback: !this.isRedisAvailable,
    };
  }
}

// Singleton instance
export const rateLimiter = new RedisRateLimiter();

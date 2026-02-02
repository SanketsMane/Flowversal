import Redis from 'ioredis';
import { env } from '../config/env';
import { logger } from '../../shared/utils/logger.util';

export class CacheService {
  private redis: Redis | null = null;
  private isConnected = false;

  constructor() {
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          reconnectOnError: (err) => {
            const targetError = 'READONLY';
            if (err.message.includes(targetError)) {
              return true;
            }
            return false;
          },
        });

        this.redis.on('connect', () => {
          this.isConnected = true;
          logger.info('Redis connected successfully');
        });

        this.redis.on('error', (error) => {
          this.isConnected = false;
          logger.warn('Redis connection error', { error: error.message });
        });

        this.redis.on('close', () => {
          this.isConnected = false;
          logger.warn('Redis connection closed');
        });
      } catch (error: any) {
        logger.warn('Redis initialization failed, caching disabled', { error: error.message });
        this.redis = null;
      }
    } else {
      logger.info('Redis URL not configured, caching disabled');
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.redis || !this.isConnected) {
      return null;
    }

    try {
      const data = await this.redis.get(key);
      if (!data) {
        return null;
      }
      return JSON.parse(data) as T;
    } catch (error: any) {
      logger.error('Cache get error', error, { key });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.redis || !this.isConnected) {
      return;
    }

    try {
      const data = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, data);
      } else {
        await this.redis.set(key, data);
      }
    } catch (error: any) {
      logger.error('Cache set error', error, { key });
    }
  }

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<void> {
    if (!this.redis || !this.isConnected) {
      return;
    }

    try {
      await this.redis.del(key);
    } catch (error: any) {
      logger.error('Cache delete error', error, { key });
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.redis || !this.isConnected) {
      return;
    }

    try {
      const stream = this.redis.scanStream({
        match: pattern,
        count: 100,
      });

      const keys: string[] = [];
      stream.on('data', (resultKeys: string[]) => {
        keys.push(...resultKeys);
      });

      await new Promise<void>((resolve, reject) => {
        stream.on('end', () => {
          if (keys.length > 0) {
            this.redis!.del(...keys).then(() => resolve()).catch(reject);
          } else {
            resolve();
          }
        });
        stream.on('error', reject);
      });
    } catch (error: any) {
      logger.error('Cache pattern invalidation error', error, { pattern });
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error: any) {
      logger.error('Cache exists check error', error, { key });
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   */
  async ttl(key: string): Promise<number> {
    if (!this.redis || !this.isConnected) {
      return -1;
    }

    try {
      return await this.redis.ttl(key);
    } catch (error: any) {
      logger.error('Cache TTL check error', error, { key });
      return -1;
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.isConnected = false;
    }
  }
}

// Singleton instance
export const cacheService = new CacheService();


import { EventEmitter } from 'events';

export interface CacheConfig {
  ttl: number; // Default TTL in seconds
  maxSize: number; // Maximum number of items
  checkPeriod?: number; // Cleanup interval in seconds
}

export interface CacheItem {
  value: any;
  expiresAt: number;
  lastAccessed: number;
  accessCount: number;
  size: number; // Approximate size in bytes
}

export interface CacheStats {
  items: number;
  hits: number;
  misses: number;
  evictions: number;
  sets: number;
  deletes: number;
  totalSize: number; // Approximate total size in bytes
  hitRate: number;
}

export class CacheManager extends EventEmitter {
  private cache: Map<string, CacheItem> = new Map();
  private config: CacheConfig;
  private stats: CacheStats = {
    items: 0,
    hits: 0,
    misses: 0,
    evictions: 0,
    sets: 0,
    deletes: 0,
    totalSize: 0,
    hitRate: 0,
  };
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: CacheConfig) {
    super();
    this.config = {
      checkPeriod: 60, // 1 minute default
      ...config,
    };

    this.startCleanupTimer();
  }

  /**
   * Get a value from cache
   */
  async get(key: string): Promise<any | null> {
    const item = this.cache.get(key);

    if (!item) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.stats.items--;
      this.stats.totalSize -= item.size;
      this.stats.evictions++;
      this.emit('expired', key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access statistics
    item.lastAccessed = Date.now();
    item.accessCount++;

    this.stats.hits++;
    this.updateHitRate();

    this.emit('hit', key);
    return item.value;
  }

  /**
   * Set a value in cache
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expiresAt = Date.now() + (ttl || this.config.ttl) * 1000;
    const size = this.calculateSize(value);

    // Check if we need to evict items to make room
    if (this.cache.size >= this.config.maxSize) {
      await this.evictItems(1);
    }

    const item: CacheItem = {
      value,
      expiresAt,
      lastAccessed: Date.now(),
      accessCount: 0,
      size,
    };

    const existingItem = this.cache.get(key);
    if (existingItem) {
      this.stats.totalSize -= existingItem.size;
    } else {
      this.stats.items++;
    }

    this.cache.set(key, item);
    this.stats.totalSize += size;
    this.stats.sets++;

    this.emit('set', key, { ttl, size });
  }

  /**
   * Delete a value from cache
   */
  async delete(key: string): Promise<boolean> {
    const item = this.cache.get(key);

    if (item) {
      this.cache.delete(key);
      this.stats.items--;
      this.stats.totalSize -= item.size;
      this.stats.deletes++;
      this.emit('delete', key);
      return true;
    }

    return false;
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    const itemCount = this.cache.size;
    this.cache.clear();
    this.stats.items = 0;
    this.stats.totalSize = 0;
    this.emit('clear', itemCount);
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    return item !== undefined && Date.now() <= item.expiresAt;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get all cache keys
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache item metadata
   */
  getMetadata(key: string): CacheItem | null {
    const item = this.cache.get(key);
    return item || null;
  }

  /**
   * Get multiple values from cache
   */
  async getMany(keys: string[]): Promise<Map<string, any>> {
    const results = new Map<string, any>();

    for (const key of keys) {
      const value = await this.get(key);
      if (value !== null) {
        results.set(key, value);
      }
    }

    return results;
  }

  /**
   * Set multiple values in cache
   */
  async setMany(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    for (const entry of entries) {
      await this.set(entry.key, entry.value, entry.ttl);
    }
  }

  /**
   * Delete multiple values from cache
   */
  async deleteMany(keys: string[]): Promise<number> {
    let deletedCount = 0;

    for (const key of keys) {
      if (await this.delete(key)) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Get cache size information
   */
  getSizeInfo(): {
    items: number;
    maxItems: number;
    totalSize: number;
    utilizationPercent: number;
  } {
    return {
      items: this.stats.items,
      maxItems: this.config.maxSize,
      totalSize: this.stats.totalSize,
      utilizationPercent: (this.stats.items / this.config.maxSize) * 100,
    };
  }

  /**
   * Warm up cache with initial data
   */
  async warmUp(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    this.emit('warmup-start', entries.length);

    for (const entry of entries) {
      await this.set(entry.key, entry.value, entry.ttl);
    }

    this.emit('warmup-complete', entries.length);
  }

  /**
   * Gracefully shutdown the cache manager
   */
  async close(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    await this.clear();
    this.emit('close');
  }

  /**
   * Force cleanup of expired items
   */
  async cleanup(): Promise<number> {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        this.stats.items--;
        this.stats.totalSize -= item.size;
        this.stats.evictions++;
        cleanedCount++;
        this.emit('expired', key);
      }
    }

    return cleanedCount;
  }

  /**
   * Evict items using LRU (Least Recently Used) strategy
   */
  private async evictItems(count: number): Promise<void> {
    if (this.cache.size === 0) return;

    // Sort by last accessed time (oldest first)
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    for (let i = 0; i < Math.min(count, entries.length); i++) {
      const [key, item] = entries[i];
      this.cache.delete(key);
      this.stats.items--;
      this.stats.totalSize -= item.size;
      this.stats.evictions++;
      this.emit('evict', key);
    }
  }

  /**
   * Calculate approximate size of a value in bytes
   */
  private calculateSize(value: any): number {
    try {
      const jsonString = JSON.stringify(value);
      return Buffer.byteLength(jsonString, 'utf8');
    } catch (error) {
      // Fallback size estimation
      return 1024; // 1KB default
    }
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(async () => {
      const cleanedCount = await this.cleanup();
      if (cleanedCount > 0) {
        this.emit('cleanup', cleanedCount);
      }
    }, this.config.checkPeriod! * 1000);
  }
}
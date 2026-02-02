export interface RateLimiterConfig {
  max: number; // Maximum requests per time window
  timeWindow: string; // Time window (e.g., '1 minute', '15 minutes')
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipErrorRequests?: boolean; // Don't count error requests
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastRequest: number;
}

export interface RateLimiterStats {
  totalRequests: number;
  blockedRequests: number;
  activeLimits: number;
  hitRate: number;
}

export class RateLimiter {
  private config: RateLimiterConfig;
  private limits: Map<string, RateLimitEntry> = new Map();
  private stats: RateLimiterStats = {
    totalRequests: 0,
    blockedRequests: 0,
    activeLimits: 0,
    hitRate: 0,
  };
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: RateLimiterConfig) {
    this.config = {
      skipSuccessfulRequests: false,
      skipErrorRequests: false,
      ...config,
    };

    // Parse time window
    this.timeWindowMs = this.parseTimeWindow(config.timeWindow);

    // Start cleanup timer
    this.startCleanupTimer();
  }

  private timeWindowMs: number;

  /**
   * Check if request should be allowed
   */
  async checkLimit(identifier: string, maxRequests?: number, timeWindow?: string): Promise<boolean> {
    const max = maxRequests || this.config.max;
    const windowMs = timeWindow ? this.parseTimeWindow(timeWindow) : this.timeWindowMs;

    this.stats.totalRequests++;

    const now = Date.now();
    const key = `${identifier}:${max}:${windowMs}`;

    let entry = this.limits.get(key);

    if (!entry) {
      // First request from this identifier
      entry = {
        count: 1,
        resetTime: now + windowMs,
        lastRequest: now,
      };
      this.limits.set(key, entry);
      this.stats.activeLimits++;
      return true;
    }

    // Check if time window has expired
    if (now > entry.resetTime) {
      // Reset the counter
      entry.count = 1;
      entry.resetTime = now + windowMs;
      entry.lastRequest = now;
      return true;
    }

    // Check if limit exceeded
    if (entry.count >= max) {
      this.stats.blockedRequests++;
      return false;
    }

    // Increment counter
    entry.count++;
    entry.lastRequest = now;

    return true;
  }

  /**
   * Record a successful request (may skip rate limiting)
   */
  recordSuccess(identifier: string): void {
    if (this.config.skipSuccessfulRequests) {
      // Could implement logic to reduce count for successful requests
    }
  }

  /**
   * Record an error request (may skip rate limiting)
   */
  recordError(identifier: string): void {
    if (this.config.skipErrorRequests) {
      // Could implement logic to reduce count for error requests
    }
  }

  /**
   * Get remaining requests for an identifier
   */
  getRemainingRequests(identifier: string, maxRequests?: number, timeWindow?: string): number {
    const max = maxRequests || this.config.max;
    const windowMs = timeWindow ? this.parseTimeWindow(timeWindow) : this.timeWindowMs;

    const key = `${identifier}:${max}:${windowMs}`;
    const entry = this.limits.get(key);

    if (!entry) {
      return max;
    }

    const now = Date.now();

    // Check if time window has expired
    if (now > entry.resetTime) {
      return max;
    }

    return Math.max(0, max - entry.count);
  }

  /**
   * Get reset time for an identifier
   */
  getResetTime(identifier: string, maxRequests?: number, timeWindow?: string): number {
    const max = maxRequests || this.config.max;
    const windowMs = timeWindow ? this.parseTimeWindow(timeWindow) : this.timeWindowMs;

    const key = `${identifier}:${max}:${windowMs}`;
    const entry = this.limits.get(key);

    return entry ? entry.resetTime : Date.now() + windowMs;
  }

  /**
   * Get rate limiter statistics
   */
  getStats(): RateLimiterStats {
    const total = this.stats.totalRequests;
    this.stats.hitRate = total > 0 ? ((total - this.stats.blockedRequests) / total) * 100 : 0;

    return { ...this.stats };
  }

  /**
   * Reset rate limit for a specific identifier
   */
  resetLimit(identifier: string, maxRequests?: number, timeWindow?: string): void {
    const max = maxRequests || this.config.max;
    const windowMs = timeWindow ? this.parseTimeWindow(timeWindow) : this.timeWindowMs;

    const key = `${identifier}:${max}:${windowMs}`;
    this.limits.delete(key);
    this.stats.activeLimits = Math.max(0, this.stats.activeLimits - 1);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.limits.clear();
    this.stats.activeLimits = 0;
  }

  /**
   * Get all active limits (for debugging)
   */
  getActiveLimits(): Array<{
    identifier: string;
    max: number;
    windowMs: number;
    count: number;
    resetTime: number;
    lastRequest: number;
  }> {
    const result: any[] = [];

    for (const [key, entry] of this.limits.entries()) {
      const [identifier, max, windowMs] = key.split(':');
      result.push({
        identifier,
        max: parseInt(max),
        windowMs: parseInt(windowMs),
        count: entry.count,
        resetTime: entry.resetTime,
        lastRequest: entry.lastRequest,
      });
    }

    return result;
  }

  /**
   * Gracefully shutdown the rate limiter
   */
  async close(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.resetAll();
  }

  /**
   * Parse time window string to milliseconds
   */
  private parseTimeWindow(timeWindow: string): number {
    const match = timeWindow.match(/^(\d+)\s*(second|minute|hour|day)s?$/i);

    if (!match) {
      throw new Error(`Invalid time window format: ${timeWindow}. Expected format: "15 minutes", "1 hour", etc.`);
    }

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'second':
        return value * 1000;
      case 'minute':
        return value * 60 * 1000;
      case 'hour':
        return value * 60 * 60 * 1000;
      case 'day':
        return value * 24 * 60 * 60 * 1000;
      default:
        throw new Error(`Unsupported time unit: ${unit}`);
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.stats.activeLimits = Math.max(0, this.stats.activeLimits - cleanedCount);
    }
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer(): void {
    // Cleanup every minute
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 60000);
  }
}
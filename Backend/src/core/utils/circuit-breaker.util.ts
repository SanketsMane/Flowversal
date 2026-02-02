export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening circuit
  recoveryTimeout: number; // Time in ms to wait before trying to close circuit
  monitoringPeriod?: number; // Time window in ms for monitoring failures
}

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  totalRequests: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  nextAttemptTime?: number;
}

export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitState = 'CLOSED';
  private failures: number = 0;
  private successes: number = 0;
  private totalRequests: number = 0;
  private lastFailureTime?: number;
  private lastSuccessTime?: number;
  private nextAttemptTime?: number;
  private services: Map<string, CircuitBreakerStats> = new Map();

  constructor(config: CircuitBreakerConfig) {
    this.config = {
      monitoringPeriod: 60000, // 1 minute default
      ...config,
    };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(serviceName: string, fn: () => Promise<T>): Promise<T> {
    const stats = this.getServiceStats(serviceName);

    // Check if circuit is open
    if (this.isCircuitOpen(serviceName)) {
      throw new Error(`Circuit breaker is OPEN for service: ${serviceName}`);
    }

    try {
      this.totalRequests++;
      stats.totalRequests++;

      const result = await fn();

      // Record success
      await this.recordSuccess(serviceName);

      return result;

    } catch (error) {
      // Record failure
      await this.recordFailure(serviceName);

      throw error;
    }
  }

  /**
   * Check if circuit is open for a service
   */
  isOpen(serviceName: string): boolean {
    return this.isCircuitOpen(serviceName);
  }

  /**
   * Record a successful operation
   */
  async recordSuccess(serviceName: string): Promise<void> {
    const stats = this.getServiceStats(serviceName);

    this.successes++;
    stats.successes++;
    stats.lastSuccessTime = Date.now();

    // If in HALF_OPEN state and success, close the circuit
    if (stats.state === 'HALF_OPEN') {
      stats.state = 'CLOSED';
      stats.failures = 0; // Reset failure count
    }
  }

  /**
   * Record a failed operation
   */
  async recordFailure(serviceName: string): Promise<void> {
    const stats = this.getServiceStats(serviceName);

    this.failures++;
    stats.failures++;
    stats.lastFailureTime = Date.now();

    // Check if we should open the circuit
    if (stats.failures >= this.config.failureThreshold) {
      stats.state = 'OPEN';
      stats.nextAttemptTime = Date.now() + this.config.recoveryTimeout;
    }
  }

  /**
   * Get statistics for a service
   */
  getServiceStats(serviceName: string): CircuitBreakerStats {
    if (!this.services.has(serviceName)) {
      this.services.set(serviceName, {
        state: 'CLOSED',
        failures: 0,
        successes: 0,
        totalRequests: 0,
      });
    }

    return this.services.get(serviceName)!;
  }

  /**
   * Get overall circuit breaker statistics
   */
  getStats(): {
    overall: CircuitBreakerStats;
    services: Record<string, CircuitBreakerStats>;
  } {
    const overall: CircuitBreakerStats = {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      totalRequests: this.totalRequests,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      nextAttemptTime: this.nextAttemptTime,
    };

    const services: Record<string, CircuitBreakerStats> = {};
    for (const [serviceName, stats] of this.services.entries()) {
      services[serviceName] = { ...stats };
    }

    return { overall, services };
  }

  /**
   * Reset circuit breaker for a service
   */
  resetService(serviceName: string): void {
    this.services.delete(serviceName);
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.totalRequests = 0;
    this.lastFailureTime = undefined;
    this.lastSuccessTime = undefined;
    this.nextAttemptTime = undefined;
    this.services.clear();
  }

  /**
   * Force circuit state for a service (for testing/debugging)
   */
  forceState(serviceName: string, state: CircuitState): void {
    const stats = this.getServiceStats(serviceName);
    stats.state = state;

    if (state === 'OPEN') {
      stats.nextAttemptTime = Date.now() + this.config.recoveryTimeout;
    }
  }

  /**
   * Clean up expired monitoring data
   */
  cleanup(): void {
    const now = Date.now();
    const monitoringPeriod = this.config.monitoringPeriod!;

    // Clean up old service stats
    for (const [serviceName, stats] of this.services.entries()) {
      // Reset counters if outside monitoring period
      if (stats.lastFailureTime && (now - stats.lastFailureTime) > monitoringPeriod) {
        stats.failures = 0;
        if (stats.state === 'OPEN' && stats.nextAttemptTime && now > stats.nextAttemptTime) {
          stats.state = 'HALF_OPEN';
        }
      }
    }
  }

  /**
   * Gracefully shutdown the circuit breaker
   */
  async close(): Promise<void> {
    // Cleanup any resources if needed
    this.services.clear();
  }

  /**
   * Check if circuit is open for a service
   */
  private isCircuitOpen(serviceName: string): boolean {
    const stats = this.getServiceStats(serviceName);
    const now = Date.now();

    switch (stats.state) {
      case 'CLOSED':
        return false;

      case 'OPEN':
        // Check if it's time to try again
        if (stats.nextAttemptTime && now > stats.nextAttemptTime) {
          stats.state = 'HALF_OPEN';
          return false;
        }
        return true;

      case 'HALF_OPEN':
        // Allow one request to test the service
        return false;

      default:
        return false;
    }
  }

  /**
   * Auto-cleanup interval (optional)
   */
  startAutoCleanup(intervalMs: number = 30000): void {
    setInterval(() => {
      this.cleanup();
    }, intervalMs);
  }
}
/**
 * Performance monitoring utilities for frontend
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 100;

  /**
   * Measure render time for a component
   */
  measureRenderTime(componentName: string, startTime: number): number {
    const duration = performance.now() - startTime;

    if (duration > 16.67) {
      // Longer than one frame at 60fps
      console.warn(`${componentName} render took ${duration.toFixed(2)}ms`);
    }

    this.recordMetric({
      name: `render:${componentName}`,
      value: duration,
      timestamp: Date.now(),
    });

    return duration;
  }

  /**
   * Measure API call performance
   */
  measureAPICall(endpoint: string, startTime: number, success: boolean): number {
    const duration = performance.now() - startTime;

    if (duration > 1000) {
      // Slow API call
      console.warn(`Slow API call to ${endpoint}: ${duration.toFixed(2)}ms`);
    }

    this.recordMetric({
      name: `api:${endpoint}`,
      value: duration,
      timestamp: Date.now(),
      metadata: {
        success,
        endpoint,
      },
    });

    // Send to analytics if configured
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('api_call', {
        endpoint,
        duration,
        success,
      });
    }

    return duration;
  }

  /**
   * Measure custom operation
   */
  measureOperation(operationName: string, operation: () => void | Promise<void>): void | Promise<void> {
    const startTime = performance.now();

    const result = operation();

    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - startTime;
        this.recordMetric({
          name: `operation:${operationName}`,
          value: duration,
          timestamp: Date.now(),
        });
      });
    } else {
      const duration = performance.now() - startTime;
      this.recordMetric({
        name: `operation:${operationName}`,
        value: duration,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Record a custom metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter((m) => m.name === name);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    totalMetrics: number;
    averageRenderTime: number;
    averageAPITime: number;
    slowestOperations: PerformanceMetric[];
  } {
    const renderMetrics = this.metrics.filter((m) => m.name.startsWith('render:'));
    const apiMetrics = this.metrics.filter((m) => m.name.startsWith('api:'));

    const averageRenderTime =
      renderMetrics.length > 0
        ? renderMetrics.reduce((sum, m) => sum + m.value, 0) / renderMetrics.length
        : 0;

    const averageAPITime =
      apiMetrics.length > 0 ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length : 0;

    const slowestOperations = [...this.metrics]
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return {
      totalMetrics: this.metrics.length,
      averageRenderTime,
      averageAPITime,
      slowestOperations,
    };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export convenience functions
export function measureRenderTime(componentName: string, startTime: number): number {
  return performanceMonitor.measureRenderTime(componentName, startTime);
}

export function measureAPICall(endpoint: string, startTime: number, success: boolean): number {
  return performanceMonitor.measureAPICall(endpoint, startTime, success);
}

export function measureOperation<T>(operationName: string, operation: () => T): T {
  const startTime = performance.now();
  const result = operation();
  const duration = performance.now() - startTime;

  performanceMonitor.recordMetric({
    name: `operation:${operationName}`,
    value: duration,
    timestamp: Date.now(),
  });

  return result;
}


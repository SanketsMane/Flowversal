import { Span, SpanKind, SpanStatusCode, Tracer, trace } from '@opentelemetry/api';
import { logger } from '../../shared/utils/logger.util';

export interface TracingConfig {
  serviceName: string;
  serviceVersion: string;
  environment: string;
  enabled: boolean;
  samplingRate?: number;
}

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
}

export class TracingService {
  private tracer: Tracer | null = null;
  private config: TracingConfig;

  constructor(config: TracingConfig) {
    this.config = config;
    this.initializeTracing();
  }

  private initializeTracing(): void {
    if (!this.config.enabled) {
      logger.info('Distributed tracing is disabled');
      return;
    }

    try {
      // Get the tracer from the global tracer provider
      this.tracer = trace.getTracer(
        this.config.serviceName,
        this.config.serviceVersion
      );

      logger.info('Distributed tracing initialized', {
        serviceName: this.config.serviceName,
        serviceVersion: this.config.serviceVersion,
        environment: this.config.environment,
      });
    } catch (error: any) {
      logger.error('Failed to initialize distributed tracing', { error: error.message });
    }
  }

  /**
   * Start a new span
   */
  startSpan(name: string, options?: {
    parentSpan?: Span;
    attributes?: Record<string, string | number | boolean>;
    kind?: SpanKind;
  }): Span | null {
    if (!this.tracer || !this.config.enabled) {
      return null;
    }

    try {
      const spanOptions: any = {
        attributes: {
          'service.name': this.config.serviceName,
          'service.version': this.config.serviceVersion,
          'service.environment': this.config.environment,
          ...options?.attributes,
        },
        kind: options?.kind,
      };

      // Set parent span if provided
      if (options?.parentSpan) {
        spanOptions.root = false; // This span is not a root span
        // The parent context will be automatically picked up from the active context
        // or we could explicitly set it using context.with()
      }

      const span = this.tracer.startSpan(name, spanOptions);

      return span;
    } catch (error: any) {
      logger.error('Failed to start span', { name, error: error.message });
      return null;
    }
  }

  /**
   * Start an active span with automatic cleanup
   */
  async withSpan<T>(
    name: string,
    fn: (span: Span | null) => Promise<T>,
    options?: {
      attributes?: Record<string, string | number | boolean>;
      kind?: SpanKind;
    }
  ): Promise<T> {
    const span = this.startSpan(name, options);

    try {
      const result = await fn(span);
      if (span) {
        span.setStatus({ code: SpanStatusCode.OK });
      }
      return result;
    } catch (error: any) {
      if (span) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message,
        });
        span.recordException(error);
      }
      throw error;
    } finally {
      if (span) {
        span.end();
      }
    }
  }

  /**
   * Add attributes to an active span
   */
  setAttributes(span: Span | null, attributes: Record<string, string | number | boolean>): void {
    if (!span) return;

    try {
      Object.entries(attributes).forEach(([key, value]) => {
        span.setAttribute(key, value);
      });
    } catch (error: any) {
      logger.error('Failed to set span attributes', { error: error.message });
    }
  }

  /**
   * Record an event on a span
   */
  addEvent(span: Span | null, name: string, attributes?: Record<string, string | number | boolean>): void {
    if (!span) return;

    try {
      span.addEvent(name, attributes);
    } catch (error: any) {
      logger.error('Failed to add span event', { name, error: error.message });
    }
  }

  /**
   * Record an exception on a span
   */
  recordException(span: Span | null, error: Error, attributes?: Record<string, string | number | boolean>): void {
    if (!span) return;

    try {
      if (attributes) {
        this.setAttributes(span, attributes);
      }
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
    } catch (err: any) {
      logger.error('Failed to record exception on span', { error: err.message });
    }
  }

  /**
   * Get current trace context
   */
  getCurrentTraceContext(): TraceContext | null {
    try {
      const span = trace.getActiveSpan();
      if (!span) return null;

      const spanContext = span.spanContext();
      return {
        traceId: spanContext.traceId,
        spanId: spanContext.spanId,
        // parentSpanId: not directly available from span context
      };
    } catch (error: any) {
      logger.error('Failed to get current trace context', { error: error.message });
      return null;
    }
  }

  /**
   * Inject trace context into headers for distributed tracing
   */
  injectTraceContext(span: Span | null, headers: Record<string, string>): void {
    if (!span) return;

    try {
      // This would use a propagator (like W3C Trace Context) in a real implementation
      const spanContext = span.spanContext();
      headers['x-trace-id'] = spanContext.traceId;
      headers['x-span-id'] = spanContext.spanId;
    } catch (error: any) {
      logger.error('Failed to inject trace context', { error: error.message });
    }
  }

  /**
   * Extract trace context from headers
   */
  extractTraceContext(headers: Record<string, string>): TraceContext | null {
    try {
      const traceId = headers['x-trace-id'];
      const spanId = headers['x-span-id'];

      if (!traceId || !spanId) return null;

      return {
        traceId,
        spanId,
      };
    } catch (error: any) {
      logger.error('Failed to extract trace context', { error: error.message });
      return null;
    }
  }

  /**
   * Create middleware for automatic tracing of HTTP requests
   */
  createTracingMiddleware(operationName?: string) {
    return async (request: any, reply: any, next: () => Promise<void>) => {
      const spanName = operationName || `${request.method} ${request.url}`;

      await this.withSpan(spanName, async (span) => {
        if (span) {
          // Add HTTP attributes
          this.setAttributes(span, {
            'http.method': request.method,
            'http.url': request.url,
            'http.user_agent': request.headers['user-agent'] || '',
            'http.request_id': (request as any).requestId || '',
          });

          // Add user context if available
          if ((request as any).user) {
            this.setAttributes(span, {
              'user.id': (request as any).user.id || '',
              'user.email': (request as any).user.email || '',
            });
          }

          // Inject trace context into response headers
          const responseHeaders: Record<string, string> = {};
          this.injectTraceContext(span, responseHeaders);

          // Set response headers
          Object.entries(responseHeaders).forEach(([key, value]) => {
            reply.header(key, value);
          });
        }

        try {
          await next();

          if (span) {
            this.setAttributes(span, {
              'http.status_code': reply.statusCode,
            });
          }
        } catch (error: any) {
          if (span) {
            this.recordException(span, error, {
              'error.type': error.constructor.name,
              'http.status_code': reply.statusCode || 500,
            });
          }
          throw error;
        }
      });
    };
  }
}

// Re-export OpenTelemetry types for convenience
export { Span, SpanKind, SpanStatusCode } from '@opentelemetry/api';

// Create and export a singleton instance
export const tracingService = new TracingService({
  serviceName: 'flowversal-backend',
  serviceVersion: process.env.npm_package_version || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  enabled: process.env.OTEL_TRACING_ENABLED !== 'false',
  samplingRate: parseFloat(process.env.OTEL_SAMPLING_RATE || '1.0'),
});
import { randomUUID } from 'crypto';
import pino, { Logger } from 'pino';
import { tracingService } from './tracing.service';

export interface LoggingConfig {
  level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  prettyPrint: boolean;
  includeCorrelationId: boolean;
  includeTraceContext: boolean;
  redactFields: string[];
  serviceName: string;
  serviceVersion: string;
  environment: string;
}

export interface LogContext {
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  workflowId?: string;
  executionId?: string;
  operation?: string;
  component?: string;
  [key: string]: any;
}

export class LoggingService {
  private logger!: Logger;
  private config: LoggingConfig;

  constructor(config: LoggingConfig) {
    this.config = config;
    this.initializeLogger();
  }

  private initializeLogger(): void {
    const pinoConfig: any = {
      level: this.config.level,
      formatters: {
        level: (label: string) => {
          return { level: label };
        },
        log: (obj: any) => {
          // Add default fields
          const formatted = {
            ...obj,
            service: this.config.serviceName,
            version: this.config.serviceVersion,
            environment: this.config.environment,
            timestamp: new Date().toISOString(),
          };

          // Add correlation ID if enabled
          if (this.config.includeCorrelationId && obj.correlationId) {
            formatted.correlationId = obj.correlationId;
          }

          // Add trace context if enabled
          if (this.config.includeTraceContext) {
            const traceContext = tracingService.getCurrentTraceContext();
            if (traceContext) {
              formatted.traceId = traceContext.traceId;
              formatted.spanId = traceContext.spanId;
              if (traceContext.parentSpanId) {
                formatted.parentSpanId = traceContext.parentSpanId;
              }
            }
          }

          return formatted;
        },
      },
      serializers: {
        error: pino.stdSerializers.err,
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res,
      },
    };

    // Add redaction if configured
    if (this.config.redactFields.length > 0) {
      pinoConfig.redact = this.config.redactFields;
    }

    // Enable pretty printing in development
    if (this.config.prettyPrint && this.config.environment === 'development') {
      pinoConfig.transport = {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname,service,version,environment',
        },
      };
    }

    this.logger = pino(pinoConfig);
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    return this.logger.child(context);
  }

  /**
   * Create a contextual logger for a specific operation
   */
  createContextualLogger(context: LogContext): ContextualLogger {
    const childLogger = this.child(context);
    return new ContextualLogger(childLogger, context);
  }

  /**
   * Generate a correlation ID
   */
  generateCorrelationId(): string {
    return randomUUID();
  }

  // Logging methods with consistent interface

  fatal(message: string, context?: LogContext, error?: Error): void {
    this.log('fatal', message, context, error);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log('error', message, context, error);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  trace(message: string, context?: LogContext): void {
    this.log('trace', message, context);
  }

  private log(level: string, message: string, context?: LogContext, error?: Error): void {
    const logData: any = {
      msg: message,
      ...context,
    };

    if (error) {
      logData.error = error;
    }

    (this.logger as any)[level](logData);
  }

  // Performance logging

  logPerformance(operation: string, duration: number, context?: LogContext): void {
    this.info(`Performance: ${operation}`, {
      ...context,
      operation,
      duration,
      duration_unit: 'ms',
      performance: true,
    });
  }

  logSlowOperation(operation: string, duration: number, threshold: number, context?: LogContext): void {
    this.warn(`Slow operation: ${operation}`, {
      ...context,
      operation,
      duration,
      threshold,
      duration_unit: 'ms',
      slow_operation: true,
    });
  }

  // Business event logging

  logBusinessEvent(event: string, properties: Record<string, any>, context?: LogContext): void {
    this.info(`Business event: ${event}`, {
      ...context,
      event,
      event_type: 'business',
      ...properties,
    });
  }

  logUserAction(userId: string, action: string, details: Record<string, any>, context?: LogContext): void {
    this.info(`User action: ${action}`, {
      ...context,
      userId,
      action,
      event_type: 'user_action',
      ...details,
    });
  }

  // Workflow logging

  logWorkflowEvent(
    workflowId: string,
    executionId: string,
    event: string,
    details: Record<string, any>,
    context?: LogContext
  ): void {
    this.info(`Workflow event: ${event}`, {
      ...context,
      workflowId,
      executionId,
      event,
      event_type: 'workflow',
      ...details,
    });
  }

  logWorkflowStep(
    workflowId: string,
    executionId: string,
    stepId: string,
    stepName: string,
    status: string,
    duration?: number,
    context?: LogContext
  ): void {
    this.info(`Workflow step: ${stepName}`, {
      ...context,
      workflowId,
      executionId,
      stepId,
      stepName,
      status,
      event_type: 'workflow_step',
      duration,
    });
  }

  // AI/ML logging

  logAIModelUsage(
    provider: string,
    model: string,
    tokens: number,
    cost: number,
    duration: number,
    context?: LogContext
  ): void {
    this.info('AI model usage', {
      ...context,
      provider,
      model,
      tokens,
      cost,
      duration,
      event_type: 'ai_usage',
    });
  }

  logAIModelError(
    provider: string,
    model: string,
    error: string,
    context?: LogContext
  ): void {
    this.error('AI model error', {
      ...context,
      provider,
      model,
      error,
      event_type: 'ai_error',
    });
  }

  // Security logging

  logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: Record<string, any>,
    context?: LogContext
  ): void {
    this.warn(`Security event: ${event}`, {
      ...context,
      event,
      severity,
      event_type: 'security',
      ...details,
    });
  }

  logAuthenticationEvent(
    userId: string,
    event: 'login' | 'logout' | 'failed_login' | 'password_change',
    success: boolean,
    context?: LogContext
  ): void {
    const level = success ? 'info' : 'warn';
    this[level](`Authentication: ${event}`, {
      ...context,
      userId,
      event,
      success,
      event_type: 'authentication',
    });
  }

  // Audit logging

  logAuditEvent(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    changes?: Record<string, any>,
    context?: LogContext
  ): void {
    this.info(`Audit: ${action}`, {
      ...context,
      userId,
      action,
      resource,
      resourceId,
      changes,
      event_type: 'audit',
      timestamp: new Date().toISOString(),
    });
  }

  // Health monitoring

  logHealthCheck(
    service: string,
    status: 'healthy' | 'unhealthy',
    responseTime: number,
    details?: Record<string, any>,
    context?: LogContext
  ): void {
    const level = status === 'healthy' ? 'debug' : 'warn';
    this[level](`Health check: ${service}`, {
      ...context,
      service,
      status,
      responseTime,
      responseTime_unit: 'ms',
      event_type: 'health_check',
      ...details,
    });
  }

  // Error aggregation and analysis

  logErrorWithStack(
    error: Error,
    context?: LogContext,
    additionalData?: Record<string, any>
  ): void {
    this.error(error.message, {
      ...context,
      error_name: error.name,
      error_stack: error.stack,
      error_type: 'exception',
      ...additionalData,
    });
  }

  logValidationError(
    field: string,
    value: any,
    rule: string,
    message: string,
    context?: LogContext
  ): void {
    this.warn(`Validation error: ${field}`, {
      ...context,
      field,
      value,
      rule,
      message,
      event_type: 'validation_error',
    });
  }

  // Request/Response logging middleware helper

  createRequestLogger() {
    return (request: any, reply: any, next: () => Promise<void>) => {
      const startTime = Date.now();
      const correlationId = this.generateCorrelationId();
      const requestId = (request as any).requestId || correlationId;

      // Add correlation ID to request for use in handlers
      (request as any).correlationId = correlationId;

      const context: LogContext = {
        correlationId,
        requestId,
        method: request.method,
        url: request.url,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
      };

      // Add user context if authenticated
      if ((request as any).user) {
        context.userId = (request as any).user.id;
      }

      this.info('Request started', context);

      // Override reply.send to log response
      const originalSend = reply.send;
      reply.send = (data: any) => {
        const duration = Date.now() - startTime;

        const responseContext = {
          ...context,
          statusCode: reply.statusCode,
          duration,
          responseSize: data ? JSON.stringify(data).length : 0,
        };

        if (reply.statusCode >= 400) {
          this.warn('Request completed with error', responseContext);
        } else {
          this.info('Request completed', responseContext);
        }

        return originalSend.call(reply, data);
      };

      next();
    };
  }
}

/**
 * Contextual logger that maintains context across multiple log calls
 */
export class ContextualLogger {
  private logger: Logger;
  private context: LogContext;

  constructor(logger: Logger, context: LogContext) {
    this.logger = logger;
    this.context = context;
  }

  fatal(message: string, additionalContext?: LogContext, error?: Error): void {
    this.logger.fatal({ ...this.context, ...additionalContext, error }, message);
  }

  error(message: string, additionalContext?: LogContext, error?: Error): void {
    this.logger.error({ ...this.context, ...additionalContext, error }, message);
  }

  warn(message: string, additionalContext?: LogContext): void {
    this.logger.warn({ ...this.context, ...additionalContext }, message);
  }

  info(message: string, additionalContext?: LogContext): void {
    this.logger.info({ ...this.context, ...additionalContext }, message);
  }

  debug(message: string, additionalContext?: LogContext): void {
    this.logger.debug({ ...this.context, ...additionalContext }, message);
  }

  trace(message: string, additionalContext?: LogContext): void {
    this.logger.trace({ ...this.context, ...additionalContext }, message);
  }

  // Add context for subsequent calls
  addContext(additionalContext: LogContext): ContextualLogger {
    this.context = { ...this.context, ...additionalContext };
    return this;
  }

  // Create child contextual logger
  child(additionalContext: LogContext): ContextualLogger {
    const childLogger = this.logger.child(additionalContext);
    return new ContextualLogger(childLogger, { ...this.context, ...additionalContext });
  }
}

// Create and export a singleton instance
export const loggingService = new LoggingService({
  level: (process.env.LOG_LEVEL as any) || 'info',
  prettyPrint: process.env.NODE_ENV === 'development',
  includeCorrelationId: true,
  includeTraceContext: true,
  redactFields: ['password', 'token', 'apiKey', 'secret'],
  serviceName: 'flowversal-backend',
  serviceVersion: process.env.npm_package_version || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
});

// Export the logger instance for direct use (backward compatibility)
export const logger = loggingService;
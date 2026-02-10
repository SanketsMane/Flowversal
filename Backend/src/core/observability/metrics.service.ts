import { metrics, ObservableGauge, Meter, Counter, Histogram, MetricOptions } from '@opentelemetry/api';
import { logger } from '../../shared/utils/logger.util';

export interface MetricsConfig {
  serviceName: string;
  serviceVersion: string;
  environment: string;
  enabled: boolean;
}

export interface PerformanceMetrics {
  responseTime: number;
  cpuUsage?: number;
  memoryUsage?: number;
  activeConnections?: number;
  errorRate?: number;
}

export class MetricsService {
  private meter: Meter | null = null;
  private config: MetricsConfig;

  // Core metrics
  private httpRequestDuration: Histogram | null = null;
  private httpRequestsTotal: Counter | null = null;
  private activeConnections: ObservableGauge | null = null;
  private _activeConnectionsValue: number = 0;

  // Business metrics
  private workflowExecutionsTotal: Counter | null = null;
  private workflowExecutionDuration: Histogram | null = null;
  private aiRequestsTotal: Counter | null = null;
  private aiRequestDuration: Histogram | null = null;
  private aiTokensUsed: Counter | null = null;
  private aiCostTotal: Counter | null = null;

  // Error metrics
  private errorsTotal: Counter | null = null;
  private validationErrorsTotal: Counter | null = null;

  // Approval and breakpoint metrics
  private pendingApprovals: ObservableGauge | null = null;
  private _pendingApprovalsValue: number = 0;
  private approvalDecisionsTotal: Counter | null = null;
  private activeBreakpoints: ObservableGauge | null = null;
  private _activeBreakpointsValue: number = 0;

  constructor(config: MetricsConfig) {
    this.config = config;
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    if (!this.config.enabled) {
      logger.info('Metrics collection is disabled');
      return;
    }

    try {
      // Get the meter from the global metrics API
      this.meter = metrics.getMeter(
        this.config.serviceName,
        this.config.serviceVersion
      );

      // Initialize core HTTP metrics
      this.httpRequestDuration = this.meter.createHistogram('http_request_duration_seconds', {
        description: 'Duration of HTTP requests in seconds',
      });

      this.httpRequestsTotal = this.meter.createCounter('http_requests_total', {
        description: 'Total number of HTTP requests',
      });

      this.activeConnections = this.meter.createObservableGauge('active_connections', {
        description: 'Number of active connections',
      });
      this.activeConnections.addCallback((observableResult: any) => {
        observableResult.observe(this._activeConnectionsValue);
      });

      // Initialize business metrics
      this.workflowExecutionsTotal = this.meter.createCounter('workflow_executions_total', {
        description: 'Total number of workflow executions',
      });

      this.workflowExecutionDuration = this.meter.createHistogram('workflow_execution_duration_seconds', {
        description: 'Duration of workflow executions in seconds',
      });

      this.aiRequestsTotal = this.meter.createCounter('ai_requests_total', {
        description: 'Total number of AI requests',
      });

      this.aiRequestDuration = this.meter.createHistogram('ai_request_duration_seconds', {
        description: 'Duration of AI requests in seconds',
      });

      this.aiTokensUsed = this.meter.createCounter('ai_tokens_used_total', {
        description: 'Total number of AI tokens used',
      });

      this.aiCostTotal = this.meter.createCounter('ai_cost_total', {
        description: 'Total AI costs in USD',
      });

      // Initialize error metrics
      this.errorsTotal = this.meter.createCounter('errors_total', {
        description: 'Total number of errors',
      });

      this.validationErrorsTotal = this.meter.createCounter('validation_errors_total', {
        description: 'Total number of validation errors',
      });

      // Initialize approval and breakpoint metrics
      this.pendingApprovals = this.meter.createObservableGauge('pending_approvals', {
        description: 'Number of pending approvals',
      });
      this.pendingApprovals.addCallback((observableResult: any) => {
        observableResult.observe(this._pendingApprovalsValue);
      });

      this.approvalDecisionsTotal = this.meter.createCounter('approval_decisions_total', {
        description: 'Total number of approval decisions',
      });

      this.activeBreakpoints = this.meter.createObservableGauge('active_breakpoints', {
        description: 'Number of active breakpoints',
      });
      this.activeBreakpoints.addCallback((observableResult: any) => {
        observableResult.observe(this._activeBreakpointsValue);
      });

      logger.info('Metrics collection initialized', {
        serviceName: this.config.serviceName,
        serviceVersion: this.config.serviceVersion,
      });
    } catch (error: any) {
      logger.error('Failed to initialize metrics collection', { error: error.message });
    }
  }

  // HTTP Metrics

  recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    if (!this.httpRequestsTotal || !this.httpRequestDuration) return;

    try {
      this.httpRequestsTotal.add(1, {
        method,
        route,
        status_code: statusCode.toString(),
      });

      this.httpRequestDuration.record(duration, {
        method,
        route,
        status_code: statusCode.toString(),
      });
    } catch (error: any) {
      logger.error('Failed to record HTTP request metrics', { error: error.message });
    }
  }

  updateActiveConnections(count: number): void {
    this._activeConnectionsValue = count;
  }

  // Workflow Metrics

  recordWorkflowExecution(
    workflowId: string,
    status: string,
    duration: number,
    stepsExecuted: number,
    userId?: string
  ): void {
    if (!this.workflowExecutionsTotal || !this.workflowExecutionDuration) return;

    try {
      this.workflowExecutionsTotal.add(1, {
        workflow_id: workflowId,
        status,
        user_id: userId || '',
      });

      this.workflowExecutionDuration.record(duration, {
        workflow_id: workflowId,
        status,
        steps_executed: stepsExecuted.toString(),
      });
    } catch (error: any) {
      logger.error('Failed to record workflow execution metrics', { error: error.message });
    }
  }

  // AI Metrics

  recordAIRequest(
    provider: string,
    model: string,
    taskType: string,
    tokensUsed: number,
    cost: number,
    duration: number,
    success: boolean
  ): void {
    if (!this.aiRequestsTotal || !this.aiRequestDuration || !this.aiTokensUsed || !this.aiCostTotal) return;

    try {
      this.aiRequestsTotal.add(1, {
        provider,
        model,
        task_type: taskType,
        success: success.toString(),
      });

      this.aiRequestDuration.record(duration, {
        provider,
        model,
        task_type: taskType,
      });

      this.aiTokensUsed.add(tokensUsed, {
        provider,
        model,
      });

      if (cost > 0) {
        this.aiCostTotal.add(cost, {
          provider,
          model,
          currency: 'USD',
        });
      }
    } catch (error: any) {
      logger.error('Failed to record AI request metrics', { error: error.message });
    }
  }

  // Error Metrics

  recordError(type: string, component: string, errorCode?: string): void {
    if (!this.errorsTotal) return;

    try {
      this.errorsTotal.add(1, {
        type,
        component,
        error_code: errorCode || '',
      });
    } catch (error: any) {
      logger.error('Failed to record error metrics', { error: error.message });
    }
  }

  recordValidationError(field: string, rule: string): void {
    if (!this.validationErrorsTotal) return;

    try {
      this.validationErrorsTotal.add(1, {
        field,
        rule,
      });
    } catch (error: any) {
      logger.error('Failed to record validation error metrics', { error: error.message });
    }
  }

  // Approval and Breakpoint Metrics

  updatePendingApprovals(count: number): void {
    this._pendingApprovalsValue = count;
  }

  recordApprovalDecision(
    approvalType: string,
    decision: 'approved' | 'rejected',
    duration: number
  ): void {
    if (!this.approvalDecisionsTotal) return;

    try {
      this.approvalDecisionsTotal.add(1, {
        approval_type: approvalType,
        decision,
        duration_seconds: duration.toString(),
      });
    } catch (error: any) {
      logger.error('Failed to record approval decision metrics', { error: error.message });
    }
  }

  updateActiveBreakpoints(count: number): void {
    this._activeBreakpointsValue = count;
  }

  // Custom Metrics

  createCounter(name: string, options: MetricOptions): Counter | null {
    if (!this.meter) return null;

    try {
      return this.meter.createCounter(name, options);
    } catch (error: any) {
      logger.error('Failed to create custom counter', { name, error: error.message });
      return null;
    }
  }

  createHistogram(name: string, options: MetricOptions): Histogram | null {
    if (!this.meter) return null;

    try {
      return this.meter.createHistogram(name, options);
    } catch (error: any) {
      logger.error('Failed to create custom histogram', { name, error: error.message });
      return null;
    }
  }

  createObservableGauge(name: string, options: MetricOptions, callback: (result: any) => void): ObservableGauge | null {
    if (!this.meter) return null;

    try {
      const gauge = this.meter.createObservableGauge(name, options);
      gauge.addCallback(callback);
      return gauge;
    } catch (error: any) {
      logger.error('Failed to create custom observable gauge', { name, error: error.message });
      return null;
    }
  }

  // Performance Monitoring

  recordPerformanceMetrics(metrics: PerformanceMetrics): void {
    // This would integrate with system monitoring tools
    // For now, we'll use the existing metrics system
    try {
      if (metrics.responseTime) {
        // Record response time as a custom metric
        const responseTimeHistogram = this.createHistogram('system_response_time', {
          description: 'System response time in milliseconds',
        });
        if (responseTimeHistogram) {
          responseTimeHistogram.record(metrics.responseTime);
        }
      }

      logger.debug('Performance metrics recorded', metrics);
    } catch (error: any) {
      logger.error('Failed to record performance metrics', { error: error.message });
    }
  }

  // Health Check Metrics

  recordHealthCheck(service: string, status: 'healthy' | 'unhealthy', responseTime: number): void {
    try {
      const healthCheckCounter = this.createCounter('health_checks_total', {
        description: 'Total number of health checks',
      });

      if (healthCheckCounter) {
        healthCheckCounter.add(1, {
          service,
          status,
        });
      }

      const healthCheckDuration = this.createHistogram('health_check_duration_seconds', {
        description: 'Duration of health checks in seconds',
      });

      if (healthCheckDuration) {
        healthCheckDuration.record(responseTime, {
          service,
          status,
        });
      }
    } catch (error: any) {
      logger.error('Failed to record health check metrics', { error: error.message });
    }
  }

  // Business Intelligence Metrics

  recordBusinessMetric(
    name: string,
    value: number,
    tags: Record<string, string> = {}
  ): void {
    try {
      // Create a custom counter for business metrics
      const businessMetric = this.createCounter(`business_${name}`, {
        description: `Business metric: ${name}`,
      });

      if (businessMetric) {
        businessMetric.add(value, tags);
      }
    } catch (error: any) {
      logger.error('Failed to record business metric', { name, error: error.message });
    }
  }
}

// Create and export a singleton instance
export const metricsService = new MetricsService({
  serviceName: 'flowversal-backend',
  serviceVersion: process.env.npm_package_version || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  enabled: process.env.METRICS_ENABLED !== 'false',
});

// Re-export OpenTelemetry metrics types for convenience
export { Counter, Histogram, MetricOptions, ObservableGauge, Meter } from '@opentelemetry/api';

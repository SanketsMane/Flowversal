import { Registry, Counter, Histogram, Gauge } from 'prom-client';

// Create a registry for metrics
export const register = new Registry();

// Collect default metrics (CPU, memory, etc.)
import { collectDefaultMetrics } from 'prom-client';
collectDefaultMetrics({ register });

// HTTP request duration histogram
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

// Workflow execution counter
export const workflowExecutionCount = new Counter({
  name: 'workflow_executions_total',
  help: 'Total number of workflow executions',
  labelNames: ['status', 'workflow_type'],
  registers: [register],
});

export const workflowExecutionDuration = new Histogram({
  name: 'workflow_execution_duration_seconds',
  help: 'Duration of workflow executions in seconds',
  labelNames: ['status', 'workflow_type'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120, 300],
  registers: [register],
});

export const workflowExecutionActive = new Gauge({
  name: 'workflow_executions_active',
  help: 'Number of active workflow executions',
  labelNames: ['workflow_type'],
  registers: [register],
});

// Database query duration histogram
export const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'collection'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

// Active connections gauge
export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register],
});

// API calls counter
export const apiCallsCount = new Counter({
  name: 'api_calls_total',
  help: 'Total number of API calls',
  labelNames: ['endpoint', 'method', 'status'],
  registers: [register],
});

// Error counter
export const errorCount = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'endpoint'],
  registers: [register],
});

// Auth failure counter
export const authFailureCount = new Counter({
  name: 'auth_failures_total',
  help: 'Total number of authentication/authorization failures',
  labelNames: ['endpoint', 'reason'],
  registers: [register],
});

// Rate limit counter
export const rateLimitCount = new Counter({
  name: 'rate_limit_hits_total',
  help: 'Total number of rate limit hits',
  labelNames: ['endpoint'],
  registers: [register],
});

// Cache metrics
export const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits (response cache)',
  labelNames: ['endpoint'],
  registers: [register],
});

export const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses (response cache)',
  labelNames: ['endpoint'],
  registers: [register],
});


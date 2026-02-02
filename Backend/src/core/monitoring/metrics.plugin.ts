import { FastifyPluginAsync } from 'fastify';
import {
  httpRequestDuration,
  apiCallsCount,
  errorCount,
  authFailureCount,
  rateLimitCount,
} from './metrics';

const metricsPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', async (request) => {
    (request as any)._startTime = process.hrtime.bigint();
  });

  fastify.addHook('onResponse', async (request, reply) => {
    const start = (request as any)._startTime as bigint | undefined;
    const durationMs = start ? Number(process.hrtime.bigint() - start) / 1e6 : undefined;

    const route = request.routerPath || request.url;
    const method = request.method;
    const status = reply.statusCode;

    // Observe HTTP duration
    if (durationMs !== undefined) {
      httpRequestDuration
        .labels(method, route, String(status))
        .observe(durationMs / 1000); // convert ms to seconds
    }

    // Count API calls
    apiCallsCount.labels(route, method, String(status)).inc();

    // Error counts
    if (status >= 500) {
      errorCount.labels('server', route).inc();
    } else if (status >= 400) {
      errorCount.labels('client', route).inc();
    }

    // Auth failures
    if (status === 401 || status === 403) {
      authFailureCount.labels(route, status === 401 ? 'unauthorized' : 'forbidden').inc();
    }

    // Rate limit hits
    if (status === 429) {
      rateLimitCount.labels(route).inc();
    }
  });
};

export default metricsPlugin;


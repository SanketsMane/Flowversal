/**
 * Request ID Tracking Plugin
 * Adds unique request ID to each request for better debugging and tracing
 */

import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

declare module 'fastify' {
  interface FastifyRequest {
    requestId: string;
  }
}

const requestIdPlugin: FastifyPluginAsync = async (fastify) => {
  // Add request ID to each request
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // Check if request ID is provided in header (for distributed tracing)
    const providedId = request.headers['x-request-id'] || request.headers['x-correlation-id'];
    request.requestId = (providedId as string) || randomUUID();
    
    // Add request ID to response headers
    reply.header('X-Request-ID', request.requestId);
    
    // Add request ID to logger context
    request.log = request.log.child({ requestId: request.requestId });
  });

  // Log request completion with request ID
  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    request.log.info({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.getResponseTime(),
    }, 'Request completed');
  });
};

export default requestIdPlugin;


import { FastifyPluginAsync } from 'fastify';
import { env } from '../../config/env';

interface ApiKeyPluginOptions {
  skip?: string[];
}

/**
 * Lightweight API key validation.
 * - Checks `x-api-key` header against allowlist from env `API_KEY_ALLOWLIST`
 * - Skips configurable routes (health/auth by default).
 */
const apiKeyPlugin: FastifyPluginAsync<ApiKeyPluginOptions> = async (fastify, opts) => {
  const allowlist = env.API_KEY_ALLOWLIST || [];
  const skipRoutes = new Set([
    '/health',
    '/api/v1/health',
    '/api/v1/health/live',
    '/api/v1/health/ready',
    '/api/v1/health/detailed',
    '/api/v1/auth/signup',
    '/api/v1/auth/login',
    '/api/v1/auth/refresh',
    ...(opts.skip || []),
  ]);

  // If no allowlist configured, noop
  if (!allowlist.length) {
    return;
  }

  fastify.addHook('preHandler', async (request, reply) => {
    if (skipRoutes.has(request.routerPath || request.url)) {
      return;
    }

    const apiKey = request.headers['x-api-key'];
    if (!apiKey || typeof apiKey !== 'string' || !allowlist.includes(apiKey)) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or missing API key',
      });
    }
  });
};

export default apiKeyPlugin;


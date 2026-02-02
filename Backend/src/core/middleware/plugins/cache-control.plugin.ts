import { FastifyPluginAsync } from 'fastify';
import { env } from '../../config/env';

/**
 * Sets Cache-Control headers for GET responses.
 * Skips auth/health and any route that explicitly sets Cache-Control.
 */
const cacheControlPlugin: FastifyPluginAsync = async (fastify) => {
  const skipPrefixes = ['/api/v1/auth', '/api/v1/health', '/health'];

  fastify.addHook('onSend', async (request, reply, payload) => {
    if (request.method !== 'GET') return;
    if (reply.hasHeader('cache-control')) return;
    if (skipPrefixes.some((p) => request.url.startsWith(p))) return;

    reply.header(
      'Cache-Control',
      `public, max-age=${env.CACHE_MAX_AGE}, stale-while-revalidate=${env.CACHE_STALE_WHILE_REVALIDATE}`
    );
  });
};

export default cacheControlPlugin;


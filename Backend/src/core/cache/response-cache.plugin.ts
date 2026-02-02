import { createHash } from 'crypto';
import { FastifyPluginAsync } from 'fastify';
import Redis from 'ioredis';
import { env } from '../config/env';
import { cacheHits, cacheMisses } from '../monitoring/metrics';

interface CacheOptions {
  ttlSeconds?: number;
}

function buildCacheKey(request: any) {
  const parts = [
    request.method,
    request.url,
    // CRITICALLY IMPORTANT: Include auth token in cache key to prevent leaks between users
    request.headers.authorization || 'anon' 
  ];
  const key = parts.join('|');
  return createHash('sha256').update(key).digest('hex');
}

const responseCachePlugin: FastifyPluginAsync<CacheOptions> = async (fastify, opts) => {
  if (!env.REDIS_URL) {
    fastify.log.info('[Cache] REDIS_URL not set; response cache disabled');
    return;
  }

  const redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 1 });
  const ttl = opts.ttlSeconds ?? 30;
  const skipPrefixes = ['/api/v1/auth', '/api/v1/health', '/health'];

  fastify.addHook('onRequest', async (request, reply) => {
    if (request.method !== 'GET') return;
    if (skipPrefixes.some((p) => request.url.startsWith(p))) return;

    const key = buildCacheKey(request);
    const cached = await redis.get(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      reply
        .header('x-cache', 'HIT')
        .code(parsed.status)
        .headers(parsed.headers)
        .send(parsed.body);
      cacheHits.labels(request.routerPath || request.url).inc();
      return reply; // short-circuit
    }
  });

  fastify.addHook('onSend', async (request, reply, payload) => {
    if (request.method !== 'GET') return;
    if (skipPrefixes.some((p) => request.url.startsWith(p))) return;
    if (reply.getHeader('x-cache') === 'HIT') return;

    const key = buildCacheKey(request);
    const body = typeof payload === 'string' ? payload : payload?.toString?.() ?? payload;
    const record = {
      status: reply.statusCode,
      headers: {
        'content-type': reply.getHeader('content-type'),
      },
      body,
    };
    await redis.setex(key, ttl, JSON.stringify(record));
    cacheMisses.labels(request.routerPath || request.url).inc();
    reply.header('x-cache', 'MISS');
  });
};

export default responseCachePlugin;


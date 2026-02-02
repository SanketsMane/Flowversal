import { FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';

const corsPlugin: FastifyPluginAsync = async (fastify) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  console.log('🔧 CORS Plugin: Initializing...');
  console.log('🔧 CORS Plugin: NODE_ENV =', process.env.NODE_ENV || 'NOT SET');
  console.log('🔧 CORS Plugin: isDevelopment =', isDevelopment);

  // Allow all origins in development, specific list in production
  const corsConfig = isDevelopment
    ? {
        origin: true, // reflect request origin
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'X-Request-ID',
          'Accept',
          'Origin',
          'X-Requested-With',
        ],
        exposedHeaders: [
          'X-Request-ID',
          'X-RateLimit-Limit',
          'X-RateLimit-Remaining',
          'X-RateLimit-Reset',
        ],
        maxAge: 86400, // 24 hours
      }
    : {
        origin: [
          'https://app.flowversal.com',
          'https://admin.flowversal.com',
          'https://docs.flowversal.com',
          'https://marketing.flowversal.com',
          'https://flowversal.com',
          'https://www.flowversal.com',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'X-Request-ID',
          'Accept',
          'Origin',
          'X-Requested-With',
        ],
        exposedHeaders: [
          'X-Request-ID',
          'X-RateLimit-Limit',
          'X-RateLimit-Remaining',
          'X-RateLimit-Reset',
        ],
        maxAge: 86400, // 24 hours
      };

  // Register @fastify/cors plugin
  // This plugin handles CORS automatically, including preflight OPTIONS requests
  await fastify.register(cors, corsConfig);

  // Ensure headers are always present early
  fastify.addHook('onRequest', async (request, reply) => {
    const origin = request.headers.origin;
    if (isDevelopment && origin) {
        reply.header('Access-Control-Allow-Origin', origin);
        reply.header('Access-Control-Allow-Credentials', 'true');
        reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID, Accept, Origin, X-Requested-With');

      // Handle OPTIONS quickly
      if (request.method === 'OPTIONS') {
        reply.header('Access-Control-Max-Age', '86400');
        return reply.code(204).send();
      }
    }
  });

  // Safety: ensure headers on send as well
  fastify.addHook('onSend', async (request, reply, payload) => {
    if (isDevelopment) {
      const origin = request.headers.origin;
      if (origin) {
            reply.header('Access-Control-Allow-Origin', origin);
            reply.header('Access-Control-Allow-Credentials', 'true');
            reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
            reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID, Accept, Origin, X-Requested-With');
      }
    }
    return payload;
  });

  console.log('✅ CORS Plugin: Initialized successfully');
  if (isDevelopment) {
    console.log('✅ CORS Plugin: Development mode - allowing ALL origins');
  } else {
    console.log('✅ CORS Plugin: Production mode - allowing flowversal.com subdomains');
  }
};

export default corsPlugin;

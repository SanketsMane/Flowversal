import { FastifyPluginAsync } from 'fastify';
import helmet from '@fastify/helmet';

const securityPlugin: FastifyPluginAsync = async (fastify) => {
  // Enhanced Helmet configuration with CSP
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: [
          "'self'",
          'https://api.github.com',
          'https://*.supabase.co',
          'https://*.openai.com',
          'https://*.anthropic.com',
        ],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    // Disable CORS-related policies as they're handled by CORS plugin
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
  });

  // Request size limits
  fastify.addHook('preHandler', (request, reply, done) => {
    const contentLength = parseInt(request.headers['content-length'] || '0', 10);
    const maxSize = 10 * 1024 * 1024; // 10MB limit

    if (contentLength > maxSize) {
      reply.code(413).send({
        success: false,
        error: 'Request too large',
        message: `Maximum request size is ${maxSize / 1024 / 1024}MB`,
      });
      return;
    }

    done();
  });

  // Security headers optimization
  fastify.addHook('onSend', (request, reply, payload, done) => {
    // Add custom security headers
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '1; mode=block');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    done();
  });
};

export default securityPlugin;


// Author: Sanket
// Auth plugin — uses local JWT verification only (Supabase removed, migrated to Neon)

import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';
import { User } from '../../../shared/types/auth.types';
import { env } from '../../config/env';

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
    authContext?: {
      user: User;
      token: string;
    };
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: any) => Promise<void>;
    getCurrentUser: (request: FastifyRequest) => User | null;
    requireAuth: (request: FastifyRequest, reply: any) => Promise<void>;
  }
}

interface AuthPluginOptions {
  skipAuth?: string[];
}

// Helper: always attach CORS headers to error replies so the browser can read them
function setCorsHeaders(request: FastifyRequest, reply: any): void {
  const origin = request.headers.origin;
  reply.raw.setHeader('Access-Control-Allow-Origin', origin || '*');
  reply.raw.setHeader('Access-Control-Allow-Credentials', 'true');
  reply.raw.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  reply.raw.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
}

const authPlugin: FastifyPluginAsync<AuthPluginOptions> = async (fastify, options) => {
  const skipAuth = options.skipAuth || [
    '/health',
    '/api/v1/health',
    '/api/v1/auth/signup',
    '/api/v1/auth/login',
    '/api/v1/auth/refresh',
    '/api/v1/auth/verify',
  ];

  // Verify every request using local JWT — runs before route handlers
  fastify.addHook('preHandler', async (request: FastifyRequest, reply) => {
    // Skip CORS preflight — handled by @fastify/cors
    if (request.method === 'OPTIONS') {
      return;
    }

    // Skip public routes
    const shouldSkip = skipAuth.some((route) => request.url.startsWith(route));
    if (shouldSkip) {
      return;
    }

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      setCorsHeaders(request, reply);
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.substring(7); // strip "Bearer "

    try {
      // Verify using our own JWT_SECRET (Neon Auth tokens)
      const decoded: any = jwt.verify(token, env.JWT_SECRET);

      // Neon tokens carry userId; support sub for forward-compatibility
      const userId = decoded.userId || decoded.sub || decoded.user_id;
      const email = decoded.email || decoded.user_metadata?.email || '';

      if (!userId) {
        console.error('[AuthPlugin] Token missing userId:', decoded);
        setCorsHeaders(request, reply);
        return reply.code(401).send({
          success: false,
          error: 'Unauthorized',
          message: 'Token is missing user identity',
        });
      }

      request.user = {
        id: userId,
        email,
        created_at: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : new Date().toISOString(),
        updated_at: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : new Date().toISOString(),
      };
    } catch (err: any) {
      console.error('[AuthPlugin] Token verification failed:', err.message);
      setCorsHeaders(request, reply);
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }
  });

  // Decorator: get current user from request
  fastify.decorate('getCurrentUser', (request: FastifyRequest): User | null => {
    return request.user || null;
  });

  // Decorator: require auth (used as preHandler in specific routes)
  // Author: Sanket — for use in route preHandler arrays
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: any) => {
    if (!request.user) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }
  });

  // Alias for backward compatibility
  fastify.decorate('requireAuth', async (request: FastifyRequest, reply: any) => {
    if (!request.user) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }
  });
};

export default fp(authPlugin);
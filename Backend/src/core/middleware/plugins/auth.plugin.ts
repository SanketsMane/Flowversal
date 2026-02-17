import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify';
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
  skipAuth?: string[]; // Routes that don't require auth
}

const authPlugin: FastifyPluginAsync<AuthPluginOptions> = async (fastify, options) => {
  try {
    const skipAuth = options.skipAuth || [
      '/health',
      '/api/v1/health',
      '/api/v1/auth/signup',
      '/api/v1/auth/login',
      '/api/v1/auth/refresh',
      '/api/v1/auth/verify', // detailed verify endpoint
    ];

    const isDevelopment = process.env.NODE_ENV !== 'production';

    // Use preHandler hook - this runs after routing but before the handler
    fastify.addHook('preHandler', async (request: FastifyRequest, reply) => {

    // CRITICAL: Skip OPTIONS requests completely - let @fastify/cors handle them
    // DO NOT interfere with CORS preflight requests
    if (request.method === 'OPTIONS') {
      return; // Let CORS plugin handle it
    }

    // Skip auth for specified routes
      const shouldSkip = skipAuth.some((route) => request.url.startsWith(route));

      if (shouldSkip) {
      return;
    }

    // Extract token from Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Add CORS headers to error response using raw headers (guaranteed to work)
      // ALWAYS set CORS headers (not conditional)
      const origin = request.headers.origin;
      reply.raw.setHeader('Access-Control-Allow-Origin', origin || '*');
      reply.raw.setHeader('Access-Control-Allow-Credentials', 'true');
      reply.raw.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      reply.raw.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // SPECIAL HANDLING FOR DEMO TOKENS (Development only)
    if (isDevelopment && token.startsWith('demo-')) {
      request.user = {
        id: 'demo-user-123',
        email: 'demo@flowversal.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return; // Skip Supabase/JWT verification
    }

    try {
        // 1. ALWAYS try local JWT verification first - Author: Sanket
        // This is faster and doesn't depend on external network/DNS lookups
        try {
            const decoded: any = jwt.verify(token, env.JWT_SECRET);
            const sub = decoded.sub || decoded.user_id || decoded.userId || decoded.id;
            const email = decoded.email || decoded.user_metadata?.email;
            
            if (sub) {
                // Author: Sanket - Hydrate user from DB immediately to ensure correct ID mapping
                // This prevents 500 errors in downstream handlers expecting MongoDB IDs.
                const { userService } = require('../../../modules/users/services/user.service');
                const dbUser = await userService.ensureUser(sub, email || '');
                request.user = {
                    ...userService.toUserType(dbUser),
                    dbUser: dbUser // Ensure backward compatibility for handlers
                };
                return;
            }
        } catch (jwtErr: any) {
            // Token verification failed or invalid payload
            if (isDevelopment) console.error('[Auth] JWT verification failed:', jwtErr.message);
        }

        // Supabase Fallback Removed per Stabilization Plan - Author: Sanket
        return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
            message: 'Invalid or expired session',
        });

        // Continue to route handler
      } catch (err: any) {
        console.error(`[Auth] ===== AUTH VERIFICATION ERROR =====`, err);

        // Add CORS headers to error response
      const origin = request.headers.origin;
      if (isDevelopment) {
        reply.raw.setHeader('Access-Control-Allow-Origin', origin || '*');
        reply.raw.setHeader('Access-Control-Allow-Credentials', 'true');
        reply.raw.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        reply.raw.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
      }
        return reply.code(500).send({
        success: false,
          error: 'InternalServerError',
          message: 'Authentication service error',
      });
    }
  });

  // Helper decorator to get current user
  fastify.decorate('getCurrentUser', (request: FastifyRequest): User | null => {
    return request.user || null;
  });

  // Helper to require authentication (used as preHandler hook)
  // Author: Sanket - For use in route preHandler arrays
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

  } catch (error) {
    console.error(`[Auth Plugin] ===== AUTH PLUGIN INITIALIZATION ERROR =====`, error);
    throw error;
  }
};

import fp from 'fastify-plugin';

export default fp(authPlugin);
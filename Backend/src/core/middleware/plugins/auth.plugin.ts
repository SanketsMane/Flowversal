import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { User } from '../../../shared/types/auth.types';
import { env } from '../../config/env';
import { supabaseClient } from '../../config/supabase.config';

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
        // Verify token with Supabase for production/real tokens
      const {
        data: { user },
        error,
      } = await supabaseClient.auth.getUser(token);

      if (error || !user) {
          // Fallback: verify JWT locally using Supabase JWT secret
          try {
            const decoded: any = jwt.verify(token, env.JWT_SECRET);

            const sub = decoded.sub || decoded.user_id || decoded.userId;
            const email = decoded.email || decoded.user_metadata?.email;

            if (!sub) {
              throw new Error('JWT missing subject');
            }

            request.user = {
              id: sub,
              email: email || '',
              created_at: decoded.created_at || decoded.iat ? new Date(decoded.iat * 1000).toISOString() : new Date().toISOString(),
              updated_at: decoded.updated_at || decoded.exp ? new Date(decoded.exp * 1000).toISOString() : new Date().toISOString(),
            };

            // Continue to route handler
            return;
          } catch (jwtErr: any) {
            
            // Add CORS headers to error response
        const origin = request.headers.origin;
        if (isDevelopment) {
          reply.raw.setHeader('Access-Control-Allow-Origin', origin || '*');
          reply.raw.setHeader('Access-Control-Allow-Credentials', 'true');
          reply.raw.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
          reply.raw.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
        }
        return reply.code(401).send({
          success: false,
          error: 'Unauthorized',
              message: `Invalid token`,
        });
          }
      }

        // Supabase verification successful
      request.user = {
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

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
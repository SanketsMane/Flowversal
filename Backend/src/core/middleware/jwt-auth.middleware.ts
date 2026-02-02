// Author: Sanket
// JWT Authentication Middleware using NeonAuthService

import { FastifyReply, FastifyRequest } from 'fastify';
import { neonAuthService } from '../../modules/auth/services/neon-auth.service';
import { logger } from '../../shared/utils/logger.util';

export interface AuthenticatedUser {
  id: string; // Neon User ID
  email: string;
}

// Extend Fastify Request to include user
// Local declaration moved to src/types/fastify.d.ts

export const jwtAuthMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'No authorization header provided',
      });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
        return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
            message: 'Invalid token format',
        });
    }

    // Verify token
    const decoded = neonAuthService.verifyAccessToken(token);

    // Attach user to request
    request.user = {
      id: decoded.userId,
      email: decoded.email,
    };

  } catch (error: any) {
    logger.error('JWT Auth failed:', { error: error.message, token: request.headers.authorization?.substring(0, 20) + '...' });
    console.error('[Middleware] JWT Verification Failed:', error);
    
    return reply.code(401).send({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid or expired token',
      details: error.message
    });
  }
};

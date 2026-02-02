// Author: Sanket
// Updated to use NeonAuthService

import { FastifyPluginAsync } from 'fastify';
import { userService } from '../../users/services/user.service';
import { neonAuthService } from '../services/neon-auth.service';
import { validatePasswordPolicy } from '../validators/password.validator';

interface AuthBody {
  email: string;
  password: string;
  fullName?: string;
}

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Sign up with email/password
  fastify.post<{ Body: AuthBody }>('/signup', async (request, reply) => {
    const { email, password, fullName } = request.body || {};
    
    if (!email || !password) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Email and password are required',
      });
    }

    const pwCheck = validatePasswordPolicy(password);
    if (!pwCheck.valid) {
      return reply.code(400).send({
        success: false,
        error: 'WeakPassword',
        message: 'Password does not meet policy',
        details: pwCheck.errors,
      });
    }

    try {
      // 1. Create user in Neon (Auth DB)
      const authResponse = await neonAuthService.signUp(email, password, fullName);

      // 2. Sync/Create user in Mongo (Main DB)
      let mongoUser;
      try {
        mongoUser = await userService.getOrCreateUserFromNeon(authResponse.user);
      } catch (syncErr: any) {
        fastify.log.error('Signup sync error', syncErr);
        // We shouldn't fail the whole request if sync fails, but frontend might need Mongo ID.
        // For now, loop back or alert.
      }

      // 3. Return response
      return reply.send({
        success: true,
        message: 'Signup successful.',
        user: {
            ...authResponse.user,
            _id: mongoUser?.id, // Return Mongo ID if available
        },
        accessToken: authResponse.session.access_token,
        refreshToken: authResponse.session.refresh_token,
      });

    } catch (err: any) {
      fastify.log.error('Signup error', err);
      // Handle known errors
      if (err.message === 'User already exists') {
          return reply.code(409).send({
              success: false,
              error: 'UserExists',
              message: 'User already exists',
          });
      }
      return reply.code(500).send({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to sign up',
      });
    }
  });

  // Login with email/password
  fastify.post<{ Body: AuthBody }>('/login', async (request, reply) => {
    const { email, password } = request.body || {};
    if (!email || !password) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Email and password are required',
      });
    }

    try {
      const authResponse = await neonAuthService.signIn(email, password);

      // Sync user to Mongo (ensure it exists)
      let mongoUser;
        try {
          mongoUser = await userService.getOrCreateUserFromNeon(authResponse.user);
        } catch (syncErr: any) {
          fastify.log.error('Login sync error', syncErr);
        }

      return reply.send({
        success: true,
        message: 'Login successful.',
        user: {
            ...authResponse.user,
            _id: mongoUser?.id,
        },
        accessToken: authResponse.session.access_token,
        refreshToken: authResponse.session.refresh_token,
      });

    } catch (err: any) {
      fastify.log.error('Login error', err);
      if (err.message === 'Invalid credentials') {
          return reply.code(401).send({
            success: false,
            error: 'InvalidCredentials',
            message: 'Invalid email or password',
          });
      }
      return reply.code(500).send({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to login',
      });
    }
  });

  // Refresh access token
  fastify.post<{ Body: { refreshToken: string } }>('/refresh', async (request, reply) => {
    const { refreshToken } = request.body || {};
    if (!refreshToken) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Refresh token is required',
      });
    }

    try {
      const authResponse = await neonAuthService.refreshSession(refreshToken);

      return reply.send({
        success: true,
        message: 'Session refreshed.',
        user: authResponse.user,
        accessToken: authResponse.session.access_token,
        refreshToken: authResponse.session.refresh_token, // New refresh token (rotated)
      });
    } catch (err: any) {
      fastify.log.error('Refresh error', err);
      return reply.code(401).send({
        success: false,
        error: 'InvalidRefreshToken',
        message: 'Failed to refresh session',
      });
    }
  });
};

export default authRoutes;


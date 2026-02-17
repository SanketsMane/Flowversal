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
  // Auth-specific strict rate limiting - Fixes BUG-005
  // Author: Sanket
  // Prevents brute-force attacks on login/signup
  const authRateLimitConfig = {
    max: 5, // Only 5 attempts per minute
    timeWindow: '1 minute',
    errorResponseBuilder: (request: any, context: any) => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Too many authentication attempts. Please wait ${Math.ceil(context.ttl / 1000)} seconds.`,
    }),
  };

  // Sign up with email/password - With rate limiting
  fastify.post<{ Body: AuthBody }>(
    '/signup',
    { 
      config: { 
        rateLimit: authRateLimitConfig 
      } 
    },
    async (request, reply) => {
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
            role: mongoUser?.role || 'user',
            onboardingCompleted: mongoUser?.onboardingCompleted || false,
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

  // Login with email/password - With rate limiting
  fastify.post<{ Body: AuthBody }>(
    '/login',
    {
      config: {
        rateLimit: authRateLimitConfig
      }
    },
    async (request, reply) => {
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
            role: mongoUser?.role || 'user',
            onboardingCompleted: mongoUser?.onboardingCompleted || false,
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
        debug: err.message,
        stack: err.stack
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

      // Get or create user in Mongo to fetch onboarding status
      let mongoUser;
      try {
        mongoUser = await userService.getOrCreateUserFromNeon(authResponse.user);
      } catch (err) {
        fastify.log.warn({ err }, 'Could not sync mongo user in /refresh');
      }

      return reply.send({
        success: true,
        message: 'Session refreshed.',
        user: {
          ...authResponse.user,
          _id: mongoUser?.id,
          role: mongoUser?.role || 'user',
          onboardingCompleted: mongoUser?.onboardingCompleted || false,
        },
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

  // Get current authenticated user (for session verification) - Author: Sanket
  // Fixes BUG-007: Session forgery prevention
  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      
      // Fetch fresh user data from Neon
      const user = await neonAuthService.getUser(userId);
      
      if (!user) {
        return reply.code(404).send({
          success: false,
          error: 'UserNotFound',
          message: 'User not found',
        });
      }

      // Also get Mongo user for additional fields
      let mongoUser;
      try {
        mongoUser = await userService.getOrCreateUserFromNeon(user);
      } catch (err) {
        fastify.log.warn({ err }, 'Could not sync mongo user in /me');
      }

      return reply.send({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email,
          avatar: user.user_metadata?.avatar,
          role: user.user_metadata?.role || 'user',
          createdAt: user.created_at,
          onboardingCompleted: mongoUser?.onboardingCompleted || false,
          _id: mongoUser?.id,
        },
      });
    } catch (err: any) {
      fastify.log.error('Error fetching user', err);
      return reply.code(500).send({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to fetch user',
      });
    }
  });

  // Request password reset - Author: Sanket
  // Fixes BUG-002: Password reset implementation
  fastify.post<{ Body: { email: string } }>('/forgot-password', async (request, reply) => {
    const { email } = request.body || {};

    if (!email) {
      return reply.code(400).send({
        success: false,
        error: 'BadRequest',
        message: 'Email is required',
      });
    }

    try {
      // Always return success (don't reveal if email exists)
      await neonAuthService.requestPasswordReset(email);
      
      return reply.send({
        success: true,
        message: 'If the email exists, a password reset code has been sent',
      });
    } catch (err: any) {
      fastify.log.error('Password reset request error', err);
      // Still return success to not reveal user existence
      return reply.send({
        success: true,
        message: 'If the email exists, a password reset code has been sent',
      });
    }
  });

  // Confirm password reset with token - Author: Sanket
  // Fixes BUG-002: Password reset implementation
  fastify.post<{ Body: { email: string; resetToken: string; newPassword: string } }>(
    '/reset-password',
    async (request, reply) => {
      const { email, resetToken, newPassword } = request.body || {};

      if (!email || !resetToken || !newPassword) {
        return reply.code(400).send({
          success: false,
          error: 'BadRequest',
          message: 'Email, reset token, and new password are required',
        });
      }

      // Validate new password
      const pwCheck = validatePasswordPolicy(newPassword);
      if (!pwCheck.valid) {
        return reply.code(400).send({
          success: false,
          error: 'WeakPassword',
          message: 'Password does not meet policy',
          details: pwCheck.errors,
        });
      }

      try {
        await neonAuthService.confirmPasswordReset(email, resetToken, newPassword);

        return reply.send({
          success: true,
          message: 'Password reset successful',
        });
      } catch (err: any) {
        fastify.log.error('Password reset confirmation error', err);
        return reply.code(400).send({
          success: false,
          error: 'InvalidResetToken',
          message: err.message || 'Invalid or expired reset token',
        });
      }
    }
  );

  // Change password (authenticated) - Author: Sanket
  // Fixes BUG-003: Change password implementation
  fastify.post<{ Body: { currentPassword: string; newPassword: string } }>(
    '/change-password',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      if (!request.user) {
        return reply.code(401).send({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }
      const { currentPassword, newPassword } = request.body || {};
      const userId = (request.user as any).id;

      if (!currentPassword || !newPassword) {
        return reply.code(400).send({
          success: false,
          error: 'BadRequest',
          message: 'Current password and new password are required',
        });
      }

      // Validate new password
      const pwCheck = validatePasswordPolicy(newPassword);
      if (!pwCheck.valid) {
        return reply.code(400).send({
          success: false,
          error: 'WeakPassword',
          message: 'Password does not meet policy',
          details: pwCheck.errors,
        });
      }

      try {
        await neonAuthService.changePassword(userId, currentPassword, newPassword);

        return reply.send({
          success: true,
          message: 'Password changed successfully',
        });
      } catch (err: any) {
        fastify.log.error('Change password error', err);
        if (err.message === 'Incorrect current password') {
          return reply.code(401).send({
            success: false,
            error: 'InvalidPassword',
            message: 'Current password is incorrect',
          });
        }
        return reply.code(500).send({
          success: false,
          error: 'InternalServerError',
          message: 'Failed to change password',
        });
      }
    }
  );
};

export default authRoutes;


// Author: Sanket
// Updated to use NeonAuthService

import { FastifyPluginAsync } from 'fastify';
import { userService } from '../../users/services/user.service';
import { neonAuthService } from '../services/neon-auth.service';
import { validatePasswordPolicy } from '../validators/password.validator';

interface AuthBody {
  email: string;
  password: string;
  fullName?: string | null;
  role?: string;
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
  // Author: Sanket - Hardened & Unified
  fastify.post<{ Body: AuthBody }>(
    '/signup',
    { config: { rateLimit: authRateLimitConfig } },
    async (request, reply) => {
      try {
        let { email, password, fullName } = request.body || {};
        
        if (!email || !password) {
          return reply.code(400).send({ success: false, error: 'BadRequest', message: 'Email and password are required' });
        }

        // 1. Sanitize
        email = email.trim().toLowerCase();
        password = password.trim();

        // 2. Validate Password Policy
        const pwCheck = validatePasswordPolicy(password);
        if (!pwCheck.valid) {
          return reply.code(400).send({ success: false, error: 'WeakPassword', message: 'Password does not meet policy', details: pwCheck.errors });
        }

        // 3. Create user in Neon (Auth DB)
        const authResponse = await neonAuthService.signUp(email, password, fullName || undefined);

        // 4. Sync/Create user in Mongo (Main DB) - SSOT Enforcement
        const mongoUser = await userService.ensureUser(authResponse.user.id, authResponse.user.email, authResponse.user.fullName);

        return reply.send({
          success: true,
          message: 'Signup successful.',
          user: {
              ...authResponse.user,
              _id: mongoUser.id,
              role: mongoUser.role || authResponse.user.role || 'user',
              onboardingCompleted: mongoUser.onboardingCompleted || false,
          },
          accessToken: authResponse.session.access_token,
          refreshToken: authResponse.session.refresh_token,
        });

      } catch (err: any) {
        fastify.log.error('Signup error', err);
        if (err.message === 'User already exists') {
            return reply.code(409).send({ success: false, error: 'UserExists', message: 'User already exists' });
        }
        return reply.code(500).send({ success: false, error: 'InternalServerError', message: 'Failed to sign up' });
      }
    }
  );

  // Login with email/password - With rate limiting
  // Author: Sanket - Hardened & Unified
  fastify.post<{ Body: AuthBody }>(
    '/login',
    { config: { rateLimit: authRateLimitConfig } },
    async (request, reply) => {
      try {
        let { email, password } = request.body || {};
        
        if (!email || !password) {
          return reply.code(400).send({ success: false, error: 'BadRequest', message: 'Email and password are required' });
        }

        // 1. Sanitize
        email = email.trim().toLowerCase();
        password = password.trim();

        // 2. Authenticate against Neon
        const authResponse = await neonAuthService.signIn(email, password);

        // 3. Ensure user is synced to MongoDB immediately (SSOT)
        const mongoUser = await userService.ensureUser(authResponse.user.id, authResponse.user.email, authResponse.user.fullName);

        return reply.send({
          success: true,
          message: 'Login successful.',
          user: {
            ...authResponse.user,
            _id: mongoUser.id,
            role: mongoUser.role || authResponse.user.role || 'user',
            onboardingCompleted: mongoUser.onboardingCompleted || false,
          },
          accessToken: authResponse.session.access_token,
          refreshToken: authResponse.session.refresh_token,
        });
      } catch (err: any) {
        fastify.log.error('Login error', err);
        return reply.code(401).send({ success: false, error: 'Unauthorized', message: err.message || 'Invalid credentials' });
      }
    }
  );

  // Refresh access token - Author: Sanket
  fastify.post<{ Body: { refreshToken: string } }>('/refresh', async (request, reply) => {
    try {
      const { refreshToken } = request.body || {};
      if (!refreshToken) {
        return reply.code(400).send({ success: false, error: 'BadRequest', message: 'Refresh token is required' });
      }

      const authResponse = await neonAuthService.refreshSession(refreshToken);
      const mongoUser = await userService.ensureUser(authResponse.user.id, authResponse.user.email, authResponse.user.fullName);

      return reply.send({
        success: true,
        message: 'Session refreshed.',
        user: {
          ...authResponse.user,
          _id: mongoUser.id,
          role: mongoUser.role || authResponse.user.role || 'user',
          onboardingCompleted: mongoUser.onboardingCompleted || false,
        },
        accessToken: authResponse.session.access_token,
        refreshToken: authResponse.session.refresh_token,
      });
    } catch (err: any) {
      fastify.log.error('Refresh error', err);
      return reply.code(401).send({ success: false, error: 'InvalidRefreshToken', message: 'Failed to refresh session' });
    }
  });

  // Get current session data - Author: Sanket
  // Leverages hydration from auth.plugin.ts preHandler
  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const user = request.user as any;
      
      return reply.send({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.full_name || user.email,
          role: user.role || 'user',
          createdAt: user.created_at,
          onboardingCompleted: user.onboardingCompleted || false,
          // Support for legacy frontend fields
          fullName: user.full_name,
        },
      });
    } catch (err: any) {
      fastify.log.error('Error in /me', err);
      return reply.code(500).send({ success: false, error: 'InternalServerError', message: 'Failed to fetch session metadata' });
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


import { FastifyPluginAsync } from 'fastify';
import { userService } from '../services/user.service';

const userRoutes: FastifyPluginAsync = async (fastify) => {
  // Get current user profile
  fastify.get('/me', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    try {
      // Get or create user from Supabase
      const user = await userService.getOrCreateUserFromSupabase(request.user.id);
      return reply.send({
        success: true,
        data: userService.toUserType(user),
      });
    } catch (error: any) {
      fastify.log.error('Error fetching user profile:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch user profile',
      });
    }
  });

  // Get user by ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    try {
      const user = await userService.findById(request.params.id);

      if (!user) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      // Users can only view their own profile unless they're admin
      if (user._id.toString() !== request.user.id) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'You can only view your own profile',
        });
      }

      return reply.send({
        success: true,
        data: userService.toUserType(user),
      });
    } catch (error: any) {
      fastify.log.error('Error fetching user:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch user',
      });
    }
  });

  // Update current user profile
  fastify.put<{ Body: { email?: string; metadata?: Record<string, any> } }>(
    '/me',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            metadata: { type: 'object' },
          },
        },
      },
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      try {
        // Get user from MongoDB
        const dbUser = await userService.findBySupabaseId(request.user.id);

        if (!dbUser) {
          // Create user if doesn't exist
          const newUser = await userService.getOrCreateUserFromSupabase(request.user.id);
          return reply.send({
            success: true,
            data: userService.toUserType(newUser),
          });
        }

        // Update user
        const updatedUser = await userService.updateUser(dbUser._id.toString(), {
          email: request.body.email,
          metadata: request.body.metadata,
        });

        if (!updatedUser) {
          return reply.code(404).send({
            error: 'Not Found',
            message: 'User not found',
          });
        }

        return reply.send({
          success: true,
          data: userService.toUserType(updatedUser),
        });
      } catch (error: any) {
        fastify.log.error('Error updating user:', error);
        return reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to update user',
        });
      }
    }
  );

  // Delete current user account
  fastify.delete('/me', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    try {
      const dbUser = await userService.findBySupabaseId(request.user.id);

      if (!dbUser) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      await userService.deleteUser(dbUser._id.toString());

      return reply.send({
        success: true,
        message: 'User account deleted successfully',
      });
    } catch (error: any) {
      fastify.log.error('Error deleting user:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to delete user',
      });
    }
  });

  // Save onboarding data
  fastify.post<{
    Body: {
      referralSource: string;
      automationExperience: string;
      organizationSize: string;
      organizationName: string;
      techStack: string[];
      automationGoal: string;
    };
  }>('/me/onboarding', async (request, reply) => {
    // Require authentication
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Authentication required for onboarding',
      });
    }

    try {
      let dbUser = await userService.findBySupabaseId(request.user.id);

      // If user doesn't exist, create it (handles demo users and new signups)
      if (!dbUser) {
        fastify.log.info({ userId: request.user.id }, 'User not found in MongoDB, creating new user');
        dbUser = await userService.getOrCreateUserFromSupabase(request.user.id, request.user);
      }

      const updatedUser = await userService.updateUser(dbUser._id.toString(), {
        referralSource: request.body.referralSource,
        automationExperience: request.body.automationExperience,
        organizationSize: request.body.organizationSize,
        organizationName: request.body.organizationName,
        techStack: request.body.techStack,
        automationGoal: request.body.automationGoal,
        onboardingCompleted: true,
      });

      if (!updatedUser) {
        return reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to update user onboarding data',
        });
      }

      return reply.send({
        success: true,
        data: userService.toUserType(updatedUser),
      });
    } catch (error: any) {
      console.error('❌ Error saving onboarding data:', error);
      
      // Debug logging to artifact dir
      try {
        const fs = require('fs');
        const logPath = 'C:/Users/rohan/.gemini/antigravity/brain/8622acbb-4c56-4c35-9298-a15ea23810c2/backend_error.log';
        fs.writeFileSync(logPath, `[${new Date().toISOString()}] Onboarding Error:\n${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}\n\nStack:\n${error.stack}\n`);
      } catch (e) {
        console.error('Failed to write debug log:', e);
      }
      
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to save onboarding data',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });
};

export default userRoutes;


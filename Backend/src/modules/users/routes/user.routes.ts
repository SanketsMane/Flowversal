import { FastifyPluginAsync } from 'fastify';
import { userService } from '../services/user.service';

const userRoutes: FastifyPluginAsync = async (fastify) => {
  // Get current user profile
  fastify.get('/me', async (request, reply) => {
    // Standardized hydrated user from auth.plugin.ts - Author: Sanket
    if (!request.user?.dbUser) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    try {
      return reply.send({
        success: true,
        data: userService.toUserType(request.user.dbUser as any),
      });
    } catch (error: any) {
      fastify.log.error('Error fetching user profile:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch user profile',
      });
    }
  });

  // Get user by ID (Internal/Admin only logic)
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    if (!request.user?.dbUser) {
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
  fastify.put<{ Body: { email?: string; fullName?: string; metadata?: Record<string, any> } }>(
    '/me',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            fullName: { type: 'string' },
            metadata: { type: 'object' },
          },
        },
      },
    },
    async (request, reply) => {
      if (!request.user?.dbUser) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'User authentication required',
        });
      }

      try {
        const dbUser = request.user.dbUser as any;

        // Update user
        const updatedUser = await userService.updateUser(dbUser._id.toString(), {
          email: request.body.email,
          fullName: request.body.fullName,
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
    if (!request.user?.dbUser) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User authentication required',
      });
    }

    try {
      const dbUser = request.user.dbUser as any;

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
    if (!request.user?.dbUser) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Authentication required for onboarding',
      });
    }

    try {
      const dbUser = request.user.dbUser as any;

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
      fastify.log.error({
        error: error.message,
        stack: error.stack,
        userId: request.user?.id,
      }, 'Error saving onboarding data');
      
      return reply.code(500).send({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to save onboarding data',
      });
    }
  });
};

export default userRoutes;

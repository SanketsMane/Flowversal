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
      // Get or create user from Neon Auth (consistent with login/signup) - Sanket
      // Extract userId from Fastify-JWT payload
      const userId = (request.user as any).id;
      const user = await userService.getOrCreateUserFromNeon({ 
        id: userId, 
        email: (request.user as any).email 
      });

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
        // Get user from Neon (consistent with login) - Sanket
        const userId = (request.user as any).id;
        const dbUser = await userService.getOrCreateUserFromNeon({ 
            id: userId, 
            email: (request.user as any).email 
        });

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
      // Get user from Neon to ensure we delete the right one - Sanket
      const userId = (request.user as any).id;
      const dbUser = await userService.getOrCreateUserFromNeon({ 
          id: userId, 
          email: (request.user as any).email 
      });

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
      // Get user from Neon (Critical Fix: Sync with login flow) - Sanket
      const userId = (request.user as any).id;
      let dbUser = await userService.getOrCreateUserFromNeon({ 
          id: userId, 
          email: (request.user as any).email 
      });

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
      // BUG-FIX: Removed hardcoded filesystem logging - Sanket
      // Use Fastify logger instead of writing to filesystem
      fastify.log.error({
        error: error.message,
        stack: error.stack,
        userId: request.user?.id,
        supabaseId: request.user?.id,
      }, 'Error saving onboarding data');
      
      return reply.code(500).send({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to save onboarding data',
        // Only include details in development
        ...(process.env.NODE_ENV === 'development' && { 
          details: error instanceof Error ? error.message : String(error) 
        }),
      });
    }
  });
};

export default userRoutes;


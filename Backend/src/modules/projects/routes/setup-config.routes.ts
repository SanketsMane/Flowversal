import { FastifyPluginAsync } from 'fastify';
import { setupConfigService } from '../services/setup-config.service';
import { userService } from '../../users/services/user.service';

const setupConfigRoutes: FastifyPluginAsync = async (fastify) => {
  // Create or update setup config
  fastify.post<{
    Body: {
      entityType: 'template' | 'project' | 'board';
      entityId: string;
      integrations?: any[];
      files?: any[];
      links?: any[];
      variables?: Record<string, any>;
    };
  }>('/', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    try {
      const dbUser = await userService.getOrCreateUserFromSupabase(request.user.id);
      const config = await setupConfigService.createOrUpdateSetupConfig({
        ...request.body,
        userId: dbUser._id.toString(),
      });

      return reply.code(201).send({
        success: true,
        data: config,
      });
    } catch (error: any) {
      fastify.log.error('Error creating setup config:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: error.message || 'Failed to create setup config',
      });
    }
  });

  // Get setup config
  fastify.get<{ Params: { entityType: string; entityId: string } }>(
    '/:entityType/:entityId',
    async (request, reply) => {
      if (!request.user) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      try {
        const dbUser = await userService.getOrCreateUserFromSupabase(request.user.id);
        const config = await setupConfigService.getSetupConfig(
          request.params.entityType as 'template' | 'project' | 'board',
          request.params.entityId,
          dbUser._id.toString()
        );

        if (!config) {
          return reply.code(404).send({
            error: 'Not Found',
            message: 'Setup configuration not found',
          });
        }

        return reply.send({
          success: true,
          data: config,
        });
      } catch (error: any) {
        fastify.log.error('Error getting setup config:', error);
        return reply.code(500).send({
          error: 'Internal Server Error',
          message: error.message || 'Failed to get setup config',
        });
      }
    }
  );

  // Update setup config
  fastify.put<{
    Params: { id: string };
    Body: {
      integrations?: any[];
      files?: any[];
      links?: any[];
      variables?: Record<string, any>;
    };
  }>('/:id', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    try {
      const dbUser = await userService.getOrCreateUserFromSupabase(request.user.id);
      const config = await setupConfigService.updateSetupConfig(
        request.params.id,
        dbUser._id.toString(),
        request.body
      );

      if (!config) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Setup configuration not found',
        });
      }

      return reply.send({
        success: true,
        data: config,
      });
    } catch (error: any) {
      fastify.log.error('Error updating setup config:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: error.message || 'Failed to update setup config',
      });
    }
  });

  // Apply setup config to workflow
  fastify.post<{ Params: { id: string; workflowId: string } }>(
    '/:id/apply/:workflowId',
    async (request, reply) => {
      if (!request.user) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      try {
        const dbUser = await userService.getOrCreateUserFromSupabase(request.user.id);
        const workflow = await setupConfigService.applySetupConfigToWorkflow(
          request.params.workflowId,
          request.params.id,
          dbUser._id.toString()
        );

        return reply.send({
          success: true,
          data: workflow,
          message: 'Setup configuration applied to workflow successfully',
        });
      } catch (error: any) {
        fastify.log.error('Error applying setup config to workflow:', error);
        return reply.code(error.message.includes('not found') ? 404 : 500).send({
          error: error.message.includes('not found') ? 'Not Found' : 'Internal Server Error',
          message: error.message || 'Failed to apply setup config to workflow',
        });
      }
    }
  );

  // Delete setup config
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    try {
      const dbUser = await userService.getOrCreateUserFromSupabase(request.user.id);
      const deleted = await setupConfigService.deleteSetupConfig(
        request.params.id,
        dbUser._id.toString()
      );

      if (!deleted) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Setup configuration not found',
        });
      }

      return reply.send({
        success: true,
        message: 'Setup configuration deleted successfully',
      });
    } catch (error: any) {
      fastify.log.error('Error deleting setup config:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: error.message || 'Failed to delete setup config',
      });
    }
  });
};

export default setupConfigRoutes;


import { FastifyPluginAsync } from 'fastify';
import { templateService } from '../services/template.service';

const templateRoutes: FastifyPluginAsync = async (fastify) => {
  // List templates
  fastify.get<{
    Querystring: {
      page?: string;
      limit?: string;
      category?: string;
      difficulty?: string;
      featured?: string;
      search?: string;
    };
  }>('/', async (request, reply) => {
    try {
      const query = request.query as { page?: string; limit?: string; category?: string; difficulty?: string; featured?: string; search?: string };
      const page = parseInt(query.page || '1') || 1;
      const limit = parseInt(query.limit || '20') || 20;

      const result = await templateService.listTemplates(
        {
          category: request.query.category,
          difficulty: request.query.difficulty,
          featured: request.query.featured === 'true',
          isPublic: true,
          search: request.query.search,
        },
        page,
        limit
      );

      return reply.send({
        success: true,
        data: result.templates,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error: any) {
      fastify.log.error('Error listing templates:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to list templates',
      });
    }
  });

  // Get template by ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      const template = await templateService.getTemplateById(request.params.id);

      if (!template) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Template not found',
        });
      }

      return reply.send({
        success: true,
        data: template,
      });
    } catch (error: any) {
      fastify.log.error('Error fetching template:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch template',
      });
    }
  });

  // Install template
  fastify.post<{ Params: { id: string } }>('/:id/install', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    try {
      const workflowData = await templateService.installTemplate(
        request.params.id,
        request.user.id,
        request.user.email
      );

      // Increment template popularity
      await templateService.incrementPopularity(request.params.id);

      return reply.send({
        success: true,
        data: workflowData,
        message: 'Template installed successfully',
      });
    } catch (error: any) {
      fastify.log.error('Error installing template:', error);
      return reply.code(400).send({
        error: 'Bad Request',
        message: error.message || 'Failed to install template',
      });
    }
  });
};

export default templateRoutes;


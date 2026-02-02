import { FastifyPluginAsync } from 'fastify';
import { workflowGeneratorService } from '../../services/ai/workflow-generator.service';

const workflowAIRoutes: FastifyPluginAsync = async (fastify) => {
  // Generate workflow from description
  fastify.post<{ Body: { description: string; modelType?: string; remoteModel?: string } }>(
    '/generate',
    {
      schema: {
        body: {
          type: 'object',
          required: ['description'],
          properties: {
            description: {
              type: 'string',
              minLength: 10,
            },
            modelType: {
              type: 'string',
              enum: ['local', 'remote'],
            },
            remoteModel: {
              type: 'string',
              enum: ['gpt4', 'claude', 'gemini'],
            },
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
        const workflow = await workflowGeneratorService.generateWorkflow({
          description: request.body.description,
          modelType: request.body.modelType as any,
          remoteModel: request.body.remoteModel as any,
        });

        // Validate generated workflow
        const validation = workflowGeneratorService.validateWorkflow(workflow);

        if (!validation.valid) {
          return reply.code(400).send({
            error: 'Validation Error',
            message: 'Generated workflow has validation errors',
            errors: validation.errors,
            workflow: workflow, // Still return the workflow for debugging
          });
        }

        return reply.send({
          success: true,
          data: workflow,
        });
      } catch (error: any) {
        fastify.log.error('Error generating workflow:', error);
        return reply.code(500).send({
          error: 'Internal Server Error',
          message: error.message || 'Failed to generate workflow',
        });
      }
    }
  );
};

export default workflowAIRoutes;


import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Types } from 'mongoose';
import { breakpointService } from '../services/breakpoint.service';

interface ResumeBreakpointBody {
  resumeToken: string;
  modifiedData?: any;
  skipToNode?: string;
  forceResume?: boolean;
}

interface ReplayToCheckpointBody {
  checkpointId: string;
}

export async function breakpointRoutes(fastify: FastifyInstance) {
  // Get active breakpoints for an execution
  fastify.get('/workflows/executions/:executionId/breakpoints', {
    schema: {
      description: 'Get active breakpoints for a workflow execution',
      tags: ['Workflows', 'Breakpoints'],
      params: {
        type: 'object',
        properties: {
          executionId: { type: 'string' },
        },
        required: ['executionId'],
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              breakpointId: { type: 'string' },
              executionId: { type: 'string' },
              nodeId: { type: 'string' },
              checkpointData: { type: 'object' },
              pausedAt: { type: 'string', format: 'date-time' },
              resumeToken: { type: 'string' },
              canResume: { type: 'boolean' },
              timeout: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request: FastifyRequest<{
      Params: { executionId: string };
    }>, reply: FastifyReply) => {
      try {
        const { executionId } = request.params;
        const breakpoints = await breakpointService.getActiveBreakpoints(executionId);
        reply.send(breakpoints);
      } catch (error: any) {
        reply.code(500).send({
          message: error.message || 'Failed to get active breakpoints',
        });
      }
    },
  });

  // Get breakpoint history for an execution
  fastify.get('/workflows/executions/:executionId/breakpoints/history', {
    schema: {
      description: 'Get breakpoint history for a workflow execution',
      tags: ['Workflows', 'Breakpoints'],
      params: {
        type: 'object',
        properties: {
          executionId: { type: 'string' },
        },
        required: ['executionId'],
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              stepId: { type: 'string' },
              stepName: { type: 'string' },
              status: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              breakpointData: { type: 'object' },
              resumedAt: { type: 'string', format: 'date-time' },
              resumedBy: { type: 'string' },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request: FastifyRequest<{
      Params: { executionId: string };
    }>, reply: FastifyReply) => {
      try {
        const { executionId } = request.params;
        const history = await breakpointService.getBreakpointHistory(executionId);
        reply.send(history);
      } catch (error: any) {
        reply.code(500).send({
          message: error.message || 'Failed to get breakpoint history',
        });
      }
    },
  });

  // Resume from breakpoint
  fastify.post('/workflows/breakpoints/:breakpointId/resume', {
    schema: {
      description: 'Resume workflow execution from a breakpoint',
      tags: ['Workflows', 'Breakpoints'],
      params: {
        type: 'object',
        properties: {
          breakpointId: { type: 'string' },
        },
        required: ['breakpointId'],
      },
      body: {
        type: 'object',
        properties: {
          resumeToken: { type: 'string' },
          modifiedData: { type: 'object' },
          skipToNode: { type: 'string' },
          forceResume: { type: 'boolean' },
        },
        required: ['resumeToken'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            executionId: { type: 'string' },
            canContinue: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request: FastifyRequest<{
      Params: { breakpointId: string };
      Body: ResumeBreakpointBody;
    }>, reply: FastifyReply) => {
      try {
        const { breakpointId } = request.params;
        const { resumeToken, modifiedData, skipToNode, forceResume } = request.body;
        const userId = (request.user as any).id;

        const result = await breakpointService.resumeFromBreakpoint(
          breakpointId,
          resumeToken,
          new Types.ObjectId(userId),
          { modifiedData, skipToNode, forceResume }
        );

        reply.send(result);
      } catch (error: any) {
        reply.code(400).send({
          success: false,
          message: error.message || 'Failed to resume from breakpoint',
        });
      }
    },
  });

  // Time travel debugging - replay to checkpoint
  fastify.post('/workflows/executions/:executionId/replay', {
    schema: {
      description: 'Initiate time travel replay from a checkpoint',
      tags: ['Workflows', 'Breakpoints', 'Debugging'],
      params: {
        type: 'object',
        properties: {
          executionId: { type: 'string' },
        },
        required: ['executionId'],
      },
      body: {
        type: 'object',
        properties: {
          checkpointId: { type: 'string' },
        },
        required: ['checkpointId'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            newExecutionId: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request: FastifyRequest<{
      Params: { executionId: string };
      Body: ReplayToCheckpointBody;
    }>, reply: FastifyReply) => {
      try {
        const { executionId } = request.params;
        const { checkpointId } = request.body;
        const userId = (request.user as any).id;

        const result = await breakpointService.replayToCheckpoint(
          executionId,
          checkpointId,
          new Types.ObjectId(userId)
        );

        reply.send(result);
      } catch (error: any) {
        reply.code(400).send({
          success: false,
          message: error.message || 'Failed to initiate replay',
        });
      }
    },
  });

  // Clean up expired breakpoints (admin/internal endpoint)
  fastify.post('/workflows/breakpoints/cleanup', {
    schema: {
      description: 'Clean up expired breakpoints (admin only)',
      tags: ['Workflows', 'Breakpoints', 'Admin'],
      response: {
        200: {
          type: 'object',
          properties: {
            cleaned: { type: 'number' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: [fastify.authenticate], // Add admin check in production
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const cleaned = await breakpointService.cleanupExpiredBreakpoints();
        reply.send({
          cleaned,
          message: `Cleaned up ${cleaned} expired breakpoints`,
        });
      } catch (error: any) {
        reply.code(500).send({
          message: error.message || 'Failed to cleanup expired breakpoints',
        });
      }
    },
  });

  // Get breakpoint configuration for a workflow
  fastify.get('/workflows/:workflowId/breakpoints', {
    schema: {
      description: 'Get breakpoint configuration for a workflow',
      tags: ['Workflows', 'Breakpoints'],
      params: {
        type: 'object',
        properties: {
          workflowId: { type: 'string' },
        },
        required: ['workflowId'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            breakpoints: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  nodeId: { type: 'string' },
                  condition: { type: 'string' },
                  enabled: { type: 'boolean' },
                  persistState: { type: 'boolean' },
                  allowResume: { type: 'boolean' },
                  maxRetries: { type: 'number' },
                  timeout: { type: 'number' },
                  customLogic: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request: FastifyRequest<{
      Params: { workflowId: string };
    }>, reply: FastifyReply) => {
      try {
        const { workflowId } = request.params;
        const WorkflowModel = (await import('../models/Workflow.model')).WorkflowModel;

        const workflow = await WorkflowModel.findById(workflowId);
        if (!workflow) {
          return reply.code(404).send({ message: 'Workflow not found' });
        }

        reply.send({
          breakpoints: workflow.breakpoints || [],
        });
      } catch (error: any) {
        reply.code(500).send({
          message: error.message || 'Failed to get breakpoint configuration',
        });
      }
    },
  });

  // Update breakpoint configuration for a workflow
  fastify.put('/workflows/:workflowId/breakpoints', {
    schema: {
      description: 'Update breakpoint configuration for a workflow',
      tags: ['Workflows', 'Breakpoints'],
      params: {
        type: 'object',
        properties: {
          workflowId: { type: 'string' },
        },
        required: ['workflowId'],
      },
      body: {
        type: 'object',
        properties: {
          breakpoints: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                nodeId: { type: 'string' },
                condition: { type: 'string' },
                enabled: { type: 'boolean' },
                persistState: { type: 'boolean' },
                allowResume: { type: 'boolean' },
                maxRetries: { type: 'number' },
                timeout: { type: 'number' },
                customLogic: { type: 'string' },
              },
            },
          },
        },
        required: ['breakpoints'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request: FastifyRequest<{
      Params: { workflowId: string };
      Body: { breakpoints: any[] };
    }>, reply: FastifyReply) => {
      try {
        const { workflowId } = request.params;
        const { breakpoints } = request.body;
        const WorkflowModel = (await import('../models/Workflow.model')).WorkflowModel;

        await WorkflowModel.updateOne(
          { _id: workflowId },
          { $set: { breakpoints } }
        );

        reply.send({
          success: true,
          message: 'Breakpoint configuration updated',
        });
      } catch (error: any) {
        reply.code(500).send({
          message: error.message || 'Failed to update breakpoint configuration',
        });
      }
    },
  });
}
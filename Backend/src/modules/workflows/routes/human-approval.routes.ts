import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Types } from 'mongoose';
import { humanApprovalService } from '../services/human-approval.service';

interface RequestApprovalBody {
  executionId: string;
  nodeId: string;
  stepId: string;
  approvalType: 'manual_review' | 'confirmation' | 'decision_making' | 'quality_check';
  approvalData: Record<string, any>;
  comments?: string;
  timeoutHours?: number;
}

interface SubmitDecisionBody {
  approvalId: string;
  decision: 'approved' | 'rejected';
  comments?: string;
}

export async function humanApprovalRoutes(fastify: FastifyInstance) {
  // Request human approval
  fastify.post('/workflows/executions/:executionId/approvals', {
    schema: {
      description: 'Request human approval for a workflow step',
      tags: ['Workflows', 'Approvals'],
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
          nodeId: { type: 'string' },
          stepId: { type: 'string' },
          approvalType: {
            type: 'string',
            enum: ['manual_review', 'confirmation', 'decision_making', 'quality_check'],
          },
          approvalData: { type: 'object' },
          comments: { type: 'string' },
          timeoutHours: { type: 'number' },
        },
        required: ['nodeId', 'stepId', 'approvalType', 'approvalData'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            approvalId: { type: 'string' },
            message: { type: 'string' },
            timeout: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request: FastifyRequest<{
      Params: { executionId: string };
      Body: RequestApprovalBody;
    }>, reply: FastifyReply) => {
      try {
        const { executionId } = request.params;
        const { nodeId, stepId, approvalType, approvalData, comments, timeoutHours } = request.body;
        const userId = (request.user as any).id;

        const result = await humanApprovalService.requestApproval({
          executionId,
          nodeId,
          stepId,
          approvalType,
          approvalData,
          requestedBy: new Types.ObjectId(userId),
          comments,
          timeoutHours,
        });

        reply.send(result);
      } catch (error: any) {
        reply.code(400).send({
          success: false,
          message: error.message || 'Failed to request approval',
        });
      }
    },
  });

  // Submit approval decision
  fastify.post('/workflows/approvals/:approvalId/decide', {
    schema: {
      description: 'Submit approval decision',
      tags: ['Workflows', 'Approvals'],
      params: {
        type: 'object',
        properties: {
          approvalId: { type: 'string' },
        },
        required: ['approvalId'],
      },
      body: {
        type: 'object',
        properties: {
          decision: {
            type: 'string',
            enum: ['approved', 'rejected'],
          },
          comments: { type: 'string' },
        },
        required: ['decision'],
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
      Params: { approvalId: string };
      Body: SubmitDecisionBody;
    }>, reply: FastifyReply) => {
      try {
        const { approvalId } = request.params;
        const { decision, comments } = request.body;
        const userId = (request.user as any).id;

        const result = await humanApprovalService.submitDecision({
          approvalId,
          decision,
          approvedBy: new Types.ObjectId(userId),
          comments,
        });

        reply.send(result);
      } catch (error: any) {
        reply.code(400).send({
          success: false,
          message: error.message || 'Failed to submit decision',
        });
      }
    },
  });

  // Get pending approvals for current user
  fastify.get('/workflows/approvals/pending', {
    schema: {
      description: 'Get pending approvals for current user',
      tags: ['Workflows', 'Approvals'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              approvalId: { type: 'string' },
              executionId: { type: 'string' },
              nodeId: { type: 'string' },
              stepId: { type: 'string' },
              approvalType: { type: 'string' },
              approvalData: { type: 'object' },
              requestedAt: { type: 'string', format: 'date-time' },
              requestedBy: { type: 'string' },
              comments: { type: 'string' },
              timeout: { type: 'string', format: 'date-time' },
              workflowName: { type: 'string' },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = (request.user as any).id;
        const approvals = await humanApprovalService.getPendingApprovals(new Types.ObjectId(userId));
        reply.send(approvals);
      } catch (error: any) {
        reply.code(500).send({
          message: error.message || 'Failed to get pending approvals',
        });
      }
    },
  });

  // Get approval statistics
  fastify.get('/workflows/approvals/stats', {
    schema: {
      description: 'Get approval statistics',
      tags: ['Workflows', 'Approvals'],
      response: {
        200: {
          type: 'object',
          properties: {
            totalPending: { type: 'number' },
            totalApproved: { type: 'number' },
            totalRejected: { type: 'number' },
            averageApprovalTime: { type: 'number' },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const stats = await humanApprovalService.getApprovalStats();
        reply.send(stats);
      } catch (error: any) {
        reply.code(500).send({
          message: error.message || 'Failed to get approval stats',
        });
      }
    },
  });

  // Handle expired approvals (admin/internal endpoint)
  fastify.post('/workflows/approvals/handle-expired', {
    schema: {
      description: 'Handle expired approvals (admin only)',
      tags: ['Workflows', 'Approvals', 'Admin'],
      response: {
        200: {
          type: 'object',
          properties: {
            handled: { type: 'number' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: [fastify.authenticate], // Add admin check in production
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const handled = await humanApprovalService.handleExpiredApprovals();
        reply.send({
          handled,
          message: `Handled ${handled} expired approvals`,
        });
      } catch (error: any) {
        reply.code(500).send({
          message: error.message || 'Failed to handle expired approvals',
        });
      }
    },
  });
}
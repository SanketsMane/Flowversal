import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Types } from 'mongoose';
import { workflowAnalyticsService } from '../services/workflow-analytics.service';

interface AnalyticsQueryParams {
  startDate?: string;
  endDate?: string;
  workflowId?: string;
  userId?: string;
}

export async function analyticsRoutes(fastify: FastifyInstance) {
  // Get comprehensive workflow analytics
  fastify.get('/workflows', {
    schema: {
      description: 'Get comprehensive workflow analytics',
      tags: ['Analytics', 'Workflows'],
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          workflowId: { type: 'string' },
          userId: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            totalExecutions: { type: 'number' },
            successfulExecutions: { type: 'number' },
            failedExecutions: { type: 'number' },
            avgExecutionTime: { type: 'number' },
            successRate: { type: 'number' },
            executionsByStatus: { type: 'object' },
            executionsByTrigger: { type: 'object' },
            topWorkflows: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  workflowId: { type: 'string' },
                  workflowName: { type: 'string' },
                  executions: { type: 'number' },
                  successRate: { type: 'number' },
                  avgExecutionTime: { type: 'number' },
                },
              },
            },
            performanceTrends: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string' },
                  executions: { type: 'number' },
                  successRate: { type: 'number' },
                  avgExecutionTime: { type: 'number' },
                },
              },
            },
            nodePerformance: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  nodeType: { type: 'string' },
                  executions: { type: 'number' },
                  successRate: { type: 'number' },
                  avgExecutionTime: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request: FastifyRequest<{
      Querystring: AnalyticsQueryParams;
    }>, reply: FastifyReply) => {
      try {
        const { startDate, endDate, workflowId, userId } = request.query;
        const userIdObj = (request.user as any).id;

        const timeRange = startDate && endDate ? {
          start: new Date(startDate),
          end: new Date(endDate),
        } : undefined;

        const analytics = await workflowAnalyticsService.getWorkflowAnalytics(
          userId ? new Types.ObjectId(userId) : new Types.ObjectId(userIdObj),
          timeRange,
          workflowId ? new Types.ObjectId(workflowId) : undefined
        );

        reply.send(analytics);
      } catch (error: any) {
        reply.code(500).send({
          message: error.message || 'Failed to get workflow analytics',
        });
      }
    },
  });

  // Get AI performance analytics
  fastify.get('/ai', {
    schema: {
      description: 'Get AI model performance analytics',
      tags: ['Analytics', 'AI'],
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          userId: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            totalRequests: { type: 'number' },
            avgConfidence: { type: 'number' },
            providerUsage: { type: 'object' },
            taskTypeDistribution: { type: 'object' },
            responseTimeStats: {
              type: 'object',
              properties: {
                avg: { type: 'number' },
                p50: { type: 'number' },
                p95: { type: 'number' },
                p99: { type: 'number' },
              },
            },
            costAnalysis: {
              type: 'object',
              properties: {
                totalCost: { type: 'number' },
                avgCostPerRequest: { type: 'number' },
                costByProvider: { type: 'object' },
              },
            },
            performanceByTaskType: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  taskType: { type: 'string' },
                  avgConfidence: { type: 'number' },
                  avgResponseTime: { type: 'number' },
                  successRate: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request: FastifyRequest<{
      Querystring: Omit<AnalyticsQueryParams, 'workflowId'>;
    }>, reply: FastifyReply) => {
      try {
        const { startDate, endDate, userId } = request.query;
        const userIdObj = (request.user as any).id;

        const timeRange = startDate && endDate ? {
          start: new Date(startDate),
          end: new Date(endDate),
        } : undefined;

        const analytics = await workflowAnalyticsService.getAIAnalytics(
          userId ? new Types.ObjectId(userId) : new Types.ObjectId(userIdObj),
          timeRange
        );

        reply.send(analytics);
      } catch (error: any) {
        reply.code(500).send({
          message: error.message || 'Failed to get AI analytics',
        });
      }
    },
  });

  // Get user engagement analytics
  fastify.get('/users', {
    schema: {
      description: 'Get user engagement analytics',
      tags: ['Analytics', 'Users'],
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            totalUsers: { type: 'number' },
            activeUsers: { type: 'number' },
            userEngagement: {
              type: 'object',
              properties: {
                dailyActiveUsers: { type: 'number' },
                weeklyActiveUsers: { type: 'number' },
                monthlyActiveUsers: { type: 'number' },
              },
            },
            userWorkflowStats: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  userName: { type: 'string' },
                  totalExecutions: { type: 'number' },
                  successRate: { type: 'number' },
                  favoriteWorkflows: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate], // Admin only in production
    handler: async (request: FastifyRequest<{
      Querystring: Pick<AnalyticsQueryParams, 'startDate' | 'endDate'>;
    }>, reply: FastifyReply) => {
      try {
        const { startDate, endDate } = request.query;

        const timeRange = startDate && endDate ? {
          start: new Date(startDate),
          end: new Date(endDate),
        } : undefined;

        const analytics = await workflowAnalyticsService.getUserAnalytics(timeRange);

        reply.send(analytics);
      } catch (error: any) {
        reply.code(500).send({
          message: error.message || 'Failed to get user analytics',
        });
      }
    },
  });

  // Get real-time dashboard metrics
  fastify.get('/dashboard', {
    schema: {
      description: 'Get real-time dashboard metrics',
      tags: ['Analytics', 'Dashboard'],
      response: {
        200: {
          type: 'object',
          properties: {
            liveStats: {
              type: 'object',
              properties: {
                activeExecutions: { type: 'number' },
                pendingApprovals: { type: 'number' },
                activeBreakpoints: { type: 'number' },
                recentErrors: { type: 'number' },
              },
            },
            performanceIndicators: {
              type: 'object',
              properties: {
                systemHealth: { type: 'string', enum: ['healthy', 'warning', 'critical'] },
                avgResponseTime: { type: 'number' },
                successRate: { type: 'number' },
                throughput: { type: 'number' },
              },
            },
            alerts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['error', 'warning', 'info'] },
                  message: { type: 'string' },
                  timestamp: { type: 'string', format: 'date-time' },
                  details: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = (request.user as any).id;

        const metrics = await workflowAnalyticsService.getDashboardMetrics(
          new Types.ObjectId(userId)
        );

        reply.send(metrics);
      } catch (error: any) {
        reply.code(500).send({
          message: error.message || 'Failed to get dashboard metrics',
        });
      }
    },
  });

  // Get workflow performance comparison
  fastify.get('/workflows/compare', {
    schema: {
      description: 'Compare performance of multiple workflows',
      tags: ['Analytics', 'Workflows'],
      querystring: {
        type: 'object',
        properties: {
          workflowIds: { type: 'string' }, // comma-separated
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
        },
        required: ['workflowIds'],
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              workflowId: { type: 'string' },
              workflowName: { type: 'string' },
              totalExecutions: { type: 'number' },
              successRate: { type: 'number' },
              avgExecutionTime: { type: 'number' },
              errorRate: { type: 'number' },
              trends: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    date: { type: 'string' },
                    executions: { type: 'number' },
                    successRate: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request: FastifyRequest<{
      Querystring: { workflowIds: string; startDate?: string; endDate?: string };
    }>, reply: FastifyReply) => {
      try {
        const { workflowIds, startDate, endDate } = request.query;
        const userId = (request.user as any).id;

        const workflowIdArray = workflowIds.split(',').map(id => id.trim());
        const timeRange = startDate && endDate ? {
          start: new Date(startDate),
          end: new Date(endDate),
        } : undefined;

        // Get analytics for each workflow
        const comparisons = await Promise.all(
          workflowIdArray.map(async (workflowId) => {
            const analytics = await workflowAnalyticsService.getWorkflowAnalytics(
              new Types.ObjectId(userId),
              timeRange,
              new Types.ObjectId(workflowId)
            );

            return {
              workflowId,
              workflowName: 'Workflow', // Would need to lookup name
              totalExecutions: analytics.totalExecutions,
              successRate: analytics.successRate,
              avgExecutionTime: analytics.avgExecutionTime,
              errorRate: (analytics.failedExecutions / analytics.totalExecutions) * 100,
              trends: analytics.performanceTrends,
            };
          })
        );

        reply.send(comparisons);
      } catch (error: any) {
        reply.code(500).send({
          message: error.message || 'Failed to compare workflows',
        });
      }
    },
  });

  // Export analytics data
  fastify.post('/export', {
    schema: {
      description: 'Export analytics data for reporting',
      tags: ['Analytics', 'Export'],
      body: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['workflow', 'ai', 'user'] },
          format: { type: 'string', enum: ['json', 'csv'], default: 'json' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          filters: { type: 'object' },
        },
        required: ['type'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: { type: 'object' },
            format: { type: 'string' },
            generatedAt: { type: 'string', format: 'date-time' },
            filters: { type: 'object' },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request: FastifyRequest<{
      Body: {
        type: 'workflow' | 'ai' | 'user';
        format?: 'json' | 'csv';
        startDate?: string;
        endDate?: string;
        filters?: any;
      };
    }>, reply: FastifyReply) => {
      try {
        const { type, format = 'json', startDate, endDate, filters } = request.body;
        const userId = (request.user as any).id;

        const timeRange = startDate && endDate ? {
          start: new Date(startDate),
          end: new Date(endDate),
        } : undefined;

        let data: any;

        switch (type) {
          case 'workflow':
            data = await workflowAnalyticsService.getWorkflowAnalytics(
              new Types.ObjectId(userId),
              timeRange
            );
            break;
          case 'ai':
            data = await workflowAnalyticsService.getAIAnalytics(
              new Types.ObjectId(userId),
              timeRange
            );
            break;
          case 'user':
            data = await workflowAnalyticsService.getUserAnalytics(timeRange);
            break;
          default:
            throw new Error('Invalid export type');
        }

        // Convert to CSV if requested (simplified implementation)
        if (format === 'csv') {
          // This would need proper CSV conversion logic
          data = JSON.stringify(data, null, 2); // Placeholder
        }

        reply.send({
          data,
          format,
          generatedAt: new Date().toISOString(),
          filters: filters || {},
        });
      } catch (error: any) {
        reply.code(500).send({
          message: error.message || 'Failed to export analytics',
        });
      }
    },
  });
}
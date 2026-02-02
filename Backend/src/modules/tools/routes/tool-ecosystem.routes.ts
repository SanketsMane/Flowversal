import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Types } from 'mongoose';
import { ToolDefinition, toolEcosystemService } from '../services/tool-ecosystem.service';

interface RegisterToolBody extends Omit<ToolDefinition, 'id'> {
  id?: string;
}

interface ExecuteToolBody {
  toolId: string;
  args: Record<string, any>;
  context?: {
    workflowId?: string;
    executionId?: string;
    nodeId?: string;
  };
}

export async function toolEcosystemRoutes(fastify: FastifyInstance) {
  // Register a new tool
  fastify.post('/tools', {
    schema: {
      description: 'Register a new tool in the ecosystem',
      tags: ['Tools', 'Ecosystem'],
      body: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          version: { type: 'string' },
          author: { type: 'string' },
          schema: { type: 'object' },
          implementation: { type: 'string' }, // Function as string for now
          metadata: { type: 'object' },
        },
        required: ['name', 'description', 'category', 'version', 'author', 'schema'],
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            toolId: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: [fastify.authenticate], // Admin only in production
    handler: async (request: FastifyRequest<{
      Body: RegisterToolBody;
    }>, reply: FastifyReply) => {
      try {
        // Convert string implementation to function (simplified)
        let implementation: (args: any) => Promise<any>;
        if (typeof request.body.implementation === 'string') {
          // In a real implementation, you'd need to safely evaluate the function
          // For now, we'll use a placeholder
          implementation = async (args: any) => {
            return { success: true, message: 'Tool executed', args };
          };
        } else {
          implementation = request.body.implementation;
        }

        const toolDef: ToolDefinition = {
          ...request.body,
          implementation,
        };

        toolEcosystemService.registerTool(toolDef);

        reply.code(201).send({
          success: true,
          toolId: toolDef.id,
          message: 'Tool registered successfully',
        });
      } catch (error: any) {
        reply.code(400).send({
          success: false,
          message: error.message || 'Failed to register tool',
        });
      }
    },
  });

  // Execute a tool
  fastify.post('/tools/execute', {
    schema: {
      description: 'Execute a tool from the ecosystem',
      tags: ['Tools', 'Execution'],
      body: {
        type: 'object',
        properties: {
          toolId: { type: 'string' },
          args: { type: 'object' },
          context: {
            type: 'object',
            properties: {
              workflowId: { type: 'string' },
              executionId: { type: 'string' },
              nodeId: { type: 'string' },
            },
          },
        },
        required: ['toolId', 'args'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            output: { type: 'object' },
            executionTime: { type: 'number' },
            toolId: { type: 'string' },
            toolVersion: { type: 'string' },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request: FastifyRequest<{
      Body: ExecuteToolBody;
    }>, reply: FastifyReply) => {
      try {
        const { toolId, args, context } = request.body;
        const userId = (request.user as any).id;

        const executionContext = {
          userId: new Types.ObjectId(userId),
          workflowId: context?.workflowId ? new Types.ObjectId(context.workflowId) : undefined,
          executionId: context?.executionId,
          nodeId: context?.nodeId,
          correlationId: (request as any).correlationId,
        };

        const result = await toolEcosystemService.executeTool(toolId, args, executionContext);

        reply.send(result);
      } catch (error: any) {
        reply.code(400).send({
          success: false,
          message: error.message || 'Failed to execute tool',
        });
      }
    },
  });

  // Get all tools
  fastify.get('/tools', {
    schema: {
      description: 'Get all registered tools',
      tags: ['Tools', 'Ecosystem'],
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          tags: { type: 'string' }, // comma-separated
          search: { type: 'string' },
          limit: { type: 'integer', minimum: 1, maximum: 100 },
          offset: { type: 'integer', minimum: 0 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            tools: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                  tags: { type: 'array', items: { type: 'string' } },
                  version: { type: 'string' },
                  author: { type: 'string' },
                  stats: { type: 'object' },
                },
              },
            },
            total: { type: 'integer' },
            categories: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    handler: async (request: FastifyRequest<{
      Querystring: {
        category?: string;
        tags?: string;
        search?: string;
        limit?: number;
        offset?: number;
      };
    }>, reply: FastifyReply) => {
      try {
        const { category, tags, search, limit = 50, offset = 0 } = request.query;

        let tools: ToolDefinition[];

        if (category) {
          tools = toolEcosystemService.getToolsByCategory(category);
        } else if (tags) {
          const tagsArray = tags.split(',').map(t => t.trim());
          tools = toolEcosystemService.getToolsByTags(tagsArray);
        } else if (search) {
          tools = toolEcosystemService.searchTools(search);
        } else {
          tools = toolEcosystemService.getAllTools();
        }

        // Apply pagination
        const paginatedTools = tools.slice(offset, offset + limit);

        reply.send({
          tools: paginatedTools.map(tool => ({
            id: tool.id,
            name: tool.name,
            description: tool.description,
            category: tool.category,
            tags: tool.tags,
            version: tool.version,
            author: tool.author,
            stats: tool.stats,
          })),
          total: tools.length,
          categories: toolEcosystemService.getCategories(),
        });
      } catch (error: any) {
        reply.code(500).send({
          message: error.message || 'Failed to get tools',
        });
      }
    },
  });

  // Get tool by ID
  fastify.get('/tools/:toolId', {
    schema: {
      description: 'Get a specific tool by ID',
      tags: ['Tools', 'Ecosystem'],
      params: {
        type: 'object',
        properties: {
          toolId: { type: 'string' },
        },
        required: ['toolId'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            version: { type: 'string' },
            author: { type: 'string' },
            metadata: { type: 'object' },
            stats: { type: 'object' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest<{
      Params: { toolId: string };
    }>, reply: FastifyReply) => {
      try {
        const { toolId } = request.params;
        const tool = toolEcosystemService.getTool(toolId);

        if (!tool) {
          return reply.code(404).send({ message: 'Tool not found' });
        }

        reply.send({
          id: tool.id,
          name: tool.name,
          description: tool.description,
          category: tool.category,
          tags: tool.tags,
          version: tool.version,
          author: tool.author,
          metadata: tool.metadata,
          stats: tool.stats,
        });
      } catch (error: any) {
        reply.code(500).send({
          message: error.message || 'Failed to get tool',
        });
      }
    },
  });

  // Get tool categories
  fastify.get('/tools/categories', {
    schema: {
      description: 'Get all tool categories',
      tags: ['Tools', 'Ecosystem'],
      response: {
        200: {
          type: 'object',
          properties: {
            categories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  toolCount: { type: 'integer' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const categories = toolEcosystemService.getCategories();
        const categoryInfo = categories.map(category => ({
          name: category,
          toolCount: toolEcosystemService.getToolsByCategory(category).length,
          description: getCategoryDescription(category),
        }));

        reply.send({ categories: categoryInfo });
      } catch (error: any) {
        reply.code(500).send({
          message: error.message || 'Failed to get categories',
        });
      }
    },
  });

  // Get tool statistics
  fastify.get('/tools/stats', {
    schema: {
      description: 'Get tool ecosystem statistics',
      tags: ['Tools', 'Analytics'],
      response: {
        200: {
          type: 'object',
          properties: {
            totalTools: { type: 'integer' },
            categories: { type: 'object' },
            totalUsage: { type: 'integer' },
            averageSuccessRate: { type: 'number' },
            mostUsedTools: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  toolId: { type: 'string' },
                  usageCount: { type: 'integer' },
                  name: { type: 'string' },
                },
              },
            },
            failingTools: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  toolId: { type: 'string' },
                  successRate: { type: 'number' },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const stats = toolEcosystemService.getEcosystemStats();
        reply.send(stats);
      } catch (error: any) {
        reply.code(500).send({
          message: error.message || 'Failed to get tool stats',
        });
      }
    },
  });

  // Get tool recommendations
  fastify.get('/tools/recommendations', {
    schema: {
      description: 'Get tool recommendations based on usage patterns',
      tags: ['Tools', 'Recommendations'],
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          limit: { type: 'integer', minimum: 1, maximum: 20 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  toolId: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                  score: { type: 'number' },
                  reason: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    handler: async (request: FastifyRequest<{
      Querystring: { category?: string; limit?: number };
    }>, reply: FastifyReply) => {
      try {
        const { category, limit = 5 } = request.query;

        let tools: ToolDefinition[];
        if (category) {
          tools = toolEcosystemService.getToolsByCategory(category);
        } else {
          tools = toolEcosystemService.getAllTools();
        }

        // Sort by success rate and usage count
        const recommendations = tools
          .filter(tool => tool.stats && tool.stats.usageCount > 0)
          .sort((a, b) => {
            const aScore = (a.stats!.successRate / 100) * Math.log(a.stats!.usageCount + 1);
            const bScore = (b.stats!.successRate / 100) * Math.log(b.stats!.usageCount + 1);
            return bScore - aScore;
          })
          .slice(0, limit)
          .map(tool => ({
            toolId: tool.id,
            name: tool.name,
            description: tool.description,
            category: tool.category,
            score: tool.stats ? (tool.stats.successRate / 100) * Math.log(tool.stats.usageCount + 1) : 0,
            reason: tool.stats ?
              `High success rate (${tool.stats.successRate.toFixed(1)}%) and frequently used (${tool.stats.usageCount} times)` :
              'New tool',
          }));

        reply.send({ recommendations });
      } catch (error: any) {
        reply.code(500).send({
          message: error.message || 'Failed to get recommendations',
        });
      }
    },
  });

  // Delete a tool
  fastify.delete('/tools/:toolId', {
    schema: {
      description: 'Unregister a tool from the ecosystem',
      tags: ['Tools', 'Ecosystem'],
      params: {
        type: 'object',
        properties: {
          toolId: { type: 'string' },
        },
        required: ['toolId'],
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
    preHandler: [fastify.authenticate], // Admin only in production
    handler: async (request: FastifyRequest<{
      Params: { toolId: string };
    }>, reply: FastifyReply) => {
      try {
        const { toolId } = request.params;
        const removed = toolEcosystemService.unregisterTool(toolId);

        if (!removed) {
          return reply.code(404).send({
            success: false,
            message: 'Tool not found',
          });
        }

        reply.send({
          success: true,
          message: 'Tool unregistered successfully',
        });
      } catch (error: any) {
        reply.code(500).send({
          message: error.message || 'Failed to unregister tool',
        });
      }
    },
  });
}

// Helper function to get category descriptions
function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    communication: 'Tools for messaging, email, and notifications',
    development: 'Development and DevOps tools',
    data: 'Data processing, databases, and analytics',
    file_system: 'File and directory operations',
    network: 'HTTP requests and network operations',
    utility: 'General utility functions',
    text: 'Text processing and analysis',
  };

  return descriptions[category] || 'General purpose tools';
}
import { FastifyPluginAsync } from 'fastify';
import { mcpServer } from '../../../../agents/mcp/server';

const mcpRoutes: FastifyPluginAsync = async (fastify) => {
  // Get MCP server config
  fastify.get('/config', async (_request, reply) => {
    return reply.send({
      success: true,
      data: mcpServer.getConfig(),
    });
  });

  // Execute tool
  fastify.post<{
    Body: {
      sessionId: string;
      tool: string;
      arguments: Record<string, any>;
    };
  }>('/execute', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    try {
      const result = await mcpServer.executeTool(
        request.body.sessionId || `session-${request.user.id}`,
        request.user.id,
        {
          tool: request.body.tool,
          arguments: request.body.arguments,
        }
      );

      return reply.send({
        success: result.success,
        data: result.result,
        error: result.error,
      });
    } catch (error: any) {
      fastify.log.error('Error executing MCP tool:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: error.message || 'Failed to execute tool',
      });
    }
  });

  // Get context variables
  fastify.get<{ Querystring: { sessionId: string } }>('/context', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    const sessionId = request.query.sessionId || `session-${request.user.id}`;
    const variables = mcpServer.getContextVariables(sessionId);

    return reply.send({
      success: true,
      data: variables,
    });
  });
};

export default mcpRoutes;


import { FastifyPluginAsync } from 'fastify';
import { env } from '../../../core/config/env';
import { userService } from '../../users/services/user.service';
import { workflowExecutionService } from '../services/workflow-execution.service';
const workflowExecutionRoutes: FastifyPluginAsync = async (fastify) => {
  // Execute unsaved workflow (accepts workflow data directly)
  fastify.post<{ Body: { workflow: any; input?: any; triggeredBy?: string } }>(
    '/execute',
    async (request, reply) => {
      // #region agent log
      // BUG-FIX: Removed hardcoded filesystem logging - Sanket
      // #endregion
      // Use standardized hydrated user from auth.plugin.ts - Author: Sanket
      if (!request.user?.dbUser) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'User authentication required',
        });
      }
      const dbUser = request.user.dbUser;

      if (!request.body.workflow) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Workflow data is required',
        });
      }
      try {
        // No need for redundant lookup - dbUser is already hydrated
        // #region agent log
        // BUG-FIX: Removed hardcoded filesystem logging - Sanket
        // #endregion
        const execution = await workflowExecutionService.startExecutionWithData(
          request.body.workflow,
          dbUser._id.toString(),
          request.body.input || {},
          (request.body.triggeredBy as any) || 'manual'
        );
        // #region agent log
        // BUG-FIX: Removed hardcoded filesystem logging - Sanket
        // #endregion
        const executionData = execution.toJSON ? execution.toJSON() : execution;
        const executionId = executionData.id || executionData._id?.toString() || execution._id.toString();
        return reply.code(202).send({
          success: true,
          data: {
            ...executionData,
            id: executionId,
          },
          message: 'Workflow execution started',
        });
      } catch (error: any) {
        fastify.log.error('Error executing unsaved workflow:', error);
        // #region agent log
        // BUG-FIX: Removed hardcoded filesystem logging - Sanket
        // #endregion
        return reply.code(400).send({
          error: 'Bad Request',
          message: error.message || 'Failed to execute workflow',
        });
      }
    }
  );
  // Start workflow execution
  fastify.post<{ Params: { id: string }; Body: { input?: any; triggeredBy?: string } }>(
    '/:id/execute',
    async (request, reply) => {
      // #region agent log
      // BUG-FIX: Removed hardcoded filesystem logging - Sanket
      // #endregion
      if (!request.user?.dbUser) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }
      try {
        const dbUser = request.user.dbUser;
        // #region agent log
        // BUG-FIX: Removed hardcoded filesystem logging - Sanket
        // #endregion
        const execution = await workflowExecutionService.startExecution(
          request.params.id,
          dbUser._id.toString(),
          request.body.input || {},
          (request.body.triggeredBy as any) || 'manual'
        );
        // #region agent log
        // BUG-FIX: Removed hardcoded filesystem logging - Sanket
        // #endregion
        // Ensure execution is serialized properly with id field
        const executionData = execution.toJSON ? execution.toJSON() : execution;
        const executionId = executionData.id || executionData._id?.toString() || execution._id.toString();
        return reply.code(202).send({
          success: true,
          data: {
            ...executionData,
            id: executionId, // Ensure id field is present
          },
          message: 'Workflow execution started',
        });
      } catch (error: any) {
        fastify.log.error('Error starting workflow execution:', error);
        // #region agent log
        // BUG-FIX: Removed hardcoded filesystem logging - Sanket
        // #endregion
        return reply.code(400).send({
          error: 'Bad Request',
          message: error.message || 'Failed to start workflow execution',
        });
      }
    }
  );
  // Get execution by ID
  fastify.get<{ Params: { executionId: string } }>('/executions/:executionId', async (request, reply) => {
    // Use standardized hydrated user from auth.plugin.ts - Author: Sanket
    if (!request.user?.dbUser) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User authentication required',
      });
    }
    const dbUser = request.user.dbUser;

    try {
      const execution = await workflowExecutionService.getExecution(
        request.params.executionId,
        dbUser._id.toString()
      );
      if (!execution) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Execution not found',
        });
      }
      return reply.send({
        success: true,
        data: execution,
      });
    } catch (error: any) {
      fastify.log.error('Error fetching execution:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch execution',
      });
    }
  });
  // List executions for a workflow
  fastify.get<{ Params: { id: string }; Querystring: { page?: string; limit?: string } }>(
    '/:id/executions',
    async (request, reply) => {
      if (!request.user?.dbUser) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }
      try {
        const dbUser = request.user.dbUser;
        const query = request.query as { page?: string; limit?: string };
        const page = parseInt(query.page || '1') || 1;
        const rawLimit = parseInt(query.limit || '20') || 20;
        const maxLimit = env.MAX_EXECUTION_PAGE_SIZE || 100;
        const limit = Math.min(Math.max(rawLimit, 1), maxLimit);
        const result = await workflowExecutionService.listExecutions(
          request.params.id,
          dbUser._id.toString(),
          page,
          limit
        );
        return reply.send({
          success: true,
          data: result.executions,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          },
        });
      } catch (error: any) {
        fastify.log.error('Error listing executions:', error);
        return reply.code(400).send({
          error: 'Bad Request',
          message: error.message || 'Failed to list executions',
        });
      }
    }
  );
  // Stop execution
  fastify.post<{ Params: { executionId: string } }>('/executions/:executionId/stop', async (request, reply) => {
    if (!request.user?.dbUser) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }
    try {
      const dbUser = request.user.dbUser;
      const stopped = await workflowExecutionService.stopExecution(
        request.params.executionId,
        dbUser._id.toString()
      );
      if (!stopped) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Execution not found or cannot be stopped',
        });
      }
      return reply.send({
        success: true,
        message: 'Execution stopped successfully',
      });
    } catch (error: any) {
      fastify.log.error('Error stopping execution:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to stop execution',
      });
    }
  });
};
export default workflowExecutionRoutes;

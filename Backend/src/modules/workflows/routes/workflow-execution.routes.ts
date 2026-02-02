import { FastifyPluginAsync } from 'fastify';
import { env } from '../../../core/config/env';
import { supabaseClient } from '../../../core/config/supabase.config';
import { userService } from '../../users/services/user.service';
import { workflowExecutionService } from '../services/workflow-execution.service';

const workflowExecutionRoutes: FastifyPluginAsync = async (fastify) => {
  // Execute unsaved workflow (accepts workflow data directly)
  fastify.post<{ Body: { workflow: any; input?: any; triggeredBy?: string } }>(
    '/execute',
    async (request, reply) => {
      // #region agent log
      const fs = require('fs');
      const logPath = '/Users/nishantkumar/Documents/FloversalAI 1.0.0/.cursor/debug.log';
      console.log('[DEBUG] Execute unsaved workflow route entry', { hasWorkflow: !!request.body.workflow, hasUser: !!request.user, hasAuthHeader: !!request.headers.authorization });
      try {
        fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.routes.ts:8',message:'Execute unsaved workflow route entry',data:{hasWorkflow:!!request.body.workflow,hasUser:!!request.user,hasAuthHeader:!!request.headers.authorization},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})+'\n');
      } catch (err) {
        console.error('[DEBUG] Failed to write log', err);
      }
      // #endregion
      
      // Authenticate user if request.user is not set
      let user: { id: string } | undefined = request.user;
      if (!user) {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return reply.code(401).send({
            error: 'Unauthorized',
            message: 'Authentication required: Please log in',
          });
        }
        
        const token = authHeader.replace('Bearer ', '');
        try {
          const { data: { user: supabaseUser }, error } = await supabaseClient.auth.getUser(token);
          if (error || !supabaseUser) {
            return reply.code(401).send({
              error: 'Unauthorized',
              message: 'Invalid or expired token',
            });
          }
          // Set request.user for compatibility
          (request as any).user = { id: supabaseUser.id };
          user = { id: supabaseUser.id };
        } catch (err: any) {
          return reply.code(401).send({
            error: 'Unauthorized',
            message: 'Authentication failed',
          });
        }
      }

      if (!user) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      if (!request.body.workflow) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Workflow data is required',
        });
      }

      try {
        const dbUser = await userService.getOrCreateUserFromSupabase(user.id);
        // #region agent log
        fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.routes.ts:25',message:'Before startExecutionWithData',data:{userId:dbUser._id.toString(),hasInput:!!request.body.input},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})+'\n');
        // #endregion

        const execution = await workflowExecutionService.startExecutionWithData(
          request.body.workflow,
          dbUser._id.toString(),
          request.body.input || {},
          (request.body.triggeredBy as any) || 'manual'
        );
        // #region agent log
        console.log('[DEBUG] After startExecutionWithData', { executionId: execution._id.toString(), status: execution.status });
        fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.routes.ts:32',message:'After startExecutionWithData',data:{executionId:execution._id.toString(),status:execution.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})+'\n');
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
        fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.routes.ts:45',message:'Execute unsaved workflow error',data:{errorMessage:error?.message,errorName:error?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})+'\n');
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
      const fs = require('fs');
      const logPath = '/Users/nishantkumar/Documents/FloversalAI 1.0.0/.cursor/debug.log';
      console.log('[DEBUG] Route handler entry', { workflowId: request.params.id, hasUser: !!request.user, hasBody: !!request.body });
      try {
        fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.routes.ts:10',message:'Route handler entry',data:{workflowId:request.params.id,hasUser:!!request.user,hasBody:!!request.body},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n');
      } catch (err) {
        console.error('[DEBUG] Failed to write log', err);
      }
      // #endregion
      if (!request.user) {
        // #region agent log
        fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.routes.ts:12',message:'Unauthorized',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n');
        // #endregion
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      try {
        const dbUser = await userService.getOrCreateUserFromSupabase(request.user.id);
        // #region agent log
        fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.routes.ts:20',message:'Before startExecution',data:{workflowId:request.params.id,userId:dbUser._id.toString(),hasInput:!!request.body.input},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n');
        // #endregion

        const execution = await workflowExecutionService.startExecution(
          request.params.id,
          dbUser._id.toString(),
          request.body.input || {},
          (request.body.triggeredBy as any) || 'manual'
        );
        // #region agent log
        console.log('[DEBUG] After startExecution', { executionId: execution._id.toString(), status: execution.status });
        try {
          fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.routes.ts:27',message:'After startExecution',data:{executionId:execution._id.toString(),status:execution.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n');
        } catch (err) {
          console.error('[DEBUG] Failed to write log', err);
        }
        // #endregion

        // Ensure execution is serialized properly with id field
        const executionData = execution.toJSON ? execution.toJSON() : execution;
        const executionId = executionData.id || executionData._id?.toString() || execution._id.toString();
        
        console.log('[DEBUG] Sending response', { executionId, hasId: !!executionData.id, has_id: !!executionData._id, executionDataKeys: Object.keys(executionData) });

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
        fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.routes.ts:34',message:'Route handler error',data:{errorMessage:error?.message,errorName:error?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n');
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
    // Authenticate user if request.user is not set
    let user: { id: string } | undefined = request.user;
    if (!user) {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Authentication required: Please log in',
        });
      }

      const token = authHeader.replace('Bearer ', '');
      try {
        const { data: { user: supabaseUser }, error } = await supabaseClient.auth.getUser(token);
        if (error || !supabaseUser) {
          return reply.code(401).send({
            error: 'Unauthorized',
            message: 'Invalid or expired token',
          });
        }
        // Set request.user for compatibility
        (request as any).user = { id: supabaseUser.id };
        user = { id: supabaseUser.id };
      } catch (err: any) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Authentication failed',
        });
      }
    }

    if (!user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    try {
      const dbUser = await userService.getOrCreateUserFromSupabase(user.id);
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
      if (!request.user) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      try {
        const dbUser = await userService.getOrCreateUserFromSupabase(request.user.id);
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
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    try {
      const dbUser = await userService.getOrCreateUserFromSupabase(request.user.id);
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


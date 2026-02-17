import { FastifyReply, FastifyRequest } from 'fastify';
import { userService } from '../../../users/services/user.service';
import { taskWorkflowService } from '../../services/task-workflow.service';

import { ExecuteWorkflowBody } from '../types/task-routes.types';

export async function executeWorkflowHandler(
  request: FastifyRequest<{ Params: { id: string; workflowId: string }; Body: ExecuteWorkflowBody }>,
  reply: FastifyReply
): Promise<void> {


  try {
    // Use standardized hydrated user from auth.plugin.ts - Author: Sanket
    if (!request.user?.dbUser) {
        return reply.code(401).send({ success: false, error: 'Unauthorized', message: 'Auth required' });
    }
    const dbUser = request.user.dbUser;
    await taskWorkflowService.triggerWorkflowManually(
      request.params.id,
      request.params.workflowId,
      dbUser._id.toString(),
      request.body.input
    );

    return reply.send({
      success: true,
      message: 'Workflow execution triggered successfully',
    });
  } catch (error: any) {
    request.log.error('Error triggering workflow for task:', error);
    return reply.code(error.message.includes('not found') ? 404 : 500).send({
      success: false,
      error: error.message.includes('not found') ? 'Not Found' : 'Internal Server Error',
      message: error.message || 'Failed to trigger workflow',
    });
  }
}

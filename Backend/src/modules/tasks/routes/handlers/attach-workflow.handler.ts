import { FastifyReply, FastifyRequest } from 'fastify';
import { userService } from '../../../users/services/user.service';
import { taskWorkflowService } from '../../services/task-workflow.service';

import { AttachWorkflowBody } from '../types/task-routes.types';

export async function attachWorkflowHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: AttachWorkflowBody }>,
  reply: FastifyReply
): Promise<void> {


  try {
    const dbUser = await userService.getOrCreateUserFromSupabase(request.user!.id);
    const task = await taskWorkflowService.attachWorkflowToTask(
      request.params.id,
      request.body.workflowId,
      dbUser._id.toString(),
      request.body.config || {}
    );

    return reply.send({
      success: true,
      data: task,
      message: 'Workflow attached to task successfully',
    });
  } catch (error: any) {
    request.log.error('Error attaching workflow to task:', error);
    return reply.code(error.message.includes('not found') ? 404 : 500).send({
      success: false,
      error: error.message.includes('not found') ? 'Not Found' : 'Internal Server Error',
      message: error.message || 'Failed to attach workflow to task',
    });
  }
}

import { FastifyReply, FastifyRequest } from 'fastify';
import { userService } from '../../../users/services/user.service';
import { taskWorkflowService } from '../../services/task-workflow.service';


export async function detachWorkflowHandler(
  request: FastifyRequest<{ Params: { id: string; workflowId: string } }>,
  reply: FastifyReply
): Promise<void> {


  try {
    // Use standardized hydrated user from auth.plugin.ts - Author: Sanket
    if (!request.user?.dbUser) {
        return reply.code(401).send({ success: false, error: 'Unauthorized', message: 'Auth required' });
    }
    const dbUser = request.user.dbUser;
    const task = await taskWorkflowService.detachWorkflowFromTask(
      request.params.id,
      request.params.workflowId,
      dbUser._id.toString()
    );

    return reply.send({
      success: true,
      data: task,
      message: 'Workflow detached from task successfully',
    });
  } catch (error: any) {
    request.log.error('Error detaching workflow from task:', error);
    return reply.code(error.message.includes('not found') ? 404 : 500).send({
      success: false,
      error: error.message.includes('not found') ? 'Not Found' : 'Internal Server Error',
      message: error.message || 'Failed to detach workflow from task',
    });
  }
}

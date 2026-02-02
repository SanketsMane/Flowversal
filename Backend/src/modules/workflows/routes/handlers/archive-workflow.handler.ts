import { FastifyRequest, FastifyReply } from 'fastify';
import { workflowService } from '../../services/workflow.service';
import { userService } from '../../../users/services/user.service';

export async function archiveWorkflowHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
): Promise<void> {
  if (!request.user) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'User not authenticated',
    });
  }

  try {
    const dbUser = await userService.getOrCreateUserFromSupabase(request.user.id);
    const workflow = await workflowService.archiveWorkflow(
      request.params.id,
      dbUser._id.toString()
    );

    if (!workflow) {
      return reply.code(404).send({
        error: 'Not Found',
        message: 'Workflow not found or you do not have permission to archive it',
      });
    }

    return reply.send({
      success: true,
      data: workflow,
    });
  } catch (error: any) {
    request.log.error('Error archiving workflow:', error);
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Failed to archive workflow',
    });
  }
}

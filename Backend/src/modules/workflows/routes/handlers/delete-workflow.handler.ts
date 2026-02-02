import { FastifyRequest, FastifyReply } from 'fastify';
import { workflowService } from '../../services/workflow.service';
import { userService } from '../../../users/services/user.service';

export async function deleteWorkflowHandler(
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
    const deleted = await workflowService.deleteWorkflow(
      request.params.id,
      dbUser._id.toString()
    );

    if (!deleted) {
      return reply.code(404).send({
        error: 'Not Found',
        message: 'Workflow not found or you do not have permission to delete it',
      });
    }

    return reply.send({
      success: true,
      message: 'Workflow deleted successfully',
    });
  } catch (error: any) {
    request.log.error('Error deleting workflow:', error);
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Failed to delete workflow',
    });
  }
}

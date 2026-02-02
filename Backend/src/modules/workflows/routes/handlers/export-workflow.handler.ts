import { FastifyRequest, FastifyReply } from 'fastify';
import { workflowService } from '../../services/workflow.service';
import { userService } from '../../../users/services/user.service';

export async function exportWorkflowHandler(
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
    const exportData = await workflowService.exportWorkflow(
      request.params.id,
      dbUser._id.toString()
    );

    // Set headers for file download
    reply.header('Content-Type', 'application/json');
    reply.header('Content-Disposition', `attachment; filename="workflow-${request.params.id}.json"`);

    return reply.send(exportData);
  } catch (error: any) {
    request.log.error('Error exporting workflow:', error);
    return reply.code(error.message.includes('not found') ? 404 : 500).send({
      error: error.message.includes('not found') ? 'Not Found' : 'Internal Server Error',
      message: error.message || 'Failed to export workflow',
    });
  }
}

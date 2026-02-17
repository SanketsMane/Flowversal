import { FastifyRequest, FastifyReply } from 'fastify';
import { workflowService } from '../../services/workflow.service';
import { userService } from '../../../users/services/user.service';
import { ImportWorkflowBody } from '../types/workflow-routes.types';

export async function importWorkflowHandler(
  request: FastifyRequest<{ Body: ImportWorkflowBody }>,
  reply: FastifyReply
): Promise<void> {
  if (!request.user) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'User not authenticated',
    });
  }

  try {
    const dbUser = request.user.dbUser;
    if (!dbUser) {
      return reply.code(401).send({ success: false, error: 'Unauthorized', message: 'User data not found' });
    }

    // Validate workflow structure first
    const validation = workflowService.validateWorkflowStructure(request.body.workflowData?.workflow || request.body.workflowData);

    if (!validation.valid) {
      return reply.code(400).send({
        error: 'Validation Error',
        message: 'Invalid workflow structure',
        errors: validation.errors,
      });
    }

    const importedWorkflow = await workflowService.importWorkflow(
      request.body.workflowData || request.body,
      dbUser._id.toString(),
      dbUser.email,
      request.body.options || {}
    );

    return reply.code(201).send({
      success: true,
      data: importedWorkflow,
      message: 'Workflow imported successfully',
    });
  } catch (error: any) {
    request.log.error('Error importing workflow:', error);
    return reply.code(400).send({
      error: 'Bad Request',
      message: error.message || 'Failed to import workflow',
    });
  }
}

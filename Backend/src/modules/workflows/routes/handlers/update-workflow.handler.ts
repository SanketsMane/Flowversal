import { FastifyReply, FastifyRequest } from 'fastify';
import { sanitizeInput, stripHtml } from '../../../../core/utils/sanitizer.util';
import { userService } from '../../../users/services/user.service';
import { workflowValidationService } from '../../services/workflow-validation.service';
import { workflowService } from '../../services/workflow.service';
import { UpdateWorkflowBody } from '../types/workflow-routes.types';

export async function updateWorkflowHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateWorkflowBody }>,
  reply: FastifyReply
): Promise<void> {
  if (!request.user) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'User not authenticated',
    });
  }

  try {
    const workflowData = { ...request.body };
    if (workflowData.name) workflowData.name = stripHtml(workflowData.name);
    if (workflowData.description) workflowData.description = sanitizeInput(workflowData.description);

    // Validate workflow update
    const validation = workflowValidationService.validateWorkflowUpdate(workflowData);
    workflowValidationService.logValidationResult(validation);

    if (!validation.valid) {
      return reply.code(400).send({
        success: false,
        error: 'Validation Error',
        message: 'Workflow validation failed',
        details: {
          errors: validation.errors,
          warnings: validation.warnings,
        },
      });
    }

    // Standardized hydrated user from auth.plugin.ts - Author: Sanket
    const dbUser = request.user.dbUser;
    if (!dbUser) {
      return reply.code(401).send({ success: false, error: 'Unauthorized', message: 'User data not found' });
    }
    const workflow = await workflowService.updateWorkflow(
      request.params.id,
      dbUser._id.toString(),
      workflowData
    );

    if (!workflow) {
      return reply.code(404).send({
        error: 'Not Found',
        message: 'Workflow not found or you do not have permission to update it',
      });
    }

    return reply.send({
      success: true,
      data: workflow,
      warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
    });
  } catch (error: any) {
    request.log.error('Error updating workflow', error);
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Failed to update workflow',
    });
  }
}

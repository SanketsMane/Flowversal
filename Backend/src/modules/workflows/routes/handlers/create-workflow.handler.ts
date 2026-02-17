import { FastifyReply, FastifyRequest } from 'fastify';
import { sanitizeInput, stripHtml } from '../../../../core/utils/sanitizer.util';
import { userService } from '../../../users/services/user.service';
import { workflowValidationService } from '../../services/workflow-validation.service';
import { workflowService } from '../../services/workflow.service';
import { CreateWorkflowBody } from '../types/workflow-routes.types';

export async function createWorkflowHandler(
  request: FastifyRequest<{ Body: CreateWorkflowBody }>,
  reply: FastifyReply
): Promise<void> {
  if (!request.user) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'User not authenticated',
    });
  }

  try {
    const workflowData = {
      ...request.body,
      name: stripHtml(request.body.name),
      description: sanitizeInput(request.body.description || '')
    };

    // Validate workflow before saving
    const validation = workflowValidationService.validateWorkflow(workflowData);
    workflowValidationService.logValidationResult(validation, workflowData.name);

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

    // Get or create user from MongoDB
    const dbUser = await userService.getOrCreateUserFromSupabase(request.user.id);

    const workflow = await workflowService.createWorkflow({
      ...workflowData,
      userId: dbUser._id.toString(),
      userName: dbUser.email,
    });

    return reply.code(201).send({
      success: true,
      data: workflow,
      warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
    });
  } catch (error: any) {
    request.log.error('Error creating workflow', error);
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Failed to create workflow',
    });
  }
}

import { FastifyRequest, FastifyReply } from 'fastify';
import { workflowService } from '../../services/workflow.service';
import { userService } from '../../../users/services/user.service';
import { validateListWorkflowsQuery } from '../validators/query.validator';
import { ListWorkflowsQuery } from '../types/workflow-routes.types';

export async function listWorkflowsHandler(
  request: FastifyRequest<{ Querystring: ListWorkflowsQuery }>,
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
    const query = request.query;

    // Validate and parse query parameters
    const { isValid, errors, parsed } = validateListWorkflowsQuery(query);
    if (!isValid) {
      return reply.code(400).send({
        success: false,
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: errors,
      });
    }

    // Add user ID to filters
    parsed.filters.userId = dbUser._id.toString();

    const result = await workflowService.listWorkflows(parsed.filters, parsed.page, parsed.limit);

    return reply.send({
      success: true,
      data: result.workflows,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error: any) {
    request.log.error('Error listing workflows:', error);
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Failed to list workflows',
    });
  }
}

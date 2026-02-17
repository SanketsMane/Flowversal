import { FastifyReply, FastifyRequest } from 'fastify';
import { userService } from '../../../users/services/user.service';
import { taskService } from '../../services/task.service';
import { ListTasksQuery } from '../types/task-routes.types';
import { validateListTasksQuery } from '../validators/query.validator';

export async function listTasksHandler(
  request: FastifyRequest<{ Querystring: ListTasksQuery }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // Use cached dbUser if available (from auth middleware), otherwise fetch it
    // This fixes BUG-TASK-003 (N+1 query problem)
    const dbUser = request.user?.dbUser || await userService.getOrCreateUserFromSupabase(request.user!.id);
    const query = request.query;

    // Validate query parameters
    const { isValid, errors } = validateListTasksQuery(query);
    if (!isValid) {
      return reply.code(400).send({
        success: false,
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: errors,
      });
    }

    const tasks = await taskService.getTasks(dbUser._id.toString(), {
      projectId: query.projectId,
      boardId: query.boardId,
      status: query.status,
      priority: query.priority,
      assignedTo: query.assignedTo,
    });

    return reply.send({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error: any) {
    request.log.error('Error listing tasks:', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch tasks. Please try again.',
      details: error.message,
    });
  }
}

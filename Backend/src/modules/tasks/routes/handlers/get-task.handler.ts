import { FastifyReply, FastifyRequest } from 'fastify';
import { userService } from '../../../users/services/user.service';
import { taskService } from '../../services/task.service';


export async function getTaskHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
): Promise<void> {


  try {
    // Use standardized hydrated user from auth.plugin.ts - Author: Sanket
    if (!request.user?.dbUser) {
        return reply.code(401).send({ success: false, error: 'Unauthorized', message: 'Auth required' });
    }
    const dbUser = request.user.dbUser;
    const { id } = request.params;

    const task = await taskService.getTaskById(id, dbUser._id.toString());

    if (!task) {
      return reply.code(404).send({
        success: false,
        error: 'Not Found',
        message: 'Task not found',
      });
    }

    return reply.send({
      success: true,
      data: task,
    });
  } catch (error: any) {
    request.log.error('Error getting task:', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch task. Please try again.',
      details: error.message,
    });
  }
}

import { FastifyReply, FastifyRequest } from 'fastify';
import { userService } from '../../../users/services/user.service';
import { taskService } from '../../services/task.service';


export async function getTaskHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
): Promise<void> {


  try {
    // Use cached dbUser if available (from auth middleware), otherwise fetch it
    // This fixes BUG-TASK-003 (N+1 query problem)
    const dbUser = request.user?.dbUser || await userService.getOrCreateUserFromSupabase(request.user!.id);
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

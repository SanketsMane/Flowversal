import { FastifyRequest, FastifyReply } from 'fastify';
import { userService } from '../../../users/services/user.service';

export async function unfavoriteWorkflowHandler(
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
    const userModel = await userService.getUserModel(dbUser._id.toString());

    if (!userModel) {
      return reply.code(404).send({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    if (!userModel.favoriteWorkflows) {
      userModel.favoriteWorkflows = [];
    }

    userModel.favoriteWorkflows = userModel.favoriteWorkflows.filter(
      (id: any) => id.toString() !== request.params.id
    );
    await userModel.save();

    return reply.send({
      success: true,
      message: 'Workflow removed from favorites',
      data: { favorited: false },
    });
  } catch (error: any) {
    request.log.error('Error removing workflow from favorites:', error);
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: error.message || 'Failed to remove workflow from favorites',
    });
  }
}

import { FastifyRequest, FastifyReply } from 'fastify';
import { WorkflowModel } from '../../models/Workflow.model';
import { userService } from '../../../users/services/user.service';

export async function getFavoritesHandler(
  request: FastifyRequest,
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

    const favoriteIds = (userModel.favoriteWorkflows || []).map((id: any) => id.toString());

    if (favoriteIds.length === 0) {
      return reply.send({
        success: true,
        data: {
          workflows: [],
          total: 0,
        },
      });
    }

    const workflows = await WorkflowModel.find({
      _id: { $in: favoriteIds },
    }).sort({ updatedAt: -1 });

    return reply.send({
      success: true,
      data: {
        workflows,
        total: workflows.length,
      },
    });
  } catch (error: any) {
    request.log.error('Error listing favorite workflows:', error);
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: error.message || 'Failed to list favorite workflows',
    });
  }
}

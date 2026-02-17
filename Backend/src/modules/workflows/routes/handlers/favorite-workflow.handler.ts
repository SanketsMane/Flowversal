import { FastifyRequest, FastifyReply } from 'fastify';
import { WorkflowModel } from '../../models/Workflow.model';
import { userService } from '../../../users/services/user.service';

export async function favoriteWorkflowHandler(
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
    const dbUser = request.user.dbUser;
    if (!dbUser) {
      return reply.code(401).send({ success: false, error: 'Unauthorized', message: 'User data not found' });
    }
    const workflow = await WorkflowModel.findById(request.params.id);

    if (!workflow) {
      return reply.code(404).send({
        error: 'Not Found',
        message: 'Workflow not found',
      });
    }

    // Check if already favorited
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

    const mongoose = await import('mongoose');
    const workflowObjectId = new mongoose.Types.ObjectId(request.params.id);

    if (userModel.favoriteWorkflows.some((id: any) => id.toString() === request.params.id)) {
      return reply.send({
        success: true,
        message: 'Workflow already in favorites',
        data: { favorited: true },
      });
    }

    userModel.favoriteWorkflows.push(workflowObjectId);
    await userModel.save();

    return reply.send({
      success: true,
      message: 'Workflow added to favorites',
      data: { favorited: true },
    });
  } catch (error: any) {
    request.log.error('Error favoriting workflow:', error);
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Failed to favorite workflow',
    });
  }
}

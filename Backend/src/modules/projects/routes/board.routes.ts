import { FastifyPluginAsync } from 'fastify';
import { userService } from '../../users/services/user.service';
import { boardService } from '../services/board.service';

interface CreateBoardBody {
  name: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  projectId: string;
  configuration?: Record<string, any>;
}

interface UpdateBoardBody {
  name?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  configuration?: Record<string, any>;
}

interface ListBoardsQuery {
  projectId?: string;
}

const boardRoutes: FastifyPluginAsync = async (fastify) => {


  // Create board with best practices
  fastify.post<{ Body: CreateBoardBody }>('/', async (request, reply) => {


    try {
      const { name, description, icon, iconColor, projectId, configuration } = request.body as CreateBoardBody;

      // === INPUT VALIDATION ===
      const validationErrors: string[] = [];

      if (!name || typeof name !== 'string') {
        validationErrors.push('Board name is required and must be a string');
      } else if (name.trim().length === 0) {
        validationErrors.push('Board name cannot be empty');
      } else if (name.trim().length > 100) {
        validationErrors.push('Board name must be less than 100 characters');
      }

      if (!projectId || typeof projectId !== 'string') {
        validationErrors.push('Valid project ID is required');
      } else if (!/^[0-9a-fA-F]{24}$/.test(projectId)) {
        validationErrors.push('Project ID must be a valid MongoDB ObjectId');
      }

      if (description && typeof description !== 'string') {
        validationErrors.push('Description must be a string');
      } else if (description && description.length > 500) {
        validationErrors.push('Description must be less than 500 characters');
      }

      if (icon && typeof icon !== 'string') {
        validationErrors.push('Icon must be a string');
      }

      if (iconColor && typeof iconColor !== 'string') {
        validationErrors.push('Icon color must be a string');
      }

      if (validationErrors.length > 0) {
        return reply.code(400).send({
          success: false,
          error: 'Validation Error',
          message: 'Please correct the following errors:',
          details: validationErrors,
        });
      }

      // === BUSINESS LOGIC VALIDATION ===
      const dbUser = await userService.getOrCreateUserFromSupabase(request.user!.id, request.user);

      // Verify project exists and belongs to user
      const projectExists = await boardService.validateProjectOwnership(projectId!, dbUser._id.toString());
      if (!projectExists) {
        return reply.code(404).send({
          success: false,
          error: 'Not Found',
          message: 'Project not found or access denied',
        });
      }

      // Check for duplicate board names within this project
      const existingBoard = await boardService.getBoardByNameAndProject(name.trim(), projectId!, dbUser._id.toString());
      if (existingBoard) {
        return reply.code(409).send({
          success: false,
          error: 'Conflict',
          message: 'A board with this name already exists in the project',
        });
      }

      // === CREATE BOARD ===
      const boardData = {
          name: name.trim(),
        description: description?.trim() || '',
        icon: icon || '📋', // Default board icon
        iconColor: iconColor || '#10b981', // Default emerald color
        projectId: projectId!,
        configuration: configuration || {},
      };

      const board = await boardService.createBoard(boardData, dbUser._id.toString());

      // === AUDIT LOGGING ===
      fastify.log.info({
        event: 'board_created',
        userId: request.user!.id,
        projectId: projectId,
        boardId: board._id,
        boardName: board.name,
        timestamp: new Date().toISOString(),
      });

      return reply.code(201).send({
        success: true,
        data: {
          id: board._id,
          name: board.name,
          description: board.description,
          icon: board.icon,
          iconColor: board.iconColor,
          projectId: board.projectId,
          configuration: board.configuration,
          createdAt: board.createdAt,
          updatedAt: board.updatedAt,
        },
        message: 'Board created successfully',
      });

    } catch (error: any) {
      fastify.log.error({
        msg: 'Error creating board',
        error: error.message,
        stack: error.stack,
        userId: request.user?.id,
        body: request.body,
      });

      // Handle specific database errors
      if (error.code === 11000) { // Duplicate key error
        return reply.code(409).send({
          success: false,
          error: 'Conflict',
          message: 'A board with this name already exists in the project',
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to create board. Please try again.',
      });
    }
  });

  // List boards
  fastify.get<{ Querystring: ListBoardsQuery }>('/', async (request, reply) => {


    try {
      const dbUser = await userService.getOrCreateUserFromSupabase(request.user!.id, request.user);
      const query = request.query as ListBoardsQuery;

      const boards = await boardService.getBoards(dbUser._id.toString(), query.projectId);

      return reply.send({
        success: true,
        data: boards,
        count: boards.length,
      });
    } catch (error: any) {
      fastify.log.error('Error listing boards:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch boards. Please try again.',
        details: error.message,
      });
    }
  });

  // Get board by ID
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {


    try {
      const dbUser = await userService.getOrCreateUserFromSupabase(request.user!.id, request.user);
      const { id } = request.params;

      const board = await boardService.getBoardById(id, dbUser._id.toString());

      if (!board) {
        return reply.code(404).send({
          success: false,
          error: 'Not Found',
          message: 'Board not found',
        });
      }

      return reply.send({
        success: true,
        data: board,
      });
    } catch (error: any) {
      fastify.log.error('Error getting board:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to fetch board. Please try again.',
        details: error.message,
      });
    }
  });

  // Update board
  fastify.put<{ Params: { id: string }; Body: UpdateBoardBody }>('/:id', async (request, reply) => {


    try {
      const dbUser = await userService.getOrCreateUserFromSupabase(request.user!.id, request.user);
      const { id } = request.params;
      const updateData = request.body as UpdateBoardBody;

      if (updateData.name !== undefined && !updateData.name.trim()) {
        return reply.code(400).send({
          success: false,
          error: 'Validation Error',
          message: 'Board name cannot be empty',
        });
      }

      const board = await boardService.updateBoard(id, dbUser._id.toString(), updateData);

      if (!board) {
        return reply.code(404).send({
          success: false,
          error: 'Not Found',
          message: 'Board not found',
        });
      }

      return reply.send({
        success: true,
        data: board,
        message: 'Board updated successfully',
      });
    } catch (error: any) {
      fastify.log.error('Error updating board:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update board. Please try again.',
        details: error.message,
      });
    }
  });

  // Delete board
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {


    try {
      const dbUser = await userService.getOrCreateUserFromSupabase(request.user!.id, request.user);
      const { id } = request.params;

      const result = await boardService.deleteBoard(id, dbUser._id.toString());

      return reply.send({
        success: true,
        message: 'Board deleted successfully',
        deleted: result,
      });
    } catch (error: any) {
      fastify.log.error('Error deleting board:', error);
      
      if (error.message === 'Board not found') {
        return reply.code(404).send({
          success: false,
          error: 'Not Found',
          message: 'Board not found',
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to delete board. Please try again.',
        details: error.message,
      });
    }
  });
};

export default boardRoutes;


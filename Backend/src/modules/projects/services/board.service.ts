import { BoardModel, IBoard } from '../models/Board.model';
import { TaskModel } from '../../tasks/models/Task.model';
import { Types } from 'mongoose';

export interface CreateBoardData {
  name: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  projectId: string;
  configuration?: Record<string, any>;
}

export interface UpdateBoardData {
  name?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  configuration?: Record<string, any>;
}

export class BoardService {
  /**
   * Create a new board
   */
  async createBoard(data: CreateBoardData, userId: string): Promise<IBoard> {
    const board = new BoardModel({
      ...data,
      projectId: new Types.ObjectId(data.projectId),
      userId: new Types.ObjectId(userId),
      icon: data.icon || 'Folder',
      iconColor: data.iconColor || '#3B82F6',
      configuration: data.configuration || {},
    });

    return board.save();
  }

  /**
   * Get board by ID
   */
  async getBoardById(boardId: string, userId: string): Promise<IBoard | null> {
    const board = await BoardModel.findOne({
      _id: boardId,
      userId: new Types.ObjectId(userId),
    });

    return board;
  }

  /**
   * Check if project exists and belongs to user
   */
  async validateProjectOwnership(projectId: string, userId: string): Promise<boolean> {
    const ProjectModel = (await import('../models/Project.model')).ProjectModel;
    const project = await ProjectModel.findOne({
      _id: projectId,
      userId: new Types.ObjectId(userId),
    });
    return !!project;
  }

  /**
   * Get board by name and project (for uniqueness validation)
   */
  async getBoardByNameAndProject(name: string, projectId: string, userId: string): Promise<IBoard | null> {
    const board = await BoardModel.findOne({
      name: name.trim(),
      projectId: new Types.ObjectId(projectId),
      userId: new Types.ObjectId(userId),
    });

    return board;
  }

  /**
   * Get all boards for a user (optionally filtered by project)
   */
  async getBoards(userId: string, projectId?: string): Promise<IBoard[]> {
    const query: any = { userId: new Types.ObjectId(userId) };

    if (projectId) {
      query.projectId = new Types.ObjectId(projectId);
    }

    return BoardModel.find(query).sort({ createdAt: -1 });
  }

  /**
   * Update a board
   */
  async updateBoard(
    boardId: string,
    userId: string,
    data: UpdateBoardData
  ): Promise<IBoard | null> {
    const board = await BoardModel.findOneAndUpdate(
      {
        _id: boardId,
        userId: new Types.ObjectId(userId),
      },
      {
        ...data,
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return board;
  }

  /**
   * Delete a board and all associated tasks
   */
  async deleteBoard(boardId: string, userId: string): Promise<{
    board: string;
    tasks: number;
  }> {
    // Verify ownership
    const board = await BoardModel.findOne({
      _id: boardId,
      userId: new Types.ObjectId(userId),
    });

    if (!board) {
      throw new Error('Board not found');
    }

    // Delete all tasks in this board
    const taskResult = await TaskModel.deleteMany({
      boardId: new Types.ObjectId(boardId),
      userId: new Types.ObjectId(userId),
    });

    // Delete the board
    await BoardModel.deleteOne({
      _id: boardId,
      userId: new Types.ObjectId(userId),
    });

    return {
      board: boardId,
      tasks: taskResult.deletedCount || 0,
    };
  }
}

export const boardService = new BoardService();


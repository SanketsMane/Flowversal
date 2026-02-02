import { TaskModel, ITask } from '../models/Task.model';
import { Types } from 'mongoose';
import { taskWorkflowService } from './task-workflow.service';

export interface CreateTaskData {
  name: string;
  description?: string;
  assignedTo?: Array<{ id: string; name: string; avatar?: string; email?: string }>;
  status?: string;
  priority?: string;
  labels?: string[];
  dueDate?: string;
  startDate?: string;
  recurring?: string;
  reminder?: string;
  selectedDays?: string[];
  hasWorkflow?: boolean;
  boardId: string;
  projectId: string;
  createdBy?: { id: string; name: string; avatar?: string };
  order?: number;
  checklists?: any[];
  comments?: any[];
  attachments?: any[];
  workflows?: any[];
}

export interface UpdateTaskData {
  name?: string;
  description?: string;
  assignedTo?: Array<{ id: string; name: string; avatar?: string; email?: string }>;
  status?: string;
  priority?: string;
  labels?: string[];
  dueDate?: string;
  startDate?: string;
  recurring?: string;
  reminder?: string;
  selectedDays?: string[];
  hasWorkflow?: boolean;
  boardId?: string;
  projectId?: string;
  order?: number;
  checklists?: any[];
  comments?: any[];
  attachments?: any[];
  workflows?: any[];
}

export interface TaskFilters {
  userId?: string;
  projectId?: string;
  boardId?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
}

export class TaskService {
  /**
   * Generate a unique task ID (TSK-001, TSK-002, etc.)
   */
  private async generateTaskId(userId: string): Promise<string> {
    // Find the highest TSK-XXX number across all tasks to ensure uniqueness
    const lastTask = await TaskModel.findOne(
      { taskId: /^TSK-\d+$/ },
      { taskId: 1 }
    ).sort({ taskId: -1 }).limit(1);

    let nextNumber = 1;
    if (lastTask && lastTask.taskId) {
      const match = lastTask.taskId.match(/TSK-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    return `TSK-${String(nextNumber).padStart(3, '0')}`;
  }

  /**
   * Create a new task
   */
  async createTask(data: CreateTaskData, userId: string): Promise<ITask> {
    const taskId = await this.generateTaskId(userId);

    const task = new TaskModel({
      taskId,
      name: data.name,
      description: data.description || '',
      assignedTo: data.assignedTo || [],
      status: data.status || 'To do',
      priority: data.priority || 'Medium',
      labels: data.labels || [],
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      recurring: data.recurring || 'Never',
      reminder: data.reminder || 'None',
      selectedDays: data.selectedDays || [],
      hasWorkflow: data.hasWorkflow || false,
      checklists: data.checklists || [],
      comments: data.comments || [],
      attachments: data.attachments || [],
      attachedWorkflows: data.workflows || [],
      boardId: new Types.ObjectId(data.boardId),
      projectId: new Types.ObjectId(data.projectId),
      createdBy: data.createdBy || { id: userId, name: 'User', avatar: 'U' },
      order: data.order !== undefined ? data.order : await this.getNextOrder(data.boardId),
      userId: new Types.ObjectId(userId),
    });

    return task.save();
  }

  /**
   * Get the next order number for a board
   */
  private async getNextOrder(boardId: string): Promise<number> {
    const lastTask = await TaskModel.findOne({
      boardId: new Types.ObjectId(boardId),
    })
      .sort({ order: -1 })
      .limit(1);

    return lastTask ? (lastTask.order || 0) + 1 : 0;
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: string, userId: string): Promise<ITask | null> {
    const task = await TaskModel.findOne({
      _id: taskId,
      userId: new Types.ObjectId(userId),
    });

    return task;
  }

  /**
   * Validate board exists and belongs to user
   */
  async validateBoardOwnership(boardId: string, userId: string): Promise<boolean> {
    const BoardModel = (await import('../../projects/models/Board.model')).BoardModel;
    const board = await BoardModel.findOne({
      _id: boardId,
      userId: new Types.ObjectId(userId),
    });
    return !!board;
  }

  /**
   * Validate project exists and belongs to user
   */
  async validateProjectOwnership(projectId: string, userId: string): Promise<boolean> {
    const ProjectModel = (await import('../../projects/models/Project.model')).ProjectModel;
    const project = await ProjectModel.findOne({
      _id: projectId,
      userId: new Types.ObjectId(userId),
    });
    return !!project;
  }

  /**
   * Get all tasks with optional filters
   */
  async getTasks(userId: string, filters?: TaskFilters): Promise<ITask[]> {
    const query: any = { userId: new Types.ObjectId(userId) };

    if (filters?.projectId) {
      query.projectId = new Types.ObjectId(filters.projectId);
    }

    if (filters?.boardId) {
      query.boardId = new Types.ObjectId(filters.boardId);
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.priority) {
      query.priority = filters.priority;
    }

    if (filters?.assignedTo) {
      query['assignedTo.id'] = filters.assignedTo;
    }

    return TaskModel.find(query).sort({ order: 1, createdAt: -1 });
  }

  /**
   * Update a task
   */
  async updateTask(
    taskId: string,
    userId: string,
    data: UpdateTaskData
  ): Promise<ITask | null> {
    // Get current task to detect status changes
    const currentTask = await TaskModel.findOne({
      _id: taskId,
      userId: new Types.ObjectId(userId),
    });

    if (!currentTask) {
      return null;
    }

    const oldStatus = currentTask.status;
    const newStatus = data.status;

    const updateData: any = {
      updatedAt: new Date(),
    };

    // Only include fields that are provided
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.labels !== undefined) updateData.labels = data.labels;
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
    }
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate ? new Date(data.startDate) : undefined;
    }
    if (data.recurring !== undefined) updateData.recurring = data.recurring;
    if (data.reminder !== undefined) updateData.reminder = data.reminder;
    if (data.selectedDays !== undefined) updateData.selectedDays = data.selectedDays;
    if (data.hasWorkflow !== undefined) updateData.hasWorkflow = data.hasWorkflow;
    if (data.checklists !== undefined) updateData.checklists = data.checklists;
    if (data.comments !== undefined) updateData.comments = data.comments;
    if (data.attachments !== undefined) updateData.attachments = data.attachments;
    if (data.workflows !== undefined) updateData.attachedWorkflows = data.workflows;
    if (data.order !== undefined) updateData.order = data.order;

    if (data.boardId) {
      updateData.boardId = new Types.ObjectId(data.boardId);
    }

    if (data.projectId) {
      updateData.projectId = new Types.ObjectId(data.projectId);
    }

    const task = await TaskModel.findOneAndUpdate(
      {
        _id: taskId,
        userId: new Types.ObjectId(userId),
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    // Trigger workflows if status changed
    if (task && newStatus && oldStatus !== newStatus) {
      // Trigger workflows asynchronously (don't block the update)
      taskWorkflowService.triggerWorkflowsOnStatusChange(
        taskId,
        oldStatus,
        newStatus,
        userId
      ).catch((error: unknown) => {
        console.error(`Error triggering workflows for task ${taskId}:`, error);
      });
    }

    return task;
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string, userId: string): Promise<void> {
    const result = await TaskModel.deleteOne({
      _id: taskId,
      userId: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new Error('Task not found');
    }
  }
}

export const taskService = new TaskService();


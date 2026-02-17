import { Types } from 'mongoose';
import { TaskModel } from '../../tasks/models/Task.model';
import { BoardModel } from '../models/Board.model';
import { IProject, ProjectModel } from '../models/Project.model';

export interface CreateProjectData {
  name: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  configuration?: Record<string, any>;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  configuration?: Record<string, any>;
}

export class ProjectService {
  /**
   * Create a new project
   */
  async createProject(data: CreateProjectData, userId: string): Promise<IProject> {
    const project = new ProjectModel({
      ...data,
      userId: new Types.ObjectId(userId),
      icon: data.icon || 'Briefcase',
      iconColor: data.iconColor || '#3B82F6',
      configuration: data.configuration || {},
    });

    return project.save();
  }

  /**
   * Get project by ID
   */
  async getProjectById(projectId: string, userId: string): Promise<IProject | null> {
    const project = await ProjectModel.findOne({
      _id: projectId,
      userId: new Types.ObjectId(userId),
    });

    return project;
  }

  /**
   * Get project by name and user (for uniqueness validation)
   */
  async getProjectByNameAndUser(name: string, userId: string): Promise<IProject | null> {
    const project = await ProjectModel.findOne({
      name: name.trim(),
      userId: new Types.ObjectId(userId),
    });

    return project;
  }

  /**
   * Get all projects for a user
   */
  async getProjects(userId: string, search?: string): Promise<IProject[]> {
    const query: any = { userId: new Types.ObjectId(userId) };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    return ProjectModel.find(query).sort({ createdAt: -1 });
  }

  /**
   * Update a project
   */
  async updateProject(
    projectId: string,
    userId: string,
    data: UpdateProjectData
  ): Promise<IProject | null> {
    const project = await ProjectModel.findOneAndUpdate(
      {
        _id: projectId,
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

    return project;
  }

  /**
  /**
   * Delete a project and all associated boards and tasks with cascade deletion
   * Author: Sanket - BUG-FIX: Added cascade deletes for workflow data
   */
  async deleteProject(projectId: string, userId: string): Promise<{
    project: string;
    boards: number;
    tasks: number;
    workflowExecutions: number;
    approvalRequests: number;
    breakpointStates: number;
  }> {
    // Verify ownership
    const project = await ProjectModel.findOne({
      _id: projectId,
      userId: new Types.ObjectId(userId),
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Get all boards in this project
    const boards = await BoardModel.find({
      projectId: new Types.ObjectId(projectId),
      userId: new Types.ObjectId(userId),
    });

    const boardIds = boards.map((b: any) => b._id);

    // STEP 1: Get all task IDs in these boards
    const tasks = await TaskModel.find({
      boardId: { $in: boardIds },
      userId: new Types.ObjectId(userId),
    }).select('_id');

    const taskIds = tasks.map(t => t._id);

    // STEP 2: Delete workflow executions related to these tasks
    let execDeleteCount = 0;
    let approvalDeleteCount = 0;
    let breakpointDeleteCount = 0;

    if (taskIds.length > 0) {
      try {
        const { WorkflowExecutionModel } = await import('../../workflows/models/WorkflowExecution.model');
        const execResult = await WorkflowExecutionModel.deleteMany({
          $or: [
            { 'metadata.taskId': { $in: taskIds } },
            { 'context.taskId': { $in: taskIds } },
          ]
        });
        execDeleteCount = execResult.deletedCount || 0;
      } catch (err) {
        console.warn('Could not delete workflow executions:', err);
      }

      // STEP 3 & 4: Approval requests and breakpoint states are embedded in workflow executions
      // so they are deleted automatically when executions are deleted.
    }

    // STEP 5: Delete all tasks in these boards
    const taskResult = await TaskModel.deleteMany({
      boardId: { $in: boardIds },
      userId: new Types.ObjectId(userId),
    });

    // STEP 6: Delete all boards
    const boardResult = await BoardModel.deleteMany({
      projectId: new Types.ObjectId(projectId),
      userId: new Types.ObjectId(userId),
    });

    // STEP 7: Delete the project
    await ProjectModel.deleteOne({
      _id: projectId,
      userId: new Types.ObjectId(userId),
    });

    return {
      project: projectId,
      boards: boardResult.deletedCount || 0,
      tasks: taskResult.deletedCount || 0,
      workflowExecutions: execDeleteCount,
      approvalRequests: approvalDeleteCount,
      breakpointStates: breakpointDeleteCount,
    };
  }
}

export const projectService = new ProjectService();


import { WorkflowModel, IWorkflow } from '../../../models/Workflow.model';
import { CreateWorkflowData, UpdateWorkflowData } from '../workflow-service.types';

export class WorkflowCrudService {
  /**
   * Create a new workflow
   */
  async createWorkflow(data: CreateWorkflowData): Promise<IWorkflow> {
    const workflow = new WorkflowModel({
      ...data,
      status: data.status || 'draft',
      isPublic: data.isPublic || false,
      tags: data.tags || [],
      stats: {
        executions: 0,
        avgExecutionTime: 0,
        successRate: 0,
      },
      version: 1,
    });

    return workflow.save();
  }

  /**
   * Get workflow by ID
   */
  async getWorkflowById(workflowId: string, userId?: string): Promise<IWorkflow | null> {
    const workflow = await WorkflowModel.findById(workflowId);

    if (!workflow) {
      return null;
    }

    // Check access: user can only access their own workflows or public workflows
    if (userId && workflow.userId.toString() !== userId) {
      if (!workflow.isPublic || workflow.status !== 'published') {
        return null;
      }
    }

    return workflow;
  }

  /**
   * Update workflow
   */
  async updateWorkflow(
    workflowId: string,
    userId: string,
    data: UpdateWorkflowData
  ): Promise<IWorkflow | null> {
    const workflow = await WorkflowModel.findOne({
      _id: workflowId,
      userId: userId,
    });

    if (!workflow) {
      return null;
    }

    // Update fields
    Object.assign(workflow, data);
    workflow.updatedAt = new Date();

    return workflow.save();
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: string, userId: string): Promise<boolean> {
    const result = await WorkflowModel.findOneAndDelete({
      _id: workflowId,
      userId: userId,
    });

    return result !== null;
  }

  /**
   * Publish workflow
   */
  async publishWorkflow(workflowId: string, userId: string): Promise<IWorkflow | null> {
    return this.updateWorkflow(workflowId, userId, {
      status: 'published',
    });
  }

  /**
   * Archive workflow
   */
  async archiveWorkflow(workflowId: string, userId: string): Promise<IWorkflow | null> {
    return this.updateWorkflow(workflowId, userId, {
      status: 'archived',
    });
  }
}

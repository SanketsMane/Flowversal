import { WorkflowModel } from '../../../models/Workflow.model';
import { WorkflowFilters, WorkflowListResult, ImportWorkflowOptions, CreateWorkflowData } from '../workflow-service.types';
import { WorkflowCrudService } from '../crud/workflow-crud.service';

export class WorkflowManagementService {
  private crudService = new WorkflowCrudService();

  /**
   * List workflows with filtering and pagination
   */
  async listWorkflows(
    filters: WorkflowFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<WorkflowListResult> {
    const skip = (page - 1) * limit;
    const query: any = {};

    // Apply filters
    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.isPublic !== undefined) {
      query.isPublic = filters.isPublic;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { tags: { $in: [new RegExp(filters.search, 'i')] } },
      ];
    }

    const [workflows, total] = await Promise.all([
      WorkflowModel.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      WorkflowModel.countDocuments(query),
    ]);

    return {
      workflows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get user's workflows
   */
  async getUserWorkflows(userId: string, page: number = 1, limit: number = 20): Promise<WorkflowListResult> {
    return this.listWorkflows({ userId }, page, limit);
  }

  /**
   * Get public workflows
   */
  async getPublicWorkflows(page: number = 1, limit: number = 20): Promise<WorkflowListResult> {
    return this.listWorkflows(
      {
        isPublic: true,
        status: 'published',
      },
      page,
      limit
    );
  }

  /**
   * Update workflow stats after execution
   */
  async updateExecutionStats(
    workflowId: string,
    executionTime: number,
    success: boolean
  ): Promise<void> {
    const workflow = await WorkflowModel.findById(workflowId);
    if (!workflow) {
      return;
    }

    const stats = workflow.stats;
    const totalExecutions = stats.executions + 1;
    const successCount = success
      ? Math.round((stats.successRate / 100) * stats.executions) + 1
      : Math.round((stats.successRate / 100) * stats.executions);

    const newAvgTime = (stats.avgExecutionTime * stats.executions + executionTime) / totalExecutions;
    const newSuccessRate = (successCount / totalExecutions) * 100;

    workflow.stats = {
      executions: totalExecutions,
      lastExecuted: new Date(),
      avgExecutionTime: Math.round(newAvgTime),
      successRate: Math.round(newSuccessRate),
    };

    await workflow.save();
  }

  /**
   * Export workflow to JSON format
   */
  async exportWorkflow(workflowId: string, userId: string): Promise<any> {
    const workflow = await this.crudService.getWorkflowById(workflowId, userId);

    if (!workflow) {
      throw new Error('Workflow not found or unauthorized');
    }

    // Redact sensitive information from node configs
    const redactSensitiveData = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(redactSensitiveData);
      }

      const redacted: any = {};
      const sensitiveKeys = ['apiKey', 'api_key', 'password', 'secret', 'token', 'accessToken', 'access_token'];

      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
          redacted[key] = '[REDACTED]';
        } else {
          redacted[key] = redactSensitiveData(value);
        }
      }

      return redacted;
    };

    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      workflow: {
        name: workflow.name,
        description: workflow.description,
        category: workflow.category,
        tags: workflow.tags,
        icon: workflow.icon,
        coverImage: workflow.coverImage,
        triggers: redactSensitiveData(workflow.triggers),
        containers: redactSensitiveData(workflow.containers),
        formFields: redactSensitiveData(workflow.formFields),
        triggerLogic: redactSensitiveData(workflow.triggerLogic),
        metadata: {
          originalId: workflow._id.toString(),
          originalUserId: workflow.userId.toString(),
          originalUserName: workflow.userName,
          version: workflow.version,
          status: workflow.status,
          isPublic: workflow.isPublic,
        },
      },
    };

    return exportData;
  }

  /**
   * Import workflow from JSON format
   */
  async importWorkflow(
    importData: any,
    userId: string,
    userName: string,
    options: ImportWorkflowOptions = {}
  ): Promise<any> {
    // Validate import data structure
    if (!importData.workflow) {
      throw new Error('Invalid import format: missing workflow data');
    }

    const workflowData = importData.workflow;

    // Validate required fields
    if (!workflowData.name) {
      throw new Error('Invalid import format: workflow name is required');
    }

    // Map old node types to new ones if needed
    const mapNodeTypes = (nodes: any[]): any[] => {
      return nodes.map(node => {
        // Map legacy node types
        if (node.type === 'condition') {
          node.type = 'conditional';
        } else if (node.type === 'action') {
          node.type = 'integration';
        }

        // Recursively map child nodes
        if (node.nodes && Array.isArray(node.nodes)) {
          node.nodes = mapNodeTypes(node.nodes);
        }

        return node;
      });
    };

    // Process containers
    let containers = workflowData.containers || [];
    if (containers.length > 0) {
      containers = mapNodeTypes(containers);
    }

    // Create workflow data
    const createData: CreateWorkflowData = {
      name: workflowData.name,
      description: workflowData.description || '',
      userId,
      userName,
      triggers: workflowData.triggers || [],
      containers,
      formFields: workflowData.formFields || [],
      triggerLogic: workflowData.triggerLogic || [],
      status: 'draft',
      isPublic: false,
      category: workflowData.category,
      tags: workflowData.tags || [],
      icon: workflowData.icon,
      coverImage: workflowData.coverImage,
    };

    return this.crudService.createWorkflow(createData);
  }

  /**
   * Validate workflow structure
   */
  validateWorkflowStructure(workflowData: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!workflowData) {
      errors.push('Workflow data is required');
      return { valid: false, errors };
    }

    if (!workflowData.name || typeof workflowData.name !== 'string') {
      errors.push('Workflow name is required and must be a string');
    }

    if (workflowData.containers && !Array.isArray(workflowData.containers)) {
      errors.push('Containers must be an array');
    }

    if (workflowData.triggers && !Array.isArray(workflowData.triggers)) {
      errors.push('Triggers must be an array');
    }

    return { valid: errors.length === 0, errors };
  }
}

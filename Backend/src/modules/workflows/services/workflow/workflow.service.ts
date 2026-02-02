import { WorkflowCrudService } from './crud/workflow-crud.service';
import { WorkflowManagementService } from './management/workflow-management.service';
import { CreateWorkflowData, UpdateWorkflowData, WorkflowFilters } from './workflow-service.types';

export class WorkflowService {
  private crudService = new WorkflowCrudService();
  private managementService = new WorkflowManagementService();

  /**
   * Create a new workflow
   */
  async createWorkflow(data: CreateWorkflowData): Promise<any> {
    return this.crudService.createWorkflow(data);
  }

  /**
   * Get workflow by ID
   */
  async getWorkflowById(workflowId: string, userId?: string): Promise<any> {
    return this.crudService.getWorkflowById(workflowId, userId);
  }

  /**
   * Update workflow
   */
  async updateWorkflow(
    workflowId: string,
    userId: string,
    data: UpdateWorkflowData
  ): Promise<any> {
    return this.crudService.updateWorkflow(workflowId, userId, data);
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: string, userId: string): Promise<boolean> {
    return this.crudService.deleteWorkflow(workflowId, userId);
  }

  /**
   * Publish workflow
   */
  async publishWorkflow(workflowId: string, userId: string): Promise<any> {
    return this.crudService.publishWorkflow(workflowId, userId);
  }

  /**
   * Archive workflow
   */
  async archiveWorkflow(workflowId: string, userId: string): Promise<any> {
    return this.crudService.archiveWorkflow(workflowId, userId);
  }

  /**
   * Update workflow stats after execution
   */
  async updateExecutionStats(
    workflowId: string,
    executionTime: number,
    success: boolean
  ): Promise<void> {
    return this.managementService.updateExecutionStats(workflowId, executionTime, success);
  }

  /**
   * Get user's workflows
   */
  async getUserWorkflows(userId: string, page: number = 1, limit: number = 20) {
    return this.managementService.getUserWorkflows(userId, page, limit);
  }

  /**
   * Get public workflows
   */
  async getPublicWorkflows(page: number = 1, limit: number = 20) {
    return this.managementService.getPublicWorkflows(page, limit);
  }

  /**
   * List workflows with filtering
   */
  async listWorkflows(filters: WorkflowFilters, page: number = 1, limit: number = 20) {
    return this.managementService.listWorkflows(filters, page, limit);
  }

  /**
   * Export workflow to JSON format
   */
  async exportWorkflow(workflowId: string, userId: string): Promise<any> {
    return this.managementService.exportWorkflow(workflowId, userId);
  }

  /**
   * Import workflow from JSON format
   */
  async importWorkflow(
    importData: any,
    userId: string,
    userName: string,
    options: any = {}
  ): Promise<any> {
    return this.managementService.importWorkflow(importData, userId, userName, options);
  }

  /**
   * Validate workflow structure
   */
  validateWorkflowStructure(workflowData: any): { valid: boolean; errors: string[] } {
    return this.managementService.validateWorkflowStructure(workflowData);
  }
}

// Export service instance for backward compatibility
export const workflowService = new WorkflowService();

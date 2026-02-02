// Re-export from the refactored modules
export { WorkflowService, workflowService } from './workflow/workflow.service';
export type {
  CreateWorkflowData,
  UpdateWorkflowData,
  WorkflowFilters,
  WorkflowListResult,
  ImportWorkflowOptions,
  WorkflowValidationResult
} from './workflow/workflow-service.types';
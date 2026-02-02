// Re-export from the refactored module
export { WorkflowExecutionService } from './workflow-execution/index';

// Legacy exports for backward compatibility
export type { ExecutionInput, ExecutionContext, WorkflowExecutionOptions } from './workflow-execution/index';

// Legacy service instance export
export { workflowExecutionService } from './workflow-execution/workflow-execution.service';


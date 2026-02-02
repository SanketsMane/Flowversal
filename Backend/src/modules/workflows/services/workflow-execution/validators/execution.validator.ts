import { ExecutionInput } from '../types/workflow-execution.types';

export function validateExecutionInput(input: ExecutionInput): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate input structure
  if (input && typeof input !== 'object') {
    errors.push('Execution input must be an object');
    return { isValid: false, errors };
  }

  // Check for potentially dangerous input patterns
  if (input) {
    const inputStr = JSON.stringify(input);

    // Prevent extremely large inputs
    if (inputStr.length > 10 * 1024 * 1024) { // 10MB limit
      errors.push('Execution input is too large (max 10MB)');
    }

    // Prevent deeply nested objects (potential DoS)
    const maxDepth = getMaxDepth(input);
    if (maxDepth > 10) {
      errors.push('Execution input has too many nested levels (max depth: 10)');
    }
  }

  return { isValid: errors.length === 0, errors };
}

function getMaxDepth(obj: any, currentDepth: number = 0): number {
  if (currentDepth >= 10) return currentDepth;

  let maxDepth = currentDepth;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (typeof item === 'object' && item !== null) {
        maxDepth = Math.max(maxDepth, getMaxDepth(item, currentDepth + 1));
      }
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null) {
        maxDepth = Math.max(maxDepth, getMaxDepth(value, currentDepth + 1));
      }
    }
  }

  return maxDepth;
}

export function validateWorkflowId(workflowId: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!workflowId || typeof workflowId !== 'string') {
    errors.push('Workflow ID is required and must be a string');
  } else if (!/^[0-9a-fA-F]{24}$/.test(workflowId)) {
    errors.push('Workflow ID must be a valid MongoDB ObjectId');
  }

  return { isValid: errors.length === 0, errors };
}

export function validateExecutionId(executionId: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!executionId || typeof executionId !== 'string') {
    errors.push('Execution ID is required and must be a string');
  } else if (!/^[0-9a-fA-F]{24}$/.test(executionId)) {
    errors.push('Execution ID must be a valid MongoDB ObjectId');
  }

  return { isValid: errors.length === 0, errors };
}

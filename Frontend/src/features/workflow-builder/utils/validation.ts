/**
 * Workflow Validation Utilities
 * Provides real-time validation for workflow elements
 */

import { WorkflowNode, WorkflowTrigger, WorkflowContainer } from '../types';

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  message: string;
  field?: string;
}

export interface NodeValidation {
  nodeId: string;
  isValid: boolean;
  issues: ValidationIssue[];
}

export interface TriggerValidation {
  triggerId: string;
  isValid: boolean;
  issues: ValidationIssue[];
}

export interface WorkflowValidation {
  isValid: boolean;
  nodes: Map<string, NodeValidation>;
  triggers: Map<string, TriggerValidation>;
  globalIssues: ValidationIssue[];
}

/**
 * Validate a single node
 */
export function validateNode(node: WorkflowNode): NodeValidation {
  const issues: ValidationIssue[] = [];

  // Check if node has a type
  if (!node.type) {
    issues.push({
      id: `${node.id}-no-type`,
      severity: 'error',
      message: 'Node type is required',
    });
  }

  // Check required fields based on node type
  const requiredFields = getRequiredFieldsForNode(node.type);
  
  for (const field of requiredFields) {
    if (!node.data || !node.data[field]) {
      issues.push({
        id: `${node.id}-missing-${field}`,
        severity: 'error',
        message: `Required field "${field}" is missing`,
        field,
      });
    }
  }

  // Check for empty configuration
  if (node.data && Object.keys(node.data).length === 0) {
    issues.push({
      id: `${node.id}-no-config`,
      severity: 'warning',
      message: 'Node has no configuration',
    });
  }

  return {
    nodeId: node.id,
    isValid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
  };
}

/**
 * Validate a trigger
 */
export function validateTrigger(trigger: WorkflowTrigger): TriggerValidation {
  const issues: ValidationIssue[] = [];

  // Check if trigger has a type
  if (!trigger.type) {
    issues.push({
      id: `${trigger.id}-no-type`,
      severity: 'error',
      message: 'Trigger type is required',
    });
  }

  // Check required fields based on trigger type
  const requiredFields = getRequiredFieldsForTrigger(trigger.type);
  
  for (const field of requiredFields) {
    if (!trigger.data || !trigger.data[field]) {
      issues.push({
        id: `${trigger.id}-missing-${field}`,
        severity: 'error',
        message: `Required field "${field}" is missing`,
        field,
      });
    }
  }

  // Check for empty configuration
  if (trigger.data && Object.keys(trigger.data).length === 0) {
    issues.push({
      id: `${trigger.id}-no-config`,
      severity: 'warning',
      message: 'Trigger has no configuration',
    });
  }

  return {
    triggerId: trigger.id,
    isValid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
  };
}

/**
 * Validate entire workflow
 */
export function validateWorkflow(
  containers: WorkflowContainer[],
  triggers: WorkflowTrigger[]
): WorkflowValidation {
  const nodeValidations = new Map<string, NodeValidation>();
  const triggerValidations = new Map<string, TriggerValidation>();
  const globalIssues: ValidationIssue[] = [];

  // Validate all triggers
  for (const trigger of triggers) {
    const validation = validateTrigger(trigger);
    triggerValidations.set(trigger.id, validation);
  }

  // Validate all nodes in all containers
  for (const container of containers) {
    for (const node of container.nodes) {
      const validation = validateNode(node);
      nodeValidations.set(node.id, validation);
    }
  }

  // Check for workflows with no triggers
  if (triggers.length === 0) {
    globalIssues.push({
      id: 'no-triggers',
      severity: 'warning',
      message: 'Workflow has no triggers. Add a trigger to activate this workflow.',
    });
  }

  // Check for empty containers
  for (const container of containers) {
    if (container.nodes.length === 0 && container.id !== 'main') {
      globalIssues.push({
        id: `empty-container-${container.id}`,
        severity: 'info',
        message: `Branch "${container.name || container.id}" has no nodes`,
      });
    }
  }

  // Determine overall validity
  const hasErrors = 
    Array.from(nodeValidations.values()).some(v => !v.isValid) ||
    Array.from(triggerValidations.values()).some(v => !v.isValid) ||
    globalIssues.some(i => i.severity === 'error');

  return {
    isValid: !hasErrors,
    nodes: nodeValidations,
    triggers: triggerValidations,
    globalIssues,
  };
}

/**
 * Get required fields for a specific node type
 */
function getRequiredFieldsForNode(nodeType: string): string[] {
  // Define required fields per node type
  const requiredFieldsMap: Record<string, string[]> = {
    'send-email': ['recipient', 'subject', 'body'],
    'send-slack': ['channel', 'message'],
    'http-request': ['url', 'method'],
    'create-task': ['title', 'project'],
    'update-database': ['table', 'data'],
    'ai-generate': ['prompt', 'model'],
    'data-transform': ['operation'],
    'filter': ['condition'],
    'delay': ['duration'],
    'webhook': ['url'],
    'form-submission': ['formId'],
  };

  return requiredFieldsMap[nodeType] || [];
}

/**
 * Get required fields for a specific trigger type
 */
function getRequiredFieldsForTrigger(triggerType: string): string[] {
  const requiredFieldsMap: Record<string, string[]> = {
    'schedule': ['interval'],
    'webhook': ['url'],
    'form-submit': ['formId'],
    'email-received': ['email'],
    'slack-message': ['channel'],
    'database-change': ['table'],
    'file-upload': ['folder'],
  };

  return requiredFieldsMap[triggerType] || [];
}

/**
 * Validate node connections
 */
export function validateConnection(
  sourceNodeType: string,
  targetNodeType: string
): { isValid: boolean; message?: string } {
  // Define incompatible connections
  const incompatibleConnections: Record<string, string[]> = {
    'filter': [], // Filter can connect to anything
    'condition': [], // Condition can connect to anything
    'delay': [], // Delay can connect to anything
  };

  // Check if source can connect to target
  const incompatibleTargets = incompatibleConnections[sourceNodeType] || [];
  
  if (incompatibleTargets.includes(targetNodeType)) {
    return {
      isValid: false,
      message: `Cannot connect ${sourceNodeType} to ${targetNodeType}`,
    };
  }

  // All connections are valid by default
  return { isValid: true };
}

/**
 * Get validation status summary
 */
export function getValidationSummary(validation: WorkflowValidation): {
  errorCount: number;
  warningCount: number;
  infoCount: number;
} {
  let errorCount = 0;
  let warningCount = 0;
  let infoCount = 0;

  // Count issues from nodes
  validation.nodes.forEach(nodeValidation => {
    nodeValidation.issues.forEach(issue => {
      if (issue.severity === 'error') errorCount++;
      else if (issue.severity === 'warning') warningCount++;
      else if (issue.severity === 'info') infoCount++;
    });
  });

  // Count issues from triggers
  validation.triggers.forEach(triggerValidation => {
    triggerValidation.issues.forEach(issue => {
      if (issue.severity === 'error') errorCount++;
      else if (issue.severity === 'warning') warningCount++;
      else if (issue.severity === 'info') infoCount++;
    });
  });

  // Count global issues
  validation.globalIssues.forEach(issue => {
    if (issue.severity === 'error') errorCount++;
    else if (issue.severity === 'warning') warningCount++;
    else if (issue.severity === 'info') infoCount++;
  });

  return { errorCount, warningCount, infoCount };
}

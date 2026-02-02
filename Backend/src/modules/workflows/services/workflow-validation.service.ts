/**
 * Workflow Validation Service
 * Validates workflow structure before saving to prevent invalid workflows
 */

import { logger } from '../../../shared/utils/logger.util';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class WorkflowValidationService {
  /**
   * Validate workflow structure
   */
  validateWorkflow(workflow: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic structure validation
    if (!workflow.name || typeof workflow.name !== 'string' || workflow.name.trim().length === 0) {
      errors.push('Workflow name is required and must be a non-empty string');
    }

    if (workflow.name && workflow.name.length > 200) {
      errors.push('Workflow name must be 200 characters or less');
    }

    if (!workflow.description || typeof workflow.description !== 'string') {
      warnings.push('Workflow description is recommended');
    }

    // Validate triggers
    if (!workflow.triggers || !Array.isArray(workflow.triggers)) {
      errors.push('Workflow must have a triggers array');
    } else {
      if (workflow.triggers.length === 0) {
        warnings.push('Workflow has no triggers - it cannot be activated automatically');
      }

      workflow.triggers.forEach((trigger: any, index: number) => {
        if (!trigger.type) {
          errors.push(`Trigger ${index + 1}: Missing trigger type`);
        }
        if (!trigger.id) {
          errors.push(`Trigger ${index + 1}: Missing trigger ID`);
        }
      });
    }

    // Validate containers
    if (!workflow.containers || !Array.isArray(workflow.containers)) {
      errors.push('Workflow must have a containers array');
    } else {
      if (workflow.containers.length === 0) {
        warnings.push('Workflow has no containers - it will not execute any actions');
      }

      workflow.containers.forEach((container: any, containerIndex: number) => {
        if (!container.id) {
          errors.push(`Container ${containerIndex + 1}: Missing container ID`);
        }

        if (container.nodes && Array.isArray(container.nodes)) {
          container.nodes.forEach((node: any, nodeIndex: number) => {
            if (!node.type) {
              errors.push(`Container ${containerIndex + 1}, Node ${nodeIndex + 1}: Missing node type`);
            }
            if (!node.id) {
              errors.push(`Container ${containerIndex + 1}, Node ${nodeIndex + 1}: Missing node ID`);
            }

            // Validate node configuration
            if (node.config && typeof node.config !== 'object') {
              errors.push(`Container ${containerIndex + 1}, Node ${nodeIndex + 1}: Node config must be an object`);
            }
          });
        }
      });
    }

    // Validate form fields (optional but should be array if present)
    if (workflow.formFields !== undefined && !Array.isArray(workflow.formFields)) {
      errors.push('Form fields must be an array if provided');
    }

    // Validate status
    if (workflow.status && !['draft', 'published', 'archived'].includes(workflow.status)) {
      errors.push('Status must be one of: draft, published, archived');
    }

    // Check for circular dependencies in containers
    const containerIds = new Set<string>();
    workflow.containers?.forEach((container: any) => {
      if (container.id) {
        if (containerIds.has(container.id)) {
          errors.push(`Duplicate container ID: ${container.id}`);
        }
        containerIds.add(container.id);
      }
    });

    // Check for circular dependencies in nodes
    const nodeIds = new Set<string>();
    workflow.containers?.forEach((container: any) => {
      container.nodes?.forEach((node: any) => {
        if (node.id) {
          if (nodeIds.has(node.id)) {
            errors.push(`Duplicate node ID: ${node.id}`);
          }
          nodeIds.add(node.id);
        }
      });
    });

    // Validate trigger logic if present
    if (workflow.triggerLogic && !Array.isArray(workflow.triggerLogic)) {
      errors.push('Trigger logic must be an array if provided');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate workflow update (less strict than create)
   */
  validateWorkflowUpdate(workflow: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Only validate fields that are being updated
    if (workflow.name !== undefined) {
      if (typeof workflow.name !== 'string' || workflow.name.trim().length === 0) {
        errors.push('Workflow name must be a non-empty string');
      }
      if (workflow.name.length > 200) {
        errors.push('Workflow name must be 200 characters or less');
      }
    }

    if (workflow.description !== undefined && typeof workflow.description !== 'string') {
      errors.push('Workflow description must be a string');
    }

    if (workflow.status !== undefined && !['draft', 'published', 'archived'].includes(workflow.status)) {
      errors.push('Status must be one of: draft, published, archived');
    }

    // Validate triggers if provided
    if (workflow.triggers !== undefined) {
      if (!Array.isArray(workflow.triggers)) {
        errors.push('Triggers must be an array');
      } else {
        workflow.triggers.forEach((trigger: any, index: number) => {
          if (!trigger.type) {
            errors.push(`Trigger ${index + 1}: Missing trigger type`);
          }
        });
      }
    }

    // Validate containers if provided
    if (workflow.containers !== undefined) {
      if (!Array.isArray(workflow.containers)) {
        errors.push('Containers must be an array');
      } else {
        workflow.containers.forEach((container: any, containerIndex: number) => {
          if (container.nodes && Array.isArray(container.nodes)) {
            container.nodes.forEach((node: any, nodeIndex: number) => {
              if (!node.type) {
                errors.push(`Container ${containerIndex + 1}, Node ${nodeIndex + 1}: Missing node type`);
              }
            });
          }
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Log validation results
   */
  logValidationResult(result: ValidationResult, workflowName?: string): void {
    if (result.valid) {
      logger.info('Workflow validation passed', {
        workflowName,
        warnings: result.warnings.length,
      });
    } else {
      logger.warn('Workflow validation failed', {
        workflowName,
        errors: result.errors,
        warnings: result.warnings,
      });
    }
  }
}

export const workflowValidationService = new WorkflowValidationService();


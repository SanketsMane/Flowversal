import { logger } from '../../../../../shared/utils/logger.util';
import { humanApprovalService } from '../../human-approval.service';
import { ExecutionContext, NodeExecutionResult } from '../types/workflow-execution.types';

export interface HumanApprovalNodeConfig {
  approvalType: 'manual_review' | 'confirmation' | 'decision_making' | 'quality_check';
  approvalMessage?: string;
  approvalFields?: Array<{
    fieldName: string;
    fieldType: 'text' | 'number' | 'boolean' | 'json';
    required: boolean;
    description?: string;
  }>;
  timeoutHours?: number;
  requiredApprovers?: string[]; // User IDs or role names
  allowSelfApproval?: boolean;
  approvalInstructions?: string;
}

export class HumanApprovalExecutor {
  /**
   * Execute human approval node
   */
  async execute(
    nodeId: string,
    config: HumanApprovalNodeConfig,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();

    try {
      logger.info('Executing human approval node', {
        nodeId,
        executionId: context.execution._id,
        approvalType: config.approvalType,
      });

      // Prepare approval data
      const approvalData = {
        approvalType: config.approvalType,
        approvalMessage: config.approvalMessage || 'Please review and approve this workflow step',
        approvalFields: config.approvalFields || [],
        approvalInstructions: config.approvalInstructions,
        inputData: context.input,
        currentStepResults: Object.fromEntries(context.stepResults),
        nodeConfig: config,
        timestamp: new Date().toISOString(),
      };

      // Request human approval
      const approvalRequest = await humanApprovalService.requestApproval({
        executionId: context.execution._id.toString(),
        nodeId,
        stepId: nodeId, // Using nodeId as stepId for simplicity
        approvalType: config.approvalType,
        approvalData,
        requestedBy: context.execution.userId,
        comments: config.approvalInstructions,
        timeoutHours: config.timeoutHours,
      });

      logger.info('Human approval requested successfully', {
        nodeId,
        executionId: context.execution._id,
        approvalId: approvalRequest.approvalId,
      });

      // Return pending result - execution will resume when approved
      return {
        success: true,
        output: {
          approvalRequested: true,
          approvalId: approvalRequest.approvalId,
          approvalType: config.approvalType,
          timeout: approvalRequest.timeout,
          message: 'Waiting for human approval',
          approvalData,
        },
      };

    } catch (error: any) {
      logger.error('Failed to execute human approval node', {
        nodeId,
        executionId: context.execution._id,
        error: error.message,
      });

      return {
        success: false,
        error: `Human approval request failed: ${error.message}`,
      };
    }
  }

  /**
   * Resume execution after approval
   */
  async resumeAfterApproval(
    nodeId: string,
    approvalId: string,
    decision: 'approved' | 'rejected',
    context: ExecutionContext,
    approvalData?: any
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();

    try {
      logger.info('Resuming execution after approval', {
        nodeId,
        approvalId,
        decision,
        executionId: context.execution._id,
      });

      if (decision === 'rejected') {
        return {
          success: false,
          error: 'Workflow step was rejected during human approval',
          output: {
            approvalDecision: 'rejected',
            approvalId,
            approvalData,
            rejectedAt: new Date().toISOString(),
          },
        };
      }

      // Approval granted - continue with approved data
      return {
        success: true,
        output: {
          approvalDecision: 'approved',
          approvalId,
          approvalData,
          approvedAt: new Date().toISOString(),
          // Include any additional data from the approval process
          ...approvalData,
        },
      };

    } catch (error: any) {
      logger.error('Failed to resume after approval', {
        nodeId,
        approvalId,
        executionId: context.execution._id,
        error: error.message,
      });

      return {
        success: false,
        error: `Failed to resume after approval: ${error.message}`,
      };
    }
  }

  /**
   * Handle approval timeout
   */
  async handleApprovalTimeout(
    nodeId: string,
    approvalId: string,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    try {
      logger.warn('Human approval timed out', {
        nodeId,
        approvalId,
        executionId: context.execution._id,
      });

      return {
        success: false,
        error: 'Human approval request timed out',
        output: {
          approvalTimeout: true,
          approvalId,
          timeoutAt: new Date().toISOString(),
        },
      };

    } catch (error: any) {
      logger.error('Failed to handle approval timeout', {
        nodeId,
        approvalId,
        executionId: context.execution._id,
        error: error.message,
      });

      return {
        success: false,
        error: `Failed to handle approval timeout: ${error.message}`,
      };
    }
  }

  /**
   * Validate human approval node configuration
   */
  validateConfig(config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.approvalType) {
      errors.push('approvalType is required');
    } else if (!['manual_review', 'confirmation', 'decision_making', 'quality_check'].includes(config.approvalType)) {
      errors.push('approvalType must be one of: manual_review, confirmation, decision_making, quality_check');
    }

    if (config.timeoutHours && (typeof config.timeoutHours !== 'number' || config.timeoutHours <= 0)) {
      errors.push('timeoutHours must be a positive number');
    }

    if (config.approvalFields && !Array.isArray(config.approvalFields)) {
      errors.push('approvalFields must be an array');
    }

    if (config.approvalFields) {
      config.approvalFields.forEach((field: any, index: number) => {
        if (!field.fieldName) {
          errors.push(`approvalFields[${index}].fieldName is required`);
        }
        if (!field.fieldType || !['text', 'number', 'boolean', 'json'].includes(field.fieldType)) {
          errors.push(`approvalFields[${index}].fieldType must be one of: text, number, boolean, json`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get approval requirements for UI display
   */
  getApprovalRequirements(config: HumanApprovalNodeConfig): {
    requiresApproval: boolean;
    approvalType: string;
    estimatedWaitTime?: string;
    requiredFields?: string[];
  } {
    return {
      requiresApproval: true,
      approvalType: config.approvalType,
      estimatedWaitTime: config.timeoutHours ? `${config.timeoutHours} hours` : '24 hours',
      requiredFields: config.approvalFields?.map(f => f.fieldName) || [],
    };
  }
}

export const humanApprovalExecutor = new HumanApprovalExecutor();
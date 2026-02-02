import { Types } from 'mongoose';
import { logger } from '../../../shared/utils/logger.util';
import { WorkflowModel } from '../models/Workflow.model';
import { IWorkflowExecution, WorkflowExecutionModel } from '../models/WorkflowExecution.model';
import { broadcastExecutionUpdate } from '../routes/workflow-websocket.routes';

export interface CheckpointData {
  nodeId: string;
  stepId: string;
  stepName: string;
  inputData: any;
  outputData?: any;
  variables: Record<string, any>;
  stepResults: Map<string, any>;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface BreakpointConfig {
  nodeId: string;
  condition?: string; // JavaScript expression to evaluate
  enabled: boolean;
  persistState: boolean;
  allowResume: boolean;
  maxRetries?: number;
  timeout?: number; // in minutes
  customLogic?: string; // Custom breakpoint logic
}

export interface BreakpointState {
  breakpointId: string;
  executionId: string;
  nodeId: string;
  checkpointData: CheckpointData;
  pausedAt: Date;
  resumeToken?: string;
  canResume: boolean;
  timeout?: Date;
  metadata?: Record<string, any>;
}

export class BreakpointService {
  private activeBreakpoints = new Map<string, BreakpointState>();

  /**
   * Check if a breakpoint should be triggered
   */
  async shouldTriggerBreakpoint(
    nodeId: string,
    execution: IWorkflowExecution,
    context: any
  ): Promise<boolean> {
    try {
      // Get workflow to check breakpoint configuration
      const workflow = await WorkflowModel.findById(execution.workflowId);
      if (!workflow) {
        return false;
      }

      // Find breakpoint config for this node
      const breakpoint = workflow.breakpoints?.find((bp: any) => bp.nodeId === nodeId);
      if (!breakpoint || !breakpoint.enabled) {
        return false;
      }

      // Evaluate condition if specified
      if (breakpoint.condition) {
        return this.evaluateCondition(breakpoint.condition, {
          execution,
          context,
          nodeId,
          input: context.input,
          variables: context.variables,
          stepResults: Object.fromEntries(context.stepResults),
        });
      }

      // Default: trigger breakpoint
      return true;
    } catch (error: any) {
      logger.error('Error checking breakpoint trigger', {
        nodeId,
        executionId: execution._id,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Trigger a breakpoint and pause execution
   */
  async triggerBreakpoint(
    nodeId: string,
    execution: IWorkflowExecution,
    context: any,
    checkpointData: CheckpointData
  ): Promise<BreakpointState> {
    try {
      const breakpointId = `bp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const resumeToken = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Get workflow for breakpoint config
      const workflow = await WorkflowModel.findById(execution.workflowId);
      const breakpointConfig = workflow?.breakpoints?.find((bp: any) => bp.nodeId === nodeId);

      // Calculate timeout
      const timeoutMinutes = breakpointConfig?.timeout || 60; // Default 1 hour
      const timeout = new Date(Date.now() + timeoutMinutes * 60 * 1000);

      const breakpointState: BreakpointState = {
        breakpointId,
        executionId: execution._id.toString(),
        nodeId,
        checkpointData,
        pausedAt: new Date(),
        resumeToken,
        canResume: breakpointConfig?.allowResume !== false,
        timeout,
        metadata: {
          breakpointConfig,
          executionStatus: execution.status,
          totalSteps: execution.totalSteps,
          completedSteps: execution.stepsExecuted,
        },
      };

      // Store active breakpoint
      this.activeBreakpoints.set(breakpointId, breakpointState);

      // Update execution status
      await WorkflowExecutionModel.updateOne(
        { _id: execution._id },
        {
          $set: {
            status: 'stopped', // Use stopped status for breakpoints
            'metadata.breakpointState': breakpointState,
          },
          $push: {
            steps: {
              stepId: checkpointData.stepId,
              stepName: checkpointData.stepName,
              stepType: 'breakpoint',
              status: 'stopped',
              startedAt: checkpointData.timestamp,
              input: checkpointData.inputData,
              error: 'Execution paused at breakpoint',
            },
          },
        }
      );

      // Broadcast breakpoint event
      await this.broadcastBreakpointEvent(execution._id.toString(), 'paused', breakpointState);

      logger.info('Breakpoint triggered', {
        breakpointId,
        executionId: execution._id,
        nodeId,
        resumeToken,
      });

      return breakpointState;
    } catch (error: any) {
      logger.error('Failed to trigger breakpoint', {
        nodeId,
        executionId: execution._id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Resume execution from a breakpoint
   */
  async resumeFromBreakpoint(
    breakpointId: string,
    resumeToken: string,
    userId: Types.ObjectId,
    options?: {
      modifiedData?: any;
      skipToNode?: string;
      forceResume?: boolean;
    }
  ): Promise<{
    success: boolean;
    executionId: string;
    canContinue: boolean;
    message: string;
  }> {
    try {
      const breakpointState = this.activeBreakpoints.get(breakpointId);
      if (!breakpointState) {
        throw new Error('Breakpoint not found or expired');
      }

      if (breakpointState.resumeToken !== resumeToken) {
        throw new Error('Invalid resume token');
      }

      if (!breakpointState.canResume && !options?.forceResume) {
        throw new Error('This breakpoint cannot be resumed');
      }

      // Check timeout
      if (breakpointState.timeout && new Date() > breakpointState.timeout) {
        throw new Error('Breakpoint has timed out');
      }

      const execution = await WorkflowExecutionModel.findById(breakpointState.executionId);
      if (!execution) {
        throw new Error('Execution not found');
      }

      // Update execution to resume
      const updateData: any = {
        status: 'running',
        'metadata.breakpointState': null,
        'metadata.breakpointResumedAt': new Date(),
        'metadata.breakpointResumedBy': userId,
      };

      if (options?.modifiedData) {
        updateData['metadata.breakpointModifications'] = options.modifiedData;
      }

      await WorkflowExecutionModel.updateOne(
        { _id: execution._id },
        { $set: updateData }
      );

      // Remove from active breakpoints
      this.activeBreakpoints.delete(breakpointId);

      // Broadcast resume event
      await this.broadcastBreakpointEvent(execution._id.toString(), 'resumed', {
        ...breakpointState,
        resumedBy: userId,
        resumedAt: new Date(),
        modifications: options?.modifiedData,
      });

      logger.info('Execution resumed from breakpoint', {
        breakpointId,
        executionId: execution._id,
        resumedBy: userId,
        skipToNode: options?.skipToNode,
      });

      return {
        success: true,
        executionId: execution._id.toString(),
        canContinue: true,
        message: 'Execution resumed from breakpoint',
      };

    } catch (error: any) {
      logger.error('Failed to resume from breakpoint', {
        breakpointId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Time travel debugging - replay execution to a specific checkpoint
   */
  async replayToCheckpoint(
    executionId: string,
    checkpointId: string,
    userId: Types.ObjectId
  ): Promise<{
    success: boolean;
    newExecutionId: string;
    message: string;
  }> {
    try {
      const originalExecution = await WorkflowExecutionModel.findById(executionId);
      if (!originalExecution) {
        throw new Error('Original execution not found');
      }

      // Find the checkpoint in the execution history
      const checkpointStep = originalExecution.steps.find(
        (step) => step.stepId === checkpointId
      );

      if (!checkpointStep) {
        throw new Error('Checkpoint not found in execution history');
      }

      // Create a new execution that starts from this checkpoint
      const replayExecution = new WorkflowExecutionModel({
        workflowId: originalExecution.workflowId,
        userId: originalExecution.userId,
        status: 'running',
        input: checkpointStep.input,
        metadata: {
          ...originalExecution.metadata,
          isReplay: true,
          originalExecutionId: executionId,
          replayStartedAt: new Date(),
          replayStartedBy: userId,
          replayFromCheckpoint: checkpointId,
        },
        steps: [{
          stepId: 'replay-start',
          stepName: 'Replay Started',
          stepType: 'replay',
          status: 'completed',
          startedAt: new Date(),
          completedAt: new Date(),
          input: checkpointStep.input,
          output: { replayFromCheckpoint: checkpointId },
        }],
      });

      await replayExecution.save();

      logger.info('Time travel replay initiated', {
        originalExecutionId: executionId,
        newExecutionId: replayExecution._id,
        checkpointId,
        userId,
      });

      return {
        success: true,
        newExecutionId: replayExecution._id.toString(),
        message: 'Time travel replay initiated',
      };

    } catch (error: any) {
      logger.error('Failed to initiate time travel replay', {
        executionId,
        checkpointId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get active breakpoints for an execution
   */
  async getActiveBreakpoints(executionId: string): Promise<BreakpointState[]> {
    const activeBreakpoints = Array.from(this.activeBreakpoints.values())
      .filter(bp => bp.executionId === executionId);

    return activeBreakpoints;
  }

  /**
   * Get breakpoint history for an execution
   */
  async getBreakpointHistory(executionId: string): Promise<any[]> {
    try {
      const execution = await WorkflowExecutionModel.findById(executionId);
      if (!execution) {
        return [];
      }

      // Find breakpoint-related steps
      const breakpointSteps = execution.steps.filter(
        step => step.stepType === 'breakpoint' || execution.metadata?.breakpointState
      );

      return breakpointSteps.map(step => ({
        stepId: step.stepId,
        stepName: step.stepName,
        status: step.status,
        timestamp: step.startedAt,
        breakpointData: execution.metadata?.breakpointState,
        resumedAt: execution.metadata?.breakpointResumedAt,
        resumedBy: execution.metadata?.breakpointResumedBy,
      }));

    } catch (error: any) {
      logger.error('Failed to get breakpoint history', {
        executionId,
        error: error.message,
      });
      return [];
    }
  }

  /**
   * Clean up expired breakpoints
   */
  async cleanupExpiredBreakpoints(): Promise<number> {
    try {
      const now = new Date();
      let cleanedCount = 0;

      for (const [breakpointId, breakpointState] of this.activeBreakpoints) {
        if (breakpointState.timeout && now > breakpointState.timeout) {
          // Mark execution as failed due to breakpoint timeout
          await WorkflowExecutionModel.updateOne(
            { _id: breakpointState.executionId },
            {
              $set: { status: 'failed' },
              $push: {
                steps: {
                  stepId: `timeout-${breakpointState.nodeId}`,
                  stepName: 'Breakpoint Timeout',
                  stepType: 'timeout',
                  status: 'failed',
                  startedAt: now,
                  completedAt: now,
                  error: 'Breakpoint timed out',
                },
              },
            }
          );

          this.activeBreakpoints.delete(breakpointId);
          cleanedCount++;
        }
      }

      logger.info('Cleaned up expired breakpoints', { cleanedCount });
      return cleanedCount;

    } catch (error: any) {
      logger.error('Failed to cleanup expired breakpoints', { error: error.message });
      return 0;
    }
  }

  /**
   * Evaluate breakpoint condition
   */
  private evaluateCondition(condition: string, context: any): boolean {
    try {
      // Create a safe evaluation context
      const evalContext = {
        ...context,
        // Add utility functions
        hasValue: (key: string) => context[key] !== undefined && context[key] !== null,
        isEmpty: (value: any) => !value || (Array.isArray(value) && value.length === 0),
        contains: (array: any[], value: any) => Array.isArray(array) && array.includes(value),
      };

      // Use Function constructor for safer evaluation than eval()
      const conditionFn = new Function(...Object.keys(evalContext), `return ${condition}`);
      return conditionFn(...Object.values(evalContext));

    } catch (error: any) {
      logger.error('Failed to evaluate breakpoint condition', {
        condition,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Broadcast breakpoint event via WebSocket
   */
  private async broadcastBreakpointEvent(
    executionId: string,
    eventType: 'paused' | 'resumed',
    data: any
  ): Promise<void> {
    try {
      broadcastExecutionUpdate(executionId, {
        type: 'breakpoint_event',
        eventType,
        data,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.warn('Failed to broadcast breakpoint event', { executionId, error });
    }
  }
}

export const breakpointService = new BreakpointService();
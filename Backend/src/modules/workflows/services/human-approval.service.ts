import { Types } from 'mongoose';
import { logger } from '../../../shared/utils/logger.util';
import { UserModel } from '../../users/models/User.model';
import { IWorkflowExecution, WorkflowExecutionModel } from '../models/WorkflowExecution.model';
import { broadcastExecutionUpdate } from '../routes/workflow-websocket.routes';

export interface ApprovalRequest {
  executionId: string;
  nodeId: string;
  stepId: string;
  approvalType: 'manual_review' | 'confirmation' | 'decision_making' | 'quality_check';
  approvalData: Record<string, any>;
  requestedBy: Types.ObjectId;
  comments?: string;
  timeoutHours?: number;
}

export interface ApprovalDecision {
  approvalId: string;
  decision: 'approved' | 'rejected';
  approvedBy: Types.ObjectId;
  comments?: string;
}

export class HumanApprovalService {
  /**
   * Request human approval for a workflow step
   */
  async requestApproval(request: ApprovalRequest): Promise<{
    success: boolean;
    approvalId: string;
    message: string;
    timeout?: Date;
  }> {
    try {
      const execution = await WorkflowExecutionModel.findById(request.executionId);
      if (!execution) {
        throw new Error('Workflow execution not found');
      }

      // Check if user can request approval
      const requestedByUser = await UserModel.findById(request.requestedBy);
      if (!requestedByUser) {
        throw new Error('Requesting user not found');
      }

      // Generate unique approval ID
      const approvalId = `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Calculate timeout
      const timeoutHours = request.timeoutHours || execution.approvalSettings?.approvalTimeoutHours || 24;
      const timeout = new Date(Date.now() + timeoutHours * 60 * 60 * 1000);

      // Create approval request
      const approvalRequest = {
        approvalId,
        nodeId: request.nodeId,
        stepId: request.stepId,
        requestedAt: new Date(),
        requestedBy: request.requestedBy,
        comments: request.comments,
        approvalData: request.approvalData,
        approvalType: request.approvalType,
        timeout,
      };

      // Update execution status and add pending approval
      await WorkflowExecutionModel.updateOne(
        { _id: request.executionId },
        {
          $set: { status: 'waiting_for_approval' },
          $push: { pendingApprovals: approvalRequest },
        }
      );

      // Broadcast update
      await this.broadcastApprovalUpdate(request.executionId, approvalId, 'requested', approvalRequest);

      logger.info('Human approval requested', {
        executionId: request.executionId,
        approvalId,
        approvalType: request.approvalType,
        requestedBy: request.requestedBy,
      });

      return {
        success: true,
        approvalId,
        message: 'Approval request created successfully',
        timeout,
      };
    } catch (error: any) {
      logger.error('Failed to request approval', {
        executionId: request.executionId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Submit approval decision
   */
  async submitDecision(decision: ApprovalDecision): Promise<{
    success: boolean;
    executionId: string;
    canContinue: boolean;
    message: string;
  }> {
    try {
      const execution = await WorkflowExecutionModel.findById(decision.approvedBy);
      if (!execution) {
        throw new Error('Execution not found');
      }

      // Find the approval request
      const approvalIndex = execution.pendingApprovals?.findIndex(
        (approval) => approval.approvalId === decision.approvalId
      );

      if (approvalIndex === undefined || approvalIndex === -1) {
        throw new Error('Approval request not found');
      }

      const approval = execution.pendingApprovals![approvalIndex];

      // Check if approval has expired
      if (approval.timeout && new Date() > approval.timeout) {
        throw new Error('Approval request has expired');
      }

      // Check if user can approve
      const canApprove = await this.canUserApprove(execution, decision.approvedBy);
      if (!canApprove) {
        throw new Error('User is not authorized to approve this request');
      }

      // Update approval with decision
      approval.decision = decision.decision;
      approval.decisionAt = new Date();
      approval.approvedBy = decision.approvedBy;
      approval.comments = decision.comments;

      // Remove from pending approvals and update execution status
      const updatedApprovals = [...(execution.pendingApprovals || [])];
      updatedApprovals.splice(approvalIndex, 1);

      const newStatus = updatedApprovals.length > 0 ? 'waiting_for_approval' : 'running';

      await WorkflowExecutionModel.updateOne(
        { _id: execution._id },
        {
          $set: {
            status: newStatus,
            pendingApprovals: updatedApprovals,
          },
        }
      );

      // Broadcast decision
      await this.broadcastApprovalUpdate(execution._id.toString(), decision.approvalId, 'decided', {
        ...approval,
        decision: decision.decision,
        approvedBy: decision.approvedBy,
        comments: decision.comments,
      });

      logger.info('Approval decision submitted', {
        approvalId: decision.approvalId,
        decision: decision.decision,
        approvedBy: decision.approvedBy,
        canContinue: newStatus === 'running',
      });

      return {
        success: true,
        executionId: execution._id.toString(),
        canContinue: newStatus === 'running',
        message: `Approval ${decision.decision} successfully`,
      };
    } catch (error: any) {
      logger.error('Failed to submit approval decision', {
        approvalId: decision.approvalId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get pending approvals for a user
   */
  async getPendingApprovals(userId: Types.ObjectId): Promise<Array<{
    approvalId: string;
    executionId: string;
    nodeId: string;
    stepId: string;
    approvalType: string;
    approvalData: Record<string, any>;
    requestedAt: Date;
    requestedBy: Types.ObjectId;
    comments?: string;
    timeout?: Date;
    workflowName?: string;
  }>> {
    try {
      const executions = await WorkflowExecutionModel.find({
        'pendingApprovals.0': { $exists: true },
      }).populate('workflowId', 'name');

      const userApprovals: any[] = [];

      for (const execution of executions) {
        for (const approval of execution.pendingApprovals || []) {
          // Check if user can approve this request
          const canApprove = await this.canUserApprove(execution, userId);
          if (canApprove) {
            userApprovals.push({
              approvalId: approval.approvalId,
              executionId: execution._id.toString(),
              nodeId: approval.nodeId,
              stepId: approval.stepId,
              approvalType: approval.approvalType,
              approvalData: approval.approvalData,
              requestedAt: approval.requestedAt,
              requestedBy: approval.requestedBy,
              comments: approval.comments,
              timeout: approval.timeout,
              workflowName: (execution.workflowId as any)?.name || 'Unnamed Workflow',
            });
          }
        }
      }

      return userApprovals;
    } catch (error: any) {
      logger.error('Failed to get pending approvals', {
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Check if a user can approve a request
   */
  private async canUserApprove(execution: IWorkflowExecution, userId: Types.ObjectId): Promise<boolean> {
    try {
      // If no specific approval settings, allow all users
      if (!execution.approvalSettings) {
        return true;
      }

      const settings = execution.approvalSettings;

      // Check if self-approval is allowed
      if (!settings.allowSelfApproval) {
        // Check if user is the one who requested approval
        const isRequester = execution.pendingApprovals?.some(
          (approval) => approval.requestedBy.toString() === userId.toString()
        );
        if (isRequester) {
          return false;
        }
      }

      // Check specific required approvers
      if (settings.requiredApprovers && settings.requiredApprovers.length > 0) {
        return settings.requiredApprovers.some(
          (approverId) => approverId.toString() === userId.toString()
        );
      }

      // Check approval roles (simplified - in real implementation, check user's roles)
      if (settings.approvalRoles && settings.approvalRoles.length > 0) {
        // For now, assume users can approve unless specific roles are required
        // In a real implementation, you'd check the user's roles against required roles
        return true;
      }

      // Default: allow approval
      return true;
    } catch (error) {
      logger.error('Failed to check user approval permissions', {
        executionId: execution._id,
        userId,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Broadcast approval update via WebSocket
   */
  private async broadcastApprovalUpdate(
    executionId: string,
    approvalId: string,
    eventType: 'requested' | 'decided',
    data: any
  ): Promise<void> {
    try {
      broadcastExecutionUpdate(executionId, {
        type: 'approval_update',
        approvalId,
        eventType,
        data,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.warn('Failed to broadcast approval update', { executionId, approvalId, error });
    }
  }

  /**
   * Handle expired approvals
   */
  async handleExpiredApprovals(): Promise<number> {
    try {
      const now = new Date();

      const result = await WorkflowExecutionModel.updateMany(
        {
          status: 'waiting_for_approval',
          'pendingApprovals.timeout': { $lt: now },
        },
        {
          $set: { status: 'failed' },
          $push: {
            steps: {
              stepId: 'approval_timeout',
              stepName: 'Approval Timeout',
              stepType: 'approval',
              status: 'failed',
              startedAt: now,
              completedAt: now,
              error: 'Approval request timed out',
            },
          },
        }
      );

      logger.info('Handled expired approvals', { count: result.modifiedCount });
      return result.modifiedCount || 0;
    } catch (error: any) {
      logger.error('Failed to handle expired approvals', { error: error.message });
      return 0;
    }
  }

  /**
   * Get approval statistics
   */
  async getApprovalStats(userId?: Types.ObjectId): Promise<{
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
    averageApprovalTime: number;
  }> {
    try {
      const matchStage: any = {};
      if (userId) {
        matchStage['pendingApprovals.requestedBy'] = { $ne: userId };
      }

      const stats = await WorkflowExecutionModel.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalPending: {
              $sum: { $size: '$pendingApprovals' },
            },
            totalApproved: {
              $sum: {
                $size: {
                  $filter: {
                    input: '$pendingApprovals',
                    cond: { $eq: ['$$this.decision', 'approved'] },
                  },
                },
              },
            },
            totalRejected: {
              $sum: {
                $size: {
                  $filter: {
                    input: '$pendingApprovals',
                    cond: { $eq: ['$$this.decision', 'rejected'] },
                  },
                },
              },
            },
            approvalTimes: {
              $push: {
                $filter: {
                  input: '$pendingApprovals',
                  cond: {
                    $and: [
                      { $ne: ['$$this.decisionAt', null] },
                      { $ne: ['$$this.requestedAt', null] },
                    ],
                  },
                },
              },
            },
          },
        },
      ]);

      const result = stats[0] || {
        totalPending: 0,
        totalApproved: 0,
        totalRejected: 0,
        approvalTimes: [],
      };

      // Calculate average approval time
      const allApprovalTimes: number[] = [];
      result.approvalTimes.forEach((approvals: any[]) => {
        approvals.forEach((approval: any) => {
          if (approval.decisionAt && approval.requestedAt) {
            const time = new Date(approval.decisionAt).getTime() - new Date(approval.requestedAt).getTime();
            allApprovalTimes.push(time);
          }
        });
      });

      const averageApprovalTime = allApprovalTimes.length > 0
        ? allApprovalTimes.reduce((a, b) => a + b, 0) / allApprovalTimes.length
        : 0;

      return {
        totalPending: result.totalPending,
        totalApproved: result.totalApproved,
        totalRejected: result.totalRejected,
        averageApprovalTime,
      };
    } catch (error: any) {
      logger.error('Failed to get approval stats', { error: error.message });
      throw error;
    }
  }
}

export const humanApprovalService = new HumanApprovalService();
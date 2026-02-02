import { TaskModel, ITask, AttachedWorkflow, WorkflowExecutionHistory } from '../modules/tasks/models/Task.model';
import { WorkflowModel } from '../modules/workflows/models/Workflow.model';
import { workflowExecutionService } from '../modules/workflows/services/workflow-execution.service';
import { inngest, events } from '../infrastructure/queue/jobs/inngest.client';
import { Types } from 'mongoose';

export interface AttachWorkflowConfig {
  triggerOnStatus?: string[];
  schedule?: {
    type: 'daily' | 'weekly' | 'monthly' | 'onDueDate' | 'custom';
    time?: string;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    cronExpression?: string;
  };
  config?: Record<string, any>;
}

export class TaskWorkflowService {
  /**
   * Attach a workflow to a task
   */
  async attachWorkflowToTask(
    taskId: string,
    workflowId: string,
    userId: string,
    config: AttachWorkflowConfig = {}
  ): Promise<ITask> {
    // Verify task exists and user owns it
    const task = await TaskModel.findOne({
      _id: taskId,
      userId: userId,
    });

    if (!task) {
      throw new Error('Task not found or unauthorized');
    }

    // Verify workflow exists and user owns it
    const workflow = await WorkflowModel.findOne({
      _id: workflowId,
      userId: userId,
    });

    if (!workflow) {
      throw new Error('Workflow not found or unauthorized');
    }

    // Initialize arrays if they don't exist
    if (!task.attachedWorkflows) {
      task.attachedWorkflows = [];
    }

    // Check if workflow is already attached
    const existingIndex = task.attachedWorkflows.findIndex(
      (aw: any) => aw.workflowId.toString() === workflowId
    );

    const attachedWorkflow: AttachedWorkflow = {
      workflowId: new Types.ObjectId(workflowId),
      triggerOnStatus: config.triggerOnStatus || [],
      schedule: config.schedule,
      config: config.config || {},
    };

    if (existingIndex >= 0) {
      // Update existing attachment
      task.attachedWorkflows[existingIndex] = attachedWorkflow;
    } else {
      // Add new attachment
      task.attachedWorkflows.push(attachedWorkflow);
    }

    task.hasWorkflow = true;
    await task.save();

    return task;
  }

  /**
   * Detach a workflow from a task
   */
  async detachWorkflowFromTask(
    taskId: string,
    workflowId: string,
    userId: string
  ): Promise<ITask> {
    const task = await TaskModel.findOne({
      _id: taskId,
      userId: userId,
    });

    if (!task) {
      throw new Error('Task not found or unauthorized');
    }

    if (!task.attachedWorkflows) {
      task.attachedWorkflows = [];
    }

    task.attachedWorkflows = task.attachedWorkflows.filter(
      (aw: any) => aw.workflowId.toString() !== workflowId
    );

    task.hasWorkflow = task.attachedWorkflows.length > 0;
    await task.save();

    return task;
  }

  /**
   * Get all workflows attached to a task
   */
  async getAttachedWorkflows(taskId: string, userId: string): Promise<{
    workflows: Array<{
      workflowId: string;
      workflow: any;
      config: AttachedWorkflow;
    }>;
  }> {
    const task = await TaskModel.findOne({
      _id: taskId,
      userId: userId,
    });

    if (!task) {
      throw new Error('Task not found or unauthorized');
    }

    const attachedWorkflows = task.attachedWorkflows || [];
    const workflowIds = attachedWorkflows.map((aw: any) => aw.workflowId.toString());

    const workflows = await WorkflowModel.find({
      _id: { $in: workflowIds },
    });

    return {
      workflows: attachedWorkflows.map((aw: any) => {
        const workflow = workflows.find((w) => w._id.toString() === aw.workflowId.toString());
        return {
          workflowId: aw.workflowId.toString(),
          workflow: workflow || null,
          config: aw,
        };
      }),
    };
  }

  /**
   * Trigger workflows on task status change
   */
  async triggerWorkflowsOnStatusChange(
    taskId: string,
    oldStatus: string,
    newStatus: string,
    userId: string
  ): Promise<void> {
    const task = await TaskModel.findOne({
      _id: taskId,
      userId: userId,
    });

    if (!task || !task.attachedWorkflows || task.attachedWorkflows.length === 0) {
      return;
    }

    // Find workflows that should trigger on this status change
    const workflowsToTrigger = task.attachedWorkflows.filter((aw: any) => {
      const triggerStatuses = aw.triggerOnStatus || [];
      return triggerStatuses.includes(newStatus);
    });

    if (workflowsToTrigger.length === 0) {
      return;
    }

    // Trigger each workflow
    for (const attachedWorkflow of workflowsToTrigger) {
      try {
        const workflowId = attachedWorkflow.workflowId.toString();
        
        // Create execution input with task data
        const input = {
          taskId: taskId,
          taskName: task.name,
          taskStatus: newStatus,
          oldStatus: oldStatus,
          taskData: {
            id: task.taskId,
            name: task.name,
            description: task.description,
            status: newStatus,
            priority: task.priority,
            dueDate: task.dueDate,
            labels: task.labels,
          },
          ...(attachedWorkflow.config || {}),
        };

        // Start workflow execution via Inngest
        await inngest.send({
          name: events['workflow/execute'].name,
          data: {
            workflowId: workflowId,
            userId: userId,
            input: input,
          },
        });

        // Record execution in history
        await this.recordWorkflowExecution(
          taskId,
          workflowId,
          userId,
          'status-change',
          input
        );
      } catch (error: any) {
        console.error(`Error triggering workflow ${attachedWorkflow.workflowId} for task ${taskId}:`, error);
      }
    }
  }

  /**
   * Manually trigger a workflow attached to a task
   */
  async triggerWorkflowManually(
    taskId: string,
    workflowId: string,
    userId: string,
    input?: Record<string, any>
  ): Promise<void> {
    const task = await TaskModel.findOne({
      _id: taskId,
      userId: userId,
    });

    if (!task) {
      throw new Error('Task not found or unauthorized');
    }

    // Verify workflow is attached
    const attachedWorkflow = task.attachedWorkflows?.find(
      (aw: any) => aw.workflowId.toString() === workflowId
    );

    if (!attachedWorkflow) {
      throw new Error('Workflow is not attached to this task');
    }

    // Create execution input
    const executionInput = {
      taskId: taskId,
      taskName: task.name,
      taskStatus: task.status,
      taskData: {
        id: task.taskId,
        name: task.name,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        labels: task.labels,
      },
      ...(attachedWorkflow.config || {}),
      ...(input || {}),
    };

    // Start workflow execution via Inngest
    await inngest.send({
      name: events['workflow/execute'].name,
      data: {
        workflowId: workflowId,
        userId: userId,
        input: executionInput,
      },
    });

    // Record execution in history
    await this.recordWorkflowExecution(
      taskId,
      workflowId,
      userId,
      'manual',
      executionInput
    );
  }

  /**
   * Record workflow execution in task history
   */
  private async recordWorkflowExecution(
    taskId: string,
    workflowId: string,
    userId: string,
    triggeredBy: 'status-change' | 'schedule' | 'manual',
    input: Record<string, any>
  ): Promise<void> {
    const task = await TaskModel.findById(taskId);
    if (!task) {
      return;
    }

    if (!task.workflowExecutionHistory) {
      task.workflowExecutionHistory = [];
    }

    // Create execution record (executionId will be set after execution starts)
    const executionRecord: WorkflowExecutionHistory = {
      executionId: new Types.ObjectId(), // Placeholder, will be updated
      workflowId: new Types.ObjectId(workflowId),
      triggeredAt: new Date(),
      status: 'pending',
      triggeredBy: triggeredBy,
    };

    task.workflowExecutionHistory.push(executionRecord);
    await task.save();
  }

  /**
   * Update workflow execution history with execution result
   */
  async updateWorkflowExecutionHistory(
    taskId: string,
    executionId: string,
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
    result?: any,
    error?: string
  ): Promise<void> {
    const task = await TaskModel.findById(taskId);
    if (!task || !task.workflowExecutionHistory) {
      return;
    }

    const executionRecord = task.workflowExecutionHistory.find(
      (eh: any) => eh.executionId.toString() === executionId
    );

    if (executionRecord) {
      executionRecord.status = status;
      executionRecord.result = result;
      executionRecord.error = error;
      await task.save();
    }
  }

  /**
   * Schedule task workflows (for cron-based scheduling)
   */
  async scheduleTaskWorkflows(taskId: string, userId: string): Promise<void> {
    const task = await TaskModel.findOne({
      _id: taskId,
      userId: userId,
    });

    if (!task || !task.attachedWorkflows) {
      return;
    }

    // Find workflows with schedules
    const scheduledWorkflows = task.attachedWorkflows.filter(
      (aw: any) => aw.schedule && aw.schedule.type
    );

    // Schedule each workflow (this would integrate with Inngest cron)
    for (const attachedWorkflow of scheduledWorkflows) {
      // TODO: Create Inngest cron jobs for scheduled workflows
      // This would be handled by the scheduled-workflows Inngest function
      console.log(`Scheduling workflow ${attachedWorkflow.workflowId} for task ${taskId}`);
    }
  }
}

export const taskWorkflowService = new TaskWorkflowService();


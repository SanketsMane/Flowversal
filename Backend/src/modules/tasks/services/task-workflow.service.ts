import { Types } from 'mongoose';
import { TaskModel, ITask } from '../models/Task.model';

const toObjectId = (id: string) => new Types.ObjectId(id);

async function getTaskForUser(taskId: string, userId: string): Promise<ITask | null> {
  return TaskModel.findOne({
    _id: taskId,
    userId: toObjectId(userId),
  });
}

export const taskWorkflowService = {
  async attachWorkflowToTask(
    taskId: string,
    workflowId: string,
    userId: string,
    config: Record<string, any> = {}
  ): Promise<ITask> {
    const task = await getTaskForUser(taskId, userId);
    if (!task) {
      throw new Error('Task not found');
    }

    const exists = (task.attachedWorkflows || []).some(
      (w) => w.workflowId.toString() === workflowId
    );

    if (!exists) {
      task.attachedWorkflows = [
        ...(task.attachedWorkflows || []),
        { workflowId: toObjectId(workflowId), config },
      ];
      task.hasWorkflow = true;
      await task.save();
    }

    return task;
  },

  async detachWorkflowFromTask(taskId: string, workflowId: string, userId: string): Promise<ITask> {
    const task = await getTaskForUser(taskId, userId);
    if (!task) {
      throw new Error('Task not found');
    }

    task.attachedWorkflows =
      task.attachedWorkflows?.filter((w) => w.workflowId.toString() !== workflowId) || [];
    task.hasWorkflow = (task.attachedWorkflows || []).length > 0;
    await task.save();

    return task;
  },

  async getAttachedWorkflows(taskId: string, userId: string) {
    const task = await getTaskForUser(taskId, userId);
    if (!task) {
      throw new Error('Task not found');
    }
    return task.attachedWorkflows || [];
  },

  async triggerWorkflowManually(
    taskId: string,
    workflowId: string,
    userId: string,
    metadata: Record<string, any> = {}
  ) {
    const task = await getTaskForUser(taskId, userId);
    if (!task) {
      throw new Error('Task not found');
    }

    task.workflowExecutionHistory = [
      ...(task.workflowExecutionHistory || []),
      {
        executionId: new Types.ObjectId(),
        workflowId: toObjectId(workflowId),
        triggeredAt: new Date(),
        status: 'pending',
        triggeredBy: 'manual',
        result: metadata,
      },
    ];

    await task.save();
    return { success: true };
  },

  async triggerWorkflowsOnStatusChange(
    taskId: string,
    oldStatus: string,
    newStatus: string,
    userId: string
  ) {
    // For now, just log and return; hook point for future workflow execution.
    console.info(
      `[TaskWorkflowService] triggerWorkflowsOnStatusChange task=${taskId} ${oldStatus} -> ${newStatus} user=${userId}`
    );
    return { success: true };
  },
};


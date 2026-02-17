import { inngest } from './inngest.client';
import { TaskModel, ITask } from '../../../modules/tasks/models/Task.model';
import { taskWorkflowService } from '../../../modules/tasks/services/task-workflow.service';

/**
 * Inngest cron job to check and execute scheduled task workflows
 * Runs every minute to check for scheduled workflows
 */
export const scheduleTaskWorkflows = inngest.createFunction(
  { id: 'schedule-task-workflows', name: 'Schedule Task Workflows' },
  { cron: '*/1 * * * *' }, // Run every minute
  async ({ step }) => {
    // Find all tasks with scheduled workflows
    const tasks = await step.run('find-scheduled-tasks', async () => {
      return await TaskModel.find({
        hasWorkflow: true,
        'attachedWorkflows.schedule': { $exists: true, $ne: null },
      }).limit(100); // Process 100 tasks at a time
    }) as unknown as ITask[];

    const results = [];

    for (const task of tasks) {
      if (!task.attachedWorkflows || task.attachedWorkflows.length === 0) {
        continue;
      }

      for (const attachedWorkflow of task.attachedWorkflows) {
        if (!attachedWorkflow.schedule) {
          continue;
        }

        const schedule = attachedWorkflow.schedule;
        const shouldExecute = await step.run(
          `check-schedule-${task._id}-${attachedWorkflow.workflowId}`,
          async () => {
            return checkSchedule(schedule, task);
          }
        );

        if (shouldExecute) {
          // Trigger workflow
          await step.run(`trigger-workflow-${task._id}-${attachedWorkflow.workflowId}`, async () => {
            try {
              await taskWorkflowService.triggerWorkflowManually(
                task._id.toString(),
                task.userId.toString(),
                attachedWorkflow.workflowId.toString(),
                {
                  triggeredBy: 'schedule',
                  scheduleType: schedule.type,
                }
              );
              return { success: true };
            } catch (error: any) {
              console.error(`Error triggering scheduled workflow:`, error);
              return { success: false, error: error.message };
            }
          });

          results.push({
            taskId: task._id.toString(),
            workflowId: attachedWorkflow.workflowId.toString(),
            executed: true,
          });
        }
      }
    }

    return {
      processed: tasks.length,
      executed: results.length,
      results,
    };
  }
);

/**
 * Check if a schedule should execute now
 */
function checkSchedule(schedule: any, task: any): boolean {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayOfMonth = now.getDate();

  switch (schedule.type) {
    case 'daily':
      if (schedule.time) {
        const [scheduleHour, scheduleMinute] = schedule.time.split(':').map(Number);
        return hour === scheduleHour && minute === scheduleMinute;
      }
      return false;

    case 'weekly':
      if (schedule.daysOfWeek && schedule.daysOfWeek.includes(dayOfWeek)) {
        if (schedule.time) {
          const [scheduleHour, scheduleMinute] = schedule.time.split(':').map(Number);
          return hour === scheduleHour && minute === scheduleMinute;
        }
        return true; // Execute at start of day if no time specified
      }
      return false;

    case 'monthly':
      if (schedule.dayOfMonth === dayOfMonth) {
        if (schedule.time) {
          const [scheduleHour, scheduleMinute] = schedule.time.split(':').map(Number);
          return hour === scheduleHour && minute === scheduleMinute;
        }
        return true; // Execute at start of day if no time specified
      }
      return false;

    case 'onDueDate':
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const isDueDate = 
          dueDate.getDate() === dayOfMonth &&
          dueDate.getMonth() === now.getMonth() &&
          dueDate.getFullYear() === now.getFullYear();
        
        if (isDueDate && schedule.time) {
          const [scheduleHour, scheduleMinute] = schedule.time.split(':').map(Number);
          return hour === scheduleHour && minute === scheduleMinute;
        }
        return isDueDate;
      }
      return false;

    case 'custom':
      // For custom cron expressions, you would use a cron parser library
      // For now, return false as custom cron parsing requires additional dependencies
      console.warn('Custom cron expressions are not yet supported');
      return false;

    default:
      return false;
  }
}


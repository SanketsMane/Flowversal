import { inngest } from './inngest.client';
import { workflowExecutionService } from '../../../modules/workflows/services/workflow-execution.service';

/**
 * Inngest function for processing workflow steps
 */
export const processWorkflowStep = inngest.createFunction(
  { id: 'process-workflow-step' },
  { event: 'workflow/step' },
  async ({ event, step }) => {
    const { executionId, stepId } = event.data;

    // Process step
    await step.run('process-step', async () => {
      // Get execution
      const execution = await workflowExecutionService.getExecution(executionId, '');
      if (!execution) {
        throw new Error('Execution not found');
      }

      // Continue workflow execution
      // This is a simplified version - in production, you'd process individual steps
      return { success: true };
    });

    return { executionId, stepId, processed: true };
  }
);


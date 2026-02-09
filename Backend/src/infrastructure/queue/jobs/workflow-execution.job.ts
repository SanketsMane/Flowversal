import { WorkflowExecutionModel } from '../../../modules/workflows/models/WorkflowExecution.model';
import { workflowExecutionService } from '../../../modules/workflows/services/workflow-execution.service';
import { inngest } from './inngest.client';
/**
 * Inngest function for workflow execution with LangGraph
 * Supports state checkpointing for long-running workflows
 */
export const executeWorkflow = inngest.createFunction(
  { id: 'execute-workflow', name: 'Execute Workflow' },
  { event: 'workflow/execute' },
  async ({ event, step }) => {
    const { workflowId, userId, input, executionId: existingExecutionId, triggeredBy, triggerData } = event.data as any;
    // Start or reuse existing execution record
    const execution = await step.run('start-execution', async () => {
      if (existingExecutionId) {
        return await WorkflowExecutionModel.findById(existingExecutionId);
      }
      return await workflowExecutionService.startExecution(
        workflowId,
        userId,
        input || {},
        triggeredBy || 'event',
        triggerData,
        { enqueue: false, useQueue: false }
      );
    });
    if (!execution) {
      throw new Error('Execution record not found or could not be created');
    }
    const executionId = (execution as any)._id.toString();
    // Execute workflow with LangGraph (with checkpointing support)
    const result = await step.run('execute-workflow-langgraph', async () => {
      try {
        // Execute using LangGraph (will fall back to sequential if LangGraph fails)
        const completedExecution = await workflowExecutionService.executeWorkflow(
          executionId,
          { useLangGraph: true }
        );
        return {
          success: true,
          executionId: completedExecution._id.toString(),
          status: completedExecution.status,
        };
      } catch (error: any) {
        // If execution fails, update status
        const exec = await WorkflowExecutionModel.findById(executionId);
        if (exec) {
          exec.status = 'failed';
          exec.completedAt = new Date();
          exec.error = {
            message: error.message || 'Execution failed',
            stack: error.stack,
          };
          await exec.save();
        }
        throw error;
      }
    });
    return {
      executionId: result.executionId,
      status: result.status,
      success: result.success,
    };
  }
);
/**
 * Inngest function for workflow step processing (for complex multi-step workflows)
 */
export const processWorkflowStep = inngest.createFunction(
  { id: 'process-workflow-step', name: 'Process Workflow Step' },
  { event: 'workflow/step' },
  async ({ event, step }) => {
    const { executionId, stepId, stepData } = event.data;
    // This can be used for checkpointing individual steps
    // For now, it's a placeholder for future step-by-step execution
    await step.run('process-step', async () => {
      // Future: Process individual step with checkpointing
      return { stepId, processed: true };
    });
    return { executionId, stepId, processed: true };
  }
);

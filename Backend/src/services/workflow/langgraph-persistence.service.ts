import { WorkflowExecutionModel } from '../../modules/workflows/models/WorkflowExecution.model';
import { LangGraphWorkflowState } from './langgraph-state.types';

/**
 * LangGraph State Persistence Service
 * Handles saving and restoring workflow execution state for checkpointing and resumption
 */
export class LangGraphPersistenceService {
  /**
   * Save workflow state checkpoint
   */
  async saveCheckpoint(
    executionId: string,
    state: LangGraphWorkflowState,
    nodeId?: string
  ): Promise<void> {
    const execution = await WorkflowExecutionModel.findById(executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }

    // Store checkpoint in execution record
    // In production, you might want a separate checkpoints collection for large states
    execution.metadata = execution.metadata || {};
    execution.metadata.checkpoint = {
      nodeId: nodeId || state.currentStep,
      state: {
        variables: state.variables,
        nodeResults: Object.fromEntries(state.nodeResults),
        branchConditions: Object.fromEntries(state.branchConditions),
        activeBranches: state.activeBranches,
        stepsExecuted: state.stepsExecuted,
        loopCounters: state.loopCounters,
        loopLimits: state.loopLimits,
        version: state.version,
      },
      timestamp: new Date(),
    };

    await execution.save();
  }

  /**
   * Load workflow state checkpoint
   */
  async loadCheckpoint(executionId: string): Promise<Partial<LangGraphWorkflowState> | null> {
    const execution = await WorkflowExecutionModel.findById(executionId);
    if (!execution || !execution.metadata?.checkpoint) {
      return null;
    }

    const checkpoint = execution.metadata.checkpoint;
    return {
      variables: checkpoint.state.variables || {},
      nodeResults: new Map(Object.entries(checkpoint.state.nodeResults || {})),
      branchConditions: new Map(Object.entries(checkpoint.state.branchConditions || {})),
      activeBranches: checkpoint.state.activeBranches || [],
      stepsExecuted: checkpoint.state.stepsExecuted || 0,
      currentStep: checkpoint.nodeId,
      loopCounters: checkpoint.state.loopCounters || {},
      loopLimits: checkpoint.state.loopLimits || {},
      version: checkpoint.state.version,
    };
  }

  /**
   * Clear checkpoint (after successful completion)
   */
  async clearCheckpoint(executionId: string): Promise<void> {
    const execution = await WorkflowExecutionModel.findById(executionId);
    if (execution && execution.metadata) {
      delete execution.metadata.checkpoint;
      await execution.save();
    }
  }
}

export const langGraphPersistenceService = new LangGraphPersistenceService();


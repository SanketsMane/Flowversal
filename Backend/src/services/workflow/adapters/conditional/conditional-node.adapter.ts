import { LangGraphWorkflowState, LangGraphNodeContext } from '../../langgraph-state.types';
import { conditionalNodeExecutor } from '../../../nodes/conditional-node-executor';

/**
 * Convert ExecutionContext to LangGraphNodeContext
 */
function createNodeContext(
  nodeId: string,
  node: any,
  state: LangGraphWorkflowState,
  workflow: any,
  execution: any
): LangGraphNodeContext {
  return {
    nodeId,
    nodeType: node.type || 'unknown',
    nodeConfig: node.config || {},
    workflowState: state,
    previousNodeOutputs: state.nodeResults,
  };
}

/**
 * Convert LangGraphNodeContext to ExecutionContext for existing executors
 */
function createExecutionContext(
  nodeContext: LangGraphNodeContext,
  workflow: any,
  execution: any
): any {
  return {
    workflow,
    execution,
    input: nodeContext.workflowState.input,
    variables: nodeContext.workflowState.variables,
    stepResults: nodeContext.previousNodeOutputs,
  };
}

/**
 * Conditional Node Adapter
 * Executes conditional nodes (if/switch) and returns branch decision
 */
export function createConditionalNodeAdapter(
  nodeId: string,
  node: any,
  workflow: any,
  execution: any
) {
  return async (state: LangGraphWorkflowState): Promise<Partial<LangGraphWorkflowState>> => {
    const nodeContext = createNodeContext(nodeId, node, state, workflow, execution);
    const execContext = createExecutionContext(nodeContext, workflow, execution);

    try {
      // Update step status
      const stepIndex = state.steps.findIndex((s) => s.stepId === nodeId);
      if (stepIndex >= 0) {
        state.steps[stepIndex].status = 'running';
        state.steps[stepIndex].startedAt = new Date();
      }

      // Execute conditional node
      const result = await conditionalNodeExecutor.executeConditionalNode(node, execContext);

      // Determine branch path
      const conditionResult = result.result !== undefined ? result.result : result.branch === 'true';

      // Store result and branch condition
      const updatedState: Partial<LangGraphWorkflowState> = {
        nodeResults: new Map(state.nodeResults).set(nodeId, result),
        variables: {
          ...state.variables,
          [nodeId]: result,
        },
        branchConditions: new Map(state.branchConditions).set(nodeId, conditionResult),
        activeBranches: conditionResult ? [`${nodeId}:true`] : [`${nodeId}:false`],
      };

      // Update step status
      if (stepIndex >= 0) {
        const step = state.steps[stepIndex];
        step.status = 'completed';
        step.completedAt = new Date();
        step.duration = step.completedAt.getTime() - (step.startedAt?.getTime() || Date.now());
        step.output = result;
        updatedState.steps = [...state.steps];
        updatedState.stepsExecuted = state.steps.filter((s) => s.status === 'completed' || s.status === 'failed').length;
      }

      return updatedState;
    } catch (error: any) {
      // Handle error
      const errorState: Partial<LangGraphWorkflowState> = {
        errors: [
          ...state.errors,
          {
            nodeId,
            message: error.message || 'Conditional node execution failed',
            stack: error.stack,
            timestamp: new Date(),
          },
        ],
      };

      // Update step status
      const stepIndex = state.steps.findIndex((s) => s.stepId === nodeId);
      if (stepIndex >= 0) {
        const step = state.steps[stepIndex];
        step.status = 'failed';
        step.completedAt = new Date();
        step.duration = step.completedAt.getTime() - (step.startedAt?.getTime() || Date.now());
        step.error = error.message;
        errorState.steps = [...state.steps];
      }

      throw error;
    }
  };
}

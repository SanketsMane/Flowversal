import { LangGraphWorkflowState } from '../../langgraph-state.types';
/**
 * Basic Node Adapter
 * Handles simple node types (delay, log, set-variable)
 */
export function createBasicNodeAdapter(
  nodeId: string,
  node: any,
  _workflow: any,
  _execution: any
) {
  return async (state: LangGraphWorkflowState): Promise<Partial<LangGraphWorkflowState>> => {
    const nodeType = node.type || 'unknown';
    let result: any;
    try {
      // Update step status
      const stepIndex = state.steps.findIndex((s) => s.stepId === nodeId);
      if (stepIndex >= 0) {
        state.steps[stepIndex].status = 'running';
        state.steps[stepIndex].startedAt = new Date();
      }
      // Execute based on node type
      switch (nodeType) {
        case 'delay':
          const delayMs = node.config?.delay || 1000;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          result = { delayed: delayMs };
          break;
        case 'log':
          const message = node.config?.message || 'No message';
          result = { logged: message };
          break;
        case 'set-variable':
          const variableName = node.config?.variableName;
          const value = node.config?.value;
          if (variableName) {
            state.variables[variableName] = value;
          }
          result = { variableSet: variableName, value: value };
          break;
        default:
          result = node.config || {};
      }
      // Store result
      const updatedState: Partial<LangGraphWorkflowState> = {
        nodeResults: new Map(state.nodeResults).set(nodeId, result),
        variables: {
          ...state.variables,
          [nodeId]: result,
        },
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
            message: error.message || 'Basic node execution failed',
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

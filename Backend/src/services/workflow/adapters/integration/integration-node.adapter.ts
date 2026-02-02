import { LangGraphWorkflowState, LangGraphNodeContext } from '../../langgraph-state.types';
import { integrationNodeExecutor } from '../../../nodes/integration-node-executor';

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
 * Integration Node Adapter
 * Executes integration nodes (HTTP, email, webhook)
 */
export function createIntegrationNodeAdapter(
  nodeId: string,
  node: any,
  workflow: any,
  execution: any
) {
  return async (state: LangGraphWorkflowState): Promise<Partial<LangGraphWorkflowState>> => {
    const nodeContext = createNodeContext(nodeId, node, state, workflow, execution);
    const execContext = createExecutionContext(nodeContext, workflow, execution);

    const nodeType = node.type || 'http-request';
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
        case 'http-request':
          result = await integrationNodeExecutor.executeHTTPRequestNode(node, execContext);
          break;
        case 'email':
          result = await integrationNodeExecutor.executeEmailNode(node, execContext);
          break;
        case 'webhook':
          result = await integrationNodeExecutor.executeWebhookNode(node, execContext);
          break;
        default:
          throw new Error(`Unknown integration node type: ${nodeType}`);
      }

      // Store result
      const updatedState: Partial<LangGraphWorkflowState> = {
        nodeResults: new Map(state.nodeResults).set(nodeId, result),
        variables: {
          ...state.variables,
          [nodeId]: result,
        },
        apiCallsMade: state.apiCallsMade + 1,
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
            message: error.message || 'Integration node execution failed',
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

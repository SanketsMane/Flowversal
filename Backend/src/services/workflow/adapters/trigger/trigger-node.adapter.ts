import { LangGraphWorkflowState, LangGraphNodeContext } from '../../langgraph-state.types';
import { triggerExecutor } from '../../../nodes/trigger-executor';

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
 * Trigger Node Adapter
 */
export function createTriggerNodeAdapter(
  nodeId: string,
  node: any,
  workflow: any,
  execution: any
) {
  return async (state: LangGraphWorkflowState): Promise<Partial<LangGraphWorkflowState>> => {
    const nodeContext = createNodeContext(nodeId, node, state, workflow, execution);
    const execContext = createExecutionContext(nodeContext, workflow, execution);

    try {
      // Execute trigger
      const shouldFire = await triggerExecutor.executeTrigger(node, execContext);

      if (!shouldFire) {
        // Trigger condition not met
        return {
          status: 'cancelled',
          errors: [
            ...state.errors,
            {
              nodeId,
              message: 'Trigger condition not met',
              timestamp: new Date(),
            },
          ],
        };
      }

      // Trigger fired successfully
      return {
        nodeResults: new Map(state.nodeResults).set(nodeId, { fired: true }),
        variables: {
          ...state.variables,
          [nodeId]: { fired: true },
        },
      };
    } catch (error: any) {
      return {
        status: 'failed',
        errors: [
          ...state.errors,
          {
            nodeId,
            message: error.message || 'Trigger execution failed',
            stack: error.stack,
            timestamp: new Date(),
          },
        ],
      };
    }
  };
}

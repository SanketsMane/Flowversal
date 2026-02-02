import { LangGraphWorkflowState, LangGraphNodeContext } from '../../langgraph-state.types';
import { aiNodeExecutor } from '../../../nodes/ai-node-executor';

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
 * AI Node Adapter
 * Executes AI nodes (chat, agent, generate, workflow-generator)
 */
export function createAINodeAdapter(
  nodeId: string,
  node: any,
  workflow: any,
  execution: any
) {
  return async (state: LangGraphWorkflowState): Promise<Partial<LangGraphWorkflowState>> => {
    const nodeContext = createNodeContext(nodeId, node, state, workflow, execution);
    const execContext = createExecutionContext(nodeContext, workflow, execution);

    const nodeType = node.type || 'ai-chat';
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
        case 'ai-chat':
          result = await aiNodeExecutor.executeAIChatNode(node, execContext);
          break;
        case 'ai-agent':
          result = await aiNodeExecutor.executeAIAgentNode(node, execContext);
          break;
        case 'ai-generate':
          result = await aiNodeExecutor.executeAIGenerateNode(node, execContext);
          break;
        case 'ai-workflow-generator':
          result = await aiNodeExecutor.executeAIWorkflowGeneratorNode(node, execContext);
          break;
        default:
          result = await aiNodeExecutor.executeAIChatNode(node, execContext);
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

      // Track AI tokens
      if (result.tokensUsed || result.totalTokens) {
        updatedState.aiTokensUsed = state.aiTokensUsed + (result.tokensUsed || result.totalTokens || 0);
      }

      return updatedState;
    } catch (error: any) {
      // Handle error
      const errorState: Partial<LangGraphWorkflowState> = {
        errors: [
          ...state.errors,
          {
            nodeId,
            message: error.message || 'AI node execution failed',
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

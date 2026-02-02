import { LangGraphWorkflowState, LangGraphNodeContext } from '../../langgraph-state.types';
import { getNodeAdapter } from '../adapters';

/**
 * Minimal loop adapter to support for/while style loops inside workflow graphs.
 * It keeps counters in state to avoid infinite loops and reuses existing node adapters
 * to execute the loop body.
 */
export function createLoopNodeAdapter(
  nodeId: string,
  node: any,
  workflow: any,
  execution: any
) {
  return async (state: LangGraphWorkflowState): Promise<Partial<LangGraphWorkflowState>> => {
    const config = node.config || {};
    const loopType = config.loopType || 'for';
    const maxIterations = config.maxIterations ?? config.iterations ?? 10;
    const minIterations = config.iterations ?? 1;
    const counters = { ...(state.loopCounters || {}) };
    const limits = { ...(state.loopLimits || {}), [nodeId]: maxIterations };

    // Initialise step status
    const stepIndex = state.steps.findIndex((s) => s.stepId === nodeId);
    if (stepIndex >= 0) {
      state.steps[stepIndex].status = 'running';
      state.steps[stepIndex].startedAt = new Date();
    }

    const results: any[] = [];
    let iteration = counters[nodeId] ?? 0;

    const shouldContinue = (currentState: LangGraphWorkflowState, iter: number) => {
      if (iter >= maxIterations) return false;
      if (loopType === 'for') return iter < minIterations;

      // For while loops, evaluate a simple condition flag from state.variables or branchConditions
      const conditionKey = config.conditionKey || config.conditionVariable || node.conditionKey;
      if (!conditionKey) return iter < minIterations;

      const branchConditions = currentState.branchConditions;
      const variables = currentState.variables || {};
      if (branchConditions instanceof Map && branchConditions.has(conditionKey)) {
        return Boolean(branchConditions.get(conditionKey));
      }
      return Boolean((variables as Record<string, any>)[conditionKey]);
    };

    while (shouldContinue(state, iteration)) {
      // Track current iteration
      counters[nodeId] = iteration + 1;

      if (Array.isArray(node.nodes)) {
        for (const childNode of node.nodes) {
          const childId = `${nodeId}-iter-${iteration}-${childNode.id || 'node'}`;
          const adapter = getNodeAdapter(childId, childNode, workflow, execution);
          const stateUpdate = await adapter(state);
          Object.assign(state, stateUpdate);

          // Collect per-iteration results
          const childResult =
            stateUpdate.nodeResults?.get?.(childId) ?? state.nodeResults?.get?.(childId);
          if (childResult !== undefined) {
            results.push({ iteration, nodeId: childId, result: childResult });
          }
        }
      }

      // Optional short-circuit on condition change for while loops
      if (loopType === 'while') {
        const conditionKey = config.conditionKey || config.conditionVariable || node.conditionKey;
        if (conditionKey) {
          const branchConditions = state.branchConditions;
          const variables = state.variables || {};
          const conditionValue =
            (branchConditions instanceof Map && branchConditions.get(conditionKey)) ??
            (variables as Record<string, any>)[conditionKey];
          if (!conditionValue) break;
        }
      }

      iteration += 1;
      if (iteration >= maxIterations) break;
    }

    // Finish step bookkeeping
    const updatedState: Partial<LangGraphWorkflowState> = {
      nodeResults: new Map(state.nodeResults).set(nodeId, {
        iterations: counters[nodeId] ?? 0,
        results,
        loopType,
      }),
      loopCounters: counters,
      loopLimits: limits,
    };

    if (stepIndex >= 0) {
      const step = state.steps[stepIndex];
      step.status = 'completed';
      step.completedAt = new Date();
      step.duration = step.completedAt.getTime() - (step.startedAt?.getTime() || Date.now());
      step.output = { iterations: counters[nodeId] ?? 0, results };
      updatedState.steps = [...state.steps];
      updatedState.stepsExecuted = state.steps.filter(
        (s) => s.status === 'completed' || s.status === 'failed'
      ).length;
    }

    return updatedState;
  };
}


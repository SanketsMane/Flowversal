import { createAINodeAdapter } from './ai/ai-node.adapter';
import { createIntegrationNodeAdapter } from './integration/integration-node.adapter';
import { createConditionalNodeAdapter } from './conditional/conditional-node.adapter';
import { createTriggerNodeAdapter } from './trigger/trigger-node.adapter';
import { createLoopNodeAdapter } from './loop/loop-node.adapter';
import { createBasicNodeAdapter } from './basic/basic-node.adapter';
import { LangGraphWorkflowState } from '../langgraph-state.types';

/**
 * Get the appropriate node adapter for a given node
 */
export function getNodeAdapter(
  nodeId: string,
  node: any,
  workflow: any,
  execution: any
): (state: LangGraphWorkflowState) => Promise<Partial<LangGraphWorkflowState>> {
  const nodeType = node.type || 'unknown';
  const category = node.category || '';

  // AI nodes
  if (category === 'ai' || category === 'ai-agents' || nodeType.startsWith('ai-')) {
    return createAINodeAdapter(nodeId, node, workflow, execution);
  }

  // Integration nodes
  if (category === 'integration' || category === 'action') {
    return createIntegrationNodeAdapter(nodeId, node, workflow, execution);
  }

  // Conditional nodes
  if (category === 'logic' || nodeType === 'condition' || nodeType === 'if' || nodeType === 'switch') {
    return createConditionalNodeAdapter(nodeId, node, workflow, execution);
  }

  // Loop nodes
  if (category === 'loop' || nodeType === 'loop' || nodeType === 'for' || nodeType === 'while') {
    return createLoopNodeAdapter(nodeId, node, workflow, execution);
  }

  // Trigger nodes
  if (nodeType === 'trigger') {
    return createTriggerNodeAdapter(nodeId, node, workflow, execution);
  }

  // Basic nodes
  if (nodeType === 'delay' || nodeType === 'log' || nodeType === 'set-variable') {
    return createBasicNodeAdapter(nodeId, node, workflow, execution);
  }

  // Default to basic adapter
  return createBasicNodeAdapter(nodeId, node, workflow, execution);
}

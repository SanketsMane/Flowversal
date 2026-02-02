/**
 * Sub-Step Node Card
 * Wrapper around NodeCard that adapts it to work with sub-step store instead of workflow store
 */

import { WorkflowNode } from '../../types';
import { NodeCard } from '../canvas/NodeCard';
import { useSubStepStore } from '@/features/workflow-builder/stores/subStepStore';
import { useUIStore } from '../../stores/uiStore';
import { useWorkflowStore } from '../../stores/workflowStore';

interface SubStepNodeCardProps {
  node: WorkflowNode;
  subStepId: string;
  nodeIndex: number;
  onMove: (containerIndex: number, fromIndex: number, toIndex: number) => void;
}

/**
 * This component wraps NodeCard and provides the necessary context for nodes inside sub-steps
 * It creates a virtual container that NodeCard expects, but routes all actions to the sub-step store
 */
export function SubStepNodeCard({ node, subStepId, nodeIndex, onMove }: SubStepNodeCardProps) {
  const { updateSubStepNode, removeNodeFromSubStep, subStepContainers } = useSubStepStore();
  const { openNodeSetup, isNodeSelected, selectNode } = useUIStore();
  const workflowStore = useWorkflowStore();

  // Find the sub-step
  const subStep = subStepContainers.find(s => s.id === subStepId);
  if (!subStep) {
    console.error(`SubStepNodeCard: SubStep ${subStepId} not found`);
    return null;
  }

  // Create a virtual container that NodeCard expects
  // This allows NodeCard to work without modification
  const virtualContainer = {
    id: subStepId, // Use subStepId as the container ID
    name: subStep.name,
    description: subStep.description,
    nodes: subStep.nodes,
    expanded: true,
  };

  // Override the workflow store methods to use sub-step store instead
  // We'll temporarily inject our methods before NodeCard uses them
  const originalToggleNode = workflowStore.toggleNode;
  const originalDeleteNode = workflowStore.deleteNode;
  const originalUpdateNode = workflowStore.updateNode;
  const originalAddNode = workflowStore.addNode;

  // Temporarily override workflow store methods to work with sub-steps
  workflowStore.toggleNode = (containerId: string, nodeId: string) => {
    if (containerId === subStepId) {
      const node = subStep.nodes.find(n => n.id === nodeId);
      if (node) {
        updateSubStepNode(subStepId, nodeId, { enabled: !node.enabled });
      }
    } else {
      originalToggleNode(containerId, nodeId);
    }
  };

  workflowStore.deleteNode = (containerId: string, nodeId: string) => {
    if (containerId === subStepId) {
      removeNodeFromSubStep(subStepId, nodeId);
    } else {
      originalDeleteNode(containerId, nodeId);
    }
  };

  workflowStore.updateNode = (containerId: string, nodeId: string, updates: Partial<WorkflowNode>) => {
    if (containerId === subStepId) {
      updateSubStepNode(subStepId, nodeId, updates);
    } else {
      originalUpdateNode(containerId, nodeId, updates);
    }
  };

  workflowStore.addNode = (containerId: string, node: WorkflowNode, index?: number) => {
    if (containerId === subStepId) {
      // Add node to sub-step (duplicate functionality)
      const { addNodeToSubStep } = useSubStepStore.getState();
      addNodeToSubStep(subStepId, node);
    } else {
      originalAddNode(containerId, node, index);
    }
  };

  // Restore original methods after render
  React.useEffect(() => {
    return () => {
      workflowStore.toggleNode = originalToggleNode;
      workflowStore.deleteNode = originalDeleteNode;
      workflowStore.updateNode = originalUpdateNode;
      workflowStore.addNode = originalAddNode;
    };
  });

  // Render NodeCard with virtual container
  // We pass containerIndex=0 because we only have one virtual container
  return (
    <NodeCard
      node={node}
      containerIndex={0}
      nodeIndex={nodeIndex}
      onMove={onMove}
    />
  );
}

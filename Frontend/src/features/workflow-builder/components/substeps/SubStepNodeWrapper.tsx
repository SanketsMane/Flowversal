/**
 * Sub-Step Node Wrapper
 * Wraps NodeCard and provides sub-step context to make node operations work correctly
 */

import { useEffect } from 'react';
import { WorkflowNode } from '../../types';
import { NodeCard } from '../canvas/NodeCard';
import { useWorkflowStore } from '../../stores/workflowStore';
import { useSubStepStore } from '@/features/workflow-builder/stores/subStepStore';

interface SubStepNodeWrapperProps {
  node: WorkflowNode;
  subStepId: string;
  nodeIndex: number;
  onMove: (containerIndex: number, fromIndex: number, toIndex: number) => void;
}

/**
 * This wrapper creates a virtual container for nodes in sub-steps
 * and routes all workflow store operations to the sub-step store instead
 */
export function SubStepNodeWrapper({ node, subStepId, nodeIndex, onMove }: SubStepNodeWrapperProps) {
  const workflowStore = useWorkflowStore();
  const subStepStore = useSubStepStore();
  
  // Create a virtual container that NodeCard expects
  // We temporarily add it to workflow store's containers array
  useEffect(() => {
    const subStep = subStepStore.subStepContainers.find(s => s.id === subStepId);
    if (!subStep) return;

    // Get current containers
    const containers = workflowStore.containers;
    
    // Check if virtual container already exists
    const virtualContainerExists = containers.some(c => c.id === subStepId);
    
    if (!virtualContainerExists) {
      // Add virtual container temporarily
      const virtualContainer = {
        id: subStepId,
        name: subStep.name,
        description: subStep.description,
        nodes: subStep.nodes,
        expanded: true,
      };
      
      // We don't actually add it to prevent persistence issues
      // Instead, we'll override the methods at call time
    }

    // Cleanup
    return () => {
      // Remove virtual container if it was added
      // (In our case, we don't add it to avoid issues)
    };
  }, [subStepId, subStepStore.subStepContainers, workflowStore.containers]);

  // Temporarily override workflow store methods to use sub-step store
  const originalToggleNode = workflowStore.toggleNode;
  const originalDeleteNode = workflowStore.deleteNode;
  const originalUpdateNode = workflowStore.updateNode;
  const originalAddNode = workflowStore.addNode;

  // Override toggle
  workflowStore.toggleNode = (containerId: string, nodeId: string) => {
    if (containerId === subStepId) {
      subStepStore.toggleNodeInSubStep(subStepId, nodeId);
    } else {
      originalToggleNode(containerId, nodeId);
    }
  };

  // Override delete
  workflowStore.deleteNode = (containerId: string, nodeId: string) => {
    if (containerId === subStepId) {
      subStepStore.removeNodeFromSubStep(subStepId, nodeId);
    } else {
      originalDeleteNode(containerId, nodeId);
    }
  };

  // Override update
  workflowStore.updateNode = (containerId: string, nodeId: string, updates: Partial<WorkflowNode>) => {
    if (containerId === subStepId) {
      subStepStore.updateNodeInSubStep(subStepId, nodeId, updates);
    } else {
      originalUpdateNode(containerId, nodeId, updates);
    }
  };

  // Override add (for duplicate)
  workflowStore.addNode = (containerId: string, node: WorkflowNode, index?: number) => {
    if (containerId === subStepId) {
      subStepStore.addNodeToSubStep(subStepId, node);
    } else {
      originalAddNode(containerId, node, index);
    }
  };

  // Restore original methods after render
  useEffect(() => {
    return () => {
      workflowStore.toggleNode = originalToggleNode;
      workflowStore.deleteNode = originalDeleteNode;
      workflowStore.updateNode = originalUpdateNode;
      workflowStore.addNode = originalAddNode;
    };
  });

  // Find the container index (we'll use a virtual index)
  // Since we're managing this separately, we use 0 as a placeholder
  const virtualContainerIndex = 0;

  return (
    <NodeCard
      node={node}
      containerIndex={virtualContainerIndex}
      nodeIndex={nodeIndex}
      onMove={onMove}
      subStepContext={{
        subStepId,
        isSubStep: true,
      }}
    />
  );
}

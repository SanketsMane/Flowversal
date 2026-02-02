/**
 * Delete Node Confirmation Container
 * Renders the Delete Node Confirmation Dialog at app level using global UI state
 */

import React from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useUIStore } from '../../stores/uiStore';
import { useWorkflowStore } from '../../stores/workflowStore';
import { useSubStepStore } from '@/features/workflow-builder/stores/subStepStore';
import { DeleteNodeConfirmDialog } from './DeleteNodeConfirmDialog';

export function DeleteNodeConfirmContainer() {
  const { theme } = useTheme();
  const { isDeleteNodeConfirmOpen, deleteNodeContext, closeDeleteNodeConfirm } = useUIStore();
  const { deleteNode, containers } = useWorkflowStore();
  const { removeNodeFromSubStep, subStepContainers } = useSubStepStore();

  if (!isDeleteNodeConfirmOpen || !deleteNodeContext) {
    return null;
  }

  const { containerId, nodeId, nodeName } = deleteNodeContext;

  const handleConfirm = () => {
    // Check if the node is in a sub-step
    const isInSubStep = subStepContainers.some(s => s.id === containerId);
    
    if (isInSubStep) {
      // Delete from sub-step
      removeNodeFromSubStep(containerId, nodeId);
    } else {
      // Delete from main workflow
      deleteNode(containerId, nodeId);
    }
    
    closeDeleteNodeConfirm();
  };

  return (
    <DeleteNodeConfirmDialog
      isOpen={isDeleteNodeConfirmOpen}
      nodeName={nodeName}
      onConfirm={handleConfirm}
      onCancel={closeDeleteNodeConfirm}
      theme={theme}
    />
  );
}
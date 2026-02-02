/**
 * Form Setup Modal Container
 * Renders the Form Setup Modal at app level using global UI state
 */

import React, { useEffect, Suspense, lazy } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useUIStore } from '../../stores/uiStore';
import { useWorkflowStore } from '../../stores/workflowStore';
import { useSubStepStore } from '@/features/workflow-builder/stores/subStepStore';

// Lazy load the heavy FormSetupModal component
const FormSetupModal = lazy(() => import('./FormSetupModal').then(module => ({ default: module.FormSetupModal })));

// Loading fallback component
const ModalLoadingFallback = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="text-gray-700 dark:text-gray-300">Loading...</span>
      </div>
    </div>
  </div>
);

export function FormSetupModalContainer() {
  const { theme } = useTheme();
  const { isFormSetupOpen, formSetupContext, closeFormSetup } = useUIStore();
  const { containers, updateNode } = useWorkflowStore();
  const { subStepContainers, updateNodeInSubStep } = useSubStepStore();

  // Handle cleanup in useEffect to avoid setState during render
  useEffect(() => {
    if (!isFormSetupOpen || !formSetupContext) {
      return;
    }

    const { containerId, nodeId } = formSetupContext;

    // Check if node exists in main workflow
    const container = containers.find(c => c.id === containerId);
    const nodeInMain = container?.nodes.find(n => n.id === nodeId);

    // Check if node exists in sub-steps
    const subStep = subStepContainers.find(s => s.id === containerId);
    const nodeInSubStep = subStep?.nodes.find(n => n.id === nodeId);

    // If node not found in either location, close modal
    if (!nodeInMain && !nodeInSubStep) {
      console.error('Container or node not found:', { containerId, nodeId });
      closeFormSetup();
    }
  }, [isFormSetupOpen, formSetupContext, containers, subStepContainers, closeFormSetup]);

  if (!isFormSetupOpen || !formSetupContext) {
    return null;
  }

  const { containerId, nodeId } = formSetupContext;

  // Try to find the node in main workflow containers first
  let container = containers.find(c => c.id === containerId);
  let node = container?.nodes.find(n => n.id === nodeId);
  let isSubStepNode = false;
  let subStepId = '';

  // If not found in main containers, check sub-step containers
  if (!node) {
    const subStep = subStepContainers.find(s => s.id === containerId);
    if (subStep) {
      node = subStep.nodes.find(n => n.id === nodeId);
      isSubStepNode = true;
      subStepId = subStep.id;
      // Create a virtual container for consistency
      container = {
        id: subStep.id,
        name: subStep.name,
        description: subStep.description,
        nodes: subStep.nodes,
        expanded: true,
      };
    }
  }

  if (!container || !node) {
    // Don't close here - it will happen in useEffect
    return null;
  }

  return (
    <Suspense fallback={<ModalLoadingFallback />}>
      <FormSetupModal
        node={node}
        onClose={closeFormSetup}
        onSave={(formFields) => {
          if (isSubStepNode) {
            // Update node in sub-step
            updateNodeInSubStep(subStepId, nodeId, {
              config: {
                ...node.config,
                formFields,
              },
            });
          } else {
            // Update node in main workflow
            updateNode(containerId, nodeId, {
              config: {
                ...node.config,
                formFields,
              },
            });
          }
          closeFormSetup();
        }}
        theme={theme}
      />
    </Suspense>
  );
}
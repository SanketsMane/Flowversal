/**
 * Workflow Canvas Component
 * Phase 2 - Component Extraction
 * 
 * Main canvas area displaying triggers and workflow steps
 */
import { useTheme } from '@/core/theme/ThemeContext';
import { useSubStepStore } from '@/features/workflow-builder/stores/subStepStore';
import { Plus, Rocket } from 'lucide-react';
import React, { Suspense, lazy, useMemo, useRef, useState } from 'react';
import { useVisualExecution } from '../../hooks/useVisualExecution';
import { useWorkflowExecution } from '../../hooks/useWorkflowExecution';
import { useUIStore, useWorkflowStore } from '../../stores';
import { Container } from '../../types';
import { ManualConnectionRenderer } from '../connections/ManualConnectionRenderer';
import { ConnectionDataFlow, NodeExecutionState, VisualExecutionOverlay } from '../execution/VisualExecutionOverlay';
import { FieldPropertiesModal } from '../form/FieldPropertiesModal';
import { FieldTypeSelectorModal } from '../form/FieldTypeSelectorModal';
import { FormFieldManagerContainer } from '../form/FormFieldManagerContainer';
import { ConditionBuilderModal } from '../properties/ConditionBuilderModal';
import { SubStepContainer } from '../substeps/SubStepContainer';
import { InfiniteCanvas } from './InfiniteCanvas';
import { StepContainer } from './StepContainer';
import { TriggerSection } from './TriggerSection';
// Lazy load heavy components
const UnifiedNodePickerModal = lazy(() => import('./UnifiedNodePickerModal').then(module => ({ default: module.UnifiedNodePickerModal })));
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
export function WorkflowCanvas() {
  const { theme } = useTheme();
  // CRITICAL: Use selector to ensure re-renders when containers change
  const containers = useWorkflowStore((state) => state.containers);
  const addContainer = useWorkflowStore((state) => state.addContainer);
  const triggers = useWorkflowStore((state) => state.triggers);
  const { isNodePickerOpen, openNodePicker, closeNodePicker } = useUIStore();
  const { isExecuting, nodeStates } = useVisualExecution();
  const { 
    isExecuting: isBackendExecuting, 
    nodeStates: backendNodeStatesArray,
    backendExecutionId 
  } = useWorkflowExecution();
  const { subStepContainers } = useSubStepStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [connectionDataFlows, setConnectionDataFlows] = useState<ConnectionDataFlow[]>([]);
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null);
  // Convert backend node states array to NodeExecutionState format
  const backendNodeStates = useMemo(() => {
    if (!backendNodeStatesArray || backendNodeStatesArray.length === 0) {
      return [];
    }
    return backendNodeStatesArray.map((ns) => {
      const element = document.querySelector(`[data-node-id="${ns.id}"]`);
      let position = { x: 0, y: 0 };
      if (element) {
        const rect = element.getBoundingClientRect();
        position = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      } else {
        console.warn('[DEBUG] WorkflowCanvas: Node element not found', { nodeId: ns.id, selector: `[data-node-id="${ns.id}"]` });
      }
      return {
        id: ns.id,
        status: ns.status,
        position,
        type: 'node' as const,
        inputData: (ns as any).inputData,
        outputData: (ns as any).outputData,
        duration: (ns as any).duration,
        error: (ns as any).error,
      };
    });
  }, [backendNodeStatesArray]);
  // Debug logging when containers change
  React.useEffect(() => {
  }, [containers]);
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  // Check if Form Submit trigger exists
  const hasFormSubmitTrigger = triggers.some(trigger => trigger.type === 'form_submit');
  // Merge execution states from both hooks (prioritize WebSocket data)
  const mergedNodeStates = useMemo(() => {
    const statesMap = new Map<string, NodeExecutionState>();
    // Add states from useVisualExecution (legacy/simulation)
    nodeStates.forEach((ns) => {
      statesMap.set(ns.id, {
        id: ns.id,
        status: ns.status,
        position: ns.position,
        type: ns.type,
      });
    });
    // Override with WebSocket states (real-time data takes priority)
    backendNodeStates.forEach((ns) => {
      statesMap.set(ns.id, ns);
    });
    const merged = Array.from(statesMap.values());
    return merged;
  }, [nodeStates, backendNodeStates]);
  // Determine if execution is active
  const isExecutionActive = isExecuting || isBackendExecuting;
  const handleAddStep = () => {
    const newContainer: Container = {
      id: `container-${Date.now()}`,
      type: 'container',
      title: `Step ${containers.length + 1}`,
      subtitle: 'Add nodes to this step',
      elements: [],
      nodes: [],
    };
    addContainer(newContainer);
  };
  return (
    <>
      {/* Main Canvas Content - Wrapped in InfiniteCanvas */}
      <InfiniteCanvas>
        <div className="p-8 min-h-full ml-32 infinite-canvas-content max-w-3xl" ref={canvasRef} style={{ position: 'relative' }}>
          {/* Trigger Section */}
          <TriggerSection />
          {/* REMOVED: Vertical Line Connector - Not needed with manual connection dots system */}
          {/* Users create connections manually by dragging from connection dots */}
          {/* Step Containers */}
          <div className="space-y-6 mt-8">
            {containers.map((container, index) => (
              <React.Fragment key={container.id}>
                <StepContainer 
                  container={container} 
                  containerIndex={index} 
                  stepNumber={index + 1}
                />
                {/* REMOVED: Connector lines between steps - Not needed with manual connection dots */}
              </React.Fragment>
            ))}
          </div>
          {/* Sub-Step Containers - Absolutely Positioned */}
          {subStepContainers.map((subStep) => {
            // Calculate substep number based on parent node's position within the container
            let stepNumber: string | undefined;
            const parentContainer = containers.find(c => c.id === subStep.parentContainerId);
            if (parentContainer) {
              const containerIndex = containers.indexOf(parentContainer);
              // Find the parent node within the container
              const nodeIndex = parentContainer.nodes.findIndex(n => n.id === subStep.parentNodeId);
              if (nodeIndex !== -1) {
                // Format: containerNumber.nodeNumber (e.g., "1.3" for 3rd node in step 1)
                stepNumber = `${containerIndex + 1}.${nodeIndex + 1}`;
              }
            }
            return (
              <SubStepContainer key={subStep.id} subStep={subStep} stepNumber={stepNumber} />
            );
          })}
          {/* Add Step Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handleAddStep}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg
                border-2 border-dashed ${borderColor}
                ${theme === 'dark' ? 'hover:border-[#00C6FF] bg-[#1A1A2E]' : 'hover:border-blue-400 bg-white'}
                ${textSecondary}
                transition-all duration-200
                group
              `}
            >
              <Plus className="w-5 h-5" />
              <span>Add Step</span>
            </button>
          </div>
          {/* Empty State - Show if no trigger and no steps */}
          {triggers.length === 0 && containers.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center mb-4">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-xl mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Start Building Your Workflow
              </h3>
              <p className={`${textSecondary} mb-6 max-w-md`}>
                Click <span className="text-[#00C6FF]">Browse Triggers</span> above to add a trigger and begin automating your tasks.
              </p>
            </div>
          )}
        </div>
        {/* OLD: Manual Connection Layer - DISABLED (replaced by ManualConnectionRenderer) */}
        {/* <ManualConnectionLayer /> */}
        {/* OLD: Sequential Connection Layer - DISABLED (using ConnectionPoint system instead) */}
        {/* <SequentialConnectionLayer /> */}
        {/* NEW: Manual Connection Renderer - Render manual connections with hover effects */}
        <ManualConnectionRenderer />
        {/* REMOVED: Sub-Step Connection Renderer - Not needed, users use manual connection dots */}
        {/* <SubStepConnectionRenderer /> */}
      </InfiniteCanvas>
      {/* Form Field Manager - If Form Submit trigger exists */}
      {hasFormSubmitTrigger && <FormFieldManagerContainer />}
      {/* Modals */}
      <Suspense fallback={<ModalLoadingFallback />}>
        <UnifiedNodePickerModal isOpen={isNodePickerOpen} onClose={closeNodePicker} />
      </Suspense>
      <FieldTypeSelectorModal />
      <FieldPropertiesModal />
      <ConditionBuilderModal />
      {/* Visual Execution Overlay with WebSocket integration */}
      <VisualExecutionOverlay 
        nodeStates={mergedNodeStates} 
        isExecuting={isExecutionActive}
        connectionDataFlows={connectionDataFlows}
        onConnectionHover={setHoveredConnection}
      />
    </>
  );
}
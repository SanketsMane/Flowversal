/**
 * Step Container Component
 * Phase 2 - Component Extraction
 * 
 * Container for workflow steps with nodes and drop zones
 */
import { Plus, Trash2, ChevronDown, Package } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useWorkflowStore, useUIStore, useSelectionStore } from '../../stores';
import { Container } from '../../types';
import { StepHeader } from './StepHeader';
import { NodeCard } from './NodeCard';
import { useDrop } from 'react-dnd';
import { NodeRegistry } from '../../registries';
interface StepContainerProps {
  container: Container;
  containerIndex: number;
  stepNumber: number;
}
export function StepContainer({ container, containerIndex, stepNumber }: StepContainerProps) {
  const { theme } = useTheme();
  const { moveNode, deleteContainer, addNode } = useWorkflowStore();
  const { openNodePicker, openDeleteContainerConfirm } = useUIStore();
  const { selection } = useSelectionStore();
  const bgColor = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  // Drop zone for dragging nodes from sidebar
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ['SIDEBAR_NODE', 'SIDEBAR_TOOL'],
    drop: (item: any) => {
      // Handle drop from sidebar
      if (item.nodeType) {
        const nodeDef = NodeRegistry.get(item.nodeType);
        if (nodeDef) {
          const newNode = NodeRegistry.createInstance(item.nodeType);
          if (newNode) {
            addNode(container.id, newNode);
          }
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));
  const handleAddNode = () => {
    openNodePicker('step', container.id);
  };
  const handleAddNodeFromMenu = (nodeType: string) => {
    const newNode = NodeRegistry.createInstance(nodeType);
    if (newNode) {
      addNode(container.id, newNode);
    }
  };
  const handleDeleteContainer = () => {
    // Always show confirmation modal
    openDeleteContainerConfirm(container.id, container.title);
  };
  // Get quick add nodes
  const quickAddNodes = [
    { type: 'prompt_builder', label: 'Prompt Builder', category: 'ai' },
    { type: 'if', label: 'If Condition', category: 'logic' },
    { type: 'send_email', label: 'Send Email', category: 'actions' },
    { type: 'http_request', label: 'HTTP Request', category: 'integration' },
    { type: 'delay', label: 'Delay', category: 'flow' },
    { type: 'transform_data', label: 'Transform Data', category: 'data' },
  ];
  const dropZoneClasses = `
    ${isOver && canDrop ? 'border-[#00C6FF] bg-[#00C6FF]/5' : borderColor}
    ${canDrop ? 'border-dashed' : 'border-dashed'}
  `;
  return (
    <div 
      ref={drop}
      className={`${bgColor} border ${borderColor} rounded-lg p-6 relative group transition-all ${
        isOver && canDrop ? 'ring-2 ring-[#00C6FF]/50' : ''
      } z-10`}
      data-container-id={container.id}
    >
      {/* Delete Button (top-right) */}
      {containerIndex > 0 && ( // Don't show delete for first container
        <button
          onClick={handleDeleteContainer}
          className="absolute top-4 right-4 p-2 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
          title="Delete step"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      )}
      {/* Header */}
      <div className="mb-4">
        <StepHeader
          containerId={container.id}
          title={container.title}
          subtitle={container.subtitle}
          stepNumber={stepNumber}
        />
      </div>
      {/* Nodes */}
      {container.nodes.length > 0 ? (
        <div className="space-y-3 mb-4">
          {container.nodes.map((node, nodeIndex) => {
            // Calculate node number: stepNumber.nodeNumber (e.g., "1.3")
            const nodeNumber = `${stepNumber}.${nodeIndex + 1}`;
            return (
              <NodeCard
                key={node.id}
                node={node}
                containerIndex={containerIndex}
                nodeIndex={nodeIndex}
                onMove={moveNode}
                nodeNumber={nodeNumber}
              />
            );
          })}
        </div>
      ) : (
        <div className={`border-2 ${dropZoneClasses} rounded-lg p-8 text-center mb-4 transition-all`}>
          {isOver && canDrop ? (
            <>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center mx-auto mb-2">
                <Package className="w-6 h-6 text-white" />
              </div>
              <p className="text-[#00C6FF] font-medium text-sm mb-1">
                Drop node here
              </p>
              <p className={`${textSecondary} text-xs`}>
                Release to add node to this step
              </p>
            </>
          ) : (
            <>
              <p className={`${textSecondary} text-sm mb-2`}>
                No nodes yet
              </p>
              <p className={`${textSecondary} text-xs`}>
                Drag nodes from sidebar or click below to add
              </p>
            </>
          )}
        </div>
      )}
      {/* Add Actions Button - Directly open node picker */}
      <button
        onClick={() => {
          openNodePicker('step', container.id);
        }}
        className={`w-full border-2 border-dashed ${borderColor} border-green-400/70 rounded-lg p-3 text-sm ${textSecondary} flex items-center justify-center gap-2 transition-all
          bg-white/95 dark:bg-[#0a1b12] dark:border-green-500/60
          text-green-700 dark:text-green-200
          shadow-[0_0_0_2px_rgba(34,197,94,0.25)]
          hover:shadow-[0_0_18px_rgba(34,197,94,0.6)]
          hover:border-green-400 hover:text-green-600 dark:hover:text-green-100`}
      >
        <Plus className="w-4 h-4" />
        Add Actions
      </button>
      {/* Form Container Badge */}
      {container.isFormContainer && (
        <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white text-xs font-semibold rounded-full">
          AI Form
        </div>
      )}
      {/* Drop Zone Indicator */}
      {canDrop && (
        <div className="absolute -top-2 -left-2 -right-2 -bottom-2 border-2 border-dashed border-[#00C6FF] rounded-xl pointer-events-none opacity-50" />
      )}
    </div>
  );
}
/**
 * Sub-Step Container Component
 * A full container (like workflow step) for sub-steps
 * Positioned absolutely and draggable on canvas
 */

import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, X, Check, GripVertical } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useSubStepStore, SubStepContainer as SubStepContainerType } from '@/features/workflow-builder/stores/subStepStore';
import { useUIStore } from '../../stores/uiStore';
import { NodeCard } from '../canvas/NodeCard';
import { DeleteConfirmationDialog } from '../dialogs/DeleteConfirmationDialog';

interface SubStepContainerProps {
  subStep: SubStepContainerType;
  stepNumber?: string; // e.g., "1.1", "1.2", "2.1"
}

export function SubStepContainer({ subStep, stepNumber }: SubStepContainerProps) {
  const { theme } = useTheme();
  const { updateSubStepContainer, removeSubStepContainer, updateSubStepNode, removeNodeFromSubStep, addNodeToSubStep } = useSubStepStore();
  const { openNodePicker, openNodeSetup, openDeleteNodeConfirm } = useUIStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(subStep.name);
  const [editedDescription, setEditedDescription] = useState(subStep.description);
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0, elementX: 0, elementY: 0 });

  // Theme colors
  const cardBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-300';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  const handleToggleExpanded = () => {
    updateSubStepContainer(subStep.id, { expanded: !subStep.expanded });
  };

  const handleSaveName = () => {
    if (editedName.trim()) {
      updateSubStepContainer(subStep.id, {
        name: editedName.trim(),
        description: editedDescription.trim(),
      });
    }
    setIsEditingName(false);
  };

  const handleNodeMove = (containerIndex: number, fromIndex: number, toIndex: number) => {
    // Reorder nodes within sub-step
    // Use the same filter that's used for rendering
    const validNodes = subStep.nodes.filter(node => node && node.id);
    
    // Check if indices are within bounds
    // If not, it means nodes were added/removed during drag - abort the move
    if (fromIndex < 0 || fromIndex >= validNodes.length || toIndex < 0 || toIndex >= validNodes.length) {
      console.warn('Invalid node move indices - nodes may have changed during drag:', { 
        fromIndex, 
        toIndex, 
        length: validNodes.length,
        nodeIds: validNodes.map(n => n.id)
      });
      return;
    }
    
    // Additional safety check: make sure fromIndex and toIndex are different
    if (fromIndex === toIndex) {
      return;
    }
    
    const newNodes = [...validNodes];
    const [movedNode] = newNodes.splice(fromIndex, 1);
    newNodes.splice(toIndex, 0, movedNode);
    updateSubStepContainer(subStep.id, { nodes: newNodes });
  };

  // Drag handlers
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    // Don't drag if clicking on buttons or interactive elements
    const target = e.target as HTMLElement;
    
    // Allow dragging from grip icon OR blank header space
    const clickedOnButton = target.closest('button');
    const clickedOnInput = target.closest('input');
    
    // If clicked on button or input, don't start dragging
    if (clickedOnButton || clickedOnInput) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    const canvasElement = document.querySelector('.infinite-canvas-content') as HTMLElement;
    if (!canvasElement) return;

    // Get initial mouse position
    const startX = e.clientX;
    const startY = e.clientY;
    
    // Get initial element position
    const startPosX = subStep.position.x;
    const startPosY = subStep.position.y;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate raw delta in screen pixels
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      // Update position directly with the delta
      // No need to account for transforms since we're tracking relative movement
      updateSubStepContainer(subStep.id, {
        position: {
          x: startPosX + deltaX,
          y: startPosY + deltaY,
        },
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={containerRef}
      data-substep-id={subStep.id}
      data-parent-node-id={subStep.parentNodeId}
      className={`${cardBg} border-2 ${borderColor} rounded-xl shadow-xl ${
        isDragging ? 'opacity-70 shadow-2xl' : ''
      }`}
      style={{
        position: 'absolute',
        left: `${subStep.position.x}px`,
        top: `${subStep.position.y}px`,
        width: '400px',
        minWidth: '400px',
        zIndex: isDragging ? 1000 : 100,
        transition: isDragging ? 'none' : 'box-shadow 0.2s',
      }}
    >
      {/* Header with Drag Handle */}
      <div
        className={`px-4 py-3 border-b ${borderColor} flex items-center justify-between cursor-grab active:cursor-grabbing`}
        onMouseDown={handleHeaderMouseDown}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="drag-handle cursor-grab active:cursor-grabbing">
            <GripVertical className={`w-4 h-4 ${textSecondary}`} />
          </div>

          {/* Step Number */}
          {stepNumber && (
            <div className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-[#2A2A3E]' : 'bg-gray-200'} text-xs ${textSecondary} flex-shrink-0`}>
              {stepNumber}
            </div>
          )}

          {isEditingName ? (
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className={`flex-1 px-2 py-1 text-sm font-medium rounded ${cardBg} border ${borderColor} ${textPrimary} focus:outline-none focus:border-[#00C6FF]`}
                  placeholder="Sub-step name"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={handleSaveName}
                  className="p-1 hover:bg-green-500/20 rounded text-green-400"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    setEditedName(subStep.name);
                    setEditedDescription(subStep.description);
                    setIsEditingName(false);
                  }}
                  className="p-1 hover:bg-red-500/20 rounded text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <input
                type="text"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className={`w-full px-2 py-1 text-xs rounded ${cardBg} border ${borderColor} ${textSecondary} focus:outline-none focus:border-[#00C6FF]`}
                placeholder="Description (optional)"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : (
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => setIsEditingName(true)}
            >
              <h3 className={`${textPrimary} font-medium text-sm truncate`}>
                {subStep.name}
              </h3>
              <p className={`${textSecondary} text-xs truncate`}>
                {subStep.description}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleExpanded}
            className={`p-1.5 hover:bg-white/5 rounded transition-colors ${textSecondary}`}
            title={subStep.expanded ? 'Collapse' : 'Expand'}
          >
            {subStep.expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="p-1.5 hover:bg-red-500/20 rounded transition-colors text-red-400"
            title="Delete sub-step"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {subStep.expanded && (
        <div className="p-4 space-y-3">
          {/* Nodes */}
          {subStep.nodes.length > 0 && (
            <div className="space-y-3">
              {subStep.nodes.filter(node => node && node.id).map((node, index) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  containerIndex={0} // Not used in sub-steps
                  nodeIndex={index}
                  onMove={handleNodeMove}
                  subStepContext={{
                    subStepId: subStep.id,
                    isSubStep: true,
                  }}
                />
              ))}
            </div>
          )}

          {/* Add Actions Button - Opens node picker for sub-step */}
          <button
            onClick={() => openNodePicker('substep', subStep.parentContainerId, subStep.parentNodeId, undefined, undefined, subStep.id)}
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

          {/* Empty state */}
          {subStep.nodes.length === 0 && (
            <div className={`text-center py-6 ${textSecondary} text-sm`}>
              <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No actions yet</p>
              <p className="text-xs mt-1 opacity-75">Click above to add actions</p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => removeSubStepContainer(subStep.id)}
        title="Delete Sub-Step"
        itemName={subStep.name}
        itemType="substep"
        warningMessage={`This will permanently remove the sub-step and all ${subStep.nodes.length} action${subStep.nodes.length !== 1 ? 's' : ''} from the workflow.`}
      />
    </div>
  );
}
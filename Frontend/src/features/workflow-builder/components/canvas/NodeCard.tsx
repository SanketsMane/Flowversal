/**
 * Node Card Component
 * Phase 2 - Component Extraction
 * 
 * Displays a single workflow node with enable/disable, settings, and delete
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { useSubStepStore } from '@/features/workflow-builder/stores/subStepStore';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Switch } from '@/shared/components/ui/switch';
import { Box, Check, CheckCircle2, Copy, GripVertical, Loader2, MoreVertical, Play, Power, Settings2, Trash2, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useWorkflowExecution } from '../../hooks/useWorkflowExecution';
import { NodeRegistry } from '../../registries';
import { useUIStore } from '../../stores/uiStore';
import { useWorkflowStore } from '../../stores/workflowStore';
import { WorkflowNode } from '../../types';
import { NodeExecutionState } from '../../utils/executionState';
import { ConnectionPoint } from '../connections/ConnectionPoint';
import { DropIndicator } from '../dnd/DropIndicator';
import { ExecutionStateBadge } from '../execution/ExecutionStateBadge';
import { BranchConnectionPoints } from '../nodes/BranchConnectionPoints';
import { BranchRouting } from '../nodes/BranchRouting';

type ExecutionState = 'idle' | 'running' | 'success' | 'error';

interface NodeCardProps {
  node: WorkflowNode;
  containerIndex: number;
  nodeIndex: number;
  onMove: (containerIndex: number, fromIndex: number, toIndex: number) => void;
  // Sub-step context (optional)
  subStepContext?: {
    subStepId: string;
    isSubStep: true;
  };
  // Node number for display (e.g., "1.3" for 3rd node in step 1)
  nodeNumber?: string;
}

export function NodeCard({ node, containerIndex, nodeIndex, onMove, subStepContext, nodeNumber }: NodeCardProps) {
  const { theme } = useTheme();
  const { toggleNode, deleteNode, updateNode, addNode, containers } = useWorkflowStore();
  const subStepStore = useSubStepStore();
  const { openDeleteNodeConfirm, selectNode, isNodeSelected } = useUIStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [executionState, setExecutionState] = useState<ExecutionState>('idle');
  const [dropIndicatorPosition, setDropIndicatorPosition] = useState<'top' | 'bottom' | null>(null);
  const [nodeExecutionData, setNodeExecutionData] = useState<{
    inputData?: any;
    outputData?: any;
    duration?: number;
    error?: string;
  } | null>(null);

  // Get execution state from WebSocket (if available)
  const { nodeStates: executionNodeStates, backendExecutionId } = useWorkflowExecution();
  
  // Update execution state from WebSocket
  useEffect(() => {
    if (backendExecutionId && executionNodeStates) {
      const nodeState = executionNodeStates.find((ns) => ns.id === node.id);
      if (nodeState) {
        // Map execution state
        const mappedState: NodeExecutionState = 
          nodeState.status === 'pending' ? 'pending' :
          nodeState.status === 'running' ? 'running' :
          nodeState.status === 'success' ? 'success' :
          nodeState.status === 'error' ? 'error' : 'idle';

        // Update local execution state for UI
        setExecutionState(
          mappedState === 'pending' ? 'running' :
          mappedState === 'running' ? 'running' :
          mappedState === 'success' ? 'success' :
          mappedState === 'error' ? 'error' : 'idle'
        );

        // Store execution data for preview
        setNodeExecutionData({
          inputData: nodeState.inputData,
          outputData: nodeState.outputData,
          duration: nodeState.duration,
          error: nodeState.error,
        });
      } else {
        // Reset if node is not in execution
        setExecutionState('idle');
        setNodeExecutionData(null);
      }
    }
  }, [node.id, executionNodeStates, backendExecutionId]);
  
  // Determine if we're in a sub-step context
  const isInSubStep = !!subStepContext?.isSubStep;
  const subStepId = subStepContext?.subStepId || '';
  
  // Get container - for sub-steps, create a virtual one
  let container;
  if (isInSubStep) {
    const subStep = subStepStore.subStepContainers.find(s => s.id === subStepId);
    container = subStep ? {
      id: subStep.id,
      name: subStep.name,
      description: subStep.description,
      nodes: subStep.nodes,
      expanded: true,
    } : null;
  } else {
    container = containers[containerIndex];
  }
  
  // Safety check: if container is undefined, don't render
  if (!container) {
    console.error(`NodeCard: Container ${isInSubStep ? 'for sub-step ' + subStepId : 'at index ' + containerIndex} not found`);
    return null;
  }
  
  const isSelected = isNodeSelected(container.id, node.id);

  // Get node definition from registry
  const nodeDef = NodeRegistry.get(node.type);
  
  // Check if node has a custom canvas component
  if (nodeDef?.canvasComponent) {
    const CustomComponent = nodeDef.canvasComponent;
    return (
      <CustomComponent
        node={node}
        containerId={container.id}
        onUpdateNode={(nodeId: string, updates: Partial<WorkflowNode>) => {
          updateNode(container.id, nodeId, updates);
        }}
        theme={theme}
        nodeNumber={nodeNumber}
      />
    );
  }

  // Get icon from registry - defensive check to ensure we always have a valid icon
  let Icon = Box; // Default fallback
  
  // Only use node.icon if it's a valid function (React component)
  if (typeof node.icon === 'function') {
    Icon = node.icon;
  } else if (nodeDef?.icon && typeof nodeDef.icon === 'function') {
    // Otherwise try to get from registry
    Icon = nodeDef.icon;
  }
  
  // Theme colors
  const bgColor = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  // Drag and drop
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'NODE',
    item: { 
      containerIndex, 
      nodeIndex,
      containerId: container.id,
      isSubStep: isInSubStep,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [containerIndex, nodeIndex, container.id, isInSubStep]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'NODE',
    hover: (item: { containerIndex: number; nodeIndex: number; containerId?: string; isSubStep?: boolean }, monitor) => {
      // Container isolation: ensure drag source and drop target are in same context
      // Check based on whether the DROP TARGET is in a sub-step or main workflow
      let isSameContainer = false;
      
      if (isInSubStep) {
        // Drop target is in sub-step: only allow if drag source is also in sub-step with matching ID
        isSameContainer = item.isSubStep === true && item.containerId === container.id;
        
        // Debug logging for sub-step drops
        if (item.isSubStep && item.containerId !== container.id) {
          console.log('[NodeCard] Rejected: Different sub-step containers', {
            dragFrom: item.containerId,
            dropTo: container.id
          });
        }
      } else {
        // Drop target is in main workflow: only allow if drag source is also in main workflow with matching containerIndex
        isSameContainer = !item.isSubStep && item.containerIndex === containerIndex;
        
        // Debug logging for main workflow drops
        if (item.isSubStep) {
          console.log('[NodeCard] Rejected: Cannot drag from sub-step to main workflow', {
            dragFromSubStep: item.containerId,
            dropToContainer: containerIndex
          });
        }
      }
        
      if (!isSameContainer || item.nodeIndex === nodeIndex) {
        setDropIndicatorPosition(null);
        return;
      }

      // Get the hover bounding rect
      const hoverBoundingRect = (monitor as any).targetMonitor?.getClientOffset 
        ? document.querySelector(`[data-node-id="${node.id}"]`)?.getBoundingClientRect()
        : null;
      
      const clientOffset = monitor.getClientOffset();
      
      if (!hoverBoundingRect || !clientOffset) {
        setDropIndicatorPosition(null);
        return;
      }

      // Determine if we're in the top half or bottom half of the node
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Set drop indicator position
      if (hoverClientY < hoverMiddleY) {
        setDropIndicatorPosition('top');
      } else {
        setDropIndicatorPosition('bottom');
      }

      // Only trigger move if:
      // 1. Same container
      // 2. Different index
      // 3. Both indices are valid (>= 0)
      if (
        isSameContainer && 
        item.nodeIndex !== nodeIndex &&
        item.nodeIndex >= 0 &&
        nodeIndex >= 0
      ) {
        onMove(containerIndex, item.nodeIndex, nodeIndex);
        item.nodeIndex = nodeIndex;
      }
    },
    drop: () => {
      // Clear the drop indicator when dropped
      setDropIndicatorPosition(null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [containerIndex, nodeIndex, onMove, node.id, isInSubStep, container.id]);

  // Clear drop indicator when not hovering
  const handleMouseLeaveNode = () => {
    setIsHovered(false);
    if (!isOver) {
      setDropIndicatorPosition(null);
    }
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(container.id, node.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Always show confirmation modal for both main workflow and substeps
    openDeleteNodeConfirm(container.id, node.id, node.label, isInSubStep, subStepId);
  };

  const handleToggle = (checked: boolean) => {
    if (isInSubStep) {
      subStepStore.toggleNodeInSubStep(subStepId, node.id);
    } else {
      toggleNode(container.id, node.id);
    }
  };

  const handleStartEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedName(node.label);
    setIsEditingName(true);
  };

  const handleSaveEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (editedName.trim()) {
      if (isInSubStep) {
        subStepStore.updateNodeInSubStep(subStepId, node.id, { label: editedName.trim() });
      } else {
        updateNode(container.id, node.id, { label: editedName.trim() });
      }
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingName(false);
    setEditedName('');
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Create a duplicate of the node
    const duplicatedNode: WorkflowNode = {
      ...node,
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: `${node.label} (Copy)`,
    };
    if (isInSubStep) {
      subStepStore.addNodeToSubStep(subStepId, duplicatedNode);
    } else {
      addNode(container.id, duplicatedNode);
    }
  };

  // Handle play button click
  const handlePlayClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    setExecutionState('running');
    
    // Simulate execution (replace with actual execution logic)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Randomly succeed or fail for demo
    const success = Math.random() > 0.3;
    setExecutionState(success ? 'success' : 'error');
    
    // Reset to idle after showing result
    setTimeout(() => {
      setExecutionState('idle');
    }, 1500);
  };

  // Check if this is a Prompt Builder node with tools
  const isPromptBuilder = node.type === 'prompt_builder';
  const tools = node.config.tools || [];

  // Check if this is a conditional node (If/Switch)
  const isConditional = node.type === 'if' || node.type === 'switch';

  // Get the container ID for branch routing
  const containerId = container?.id || '';

  return (
    <div
      ref={(node) => drag(drop(node))}
      onClick={() => selectNode(container.id, node.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeaveNode}
      data-node-id={node.id}
      className={`
        ${bgColor} border-2
        ${isSelected ? 'border-[#00C6FF] shadow-lg shadow-[#00C6FF]/20' : borderColor}
        rounded-lg p-4 cursor-pointer transition-all
        hover:border-[#00C6FF]/50 relative
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      {/* Execution State Badge (n8n-style) */}
      {executionState !== 'idle' && (
        <ExecutionStateBadge
          state={
            executionState === 'running' ? 'running' :
            executionState === 'success' ? 'success' :
            executionState === 'error' ? 'error' : 'idle'
          }
          duration={nodeExecutionData?.duration}
          error={nodeExecutionData?.error}
          inputData={nodeExecutionData?.inputData}
          outputData={nodeExecutionData?.outputData}
          nodeId={node.id}
          nodeName={node.label || node.name}
          size="sm"
        />
      )}
      {/* LEFT SIDE: Input connection dot - receives from previous node or step spine */}
      <ConnectionPoint
        ownerId={node.id}
        ownerType="node"
        side="left"
        ownerName={node.name}
        parentContainerId={container.id}
      />
      
      {/* RIGHT SIDE: Output connection dot - connects to next node or step spine */}
      {/* Don't show regular output for If/Switch nodes - they use BranchOutputDots */}
      {!isConditional && (
        <ConnectionPoint
          ownerId={node.id}
          ownerType="node"
          side="right"
          parentContainerId={container.id}
        />
      )}

      {/* Edit icon removed from hover - users can edit by clicking the card */}

      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div ref={preview} className="cursor-move">
          <GripVertical className={`w-5 h-5 ${node.enabled === false ? 'text-gray-500' : textSecondary}`} />
        </div>

        {/* Icon - grayed out when disabled */}
        <div 
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            node.enabled === false ? 'opacity-30 grayscale' : ''
          }`}
          style={{ 
            background: node.config.color || 'linear-gradient(135deg, #00C6FF 0%, #9D50BB 100%)'
          }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit(e as any);
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                className={`flex-1 px-2 py-0.5 text-sm font-medium rounded ${bgColor} border ${borderColor} ${textPrimary} focus:outline-none focus:border-[#00C6FF]`}
              />
              <button
                onClick={handleSaveEdit}
                className="p-0.5 hover:bg-green-500/20 rounded text-green-400"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-0.5 hover:bg-red-500/20 rounded text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                {/* Node Number */}
                {nodeNumber && !isInSubStep && (
                  <span className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-[#2A2A3E] text-[#CFCFE8]' : 'bg-gray-200 text-gray-600'} flex-shrink-0`}>
                    {nodeNumber}
                  </span>
                )}
                <p 
                  className={`${node.enabled === false ? 'text-gray-500' : textPrimary} font-medium truncate flex items-center gap-2 group cursor-text hover:text-[#00C6FF] transition-colors`}
                  onClick={handleStartEditing}
                  title="Click to edit name"
                >
                  {node.label}
                </p>
                {node.enabled === false && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-medium">
                    Deactivated
                  </span>
                )}
              </div>
              <p className={`${node.enabled === false ? 'text-gray-600' : textSecondary} text-xs truncate`}>
                {node.category} • {node.type}
              </p>
            </div>
          )}
          
          {/* Show tools count for Prompt Builder */}
          {isPromptBuilder && tools.length > 0 && (
            <p className="text-[#00C6FF] text-xs mt-1">
              {tools.length} tool{tools.length !== 1 ? 's' : ''} added
            </p>
          )}

          {/* Show branches for conditional nodes */}
          {isConditional && (
            <p className="text-[#9D50BB] text-xs mt-1">
              Conditional logic
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Play Button with execution states */}
          <button
            onClick={handlePlayClick}
            disabled={executionState === 'running' || node.enabled === false}
            className={`p-1.5 rounded-lg transition-all ${
              executionState === 'idle' 
                ? 'bg-[#00C6FF]/10 hover:bg-[#00C6FF]/20 text-[#00C6FF]' 
                : executionState === 'running'
                ? 'bg-yellow-500/10 text-yellow-400'
                : executionState === 'success'
                ? 'bg-green-500/10 text-green-400'
                : 'bg-red-500/10 text-red-400'
            } ${node.enabled === false ? 'opacity-30 cursor-not-allowed' : ''}`}
            title={executionState === 'idle' ? 'Test execution' : executionState}
          >
            {executionState === 'idle' && <Play className="w-4 h-4" />}
            {executionState === 'running' && <Loader2 className="w-4 h-4 animate-spin" />}
            {executionState === 'success' && <CheckCircle2 className="w-4 h-4" />}
            {executionState === 'error' && <XCircle className="w-4 h-4" />}
          </button>

          {/* Enable/Disable Toggle */}
          <Switch
            checked={node.enabled !== false}
            onCheckedChange={handleToggle}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-2 hover:bg-white/5 rounded transition-colors"
                title="Settings"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSettingsClick}>
                <Settings2 className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                if (isInSubStep) {
                  subStepStore.toggleNodeInSubStep(subStepId, node.id);
                } else {
                  toggleNode(container.id, node.id);
                }
              }}>
                <Power className="w-4 h-4 mr-2" />
                {node.enabled !== false ? 'Disable' : 'Enable'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  // Always show confirmation for both main workflow and substeps
                  openDeleteNodeConfirm(container.id, node.id, node.label, isInSubStep, subStepId);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tool Drop Zone for Prompt Builder - REMOVED "Add Tools" button per requirements */}
      {/* Prompt Builder uses main Settings button instead */}

      {/* Setup Button for ALL nodes (except Form nodes which have their own) */}
      {!isConditional && node.type !== 'form' && (
        <div className={`mt-3 pt-3 border-t ${borderColor}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const { openNodeSetup } = useUIStore.getState();
              openNodeSetup(container.id, node.id);
            }}
            className={`w-full border-2 border-dashed ${borderColor} rounded-lg p-3 text-sm ${textSecondary} hover:border-[#00C6FF]/50 hover:text-[#00C6FF] transition-all flex items-center justify-center gap-2`}
          >
            <Settings2 className="w-4 h-4" />
            Setup {node.label}
          </button>
        </div>
      )}

      {/* Setup Button for Conditional nodes (If/Switch) */}
      {isConditional && (
        <div className={`mt-3 pt-3 border-t ${borderColor}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const { openNodeSetup } = useUIStore.getState();
              openNodeSetup(container.id, node.id);
            }}
            className={`w-full border-2 border-dashed ${borderColor} rounded-lg p-3 text-sm ${textSecondary} hover:border-[#00C6FF]/50 hover:text-[#00C6FF] transition-all flex items-center justify-center gap-2 mb-3`}
          >
            <Settings2 className="w-4 h-4" />
            Setup {node.label}
          </button>
        </div>
      )}

      {/* Conditional Branches Preview */}
      {isConditional && (
        <div className={`${borderColor}`}>
          <BranchRouting node={node} containerId={containerId} />
        </div>
      )}

      {/* Branch Connection Points for If/Switch nodes */}
      {isConditional && (
        <BranchConnectionPoints node={node} containerId={containerId} />
      )}

      {/* Drop Indicators */}
      <DropIndicator position="top" isVisible={dropIndicatorPosition === 'top'} />
      <DropIndicator position="bottom" isVisible={dropIndicatorPosition === 'bottom'} />
    </div>
  );
}
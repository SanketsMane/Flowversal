/**
 * Form Node Component
 * Special node that contains form builder with full dropdown menu
 */

import React, { useState } from 'react';
import { FileText, Settings, Edit, MoreVertical, Copy, Power, Trash2, Play, Loader2, CheckCircle2, XCircle, GripVertical } from 'lucide-react';
import { WorkflowNode } from '../../types';
import { useUIStore } from '../../stores/uiStore';
import { useWorkflowStore } from '../../stores/workflowStore';
import { useSelection } from '../../hooks/useSelection';
import { Switch } from '@/shared/components/ui/switch';
import { ConnectionPoint } from '../connections/ConnectionPoint';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';

interface FormNodeProps {
  node: WorkflowNode;
  containerId: string;
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  theme?: 'dark' | 'light';
  nodeNumber?: string; // Node number for display (e.g., "1.2")
}

type ExecutionState = 'idle' | 'running' | 'success' | 'error';

export function FormNode({ node, containerId, onUpdateNode, theme = 'dark', nodeNumber }: FormNodeProps) {
  const { openFormSetup, openDeleteNodeConfirm } = useUIStore();
  const { toggleNode, addNode, containers } = useWorkflowStore();
  const { selection, selectNode: selectNodeInStore } = useSelection();
  const [executionState, setExecutionState] = useState<ExecutionState>('idle');
  
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  
  const formFields = node.config?.formFields || [];
  const fieldCount = formFields.length;

  // Find container and node indices for selection
  const containerIndex = containers.findIndex(c => c.id === containerId);
  const nodeIndex = containers[containerIndex]?.nodes.findIndex(n => n.id === node.id) ?? -1;
  const isSelected = selection?.type === 'node' &&
    selection.containerIndex === containerIndex &&
    selection.nodeIndex === nodeIndex;

  const handleToggle = (checked: boolean) => {
    toggleNode(containerId, node.id);
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (containerIndex !== -1 && nodeIndex !== -1) {
      selectNodeInStore(containerIndex, nodeIndex);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicatedNode: WorkflowNode = {
      ...node,
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: `${node.label} (Copy)`,
    };
    addNode(containerId, duplicatedNode);
  };

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    setExecutionState('running');
    
    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = Math.random() > 0.3;
    setExecutionState(success ? 'success' : 'error');
    
    setTimeout(() => {
      setExecutionState('idle');
    }, 1500);
  };

  return (
    <div
      className={`${bgCard} border-2 ${isSelected ? 'border-[#00C6FF]' : borderColor} rounded-lg p-4 cursor-pointer transition-all hover:border-[#00C6FF]/50 relative`}
      onClick={() => {
        if (containerIndex !== -1 && nodeIndex !== -1) {
          selectNodeInStore(containerIndex, nodeIndex);
        }
      }}
      data-node-id={node.id}
    >
      {/* LEFT SIDE: Input connection dot - receives from previous node or step spine */}
      <ConnectionPoint
        ownerId={node.id}
        ownerType="node"
        side="left"
        parentContainerId={containerId}
      />
      
      {/* RIGHT SIDE: Output connection dot - connects to next node or step spine */}
      <ConnectionPoint
        ownerId={node.id}
        ownerType="node"
        side="right"
        parentContainerId={containerId}
      />

      {/* Top Row - Icon, Title, Actions */}
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div className="cursor-move">
          <GripVertical className={`w-5 h-5 ${node.enabled === false ? 'text-gray-500' : textSecondary}`} />
        </div>

        {/* Icon */}
        <div 
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            node.enabled === false ? 'opacity-30 grayscale' : ''
          }`}
          style={{ 
            background: 'linear-gradient(135deg, #00C6FF 0%, #9D50BB 100%)'
          }}
        >
          <FileText className="w-5 h-5 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Node Number */}
            {nodeNumber && (
              <span className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-[#2A2A3E] text-[#CFCFE8]' : 'bg-gray-200 text-gray-600'} flex-shrink-0`}>
                {nodeNumber}
              </span>
            )}
            <p className={`${node.enabled === false ? 'text-gray-500' : textPrimary} font-medium truncate`}>
              {node.label}
            </p>
            {node.enabled === false && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-medium">
                Deactivated
              </span>
            )}
          </div>
          <p className={`${node.enabled === false ? 'text-gray-600' : textSecondary} text-xs truncate`}>
            {fieldCount === 0 ? 'No fields configured' : `${fieldCount} field${fieldCount !== 1 ? 's' : ''} configured`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Play Button */}
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
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                toggleNode(containerId, node.id);
              }}>
                <Power className="w-4 h-4 mr-2" />
                {node.enabled !== false ? 'Disable' : 'Enable'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteNodeConfirm(containerId, node.id, node.label);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Fields Preview */}
      {fieldCount > 0 && (
        <div className={`mt-3 pt-3 border-t ${borderColor}`}>
          <p className={`${textSecondary} text-xs mb-2`}>Form Fields:</p>
          <div className="space-y-1">
            {formFields.slice(0, 3).map((field: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00C6FF]" />
                <span className={`${textSecondary} text-xs`}>
                  {field.label} ({field.type})
                </span>
              </div>
            ))}
            {fieldCount > 3 && (
              <p className={`${textSecondary} text-xs italic`}>
                +{fieldCount - 3} more field{fieldCount - 3 !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Setup/Edit Button */}
      <div className={`mt-3 pt-3 border-t ${borderColor}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            openFormSetup(containerId, node.id);
          }}
          className={`w-full border-2 border-dashed ${borderColor} rounded-lg p-3 text-sm ${textSecondary} hover:border-[#00C6FF]/50 hover:text-[#00C6FF] transition-all flex items-center justify-center gap-2`}
        >
          {fieldCount === 0 ? (
            <>
              <Settings className="w-4 h-4" />
              Setup Form
            </>
          ) : (
            <>
              <Edit className="w-4 h-4" />
              Edit Form
            </>
          )}
        </button>
      </div>
    </div>
  );
}
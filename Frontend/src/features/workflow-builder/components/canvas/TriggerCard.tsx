/**
 * Trigger Card Component
 * Phase 2 - Component Extraction
 * 
 * Displays a single trigger with enable/disable, settings, delete, and nodes
 */

import { MoreVertical, GripVertical, Settings, Power, Trash2, Copy, Pencil, Check, X, Play, Loader2, CheckCircle2, XCircle, Plus } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useWorkflowStore, useUIStore } from '../../stores';
import { useSelection } from '../../hooks';
import { Trigger } from '../../types';
import { TriggerRegistry } from '../../registries';
import { Switch } from '@/shared/components/ui/switch';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from '@/shared/components/ui/dropdown-menu';
import { useDrag, useDrop } from 'react-dnd';
import { useState } from 'react';

type ExecutionState = 'idle' | 'running' | 'success' | 'error';

interface TriggerCardProps {
  trigger: Trigger;
  index: number;
  isSelected: boolean;
  onMove: (fromIndex: number, toIndex: number) => void;
}

export function TriggerCard({ trigger, index, isSelected, onMove }: TriggerCardProps) {
  const { theme } = useTheme();
  const { updateTrigger, deleteTrigger, toggleTrigger, addTrigger } = useWorkflowStore();
  const { selectTrigger } = useSelection();
  const { openDeleteTriggerConfirm, openTriggerSetup } = useUIStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [executionState, setExecutionState] = useState<ExecutionState>('idle');

  // Get trigger definition from registry - defensive check
  const triggerDef = TriggerRegistry.get(trigger.type);
  const Icon = (triggerDef?.icon && typeof triggerDef.icon === 'function') ? triggerDef.icon : null;

  // Theme colors
  const bgColor = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  // Drag and drop
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'TRIGGER',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: 'TRIGGER',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    },
  }));

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openTriggerSetup(trigger.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTrigger(trigger.id);
  };

  const handleToggle = (checked: boolean) => {
    toggleTrigger(trigger.id);
  };

  const handleStartEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedName(trigger.label);
    setIsEditingName(true);
  };

  const handleSaveEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (editedName.trim()) {
      updateTrigger(trigger.id, { label: editedName.trim() });
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
    // Create a duplicate of the trigger
    const duplicatedTrigger: Trigger = {
      ...trigger,
      id: `trigger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: `${trigger.label} (Copy)`,
    };
    addTrigger(duplicatedTrigger);
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

  return (
    <div
      ref={(node) => drag(drop(node))}
      onClick={() => selectTrigger(index)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-trigger-id={trigger.id}
      className={`
        ${bgColor} border ${borderColor}
        rounded-lg p-4 cursor-pointer transition-all
        hover:border-[#00C6FF]/50 relative z-10
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div ref={preview} className="cursor-move">
          <GripVertical className={`w-5 h-5 ${trigger.enabled === false ? 'text-gray-500' : textSecondary}`} />
        </div>

        {/* Icon - grayed out when disabled */}
        {Icon && (
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center flex-shrink-0 ${ 
            trigger.enabled === false ? 'opacity-30 grayscale' : ''
          }`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}

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
                <p 
                  className={`${trigger.enabled === false ? 'text-gray-500' : textPrimary} font-medium truncate flex items-center gap-2 group cursor-text hover:text-[#00C6FF] transition-colors`}
                  onClick={handleStartEditing}
                  title="Click to edit name"
                >
                  {trigger.label}
                </p>
                {trigger.enabled === false && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-medium">
                    Deactivated
                  </span>
                )}
              </div>
              <p className={`${trigger.enabled === false ? 'text-gray-600' : textSecondary} text-xs truncate`}>
                {triggerDef?.description || `Type: ${trigger.type}`}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Play Button with execution states */}
          <button
            onClick={handlePlayClick}
            disabled={executionState === 'running' || trigger.enabled === false}
            className={`p-1.5 rounded-lg transition-all ${ 
              executionState === 'idle' 
                ? 'bg-[#00C6FF]/10 hover:bg-[#00C6FF]/20 text-[#00C6FF]' 
                : executionState === 'running'
                ? 'bg-yellow-500/10 text-yellow-400'
                : executionState === 'success'
                ? 'bg-green-500/10 text-green-400'
                : 'bg-red-500/10 text-red-400'
            } ${trigger.enabled === false ? 'opacity-30 cursor-not-allowed' : ''}`}
            title={executionState === 'idle' ? 'Test execution' : executionState}
          >
            {executionState === 'idle' && <Play className="w-4 h-4" />}
            {executionState === 'running' && <Loader2 className="w-4 h-4 animate-spin" />}
            {executionState === 'success' && <CheckCircle2 className="w-4 h-4" />}
            {executionState === 'error' && <XCircle className="w-4 h-4" />}
          </button>

          {/* Enable/Disable Toggle */}
          <Switch
            checked={trigger.enabled !== false}
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
                toggleTrigger(trigger.id);
              }}>
                <Power className="w-4 h-4 mr-2" />
                {trigger.enabled !== false ? 'Disable' : 'Enable'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteTriggerConfirm(trigger.id, trigger.label);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Setup Button - Same style as nodes */}
      <div className={`mt-3 pt-3 border-t ${borderColor}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            openTriggerSetup(trigger.id);
          }}
          className={`w-full border-2 border-dashed ${borderColor} rounded-lg p-3 text-sm ${textSecondary} hover:border-[#00C6FF]/50 hover:text-[#00C6FF] transition-all flex items-center justify-center gap-2`}
        >
          <Settings className="w-4 h-4" />
          Setup {trigger.label}
        </button>
      </div>
    </div>
  );
}
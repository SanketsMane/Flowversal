import { GripVertical, X, Box, Zap } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { LucideIcon } from 'lucide-react';
import { ToolDropZone } from './ToolDropZone';
import { toolTemplates } from './toolTemplates';
import { triggerTemplates } from './triggerTemplates';
import { ConditionalNode } from './ConditionalNode';

export interface WorkflowNodeType {
  id: string;
  type: string;
  label: string;
  category: string;
  icon: LucideIcon;
  config: Record<string, any>;
  enabled?: boolean; // Add enabled property
}

interface WorkflowNodeProps {
  node: WorkflowNodeType;
  index: number;
  containerIndex: number;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onMove?: (containerIndex: number, fromIndex: number, toIndex: number) => void;
  theme: string;
  onAddTool?: (toolType: string) => void;
  onRemoveTool?: (toolIndex: number) => void;
  onToolClick?: (toolIndex: number) => void;
  onOpenToolsPanel?: () => void;
  selectedToolDropZone?: boolean;
  selectedToolIndex?: number | null;
  onMoveTool?: (fromIndex: number, toIndex: number) => void;
  allContainers?: any[];
  onAddConditionalNode?: (containerIndex: number, nodeIndex: number, branch: 'true' | 'false', nodeType: string) => void;
  onDeleteConditionalNode?: (containerIndex: number, nodeIndex: number, branch: 'true' | 'false', conditionalNodeIndex: number) => void;
  onUpdateNodeConfig?: (containerIndex: number, nodeIndex: number, config: any) => void;
  onOpenLeftPanel?: (context?: { containerIndex: number; nodeIndex: number; branch: 'true' | 'false' }) => void;
  hasFormSubmitTrigger?: boolean;
  onConditionalNodeClick?: (containerIndex: number, nodeIndex: number, branch: 'true' | 'false', conditionalNodeIndex: number) => void;
  selectedConditionalNodeIndex?: number | null;
  selectedConditionalBranch?: 'true' | 'false' | null;
}

export function WorkflowNode({ 
  node, 
  index, 
  containerIndex, 
  isSelected, 
  onClick, 
  onDelete, 
  onMove, 
  theme,
  onAddTool,
  onRemoveTool,
  onToolClick,
  onOpenToolsPanel,
  selectedToolDropZone = false,
  selectedToolIndex = null,
  onMoveTool,
  allContainers = [],
  onAddConditionalNode,
  onDeleteConditionalNode,
  onUpdateNodeConfig,
  onOpenLeftPanel,
  hasFormSubmitTrigger,
  onConditionalNodeClick,
  selectedConditionalNodeIndex = null,
  selectedConditionalBranch = null
}: WorkflowNodeProps) {
  // If this is an If/Switch conditional node, render the ConditionalNode component
  if (node.type === 'if') {
    return (
      <ConditionalNode
        node={node}
        index={index}
        containerIndex={containerIndex}
        isSelected={isSelected}
        onClick={onClick}
        onDelete={onDelete}
        onMove={onMove}
        theme={theme}
        allContainers={allContainers}
        onAddConditionalNode={onAddConditionalNode}
        onDeleteConditionalNode={onDeleteConditionalNode}
        onUpdateConfig={onUpdateNodeConfig}
        onOpenLeftPanel={onOpenLeftPanel}
        hasFormSubmitTrigger={hasFormSubmitTrigger}
        onConditionalNodeClick={onConditionalNodeClick}
        selectedConditionalNodeIndex={isSelected ? selectedConditionalNodeIndex : null}
        selectedBranch={isSelected ? selectedConditionalBranch : null}
      />
    );
  }

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'NODE',
    item: { index, containerIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: 'NODE',
    hover: (item: { index: number; containerIndex: number }) => {
      if (onMove && item.containerIndex === containerIndex && item.index !== index) {
        onMove(containerIndex, item.index, index);
        item.index = index;
      }
    },
  }));

  // Check if this node is actually a tool or trigger
  const isTool = toolTemplates.some(t => t.type === node.type);
  const isTrigger = triggerTemplates.some(t => t.type === node.type);
  
  // Get the appropriate template and icon
  const toolTemplate = toolTemplates.find(t => t.type === node.type);
  const triggerTemplate = triggerTemplates.find(t => t.type === node.type);
  
  let NodeIcon = node.icon;
  let gradientClasses = 'from-[#00C6FF] to-[#0EA5E9]'; // Default blue gradient for nodes
  let label = node.label;
  let subtitle = node.type;
  
  if (isTool && toolTemplate) {
    NodeIcon = toolTemplate.icon;
    gradientClasses = 'from-[#F59E0B] to-[#D97706]'; // Orange gradient for tools
    subtitle = 'Tool Action';
  } else if (isTrigger && triggerTemplate) {
    NodeIcon = triggerTemplate.icon || Zap;
    gradientClasses = 'from-[#00C6FF] to-[#9D50BB]'; // Cyan-purple gradient for triggers
    subtitle = 'Trigger Action';
  }
  
  // Theme-aware colors
  const bgColor = theme === 'dark' 
    ? (isSelected ? 'bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20' : 'bg-[#1A1A2E]')
    : (isSelected ? 'bg-gradient-to-r from-[#00C6FF]/10 to-[#9D50BB]/10' : 'bg-white');
  const borderColor = theme === 'dark' 
    ? (isSelected ? 'border-[#00C6FF]/50' : 'border-white/10')
    : (isSelected ? 'border-[#00C6FF]/50' : 'border-gray-200');
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#9CA3AF]' : 'text-gray-600';
  const hoverBg = theme === 'dark' ? 'hover:bg-[#252538]' : 'hover:bg-gray-50';
  const iconColor = theme === 'dark' ? 'text-[#9D50BB]' : 'text-[#7C3AED]';

  const tools = node.config.tools || [];
  const hasTools = tools.length > 0;
  
  // Handle icon - check if it's a valid React component
  // Sometimes icons might be wrapped in { default: Component } from imports
  let IconToRender = Box; // Fallback icon
  
  if (typeof NodeIcon === 'function') {
    IconToRender = NodeIcon;
  } else if (NodeIcon && typeof NodeIcon === 'object' && 'default' in NodeIcon && typeof (NodeIcon as any).default === 'function') {
    IconToRender = (NodeIcon as any).default;
  }

  return (
    <div className="space-y-2 relative">
      <div
        ref={(node) => {
          preview(drop(node));
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        data-connection-id={`node-${containerIndex}-${index}`}
        data-connection-type="workflow-node"
        className={`group relative flex items-center gap-3 p-3 rounded-lg border-2 ${borderColor} ${bgColor} ${hoverBg} transition-all cursor-pointer ${
          isDragging ? 'opacity-50' : ''
        } ${isSelected ? 'ring-2 ring-[#00C6FF]/30 shadow-lg shadow-[#00C6FF]/20' : ''}`}
        id={`node-${node.id}`}
      >
        {/* Drag Handle */}
        <div
          ref={drag}
          className={`cursor-grab active:cursor-grabbing ${textSecondary} hover:text-[#00C6FF] transition-colors`}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Node Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${gradientClasses} flex items-center justify-center`}>
          {IconToRender && <IconToRender className="w-5 h-5 text-white" />}
        </div>

        {/* Node Info */}
        <div className="flex-1 min-w-0">
          <div className={`${textPrimary} truncate`}>
            {label}
          </div>
          <div className={`text-xs ${textSecondary} truncate`}>
            {subtitle}
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={`opacity-0 group-hover:opacity-100 p-1.5 rounded ${textSecondary} hover:text-red-500 hover:bg-red-500/10 transition-all`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
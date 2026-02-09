/**
 * Conditional Node Card Component
 * Enhanced If/Switch node with visual branching
 */
import { 
  GitBranch, 
  MoreVertical, 
  GripVertical, 
  Plus, 
  Settings, 
  Power, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Box,
  Wrench,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Play,
  Loader2
} from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useWorkflowStore } from '../../stores';
import { useSelection } from '../../hooks';
import { WorkflowNode, ConditionGroup, OPERATORS } from '../../types';
import { Switch } from '@/shared/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/shared/components/ui/dropdown-menu';
import { useDrag, useDrop } from 'react-dnd';
import { useState } from 'react';
import { BranchFlowCard } from './BranchFlowCard';
import { BranchFlowVisualizer } from './BranchFlowVisualizer';
import { BranchNodeItem } from './BranchNodeItem';
import { NodeRegistry } from '../../registries';
import { TriggerRegistry } from '../../registries';
import { ToolRegistry } from '../../registries';
import { ConfigureConditionsModal } from '../modals/ConfigureConditionsModal';
interface ConditionalNodeCardProps {
  node: WorkflowNode;
  containerIndex: number;
  nodeIndex: number;
  isSelected: boolean;
  onMove: (containerIndex: number, fromIndex: number, toIndex: number) => void;
}
export function ConditionalNodeCard({ 
  node, 
  containerIndex, 
  nodeIndex, 
  isSelected, 
  onMove 
}: ConditionalNodeCardProps) {
  const { theme } = useTheme();
  const { toggleNode, deleteNode, containers, addConditionalNode } = useWorkflowStore();
  const { selectNode } = useSelection();
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'true' | 'false'>('true');
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const Icon = GitBranch;
  // Theme colors
  const bgColor = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const hoverBg = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-100';
  const tabActiveBg = theme === 'dark' ? 'bg-[#2A2A3E]' : 'bg-gray-200';
  // Get condition groups and branches
  const conditionGroups: ConditionGroup[] = node.config.conditionGroups || [];
  const trueNodes = node.config.trueNodes || [];
  const falseNodes = node.config.falseNodes || [];
  // Drop zone for dragging nodes/tools/triggers from sidebar to branches
  const [{ isOver: isTrueOver, canDrop: canTrueDrop }, trueDrop] = useDrop(() => ({
    accept: ['SIDEBAR_NODE', 'SIDEBAR_TOOL', 'SIDEBAR_TRIGGER'],
    drop: (item: any) => {
      handleDropOnBranch('true', item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));
  const [{ isOver: isFalseOver, canDrop: canFalseDrop }, falseDrop] = useDrop(() => ({
    accept: ['SIDEBAR_NODE', 'SIDEBAR_TOOL', 'SIDEBAR_TRIGGER'],
    drop: (item: any) => {
      handleDropOnBranch('false', item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));
  // Handler for dropping items on branches
  const handleDropOnBranch = (branch: 'true' | 'false', item: any) => {
    const container = containers[containerIndex];
    if (item.nodeType) {
      // Adding a node from sidebar
      const nodeDef = NodeRegistry.get(item.nodeType);
      if (nodeDef) {
        const newNode = NodeRegistry.createInstance(item.nodeType);
        if (newNode) {
          const conditionalNode = {
            id: newNode.id,
            type: newNode.type,
            label: newNode.label,
            category: newNode.category as any,
            enabled: true,
            config: newNode.config,
          };
          addConditionalNode(container.id, node.id, branch, conditionalNode);
        }
      }
    } else if (item.toolType) {
      // Adding a tool from sidebar
      const toolDef = ToolRegistry.get(item.toolType);
      if (toolDef) {
        const newTool = ToolRegistry.createInstance(item.toolType);
        if (newTool) {
          const conditionalNode = {
            id: newTool.id,
            type: newTool.type,
            label: newTool.name,
            category: 'tool' as any,
            enabled: true,
            config: newTool.config || {},
          };
          addConditionalNode(container.id, node.id, branch, conditionalNode);
        }
      }
    } else if (item.triggerType) {
      // Adding a trigger (converted to node) from sidebar
      const triggerDef = TriggerRegistry.get(item.triggerType);
      if (triggerDef) {
        const conditionalNode = {
          id: `trigger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: item.triggerType,
          label: triggerDef.name,
          category: 'trigger' as any,
          enabled: true,
          config: {},
        };
        addConditionalNode(container.id, node.id, branch, conditionalNode);
      }
    }
  };
  // Handler for adding node from quick add menu
  const handleAddNodeFromMenu = (branch: 'true' | 'false', nodeType: string) => {
    const container = containers[containerIndex];
    const newNode = NodeRegistry.createInstance(nodeType);
    if (newNode) {
      const conditionalNode = {
        id: newNode.id,
        type: newNode.type,
        label: newNode.label,
        category: newNode.category as any,
        enabled: true,
        config: newNode.config,
      };
      addConditionalNode(container.id, node.id, branch, conditionalNode);
    }
  };
  // Quick add node options
  const quickAddNodes = [
    { type: 'prompt_builder', label: 'Prompt Builder', category: 'ai' },
    { type: 'send_email', label: 'Send Email', category: 'actions' },
    { type: 'http_request', label: 'HTTP Request', category: 'integration' },
    { type: 'delay', label: 'Delay', category: 'flow' },
    { type: 'transform_data', label: 'Transform Data', category: 'data' },
  ];
  // Drag and drop
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'NODE',
    item: { containerIndex, nodeIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  const [, drop] = useDrop(() => ({
    accept: 'NODE',
    hover: (item: { containerIndex: number; nodeIndex: number }) => {
      if (item.containerIndex === containerIndex && item.nodeIndex !== nodeIndex) {
        onMove(containerIndex, item.nodeIndex, nodeIndex);
        item.nodeIndex = nodeIndex;
      }
    },
  }));
  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(containerIndex, nodeIndex);
  };
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this conditional node?')) {
      const container = containers[containerIndex];
      deleteNode(container.id, node.id);
    }
  };
  const handleToggle = () => {
    const container = containers[containerIndex];
    toggleNode(container.id, node.id);
  };
  // Generate condition summary text
  const getConditionSummary = () => {
    if (!conditionGroups || conditionGroups.length === 0) {
      return 'No conditions configured';
    }
    const firstGroup = conditionGroups[0];
    if (firstGroup.conditions.length === 0) {
      return 'No conditions configured';
    }
    const firstCondition = firstGroup.conditions[0];
    const operator = OPERATORS.find(op => op.value === firstCondition.operator);
    let summary = `${firstCondition.leftOperand || 'value'} ${operator?.label || 'equals'}`;
    if (operator?.requiresRightOperand) {
      summary += ` ${firstCondition.rightOperand || 'value'}`;
    }
    if (firstGroup.conditions.length > 1) {
      summary += ` +${firstGroup.conditions.length - 1} more`;
    }
    if (conditionGroups.length > 1) {
      summary += ` | ${conditionGroups.length} groups`;
    }
    return summary;
  };
  return (
    <div
      ref={(el) => preview(drop(el))}
      onClick={handleSettingsClick}
      data-connection-id={`node-${containerIndex}-${nodeIndex}`}
      data-connection-type="conditional-node"
      className={`relative rounded-xl border-2 ${borderColor} ${bgColor} transition-all cursor-pointer ${
        isDragging ? 'opacity-50' : ''
      } ${isSelected ? 'ring-2 ring-[#FFB75E]/50 shadow-lg shadow-[#FFB75E]/20' : ''} ${
        node.enabled === false ? 'opacity-50' : ''
      }`}
      id={`node-${node.id}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#2A2A3E]">
        {/* Drag Handle */}
        <div
          ref={drag}
          className={`cursor-grab active:cursor-grabbing ${textSecondary} hover:text-[#FFB75E] transition-colors`}
        >
          <GripVertical className="w-4 h-4" />
        </div>
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFB75E] to-[#ED8F03] flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className={`${textPrimary} truncate font-medium`}>
            {node.label}
          </div>
          <div className={`text-xs ${textSecondary} truncate`}>
            {getConditionSummary()}
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Enable/Disable Toggle */}
          <Switch
            checked={node.enabled !== false}
            onCheckedChange={handleToggle}
            onClick={(e) => e.stopPropagation()}
          />
          {/* Expand/Collapse */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className={`p-1.5 rounded ${hoverBg} transition-colors`}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {/* 3-dot Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className={`p-1.5 rounded ${hoverBg} transition-colors`}
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleSettingsClick}>
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}>
                <Power className="w-4 h-4 mr-2" />
                {node.enabled === false ? 'Enable' : 'Disable'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDeleteClick} className="text-red-400">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Branches */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Configure Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowConfigureModal(true);
            }}
            className={`w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] hover:from-[#00B8E6] hover:to-[#8D40AB] text-white text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-md`}
          >
            <Settings className="w-4 h-4" />
            Configure Conditions
          </button>
          {/* Tab Selector */}
          <div className={`flex gap-2 p-1 rounded-lg ${bgColor} border ${borderColor}`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('true');
              }}
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'true'
                  ? `${tabActiveBg} ${textPrimary}`
                  : `${textSecondary} ${hoverBg}`
              }`}
            >
              <GitBranch className="w-3 h-3 text-green-400" />
              True ({trueNodes.length})
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('false');
              }}
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'false'
                  ? `${tabActiveBg} ${textPrimary}`
                  : `${textSecondary} ${hoverBg}`
              }`}
            >
              <GitBranch className="w-3 h-3 text-red-400" />
              False ({falseNodes.length})
            </button>
          </div>
          {/* Branch Nodes */}
          <div 
            ref={activeTab === 'true' ? trueDrop : falseDrop}
            className={`space-y-2 ${
              (activeTab === 'true' ? (isTrueOver && canTrueDrop) : (isFalseOver && canFalseDrop)) 
                ? 'ring-2 ring-[#00C6FF]/50 rounded-lg p-2' 
                : ''
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drop indicator */}
            {(activeTab === 'true' ? (isTrueOver && canTrueDrop) : (isFalseOver && canFalseDrop)) && (
              <div className={`text-center py-4 ${textSecondary} text-xs border-2 border-dashed border-[#00C6FF] rounded-lg bg-[#00C6FF]/5`}>
                <p className="text-[#00C6FF]">Drop to add to {activeTab} branch</p>
              </div>
            )}
            {activeTab === 'true' && trueNodes.length === 0 && !isTrueOver && (
              <div className={`text-center py-6 ${textSecondary} text-xs border-2 border-dashed ${borderColor} rounded-lg`}>
                <p>No nodes in true branch</p>
                <p className="mt-1">Drag from sidebar or click below to add</p>
              </div>
            )}
            {activeTab === 'false' && falseNodes.length === 0 && !isFalseOver && (
              <div className={`text-center py-6 ${textSecondary} text-xs border-2 border-dashed ${borderColor} rounded-lg`}>
                <p>No nodes in false branch</p>
                <p className="mt-1">Drag from sidebar or click below to add</p>
              </div>
            )}
            {/* Display Branch Nodes */}
            {(activeTab === 'true' ? trueNodes : falseNodes).map((branchNode: any, idx: number) => {
              const branchColor = activeTab === 'true' ? 'green' : 'red';
              return (
                <BranchNodeItem
                  key={idx}
                  branchNode={branchNode}
                  branchColor={branchColor}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    // TODO: Select conditional node for editing
                  }}
                />
              );
            })}
            {/* Add Node Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className={`w-full border-2 border-dashed ${
                    activeTab === 'true' ? 'border-green-500/30' : 'border-red-500/30'
                  } rounded-lg p-2 text-xs ${
                    activeTab === 'true' ? 'text-green-400 hover:border-green-500/50 hover:bg-green-500/5' : 'text-red-400 hover:border-red-500/50 hover:bg-red-500/5'
                  } transition-all flex items-center justify-center gap-2`}
                >
                  <Plus className="w-3 h-3" />
                  Add to {activeTab === 'true' ? 'True' : 'False'} Branch
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className={`${bgColor} ${borderColor} w-56`}>
                <DropdownMenuLabel className={textPrimary}>Quick Add</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {quickAddNodes.map((quickNode) => (
                  <DropdownMenuItem
                    key={quickNode.type}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddNodeFromMenu(activeTab, quickNode.type);
                    }}
                    className={`${textPrimary} hover:bg-[#00C6FF]/10`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#00C6FF] to-[#9D50BB]" />
                      <div className="flex-1">
                        <div className="text-xs font-medium">{quickNode.label}</div>
                        <div className={`text-xs ${textSecondary}`}>{quickNode.category}</div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSettingsClick(e);
                  }}
                  className={`${textPrimary} hover:bg-[#00C6FF]/10`}
                >
                  <Plus className="w-3 h-3 mr-2" />
                  Browse All Nodes
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Redirect/Next Step Dropdown */}
            <div className="space-y-1.5">
              <label className={`text-xs ${textSecondary} px-1`}>
                Then go to
              </label>
              <select
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  e.stopPropagation();
                  // TODO: Handle redirect change
                }}
                className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${bgColor} ${textPrimary} text-xs focus:outline-none focus:border-[#00C6FF] focus:ring-1 focus:ring-[#00C6FF]/30`}
              >
                <option value="">Continue to next step...</option>
                <option value="end">End</option>
                {containers.map((container, idx) => (
                  container.nodes && container.nodes.map((n: any, nIdx: number) => (
                    <option 
                      key={`${idx}-${nIdx}`} 
                      value={`${idx}-${nIdx}`}
                      disabled={idx === containerIndex && nIdx === nodeIndex}
                    >
                      Step {idx + 1} → {n.label}
                    </option>
                  ))
                ))}
              </select>
            </div>
          </div>
          {/* Connection Points */}
          <div className="flex items-center gap-2 pt-2">
            <div 
              className={`flex-1 h-px bg-gradient-to-r ${
                activeTab === 'true' 
                  ? 'from-transparent via-green-400/50 to-transparent' 
                  : 'from-transparent via-red-400/50 to-transparent'
              }`}
              data-connection-id={`node-${containerIndex}-${nodeIndex}-${activeTab}-out`}
              data-connection-type="branch-output"
            />
          </div>
        </div>
      )}
      {/* Disabled Overlay */}
      {node.enabled === false && (
        <div className="absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
          <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-medium border border-red-500/30">
            Node Disabled
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-medium transition-all flex items-center gap-2 shadow-lg"
          >
            <Power className="w-4 h-4" />
            Enable Node
          </button>
        </div>
      )}
      {/* Configure Conditions Modal */}
      <ConfigureConditionsModal
        isOpen={showConfigureModal}
        onClose={() => setShowConfigureModal(false)}
        currentConditions={[]}
        onSave={(conditions) => {
          // TODO: Save conditions to node config
        }}
        theme={theme}
      />
    </div>
  );
}
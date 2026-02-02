import { useState } from 'react';
import { GripVertical, X, GitBranch, ChevronDown, ChevronUp, MoreVertical, Plus } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { WorkflowNodeType } from './WorkflowNode';
import { NodeDropZone } from './NodeDropZone';

interface ConditionalNodeProps {
  node: WorkflowNodeType;
  index: number;
  containerIndex: number;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onMove?: (containerIndex: number, fromIndex: number, toIndex: number) => void;
  theme: string;
  onAddConditionalNode?: (containerIndex: number, nodeIndex: number, branch: 'true' | 'false', nodeType: string) => void;
  onDeleteConditionalNode?: (containerIndex: number, nodeIndex: number, branch: 'true' | 'false', conditionalNodeIndex: number) => void;
  allContainers?: any[]; // For selecting redirect nodes
  onUpdateConfig?: (containerIndex: number, nodeIndex: number, config: any) => void;
  onOpenLeftPanel?: (context?: { containerIndex: number; nodeIndex: number; branch: 'true' | 'false' }) => void; // Updated to pass context
  hasFormSubmitTrigger?: boolean; // New prop to check if form submit trigger exists
  onMoveConditionalNode?: (containerIndex: number, nodeIndex: number, branch: 'true' | 'false', fromIndex: number, toIndex: number) => void;
  onDropConditionalNode?: (containerIndex: number, nodeIndex: number, branch: 'true' | 'false', nodeType: string) => void;
  onConditionalNodeClick?: (containerIndex: number, nodeIndex: number, branch: 'true' | 'false', conditionalNodeIndex: number) => void;
  selectedConditionalNodeIndex?: number | null;
  selectedBranch?: 'true' | 'false' | null;
}

export function ConditionalNode({ 
  node, 
  index, 
  containerIndex, 
  isSelected, 
  onClick, 
  onDelete, 
  onMove, 
  theme,
  onAddConditionalNode,
  onDeleteConditionalNode,
  allContainers = [],
  onUpdateConfig,
  onOpenLeftPanel,
  hasFormSubmitTrigger,
  onMoveConditionalNode,
  onDropConditionalNode,
  onConditionalNodeClick,
  selectedConditionalNodeIndex = null,
  selectedBranch = null
}: ConditionalNodeProps) {
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

  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'true' | 'false'>('true');

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
  const panelBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const inputBg = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';

  // Get conditional nodes from config
  const trueNodes = node.config.trueNodes || [];
  const falseNodes = node.config.falseNodes || [];
  const condition = node.config.condition || 'user.email is not empty';
  const redirectOnTrue = node.config.redirectOnTrue || null;
  const redirectOnFalse = node.config.redirectOnFalse || null;

  const handleAddNode = (nodeType: string) => {
    if (onAddConditionalNode) {
      onAddConditionalNode(containerIndex, index, activeTab, nodeType);
    }
  };

  const handleDeleteNode = (conditionalNodeIndex: number) => {
    if (onDeleteConditionalNode) {
      onDeleteConditionalNode(containerIndex, index, activeTab, conditionalNodeIndex);
    }
  };

  const handleRedirectChange = (branch: 'true' | 'false', value: string) => {
    if (onUpdateConfig) {
      const newConfig = {
        ...node.config,
        [branch === 'true' ? 'redirectOnTrue' : 'redirectOnFalse']: value || null
      };
      onUpdateConfig(containerIndex, index, newConfig);
    }
  };

  return (
    <div className="space-y-2 relative">
      <div
        ref={(nodeEl) => {
          preview(drop(nodeEl));
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        data-connection-id={`node-${containerIndex}-${index}`}
        data-connection-type="workflow-node"
        className={`group relative rounded-xl border-2 ${borderColor} ${bgColor} transition-all cursor-pointer ${
          isDragging ? 'opacity-50' : ''
        } ${isSelected ? 'ring-2 ring-[#00C6FF]/30 shadow-lg shadow-[#00C6FF]/20' : ''}`}
        id={`node-${node.id}`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          {/* Drag Handle */}
          <div
            ref={drag}
            className={`cursor-grab active:cursor-grabbing ${textSecondary} hover:text-[#00C6FF] transition-colors`}
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-white" />
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <div className={`${textPrimary} truncate font-medium`}>
              If / Switch
            </div>
            <div className={`text-xs ${textSecondary} truncate`}>
              {condition}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className={`p-1.5 rounded ${textSecondary} hover:text-[#00C6FF] hover:bg-[#00C6FF]/10 transition-all`}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className={`p-1.5 rounded ${textSecondary} hover:text-[#00C6FF] hover:bg-[#00C6FF]/10 transition-all`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

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

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-4">
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('true');
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'true'
                    ? 'bg-green-600/80 text-white'
                    : `${textSecondary} hover:bg-white/5`
                }`}
              >
                True
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('false');
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'false'
                    ? 'bg-red-600/80 text-white'
                    : `${textSecondary} hover:bg-white/5`
                }`}
              >
                False
              </button>
            </div>

            {/* True Branch Content */}
            {activeTab === 'true' && (
              <div className="space-y-3">
                <div className={`${panelBg} rounded-lg p-4 border border-green-500/30 bg-green-500/5`}>
                  <h5 className={`${textPrimary} text-sm font-medium mb-3`}>True</h5>
                  
                  {/* True Branch Nodes */}
                  <div className="space-y-2 mb-3">
                    {trueNodes.map((conditionalNode: any, idx: number) => {
                      const isCondNodeSelected = selectedBranch === 'true' && selectedConditionalNodeIndex === idx;
                      return (
                        <div
                          key={conditionalNode.id || idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onConditionalNodeClick) {
                              onConditionalNodeClick(containerIndex, index, 'true', idx);
                            }
                          }}
                          className={`${inputBg} rounded-lg p-3 border-2 ${
                            isCondNodeSelected ? 'border-[#00C6FF] shadow-lg shadow-[#00C6FF]/20' : borderColor
                          } flex items-center gap-2 cursor-pointer hover:border-[#00C6FF]/50 transition-all`}
                        >
                          <div className="flex-1">
                            <div className={`${textPrimary} text-sm`}>{conditionalNode.label}</div>
                            <div className={`${textSecondary} text-xs`}>{conditionalNode.type}</div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNode(idx);
                            }}
                            className={`p-1 rounded ${textSecondary} hover:text-red-500 hover:bg-red-500/10`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Items Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // This will trigger opening the nodes panel
                      if (onOpenLeftPanel) {
                        onOpenLeftPanel({ containerIndex, nodeIndex: index, branch: 'true' });
                      }
                    }}
                    className="w-full p-3 rounded-lg border-2 border-dashed border-green-500/30 text-green-500 hover:border-green-500/50 hover:bg-green-500/5 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Add Items Here</span>
                  </button>
                </div>

                {/* Redirect Dropdown for True */}
                <div className="space-y-2">
                  <label className={`${textSecondary} text-xs`}>
                    Redirect to item when true
                  </label>
                  <select
                    value={redirectOnTrue || ''}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleRedirectChange('true', e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]`}
                  >
                    <option value="">Select next item...</option>
                    {hasFormSubmitTrigger && <option value="ai-form">AI Form</option>}
                    <option value="end">End</option>
                    {allContainers.map((container, idx) => (
                      container.nodes && container.nodes.map((containerNode: any, nodeIdx: number) => (
                        <option key={`${idx}-${nodeIdx}`} value={`${idx}-${nodeIdx}`}>
                          Step {idx + 1} → {containerNode.label}
                        </option>
                      ))
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* False Branch Content */}
            {activeTab === 'false' && (
              <div className="space-y-3">
                <div className={`${panelBg} rounded-lg p-4 border border-red-500/30 bg-red-500/5`}>
                  <h5 className={`${textPrimary} text-sm font-medium mb-3`}>False</h5>
                  
                  {/* False Branch Nodes */}
                  <div className="space-y-2 mb-3">
                    {falseNodes.map((conditionalNode: any, idx: number) => {
                      const isCondNodeSelected = selectedBranch === 'false' && selectedConditionalNodeIndex === idx;
                      return (
                        <div
                          key={conditionalNode.id || idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onConditionalNodeClick) {
                              onConditionalNodeClick(containerIndex, index, 'false', idx);
                            }
                          }}
                          className={`${inputBg} rounded-lg p-3 border-2 ${
                            isCondNodeSelected ? 'border-[#00C6FF] shadow-lg shadow-[#00C6FF]/20' : borderColor
                          } flex items-center gap-2 cursor-pointer hover:border-[#00C6FF]/50 transition-all`}
                        >
                          <div className="flex-1">
                            <div className={`${textPrimary} text-sm`}>{conditionalNode.label}</div>
                            <div className={`${textSecondary} text-xs`}>{conditionalNode.type}</div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNode(idx);
                            }}
                            className={`p-1 rounded ${textSecondary} hover:text-red-500 hover:bg-red-500/10`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Items Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // This will trigger opening the nodes panel
                      if (onOpenLeftPanel) {
                        onOpenLeftPanel({ containerIndex, nodeIndex: index, branch: 'false' });
                      }
                    }}
                    className="w-full p-3 rounded-lg border-2 border-dashed border-red-500/30 text-red-500 hover:border-red-500/50 hover:bg-red-500/5 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Add Items Here</span>
                  </button>
                </div>

                {/* Redirect Dropdown for False */}
                <div className="space-y-2">
                  <label className={`${textSecondary} text-xs`}>
                    Redirect to item when false
                  </label>
                  <select
                    value={redirectOnFalse || ''}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleRedirectChange('false', e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]`}
                  >
                    <option value="">Select next item...</option>
                    {hasFormSubmitTrigger && <option value="ai-form">AI Form</option>}
                    <option value="end">End</option>
                    {allContainers.map((container, idx) => (
                      container.nodes && container.nodes.map((containerNode: any, nodeIdx: number) => (
                        <option key={`${idx}-${nodeIdx}`} value={`${idx}-${nodeIdx}`}>
                          Step {idx + 1} → {containerNode.label}
                        </option>
                      ))
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Bottom Add Items Button - Outside conditions */}
            {/* REMOVED - Not needed as per requirements */}
          </div>
        )}
      </div>
    </div>
  );
}
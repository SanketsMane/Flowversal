/**
 * Branch Node Component
 * Renders If/Switch nodes with horizontal branching support
 */

import { useState } from 'react';
import { GitBranch, Plus, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { useTheme } from '../../../../components/ThemeContext';
import { WorkflowNode, BranchContainer } from '../../types/node.types';
import { useWorkflowStore, useUIStore } from '../../stores';
import { NodeItem } from '../canvas/NodeItem';

interface BranchNodeProps {
  node: WorkflowNode;
  containerId: string;
}

export function BranchNode({ node, containerId }: BranchNodeProps) {
  const { theme } = useTheme();
  const { updateNode, addNodeToBranch } = useWorkflowStore();
  const { openNodePicker, openConditionBuilder } = useUIStore();
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgHover = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-50';

  // Initialize branches if not present
  if (!node.branches || node.branches.length === 0) {
    // VERTICAL STACKING ON THE LEFT SIDE
    // ALL branches on LEFT side, stacked vertically
    // 1st card (True/Default): -350px LEFT, -40px UP
    // 2nd card (False/Case 1): -350px LEFT, +40px DOWN (REDUCED from +80px)
    // 3rd card (Case 2): -350px LEFT, +80px DOWN (REDUCED from +160px)
    // etc.
    const leftOffsetX = -350; // All branches on LEFT side
    const startOffsetY = -40; // Starting Y position (slightly up)
    const verticalStep = 40; // Vertical spacing between branches (REDUCED from 80 to 40)
    
    const defaultBranches: BranchContainer[] = node.type === 'if' ? [
      {
        id: `${node.id}-true`,
        type: 'true',
        label: 'True',
        nodes: [],
        position: { x: leftOffsetX, y: startOffsetY }, // 1st: -350px, -40px
      },
      {
        id: `${node.id}-false`,
        type: 'false',
        label: 'False',
        nodes: [],
        position: { x: leftOffsetX, y: startOffsetY + verticalStep }, // 2nd: -350px, 0px (REDUCED)
      },
    ] : [
      {
        id: `${node.id}-default`,
        type: 'default',
        label: 'Default',
        nodes: [],
        position: { x: leftOffsetX, y: startOffsetY }, // 1st: -350px, -40px
      },
      {
        id: `${node.id}-case-1`,
        type: 'case',
        label: 'Case 1',
        nodes: [],
        position: { x: leftOffsetX, y: startOffsetY + verticalStep }, // 2nd: -350px, 0px (REDUCED)
      },
    ];

    updateNode(containerId, node.id, { branches: defaultBranches });
    return null; // Re-render after update
  }

  const branches = node.branches || [];

  const handleAddNodeToBranch = (branchId: string) => {
    openNodePicker('branch', containerId, node.id, branchId);
  };

  const handleConfigureConditions = () => {
    openConditionBuilder(containerId, node.id);
  };

  const handleAddCase = () => {
    if (node.type !== 'switch') return;
    
    // Calculate position for new case using VERTICAL stacking pattern
    const leftOffsetX = -350; // All branches on LEFT side
    const startOffsetY = -40; // Starting Y position (slightly up)
    const verticalStep = 40; // Vertical spacing between branches (REDUCED from 80 to 40)
    
    // Calculate branch index (default=0, case1=1, case2=2, etc.)
    const branchIndex = branches.length; // This will be the index of new branch
    
    const newCase: BranchContainer = {
      id: `${node.id}-case-${branches.length}`,
      type: 'case',
      label: `Case ${branches.length}`,
      nodes: [],
      position: { 
        x: leftOffsetX, 
        y: startOffsetY + (branchIndex * verticalStep)
      },
    };

    const updatedBranches = [...branches];
    // Insert before default case
    const defaultIndex = updatedBranches.findIndex(b => b.type === 'default');
    if (defaultIndex !== -1) {
      updatedBranches.splice(defaultIndex, 0, newCase);
    } else {
      updatedBranches.push(newCase);
    }

    updateNode(containerId, node.id, { branches: updatedBranches });
  };

  const toggleBranch = (branchId: string) => {
    setExpandedBranch(expandedBranch === branchId ? null : branchId);
  };

  return (
    <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
      {/* Node Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center">
          <GitBranch className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className={`${textPrimary} font-medium`}>{node.label}</h3>
          <p className={`${textSecondary} text-xs`}>
            {node.type === 'if' ? 'True/False branching' : 'Multi-case branching'}
          </p>
        </div>
        <button
          onClick={handleConfigureConditions}
          className={`px-3 py-1.5 rounded-lg border ${borderColor} ${bgHover} transition-colors`}
          title="Configure Conditions"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Branches Container */}
      <div className="space-y-3">
        {branches.map((branch) => (
          <div key={branch.id} className={`border ${borderColor} rounded-lg overflow-hidden`}>
            {/* Branch Header */}
            <button
              onClick={() => toggleBranch(branch.id)}
              className={`w-full px-4 py-3 flex items-center justify-between ${bgHover} transition-colors`}
            >
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  branch.type === 'true' 
                    ? 'bg-green-500/20 text-green-400' 
                    : branch.type === 'false'
                    ? 'bg-red-500/20 text-red-400'
                    : branch.type === 'default'
                    ? 'bg-gray-500/20 text-gray-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {branch.label}
                </span>
                <span className={`${textSecondary} text-sm`}>
                  {branch.nodes.length} node{branch.nodes.length !== 1 ? 's' : ''}
                </span>
              </div>
              {expandedBranch === branch.id ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Branch Content */}
            {expandedBranch === branch.id && (
              <div className="p-4 space-y-2">
                {/* Horizontal Node Layout */}
                {branch.nodes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {branch.nodes.map((branchNode, idx) => (
                      <div key={branchNode.id} className="flex items-center">
                        <div className="flex-shrink-0">
                          <NodeItem
                            node={branchNode}
                            containerId={containerId}
                            index={idx}
                          />
                        </div>
                        {idx < branch.nodes.length - 1 && (
                          <div className="w-8 h-0.5 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] mx-2" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`${textSecondary} text-sm text-center py-4`}>
                    No nodes in this branch yet
                  </p>
                )}

                {/* Add Node Button */}
                <button
                  onClick={() => handleAddNodeToBranch(branch.id)}
                  className={`w-full px-4 py-2 border-2 border-dashed ${borderColor} rounded-lg ${bgHover} transition-colors flex items-center justify-center gap-2 text-sm ${textSecondary} hover:text-[#00C6FF] hover:border-[#00C6FF]/50`}
                >
                  <Plus className="w-4 h-4" />
                  Add Node
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Case Button (Switch only) */}
      {node.type === 'switch' && (
        <button
          onClick={handleAddCase}
          className={`w-full mt-3 px-4 py-2 border-2 border-dashed ${borderColor} rounded-lg ${bgHover} transition-colors flex items-center justify-center gap-2 text-sm ${textSecondary} hover:text-purple-400 hover:border-purple-500/50`}
        >
          <Plus className="w-4 h-4" />
          Add Case
        </button>
      )}
    </div>
  );
}
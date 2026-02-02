/**
 * If/Switch Node Properties Component
 * Enhanced configuration for conditional nodes with tabbed interface
 */

import { GitBranch, Settings, Trash2, Plus, Box, Wrench } from 'lucide-react';
import { useTheme } from '../../../../components/ThemeContext';
import { useWorkflowStore, useSelectionStore, useUIStore } from '../../stores';
import { PropertySection } from './PropertySection';
import { PropertyField } from './PropertyField';
import { ConditionBuilder } from './ConditionBuilder';
import { ConditionSummaryCard } from './ConditionSummaryCard';
import { Switch } from '@/shared/components/ui/switch';
import { useState } from 'react';
import { ConditionGroup } from '../../types';

export function IfSwitchNodeProperties() {
  const { theme } = useTheme();
  const { containers, updateNode, deleteNode, toggleNode } = useWorkflowStore();
  const { selection, clearSelection } = useSelectionStore();
  const { setLeftPanelView, expandLeftPanel } = useUIStore();
  const [activeTab, setActiveTab] = useState<'parameters' | 'settings'>('parameters');

  if (!selection || selection.type !== 'node') return null;

  const container = containers[selection.containerIndex];
  if (!container) return null;

  const node = container.nodes[selection.nodeIndex];
  if (!node || (node.type !== 'if' && node.type !== 'switch')) return null;

  const Icon = node.icon;
  const isSwitch = node.type === 'switch';

  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const tabActiveBg = theme === 'dark' ? 'bg-[#2A2A3E]' : 'bg-gray-200';

  // Get or initialize condition groups
  const conditionGroups: ConditionGroup[] = node.config.conditionGroups || [{
    id: `group-${Date.now()}`,
    conditions: [{
      id: `cond-${Date.now()}`,
      leftOperand: '',
      operator: 'equals',
      rightOperand: '',
      dataType: 'string'
    }],
    logicalOperator: 'AND',
    convertTypes: node.config.convertTypes || false
  }];

  const convertTypes = node.config.convertTypes || false;
  const trueNodes = node.config.trueNodes || [];
  const falseNodes = node.config.falseNodes || [];

  const handleUpdateConfig = (key: string, value: any) => {
    updateNode(container.id, node.id, {
      config: {
        ...node.config,
        [key]: value,
      },
    });
  };

  const handleUpdateLabel = (label: string) => {
    updateNode(container.id, node.id, { label });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      deleteNode(container.id, node.id);
      clearSelection();
    }
  };

  const handleUpdateConditionGroups = (groups: ConditionGroup[]) => {
    handleUpdateConfig('conditionGroups', groups);
  };

  const handleOpenNodesPanel = (branch: 'true' | 'false') => {
    // Store the branch context for adding nodes
    handleUpdateConfig('_activeBranch', branch);
    setLeftPanelView('nodes');
    expandLeftPanel();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ 
            background: 'linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%)'
          }}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`${textPrimary} font-semibold truncate`}>
            {node.label}
          </h3>
          <p className={`${textSecondary} text-xs truncate`}>
            {isSwitch ? 'Switch' : 'If'} • Conditional Logic
          </p>
        </div>
      </div>

      {/* Enable/Disable */}
      <PropertySection>
        <div className="flex items-center justify-between">
          <div>
            <label className={`${textPrimary} text-sm block`}>
              Enable Node
            </label>
            <p className={`${textSecondary} text-xs mt-0.5`}>
              Disabled nodes won't execute
            </p>
          </div>
          <Switch
            checked={node.enabled !== false}
            onCheckedChange={() => toggleNode(container.id, node.id)}
          />
        </div>
      </PropertySection>

      {/* Tabs */}
      <div className={`flex gap-2 p-1 rounded-lg ${bgCard} border ${borderColor}`}>
        <button
          onClick={() => setActiveTab('parameters')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'parameters'
              ? `${tabActiveBg} ${textPrimary}`
              : `${textSecondary} hover:${textPrimary}`
          }`}
        >
          Parameters
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'settings'
              ? `${tabActiveBg} ${textPrimary}`
              : `${textSecondary} hover:${textPrimary}`
          }`}
        >
          Settings
        </button>
      </div>

      {/* Parameters Tab */}
      {activeTab === 'parameters' && (
        <>
          <PropertySection title="Conditions">
            <p className={`${textSecondary} text-xs mb-4`}>
              Configure the conditions that determine which branch to execute
            </p>
            <button
              onClick={() => {
                const { openConditionBuilder } = useUIStore.getState();
                openConditionBuilder(container.id, node.id);
              }}
              className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-[#00C6FF]/30 text-[#00C6FF] hover:border-[#00C6FF]/50 hover:bg-[#00C6FF]/5 transition-all flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Configure Conditions
            </button>
            
            {/* Condition Summary */}
            {conditionGroups.length > 0 && conditionGroups[0].conditions.length > 0 && (
              <div className={`mt-3 p-3 rounded-lg ${bgInput} border ${borderColor}`}>
                <p className={`${textSecondary} text-xs mb-2`}>Current Conditions:</p>
                {conditionGroups.map((group, idx) => (
                  <div key={group.id} className={`${textPrimary} text-sm`}>
                    {group.conditions.length} condition{group.conditions.length !== 1 ? 's' : ''} ({group.logicalOperator})
                  </div>
                ))}
              </div>
            )}
          </PropertySection>

          {/* Branch Configuration */}
          <PropertySection title="Branch Configuration">
            {/* True Branch */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={`${textPrimary} text-sm flex items-center gap-2`}>
                  <GitBranch className="w-4 h-4 text-green-400" />
                  True Branch
                </label>
                <span className={`${textSecondary} text-xs`}>
                  {trueNodes.length} node{trueNodes.length !== 1 ? 's' : ''}
                </span>
              </div>

              {trueNodes.length > 0 ? (
                <div className={`space-y-2 p-3 rounded-lg border ${borderColor} ${bgInput}`}>
                  {trueNodes.map((branchNode: any, idx: number) => {
                    const isToolNode = branchNode.category === 'tool';
                    const BranchIcon = isToolNode ? Wrench : Box;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 p-2 rounded ${bgCard} border ${borderColor}`}
                      >
                        <BranchIcon className="w-4 h-4 text-green-400" />
                        <span className={`${textPrimary} text-sm flex-1 truncate`}>
                          {branchNode.label}
                        </span>
                        <span className={`${textSecondary} text-xs`}>
                          {isToolNode ? 'Tool' : 'Node'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className={`${textSecondary} text-xs p-3 rounded-lg ${bgInput} border ${borderColor} text-center`}>
                  No nodes in true branch
                </p>
              )}

              <button
                onClick={() => handleOpenNodesPanel('true')}
                className={`w-full border-2 border-dashed border-green-500/30 rounded-lg p-3 text-sm text-green-400 hover:border-green-500/50 hover:bg-green-500/5 transition-all flex items-center justify-center gap-2`}
              >
                <Plus className="w-4 h-4" />
                Add Node to True Branch
              </button>
            </div>

            {/* False Branch */}
            <div className="space-y-3 mt-6">
              <div className="flex items-center justify-between">
                <label className={`${textPrimary} text-sm flex items-center gap-2`}>
                  <GitBranch className="w-4 h-4 text-red-400" />
                  False Branch
                </label>
                <span className={`${textSecondary} text-xs`}>
                  {falseNodes.length} node{falseNodes.length !== 1 ? 's' : ''}
                </span>
              </div>

              {falseNodes.length > 0 ? (
                <div className={`space-y-2 p-3 rounded-lg border ${borderColor} ${bgInput}`}>
                  {falseNodes.map((branchNode: any, idx: number) => {
                    const isToolNode = branchNode.category === 'tool';
                    const BranchIcon = isToolNode ? Wrench : Box;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 p-2 rounded ${bgCard} border ${borderColor}`}
                      >
                        <BranchIcon className="w-4 h-4 text-red-400" />
                        <span className={`${textPrimary} text-sm flex-1 truncate`}>
                          {branchNode.label}
                        </span>
                        <span className={`${textSecondary} text-xs`}>
                          {isToolNode ? 'Tool' : 'Node'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className={`${textSecondary} text-xs p-3 rounded-lg ${bgInput} border ${borderColor} text-center`}>
                  No nodes in false branch
                </p>
              )}

              <button
                onClick={() => handleOpenNodesPanel('false')}
                className={`w-full border-2 border-dashed border-red-500/30 rounded-lg p-3 text-sm text-red-400 hover:border-red-500/50 hover:bg-red-500/5 transition-all flex items-center justify-center gap-2`}
              >
                <Plus className="w-4 h-4" />
                Add Node to False Branch
              </button>
            </div>
          </PropertySection>
        </>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <PropertySection title="Node Settings">
          <PropertyField label="Node Name">
            <input
              type="text"
              value={node.label}
              onChange={(e) => handleUpdateLabel(e.target.value)}
              placeholder="Enter node name"
              className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
            />
          </PropertyField>

          <PropertyField label="Description">
            <textarea
              value={node.config.description || ''}
              onChange={(e) => handleUpdateConfig('description', e.target.value)}
              placeholder="Add a description for this node..."
              rows={3}
              className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm resize-none focus:outline-none focus:border-[#00C6FF]/50`}
            />
          </PropertyField>

          {isSwitch && (
            <PropertyField label="Evaluation Strategy">
              <select
                value={node.config.evaluationStrategy || 'first_match'}
                onChange={(e) => handleUpdateConfig('evaluationStrategy', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
              >
                <option value="first_match">First Match</option>
                <option value="all_matches">All Matches</option>
              </select>
            </PropertyField>
          )}
        </PropertySection>
      )}

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="w-full px-4 py-2 rounded-lg border-2 border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Delete Node
      </button>
    </div>
  );
}
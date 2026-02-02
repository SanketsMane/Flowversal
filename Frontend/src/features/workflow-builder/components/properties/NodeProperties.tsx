/**
 * Node Properties Component
 * Phase 2 - Component Extraction
 * 
 * Configuration panel for workflow nodes
 */

import { Trash2, Plus, GitBranch, ArrowRight } from 'lucide-react';
import { useTheme } from '../../../../components/ThemeContext';
import { useWorkflowStore, useSelectionStore, useUIStore } from '../../stores';
import { PropertySection } from './PropertySection';
import { PropertyField } from './PropertyField';
import { Switch } from '@/shared/components/ui/switch';

export function NodeProperties() {
  const { theme } = useTheme();
  const { containers, updateNode, deleteNode, toggleNode } = useWorkflowStore();
  const { selection, clearSelection } = useSelectionStore();
  const { setLeftPanelView, expandLeftPanel } = useUIStore();

  if (!selection || selection.type !== 'node') return null;

  const container = containers[selection.containerIndex];
  if (!container) return null;

  const node = container.nodes[selection.nodeIndex];
  if (!node) return null;

  const Icon = node.icon;

  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';

  const isPromptBuilder = node.type === 'prompt_builder';
  const isConditional = node.type === 'if' || node.type === 'switch';
  const tools = node.config.tools || [];

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

  const handleOpenToolsPanel = () => {
    setLeftPanelView('tools');
    expandLeftPanel();
  };

  // Conditional branch helpers
  const handleAddBranch = (branchType: 'true' | 'false') => {
    const branches = node.config.branches || { true: null, false: null };
    branches[branchType] = {
      targetNodeId: null,
      targetContainerId: null,
      label: branchType === 'true' ? 'True Path' : 'False Path',
    };
    handleUpdateConfig('branches', branches);
  };

  const handleUpdateBranch = (branchType: 'true' | 'false', updates: any) => {
    const branches = node.config.branches || { true: null, false: null };
    branches[branchType] = { ...branches[branchType], ...updates };
    handleUpdateConfig('branches', branches);
  };

  const handleRemoveBranch = (branchType: 'true' | 'false') => {
    const branches = node.config.branches || { true: null, false: null };
    branches[branchType] = null;
    handleUpdateConfig('branches', branches);
  };

  // Get available nodes for targeting
  const getAvailableTargets = () => {
    const targets: { id: string; label: string; containerIndex: number; nodeIndex: number }[] = [];
    containers.forEach((cont, contIndex) => {
      cont.nodes.forEach((n, nIndex) => {
        if (n.id !== node.id) {
          targets.push({
            id: n.id,
            label: `${cont.title} → ${n.label}`,
            containerIndex: contIndex,
            nodeIndex: nIndex,
          });
        }
      });
    });
    return targets;
  };

  const availableTargets = getAvailableTargets();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ 
            background: node.config.color || 'linear-gradient(135deg, #00C6FF 0%, #9D50BB 100%)'
          }}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`${textPrimary} font-semibold truncate`}>
            {node.label}
          </h3>
          <p className={`${textSecondary} text-xs truncate`}>
            {node.category} • {node.type}
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

      {/* Basic Settings */}
      <PropertySection title="Basic Settings">
        <PropertyField label="Node Name">
          <input
            type="text"
            value={node.label}
            onChange={(e) => handleUpdateLabel(e.target.value)}
            placeholder="Enter node name"
            className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
          />
        </PropertyField>
      </PropertySection>

      {/* Conditional Node Branch Configuration */}
      {isConditional && (
        <PropertySection title="Branch Configuration">
          <PropertyField label="Condition" description="The condition to evaluate">
            <textarea
              value={node.config.condition || ''}
              onChange={(e) => handleUpdateConfig('condition', e.target.value)}
              placeholder="e.g., {{variable}} > 100"
              rows={3}
              className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm resize-none focus:outline-none focus:border-[#00C6FF]/50 font-mono`}
            />
          </PropertyField>

          {/* True Branch */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className={`${textPrimary} text-sm flex items-center gap-2`}>
                <GitBranch className="w-4 h-4 text-green-400" />
                True Branch
              </label>
            </div>
            
            {node.config.branches?.true ? (
              <div className={`p-3 rounded-lg border ${borderColor} ${bgCard} space-y-3`}>
                <PropertyField label="Branch Label">
                  <input
                    type="text"
                    value={node.config.branches.true.label || ''}
                    onChange={(e) => handleUpdateBranch('true', { label: e.target.value })}
                    placeholder="e.g., High Value Customer"
                    className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
                  />
                </PropertyField>
                
                <PropertyField label="Redirect To">
                  <select
                    value={node.config.branches.true.targetNodeId || ''}
                    onChange={(e) => {
                      const target = availableTargets.find(t => t.id === e.target.value);
                      handleUpdateBranch('true', { 
                        targetNodeId: e.target.value,
                        targetContainerId: target?.containerIndex 
                      });
                    }}
                    className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
                  >
                    <option value="">Continue to next step</option>
                    {availableTargets.map(target => (
                      <option key={target.id} value={target.id}>
                        {target.label}
                      </option>
                    ))}
                  </select>
                </PropertyField>

                <button
                  onClick={() => handleRemoveBranch('true')}
                  className="w-full text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove Branch
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleAddBranch('true')}
                className={`w-full border-2 border-dashed ${borderColor} rounded-lg p-3 text-sm ${textSecondary} hover:border-green-500/50 hover:text-green-400 transition-all flex items-center justify-center gap-2`}
              >
                <Plus className="w-4 h-4" />
                Add True Branch
              </button>
            )}
          </div>

          {/* False Branch */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className={`${textPrimary} text-sm flex items-center gap-2`}>
                <GitBranch className="w-4 h-4 text-red-400" />
                False Branch
              </label>
            </div>
            
            {node.config.branches?.false ? (
              <div className={`p-3 rounded-lg border ${borderColor} ${bgCard} space-y-3`}>
                <PropertyField label="Branch Label">
                  <input
                    type="text"
                    value={node.config.branches.false.label || ''}
                    onChange={(e) => handleUpdateBranch('false', { label: e.target.value })}
                    placeholder="e.g., Regular Customer"
                    className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
                  />
                </PropertyField>
                
                <PropertyField label="Redirect To">
                  <select
                    value={node.config.branches.false.targetNodeId || ''}
                    onChange={(e) => {
                      const target = availableTargets.find(t => t.id === e.target.value);
                      handleUpdateBranch('false', { 
                        targetNodeId: e.target.value,
                        targetContainerId: target?.containerIndex 
                      });
                    }}
                    className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
                  >
                    <option value="">Continue to next step</option>
                    {availableTargets.map(target => (
                      <option key={target.id} value={target.id}>
                        {target.label}
                      </option>
                    ))}
                  </select>
                </PropertyField>

                <button
                  onClick={() => handleRemoveBranch('false')}
                  className="w-full text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove Branch
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleAddBranch('false')}
                className={`w-full border-2 border-dashed ${borderColor} rounded-lg p-3 text-sm ${textSecondary} hover:border-red-500/50 hover:text-red-400 transition-all flex items-center justify-center gap-2`}
              >
                <Plus className="w-4 h-4" />
                Add False Branch
              </button>
            )}
          </div>

          {/* Branch Preview */}
          {(node.config.branches?.true || node.config.branches?.false) && (
            <div className={`mt-4 p-3 rounded-lg border ${borderColor} ${bgCard}`}>
              <div className={`${textSecondary} text-xs mb-2`}>Flow Preview:</div>
              <div className="space-y-1 text-xs">
                {node.config.branches?.true && (
                  <div className="flex items-center gap-2 text-green-400">
                    <ArrowRight className="w-3 h-3" />
                    <span>True → {node.config.branches.true.targetNodeId ? 
                      availableTargets.find(t => t.id === node.config.branches.true.targetNodeId)?.label : 
                      'Continue'}</span>
                  </div>
                )}
                {node.config.branches?.false && (
                  <div className="flex items-center gap-2 text-red-400">
                    <ArrowRight className="w-3 h-3" />
                    <span>False → {node.config.branches.false.targetNodeId ? 
                      availableTargets.find(t => t.id === node.config.branches.false.targetNodeId)?.label : 
                      'Continue'}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </PropertySection>
      )}

      {/* Prompt Builder Configuration */}
      {isPromptBuilder && (
        <>
          <PropertySection title="AI Configuration">
            <PropertyField label="AI Model">
              <select
                value={node.config.aiModel || 'gpt-4'}
                onChange={(e) => handleUpdateConfig('aiModel', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                <option value="gemini-pro">Gemini Pro</option>
              </select>
            </PropertyField>

            <PropertyField label="Temperature" description="Controls randomness (0-1)">
              <input
                type="number"
                value={node.config.temperature || 0.7}
                onChange={(e) => handleUpdateConfig('temperature', parseFloat(e.target.value))}
                min="0"
                max="1"
                step="0.1"
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
              />
            </PropertyField>

            <PropertyField label="Max Tokens">
              <input
                type="number"
                value={node.config.maxTokens || 2000}
                onChange={(e) => handleUpdateConfig('maxTokens', parseInt(e.target.value))}
                min="100"
                max="32000"
                step="100"
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
              />
            </PropertyField>
          </PropertySection>

          <PropertySection title="Prompt Configuration">
            <PropertyField label="System Prompt" description="Sets AI behavior and context">
              <textarea
                value={node.config.systemPrompt || ''}
                onChange={(e) => handleUpdateConfig('systemPrompt', e.target.value)}
                placeholder="You are a helpful assistant..."
                rows={4}
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm resize-none focus:outline-none focus:border-[#00C6FF]/50`}
              />
            </PropertyField>

            <PropertyField label="User Prompt">
              <textarea
                value={node.config.userPrompt || ''}
                onChange={(e) => handleUpdateConfig('userPrompt', e.target.value)}
                placeholder="Enter your prompt..."
                rows={4}
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm resize-none focus:outline-none focus:border-[#00C6FF]/50`}
              />
            </PropertyField>
          </PropertySection>

          {/* Tools Management */}
          <PropertySection title={`Tools (${tools.length})`}>
            {tools.length > 0 ? (
              <div className="space-y-2">
                {tools.map((tool, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${borderColor} ${bgInput} flex items-center justify-between`}
                  >
                    <span className={`${textPrimary} text-sm`}>{tool.label}</span>
                    <button
                      onClick={() => {
                        const newTools = tools.filter((_, i) => i !== index);
                        handleUpdateConfig('tools', newTools);
                      }}
                      className="p-1 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`${textSecondary} text-sm text-center py-4`}>
                No tools added yet
              </p>
            )}

            <button
              onClick={handleOpenToolsPanel}
              className={`w-full border-2 border-dashed ${borderColor} rounded-lg p-3 text-sm ${textSecondary} hover:border-[#00C6FF]/50 hover:text-[#00C6FF] transition-all flex items-center justify-center gap-2`}
            >
              <Plus className="w-4 h-4" />
              {tools.length === 0 ? 'Add Tools' : 'Add More Tools'}
            </button>
          </PropertySection>
        </>
      )}

      {/* HTTP Request Configuration */}
      {node.type === 'http_request' && (
        <PropertySection title="HTTP Configuration">
          <PropertyField label="URL">
            <input
              type="url"
              value={node.config.url || ''}
              onChange={(e) => handleUpdateConfig('url', e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
            />
          </PropertyField>

          <PropertyField label="Method">
            <select
              value={node.config.method || 'GET'}
              onChange={(e) => handleUpdateConfig('method', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </PropertyField>

          <PropertyField label="Headers (JSON)">
            <textarea
              value={JSON.stringify(node.config.headers || {}, null, 2)}
              onChange={(e) => {
                try {
                  const headers = JSON.parse(e.target.value);
                  handleUpdateConfig('headers', headers);
                } catch (err) {
                  // Invalid JSON, don't update
                }
              }}
              placeholder='{"Content-Type": "application/json"}'
              rows={4}
              className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm font-mono resize-none focus:outline-none focus:border-[#00C6FF]/50`}
            />
          </PropertyField>
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
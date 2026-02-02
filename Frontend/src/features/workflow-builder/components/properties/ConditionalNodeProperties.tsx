/**
 * Conditional Node Properties Component
 * Configuration panel for nodes/tools inside conditional branches
 */

import { Trash2, Wrench, Box } from 'lucide-react';
import { useTheme } from '../../../../components/ThemeContext';
import { useWorkflowStore, useSelectionStore } from '../../stores';
import { PropertySection } from './PropertySection';
import { PropertyField } from './PropertyField';
import { Switch } from '@/shared/components/ui/switch';

export function ConditionalNodeProperties() {
  const { theme } = useTheme();
  const { containers, updateConditionalNode, deleteConditionalNode, toggleConditionalNode } = useWorkflowStore();
  const { selection, clearSelection } = useSelectionStore();

  if (!selection || selection.type !== 'conditionalNode') return null;

  const container = containers[selection.containerIndex];
  if (!container) return null;

  const parentNode = container.nodes[selection.nodeIndex];
  if (!parentNode || parentNode.type !== 'conditional') return null;

  const branchNodes = selection.branch === 'true' 
    ? parentNode.config.trueNodes || []
    : parentNode.config.falseNodes || [];

  const conditionalNode = branchNodes[selection.conditionalNodeIndex];
  if (!conditionalNode) return null;

  const isToolNode = conditionalNode.category === 'tool';
  const Icon = isToolNode ? Wrench : Box;

  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  const handleUpdateConfig = (key: string, value: any) => {
    updateConditionalNode(
      container.id,
      parentNode.id,
      selection.branch,
      selection.conditionalNodeIndex,
      {
        config: {
          ...conditionalNode.config,
          [key]: value,
        },
      }
    );
  };

  const handleUpdateLabel = (label: string) => {
    updateConditionalNode(
      container.id,
      parentNode.id,
      selection.branch,
      selection.conditionalNodeIndex,
      { label }
    );
  };

  const handleToggle = () => {
    toggleConditionalNode(
      container.id,
      parentNode.id,
      selection.branch,
      selection.conditionalNodeIndex
    );
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this ${isToolNode ? 'tool' : 'node'}?`)) {
      deleteConditionalNode(
        container.id,
        parentNode.id,
        selection.branch,
        selection.conditionalNodeIndex
      );
      clearSelection();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ 
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)' 
          }}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`${textPrimary} font-semibold truncate`}>
            {conditionalNode.label}
          </h3>
          <p className={`${textSecondary} text-xs truncate`}>
            {isToolNode ? 'Tool' : 'Node'} • {selection.branch === 'true' ? 'True' : 'False'} Branch
          </p>
        </div>
      </div>

      {/* Enable/Disable */}
      <PropertySection>
        <div className="flex items-center justify-between">
          <div>
            <label className={`${textPrimary} text-sm block`}>
              Enable {isToolNode ? 'Tool' : 'Node'}
            </label>
            <p className={`${textSecondary} text-xs mt-0.5`}>
              Disabled {isToolNode ? 'tools' : 'nodes'} won't execute
            </p>
          </div>
          <Switch
            checked={conditionalNode.enabled !== false}
            onCheckedChange={handleToggle}
          />
        </div>
      </PropertySection>

      {/* Basic Settings */}
      <PropertySection title="Basic Settings">
        <PropertyField label={`${isToolNode ? 'Tool' : 'Node'} Name`}>
          <input
            type="text"
            value={conditionalNode.label}
            onChange={(e) => handleUpdateLabel(e.target.value)}
            placeholder={`Enter ${isToolNode ? 'tool' : 'node'} name`}
            className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
          />
        </PropertyField>
      </PropertySection>

      {/* Configuration based on type */}
      {conditionalNode.type === 'send_email' && (
        <PropertySection title="Email Configuration">
          <PropertyField label="Recipient">
            <input
              type="email"
              value={conditionalNode.config.recipient || ''}
              onChange={(e) => handleUpdateConfig('recipient', e.target.value)}
              placeholder="user@example.com"
              className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
            />
          </PropertyField>

          <PropertyField label="Subject">
            <input
              type="text"
              value={conditionalNode.config.subject || ''}
              onChange={(e) => handleUpdateConfig('subject', e.target.value)}
              placeholder="Email subject"
              className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
            />
          </PropertyField>

          <PropertyField label="Body">
            <textarea
              value={conditionalNode.config.body || ''}
              onChange={(e) => handleUpdateConfig('body', e.target.value)}
              placeholder="Email body..."
              rows={4}
              className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm resize-none focus:outline-none focus:border-[#00C6FF]/50`}
            />
          </PropertyField>
        </PropertySection>
      )}

      {conditionalNode.type === 'http_request' && (
        <PropertySection title="HTTP Configuration">
          <PropertyField label="URL">
            <input
              type="url"
              value={conditionalNode.config.url || ''}
              onChange={(e) => handleUpdateConfig('url', e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
            />
          </PropertyField>

          <PropertyField label="Method">
            <select
              value={conditionalNode.config.method || 'GET'}
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
        </PropertySection>
      )}

      {/* Web Search Tool */}
      {conditionalNode.type === 'web_search' && (
        <PropertySection title="Web Search Configuration">
          <PropertyField label="Search Engine">
            <select
              value={conditionalNode.config.engine || 'google'}
              onChange={(e) => handleUpdateConfig('engine', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
            >
              <option value="google">Google</option>
              <option value="bing">Bing</option>
              <option value="duckduckgo">DuckDuckGo</option>
            </select>
          </PropertyField>

          <PropertyField label="Max Results">
            <input
              type="number"
              value={conditionalNode.config.maxResults || 10}
              onChange={(e) => handleUpdateConfig('maxResults', parseInt(e.target.value))}
              min="1"
              max="100"
              className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
            />
          </PropertyField>
        </PropertySection>
      )}

      {/* Generic Configuration */}
      {conditionalNode.config.description !== undefined && (
        <PropertySection title="Configuration">
          <PropertyField label="Description">
            <textarea
              value={conditionalNode.config.description || ''}
              onChange={(e) => handleUpdateConfig('description', e.target.value)}
              placeholder="Add a description..."
              rows={3}
              className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm resize-none focus:outline-none focus:border-[#00C6FF]/50`}
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
        Delete {isToolNode ? 'Tool' : 'Node'}
      </button>
    </div>
  );
}
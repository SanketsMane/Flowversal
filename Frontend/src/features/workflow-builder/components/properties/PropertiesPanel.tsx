/**
 * Properties Panel Component
 * Phase 2 - Component Extraction
 * 
 * Right panel container showing configuration for selected items
 */

import { ChevronLeft, ChevronRight, Settings as SettingsIcon } from 'lucide-react';
import { useTheme } from '../../../../components/ThemeContext';
import { useUIStore, useSelectionStore, useWorkflowStore } from '../../stores';
import { EmptyPropertyState } from './EmptyPropertyState';
import { TriggerProperties } from './TriggerProperties';
import { NodeProperties } from './NodeProperties';
import { ConditionalNodeProperties } from './ConditionalNodeProperties';
import { IfSwitchNodeProperties } from './IfSwitchNodeProperties';

export function PropertiesPanel() {
  const { theme } = useTheme();
  const { isRightPanelMinimized, toggleRightPanel } = useUIStore();
  const { selectedItem } = useSelectionStore();
  const { containers } = useWorkflowStore();

  // Theme colors
  const panelBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';

  // Check if selected node is If/Switch
  const isIfSwitchNode = () => {
    if (selectedItem?.type !== 'node') return false;
    const container = containers[selectedItem.containerIndex];
    if (!container) return false;
    const node = container.nodes[selectedItem.nodeIndex];
    return node && (node.type === 'if' || node.type === 'switch');
  };

  return (
    <div className={`${panelBg} border-l ${borderColor} ${isRightPanelMinimized ? 'w-20' : 'w-80'} overflow-y-auto p-6 transition-all`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {!isRightPanelMinimized && (
          <h2 className={`${textPrimary} flex items-center gap-2`}>
            <SettingsIcon className="w-5 h-5" />
            <span>Properties</span>
          </h2>
        )}
        <button
          onClick={toggleRightPanel}
          className="p-1.5 hover:bg-gray-700/20 rounded transition-colors"
          title={isRightPanelMinimized ? 'Expand panel' : 'Collapse panel'}
        >
          {isRightPanelMinimized ? (
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Content */}
      {!isRightPanelMinimized && (
        <>
          {/* No Selection */}
          {!selectedItem && <EmptyPropertyState />}

          {/* Trigger Properties */}
          {selectedItem?.type === 'trigger' && <TriggerProperties />}

          {/* If/Switch Node Properties */}
          {selectedItem?.type === 'node' && isIfSwitchNode() && <IfSwitchNodeProperties />}

          {/* Regular Node Properties */}
          {selectedItem?.type === 'node' && !isIfSwitchNode() && <NodeProperties />}

          {/* Conditional Node Properties */}
          {selectedItem?.type === 'conditionalNode' && <ConditionalNodeProperties />}
        </>
      )}
    </div>
  );
}
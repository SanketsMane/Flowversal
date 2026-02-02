/**
 * Trigger Section Component
 * Phase 2 - Component Extraction
 * 
 * Displays all triggers with logic operators and add button
 */

import { Plus } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useWorkflowStore, useUIStore, useSelectionStore } from '../../stores';
import { TriggerCard } from './TriggerCard';
import { LogicOperatorButton } from './LogicOperatorButton';
import React from 'react';

export function TriggerSection() {
  const { theme } = useTheme();
  const { triggers, triggerLogic, setTriggerLogic, moveTrigger } = useWorkflowStore();
  const { openNodePicker } = useUIStore();
  const { selection } = useSelectionStore();

  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';

  const handleAddTrigger = () => {
    openNodePicker('trigger');
  };
  
  const handleAddNode = () => {
    // Open node picker to add nodes to triggers
    openNodePicker('trigger-node');
  };

  const handleToggleLogic = (index: number) => {
    const newLogic = [...triggerLogic];
    newLogic[index] = newLogic[index] === 'OR' ? 'AND' : 'OR';
    setTriggerLogic(newLogic);
  };

  if (triggers.length === 0) {
    return (
      <div 
        data-trigger-section
        className={`border-2 border-dashed ${borderColor} rounded-lg p-6 text-center ${
        theme === 'dark' ? 'bg-transparent' : 'bg-gray-50/80'
      }`}>
        <div className="max-w-md mx-auto">
          <h3 className={`${textPrimary} font-semibold mb-2`}>
            Add Your First Trigger
          </h3>
          <p className={`${textSecondary} text-xs mb-3`}>
            Triggers start your workflow. Choose from webhooks, schedules, events, and more.
          </p>
          <button
            onClick={handleAddTrigger}
            className="px-4 py-1.5 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
          >
            Browse Triggers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-trigger-section>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`${textPrimary} font-semibold`}>Triggers</h3>
      </div>

      {/* Triggers */}
      {triggers.map((trigger, index) => (
        <React.Fragment key={trigger.id}>
          <TriggerCard
            trigger={trigger}
            index={index}
            isSelected={selection?.type === 'trigger' && selection.index === index}
            onMove={moveTrigger}
          />

          {/* Logic Operator (between triggers) - Always show if multiple triggers */}
          {index < triggers.length - 1 && (
            <LogicOperatorButton
              logic={triggerLogic[index] || 'AND'}
              onToggle={() => handleToggleLogic(index)}
            />
          )}
        </React.Fragment>
      ))}

      {/* Add Another Trigger Button */}
      <button
        onClick={handleAddTrigger}
        className={`w-full border-2 border-dashed ${borderColor} border-green-400/70 rounded-lg p-3 text-sm ${textSecondary} flex items-center justify-center gap-2 transition-all ${theme === 'dark' ? 'bg-[#0a1b12] dark:border-green-500/60' : 'bg-white/95'}
          text-green-700 dark:text-green-200
          shadow-[0_0_0_2px_rgba(34,197,94,0.25)]
          hover:shadow-[0_0_18px_rgba(34,197,94,0.6)]
          hover:border-green-400 hover:text-green-600 dark:hover:text-green-100`}
      >
        <Plus className="w-4 h-4" />
        Add Trigger
      </button>
    </div>
  );
}
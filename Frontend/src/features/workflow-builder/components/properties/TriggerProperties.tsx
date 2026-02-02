/**
 * Trigger Properties Component
 * Phase 2 - Component Extraction
 * 
 * Configuration panel for triggers
 */

import { Trash2, Zap, Pencil, Check, X } from 'lucide-react';
import { useTheme } from '../../../../components/ThemeContext';
import { useWorkflowStore, useSelectionStore } from '../../stores';
import { TriggerRegistry } from '../../registries';
import { PropertySection } from './PropertySection';
import { PropertyField } from './PropertyField';
import { Switch } from '@/shared/components/ui/switch';
import { FormFieldManager } from '../form/FormFieldManager';
import { useState } from 'react';

export function TriggerProperties() {
  const { theme } = useTheme();
  const { triggers, updateTrigger, deleteTrigger, toggleTrigger } = useWorkflowStore();
  const { selection, clearSelection } = useSelectionStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  if (!selection || selection.type !== 'trigger') return null;

  const trigger = triggers[selection.index];
  if (!trigger) return null;

  const triggerDef = TriggerRegistry.get(trigger.type);
  const Icon = triggerDef?.icon || Zap;

  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  const handleUpdateConfig = (key: string, value: any) => {
    updateTrigger(trigger.id, {
      config: {
        ...trigger.config,
        [key]: value,
      },
    });
  };

  const handleUpdateLabel = (label: string) => {
    updateTrigger(trigger.id, { label });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this trigger?')) {
      deleteTrigger(trigger.id);
      clearSelection();
    }
  };

  const handleStartEditing = () => {
    setEditedName(trigger.label);
    setIsEditingName(true);
  };

  const handleSaveEdit = () => {
    if (editedName.trim()) {
      handleUpdateLabel(editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  const handleFieldsChange = (fields: any[]) => {
    handleUpdateConfig('fields', fields);
  };

  return (
    <div className="space-y-4">
      {/* Header with Editable Name */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                autoFocus
                className={`flex-1 px-2 py-1 text-lg font-semibold rounded ${bgInput} border ${borderColor} ${textPrimary} focus:outline-none focus:border-[#00C6FF]`}
              />
              <button
                onClick={handleSaveEdit}
                className="p-1 hover:bg-green-500/20 rounded text-green-400"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1 hover:bg-red-500/20 rounded text-red-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <h3 
              className={`${textPrimary} font-semibold truncate flex items-center gap-2 cursor-pointer hover:text-[#00C6FF] transition-colors group`}
              onClick={handleStartEditing}
              title="Click to edit name"
            >
              {trigger.label}
              <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
          )}
          <p className={`${textSecondary} text-xs truncate`}>
            {triggerDef?.label || trigger.type}
          </p>
        </div>
      </div>

      {/* Enable/Disable */}
      <PropertySection>
        <div className="flex items-center justify-between">
          <div>
            <label className={`${textPrimary} text-sm block`}>
              Enable Trigger
            </label>
            <p className={`${textSecondary} text-xs mt-0.5`}>
              Disabled triggers won't activate the workflow
            </p>
          </div>
          <Switch
            checked={trigger.enabled !== false}
            onCheckedChange={() => toggleTrigger(trigger.id)}
          />
        </div>
      </PropertySection>

      {/* Basic Settings */}
      <PropertySection title="Basic Settings">
        <PropertyField label="Trigger Name">
          <input
            type="text"
            value={trigger.label}
            onChange={(e) => handleUpdateLabel(e.target.value)}
            placeholder="Enter trigger name"
            className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
          />
        </PropertyField>
      </PropertySection>

      {/* Form Trigger - Show Form Field Manager */}
      {trigger.type === 'form' && (
        <PropertySection title="Form Fields">
          <div className="space-y-4">
            <PropertyField 
              label="Form ID"
              description="Unique identifier for this form"
            >
              <input
                type="text"
                value={trigger.config.formId || trigger.id}
                onChange={(e) => handleUpdateConfig('formId', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
              />
            </PropertyField>

            <PropertyField label="Submit Button Text">
              <input
                type="text"
                value={trigger.config.submitButtonText || 'Submit'}
                onChange={(e) => handleUpdateConfig('submitButtonText', e.target.value)}
                placeholder="Submit"
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
              />
            </PropertyField>

            {/* Form Fields Management */}
            <div className="mt-4">
              <div className={`${textPrimary} text-sm font-medium mb-2`}>
                Manage Form Fields
              </div>
              <div className={`${borderColor} border rounded-lg p-4 max-h-[400px] overflow-y-auto`}>
                <FormFieldManager
                  fields={trigger.config.fields || []}
                  onFieldsChange={handleFieldsChange}
                  formTitle={trigger.label}
                  formDescription="Configure the fields that will be shown in this form"
                />
              </div>
            </div>
          </div>
        </PropertySection>
      )}

      {/* Trigger-Specific Configuration */}
      {trigger.type === 'webhook' && (
        <PropertySection title="Webhook Configuration">
          <PropertyField 
            label="Webhook URL" 
            description="This URL will be auto-generated after publishing"
          >
            <input
              type="text"
              value={trigger.config.webhookUrl || 'Will be generated...'}
              disabled
              className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textSecondary} text-sm`}
            />
          </PropertyField>

          <PropertyField label="HTTP Method">
            <select
              value={trigger.config.method || 'POST'}
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

      {trigger.type === 'schedule' && (
        <PropertySection title="Schedule Configuration">
          <PropertyField label="Schedule Type">
            <select
              value={trigger.config.scheduleType || 'cron'}
              onChange={(e) => handleUpdateConfig('scheduleType', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
            >
              <option value="cron">Cron Expression</option>
              <option value="interval">Interval</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </PropertyField>

          {trigger.config.scheduleType === 'cron' && (
            <PropertyField 
              label="Cron Expression"
              description="Example: 0 0 * * * (every hour)"
            >
              <input
                type="text"
                value={trigger.config.cronExpression || ''}
                onChange={(e) => handleUpdateConfig('cronExpression', e.target.value)}
                placeholder="0 0 * * *"
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm font-mono focus:outline-none focus:border-[#00C6FF]/50`}
              />
            </PropertyField>
          )}

          {trigger.config.scheduleType === 'interval' && (
            <PropertyField label="Interval (minutes)">
              <input
                type="number"
                value={trigger.config.intervalMinutes || 60}
                onChange={(e) => handleUpdateConfig('intervalMinutes', parseInt(e.target.value))}
                min="1"
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
              />
            </PropertyField>
          )}
        </PropertySection>
      )}

      {/* Advanced Settings */}
      <PropertySection title="Advanced Settings">
        <PropertyField label="Timeout (seconds)">
          <input
            type="number"
            value={trigger.config.timeout || 30}
            onChange={(e) => handleUpdateConfig('timeout', parseInt(e.target.value))}
            min="5"
            max="300"
            className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
          />
        </PropertyField>

        <PropertyField label="Enable Logging">
          <select
            value={trigger.config.enableLogging !== false ? 'yes' : 'no'}
            onChange={(e) => handleUpdateConfig('enableLogging', e.target.value === 'yes')}
            className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </PropertyField>
      </PropertySection>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="w-full px-4 py-2 rounded-lg border-2 border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Delete Trigger
      </button>
    </div>
  );
}
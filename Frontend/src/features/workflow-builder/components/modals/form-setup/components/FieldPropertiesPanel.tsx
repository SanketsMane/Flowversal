import { CheckCircle, Database, Plus, Settings, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { FormField } from '../../../types/form.types';
import { FieldPropertiesPanelProps, FieldTab } from '../types/form-setup.types';

export function FieldPropertiesPanel({
  selectedField,
  fieldTab,
  onFieldTabChange,
  onFieldUpdate,
  onSave,
  hasUnsavedChanges,
  theme,
}: FieldPropertiesPanelProps) {
  const [newOption, setNewOption] = useState('');

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgSecondary = theme === 'dark' ? 'bg-[#16213E]' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  const tabs: { key: FieldTab; label: string; icon: React.ComponentType<any> }[] = [
    { key: 'edit', label: 'Edit', icon: Settings },
    { key: 'validations', label: 'Validations', icon: CheckCircle },
    { key: 'data', label: 'Data', icon: Database },
  ];

  const handleFieldPropertyChange = (property: keyof FormField, value: any) => {
    if (selectedField) {
      onFieldUpdate({ [property]: value });
    }
  };

  const addOption = () => {
    if (newOption.trim() && selectedField) {
      const currentOptions = selectedField.config?.options || [];
      onFieldUpdate({
        config: {
          ...selectedField.config,
          options: [...currentOptions, newOption.trim()],
        },
      });
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    if (selectedField) {
      const currentOptions = selectedField.config?.options || [];
      const newOptions = currentOptions.filter((_, i) => i !== index);
      onFieldUpdate({
        config: {
          ...selectedField.config,
          options: newOptions,
        },
      });
    }
  };

  const renderEditTab = () => {
    if (!selectedField) return null;

    return (
      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Label</label>
          <input
            type="text"
            value={selectedField.label || ''}
            onChange={(e) => handleFieldPropertyChange('label', e.target.value)}
            className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:border-[#00C6FF] focus:outline-none`}
            placeholder="Field label"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Placeholder</label>
          <input
            type="text"
            value={selectedField.placeholder || ''}
            onChange={(e) => handleFieldPropertyChange('placeholder', e.target.value)}
            className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:border-[#00C6FF] focus:outline-none`}
            placeholder="Field placeholder"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Description</label>
          <textarea
            value={selectedField.description || ''}
            onChange={(e) => handleFieldPropertyChange('description', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:border-[#00C6FF] focus:outline-none resize-none`}
            placeholder="Field description"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="required"
            checked={selectedField.required || false}
            onChange={(e) => handleFieldPropertyChange('required', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="required" className={`text-sm ${textPrimary}`}>Required field</label>
        </div>

        {/* Type-specific options */}
        {(selectedField.type === 'select' || selectedField.type === 'radio' || selectedField.type === 'checkbox') && (
          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Options</label>
            <div className="space-y-2">
              {(selectedField.config?.options || []).map((option: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(selectedField.config?.options || [])];
                      newOptions[index] = e.target.value;
                      onFieldUpdate({
                        config: { ...selectedField.config, options: newOptions },
                      });
                    }}
                    className={`flex-1 px-2 py-1 border ${borderColor} rounded ${bgCard} ${textPrimary} focus:border-[#00C6FF] focus:outline-none text-sm`}
                  />
                  <button
                    onClick={() => removeOption(index)}
                    className="p-1 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOption()}
                  className={`flex-1 px-2 py-1 border ${borderColor} rounded ${bgCard} ${textPrimary} focus:border-[#00C6FF] focus:outline-none text-sm`}
                  placeholder="Add option"
                />
                <button
                  onClick={addOption}
                  className="p-1 hover:bg-green-500/10 rounded transition-colors"
                >
                  <Plus className="w-4 h-4 text-green-400" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderValidationsTab = () => {
    if (!selectedField) return null;

    return (
      <div className="space-y-4">
        <p className={`text-sm ${textSecondary}`}>Validation rules for {selectedField.label}</p>

        {/* Basic validations */}
        <div className="space-y-2">
          <label className={`flex items-center gap-2 ${textPrimary}`}>
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Required field</span>
          </label>

          {selectedField.type === 'email' && (
            <label className={`flex items-center gap-2 ${textPrimary}`}>
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Valid email format</span>
            </label>
          )}

          {(selectedField.type === 'text' || selectedField.type === 'textarea') && (
            <>
              <div>
                <label className={`block text-sm ${textPrimary} mb-1`}>Minimum length</label>
                <input
                  type="number"
                  className={`w-full px-2 py-1 border ${borderColor} rounded ${bgCard} ${textPrimary} focus:border-[#00C6FF] focus:outline-none text-sm`}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={`block text-sm ${textPrimary} mb-1`}>Maximum length</label>
                <input
                  type="number"
                  className={`w-full px-2 py-1 border ${borderColor} rounded ${bgCard} ${textPrimary} focus:border-[#00C6FF] focus:outline-none text-sm`}
                  placeholder="1000"
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderDataTab = () => {
    if (!selectedField) return null;

    return (
      <div className="space-y-4">
        <p className={`text-sm ${textSecondary}`}>Data handling for {selectedField.label}</p>

        <div>
          <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Default Value</label>
          <input
            type="text"
            value={selectedField.config?.defaultValue || ''}
            onChange={(e) => onFieldUpdate({
              config: { ...selectedField.config, defaultValue: e.target.value },
            })}
            className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:border-[#00C6FF] focus:outline-none`}
            placeholder="Default value"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="disabled"
            checked={selectedField.config?.disabled || false}
            onChange={(e) => onFieldUpdate({
              config: { ...selectedField.config, disabled: (e.target as any).checked },
            })}
            className="rounded"
          />
          <label htmlFor="disabled" className={`text-sm ${textPrimary}`}>Disabled field</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="readonly"
            checked={selectedField.config?.readonly || false}
            onChange={(e) => onFieldUpdate({
              config: { ...selectedField.config, readonly: (e.target as any).checked },
            })}
            className="rounded"
          />
          <label htmlFor="readonly" className={`text-sm ${textPrimary}`}>Read-only field</label>
        </div>
      </div>
    );
  };

  if (!selectedField) {
    return (
      <div className={`flex flex-col h-full ${bgCard}`}>
        <div className={`${bgSecondary} px-4 py-3 border-b ${borderColor} flex items-center justify-between`}>
          <h3 className={`${textPrimary} font-medium`}>Field Properties</h3>
          {onSave && (
            <button
              onClick={onSave}
              disabled={!hasUnsavedChanges}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                hasUnsavedChanges
                  ? 'bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white hover:opacity-90 shadow-sm'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              Save Form
            </button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className={`text-center ${textSecondary}`}>
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a field to edit its properties</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${bgCard}`}>
      {/* Header */}
      <div className={`${bgSecondary} px-4 py-3 border-b ${borderColor} flex items-center justify-between`}>
        <div>
          <h3 className={`${textPrimary} font-medium`}>Field Properties</h3>
          <p className={`text-xs ${textSecondary} mt-1`}>{selectedField.label}</p>
        </div>
        {onSave && (
          <button
            onClick={onSave}
            disabled={!hasUnsavedChanges}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              hasUnsavedChanges
                ? 'bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white hover:opacity-90 shadow-sm'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            Save Form
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className={`${bgCard} px-3 py-2 border-b ${borderColor}`}>
        <div className="flex items-center gap-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onFieldTabChange(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
                fieldTab === key
                  ? `${bgSecondary} ${textPrimary}`
                  : `${textSecondary} hover:${bgSecondary}`
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {fieldTab === 'edit' && renderEditTab()}
        {fieldTab === 'validations' && renderValidationsTab()}
        {fieldTab === 'data' && renderDataTab()}
      </div>
    </div>
  );
}

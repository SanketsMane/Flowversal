/**
 * Form Field Property Panel
 * Edit properties, validations, and data for form fields
 */

import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { FormField } from '../../types/form.types';

interface FormFieldPropertyPanelProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export function FormFieldPropertyPanel({ field, onUpdate, onClose, theme = 'dark' }: FormFieldPropertyPanelProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'validations' | 'data'>('edit');
  const [newOption, setNewOption] = useState('');
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  const tabs = [
    { id: 'edit', label: 'Edit' },
    { id: 'validations', label: 'Validations' },
    { id: 'data', label: 'Data' },
  ];

  // Handle option changes for select, radio, checkbox fields
  const handleOptionsChange = (options: string[]) => {
    onUpdate({ options });
  };

  const addOption = () => {
    const currentOptions = field.options || [];
    handleOptionsChange([...currentOptions, `Option ${currentOptions.length + 1}`]);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = value;
    handleOptionsChange(newOptions);
  };

  const deleteOption = (index: number) => {
    const newOptions = [...(field.options || [])];
    newOptions.splice(index, 1);
    handleOptionsChange(newOptions);
    
    // Clear default value if it matches deleted option
    if (field.type === 'checkbox') {
      const currentDefaults = Array.isArray(field.defaultValue) ? field.defaultValue : [];
      const newDefaults = currentDefaults.filter((v: string) => v !== newOptions[index]);
      onUpdate({ defaultValue: newDefaults });
    } else if (field.defaultValue === newOptions[index]) {
      onUpdate({ defaultValue: '' });
    }
  };

  const handleAddNewOption = () => {
    if (newOption.trim()) {
      const currentOptions = field.options || [];
      handleOptionsChange([...currentOptions, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNewOption();
    }
  };

  const startEditingOption = (index: number) => {
    setEditingOptionIndex(index);
  };

  const finishEditingOption = () => {
    setEditingOptionIndex(null);
  };

  // Handle default value for checkbox (multiple selection)
  const toggleDefaultCheckbox = (option: string) => {
    const currentDefaults = Array.isArray(field.defaultValue) ? field.defaultValue : [];
    const newDefaults = currentDefaults.includes(option)
      ? currentDefaults.filter((v: string) => v !== option)
      : [...currentDefaults, option];
    onUpdate({ defaultValue: newDefaults });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`${textPrimary} font-medium`}>Field Properties</h3>
          <button
            onClick={onClose}
            className={`${textSecondary} hover:text-white transition-colors`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 text-[#00C6FF] border border-[#00C6FF]/30'
                  : `${textSecondary} hover:bg-white/5`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Edit Tab */}
        {activeTab === 'edit' && (
          <>
            {/* Label */}
            <div>
              <label className={`block text-sm ${textSecondary} mb-2`}>Label</label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} 
                           focus:outline-none focus:border-[#00C6FF]/50`}
                placeholder="Enter field label"
              />
            </div>

            {/* Placeholder */}
            <div>
              <label className={`block text-sm ${textSecondary} mb-2`}>Placeholder</label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} 
                           focus:outline-none focus:border-[#00C6FF]/50`}
                placeholder="Enter placeholder text"
              />
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm ${textSecondary} mb-2`}>Description</label>
              <textarea
                value={field.description || ''}
                onChange={(e) => onUpdate({ description: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} 
                           focus:outline-none focus:border-[#00C6FF]/50 resize-none`}
                rows={3}
                placeholder="Enter field description"
              />
            </div>

            {/* Default Value - Now in Edit tab for non-option fields */}
            {!(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
              <div>
                <label className={`block text-sm ${textSecondary} mb-2`}>Default Value</label>
                <input
                  type="text"
                  value={field.defaultValue || ''}
                  onChange={(e) => onUpdate({ defaultValue: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} 
                             focus:outline-none focus:border-[#00C6FF]/50`}
                  placeholder="Enter default value"
                />
              </div>
            )}
          </>
        )}

        {/* Validations Tab */}
        {activeTab === 'validations' && (
          <>
            {/* Required */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.required || false}
                  onChange={(e) => onUpdate({ required: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 bg-[#0E0E1F] text-[#00C6FF] 
                           focus:ring-[#00C6FF] focus:ring-offset-0"
                />
                <div>
                  <p className={`${textPrimary} text-sm`}>Required</p>
                  <p className={`${textSecondary} text-xs`}>User must fill this field</p>
                </div>
              </label>
            </div>

            {/* Min Length (for text fields) */}
            {(field.type === 'text' || field.type === 'textarea' || field.type === 'email') && (
              <div>
                <label className={`block text-sm ${textSecondary} mb-2`}>Minimum Length</label>
                <input
                  type="number"
                  value={field.validation?.minLength || ''}
                  onChange={(e) => onUpdate({ 
                    validation: { ...field.validation, minLength: parseInt(e.target.value) || undefined }
                  })}
                  className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} 
                             focus:outline-none focus:border-[#00C6FF]/50`}
                  placeholder="No minimum"
                  min="0"
                />
              </div>
            )}

            {/* Max Length (for text fields) */}
            {(field.type === 'text' || field.type === 'textarea' || field.type === 'email') && (
              <div>
                <label className={`block text-sm ${textSecondary} mb-2`}>Maximum Length</label>
                <input
                  type="number"
                  value={field.validation?.maxLength || ''}
                  onChange={(e) => onUpdate({ 
                    validation: { ...field.validation, maxLength: parseInt(e.target.value) || undefined }
                  })}
                  className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} 
                             focus:outline-none focus:border-[#00C6FF]/50`}
                  placeholder="No maximum"
                  min="0"
                />
              </div>
            )}

            {/* Pattern (for text fields) */}
            {(field.type === 'text' || field.type === 'email') && (
              <div>
                <label className={`block text-sm ${textSecondary} mb-2`}>Pattern (Regex)</label>
                <input
                  type="text"
                  value={field.validation?.pattern || ''}
                  onChange={(e) => onUpdate({ 
                    validation: { ...field.validation, pattern: e.target.value || undefined }
                  })}
                  className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} 
                             focus:outline-none focus:border-[#00C6FF]/50`}
                  placeholder="e.g., ^[A-Z].*"
                />
              </div>
            )}

            {/* Min/Max (for number fields) */}
            {field.type === 'number' && (
              <>
                <div>
                  <label className={`block text-sm ${textSecondary} mb-2`}>Minimum Value</label>
                  <input
                    type="number"
                    value={field.validation?.min || ''}
                    onChange={(e) => onUpdate({ 
                      validation: { ...field.validation, min: parseFloat(e.target.value) || undefined }
                    })}
                    className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} 
                               focus:outline-none focus:border-[#00C6FF]/50`}
                    placeholder="No minimum"
                  />
                </div>
                <div>
                  <label className={`block text-sm ${textSecondary} mb-2`}>Maximum Value</label>
                  <input
                    type="number"
                    value={field.validation?.max || ''}
                    onChange={(e) => onUpdate({ 
                      validation: { ...field.validation, max: parseFloat(e.target.value) || undefined }
                    })}
                    className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} 
                               focus:outline-none focus:border-[#00C6FF]/50`}
                    placeholder="No maximum"
                  />
                </div>
              </>
            )}

            {/* Custom Error Message */}
            <div>
              <label className={`block text-sm ${textSecondary} mb-2`}>Custom Error Message</label>
              <input
                type="text"
                value={field.validation?.message || ''}
                onChange={(e) => onUpdate({ 
                  validation: { ...field.validation, message: e.target.value || undefined }
                })}
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} 
                           focus:outline-none focus:border-[#00C6FF]/50`}
                placeholder="Enter custom error message"
              />
            </div>
          </>
        )}

        {/* Data Tab */}
        {activeTab === 'data' && (
          <>
            {/* Field ID (read-only) */}
            <div>
              <label className={`block text-sm ${textSecondary} mb-2`}>Field ID</label>
              <input
                type="text"
                value={field.id}
                readOnly
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textSecondary} 
                           cursor-not-allowed`}
              />
              <p className={`${textSecondary} text-xs mt-1`}>Use this ID to reference the field value</p>
            </div>

            {/* Field Type (read-only) */}
            <div>
              <label className={`block text-sm ${textSecondary} mb-2`}>Field Type</label>
              <input
                type="text"
                value={field.type}
                readOnly
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textSecondary} 
                           cursor-not-allowed`}
              />
            </div>

            {/* Variable Name */}
            <div>
              <label className={`block text-sm ${textSecondary} mb-2`}>Variable Name</label>
              <input
                type="text"
                value={field.variableName || ''}
                onChange={(e) => onUpdate({ variableName: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} 
                           focus:outline-none focus:border-[#00C6FF]/50`}
                placeholder="e.g., user_email"
              />
              <p className={`${textSecondary} text-xs mt-1`}>Custom variable name for this field</p>
            </div>

            {/* Data Mapping */}
            <div>
              <label className={`block text-sm ${textSecondary} mb-2`}>Data Mapping</label>
              <textarea
                value={field.dataMapping || ''}
                onChange={(e) => onUpdate({ dataMapping: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} 
                           focus:outline-none focus:border-[#00C6FF]/50 resize-none`}
                rows={3}
                placeholder="JSON path or mapping expression"
              />
              <p className={`${textSecondary} text-xs mt-1`}>Map this field to external data</p>
            </div>

            {/* Options (for select, radio, checkbox) - moved to Data tab */}
            {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
              <div>
                <label className={`block text-sm ${textSecondary} mb-3`}>Options</label>
                <p className={`${textSecondary} text-xs mb-3`}>Add options that users can select from</p>
                
                <div className="space-y-2 mb-3">
                  {(field.options || []).map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className={`flex-1 px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} \n                                   focus:outline-none focus:border-[#00C6FF]/50`}
                        placeholder={`Option ${index + 1}`}
                      />
                      <button
                        onClick={() => deleteOption(index)}
                        className="p-2 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Add new option input */}
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={`flex-1 px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} \n                               focus:outline-none focus:border-[#00C6FF]/50`}
                    placeholder="Type option and press Enter"
                  />
                  <button
                    onClick={handleAddNewOption}
                    className={`px-3 py-2 rounded-lg border ${borderColor} ${textSecondary} \n                               hover:border-[#00C6FF]/50 hover:text-[#00C6FF] transition-all \n                               flex items-center gap-2`}
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {/* Default Value Section for Dropdown/Radio/Checkbox */}
                <div className="pt-4 border-t border-white/10">
                  <label className={`block text-sm ${textSecondary} mb-2`}>Default Value</label>
                  
                  {field.type === 'checkbox' ? (
                    /* Checkbox - Multiple Selection */
                    <div className="space-y-2">
                      <p className={`${textSecondary} text-xs mb-2`}>Select one or more default values</p>
                      {(field.options || []).map((option, index) => (
                        <label key={index} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={Array.isArray(field.defaultValue) ? field.defaultValue.includes(option) : false}
                            onChange={() => toggleDefaultCheckbox(option)}
                            className="w-4 h-4 rounded border-white/10 bg-[#0E0E1F] text-[#00C6FF] \n                                     focus:ring-[#00C6FF] focus:ring-offset-0"
                          />
                          <span className={`${textPrimary} text-sm`}>{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : field.type === 'radio' ? (
                    /* Radio - Single Selection */
                    <div className="space-y-2">
                      <p className={`${textSecondary} text-xs mb-2`}>Select one default value</p>
                      {(field.options || []).map((option, index) => (
                        <label key={index} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded">
                          <input
                            type="radio"
                            checked={field.defaultValue === option}
                            onChange={() => onUpdate({ defaultValue: option })}
                            className="w-4 h-4 border-white/10 bg-[#0E0E1F] text-[#00C6FF] \n                                     focus:ring-[#00C6FF] focus:ring-offset-0"
                          />
                          <span className={`${textPrimary} text-sm`}>{option}</span>
                        </label>
                      ))}
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded">
                        <input
                          type="radio"
                          checked={!field.defaultValue}
                          onChange={() => onUpdate({ defaultValue: '' })}
                          className="w-4 h-4 border-white/10 bg-[#0E0E1F] text-[#00C6FF] \n                                   focus:ring-[#00C6FF] focus:ring-offset-0"
                        />
                        <span className={`${textSecondary} text-sm`}>None</span>
                      </label>
                    </div>
                  ) : (
                    /* Dropdown - Select from options or custom text */
                    <div className="space-y-2">
                      <p className={`${textSecondary} text-xs mb-2`}>Select from options or enter custom text/variable</p>
                      <select
                        value={field.defaultValue || ''}
                        onChange={(e) => onUpdate({ defaultValue: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} \n                                   focus:outline-none focus:border-[#00C6FF]/50`}
                      >
                        <option value="">-- No default --</option>
                        {(field.options || []).map((option, index) => (
                          <option key={index} value={option}>{option}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2">
                        <span className={`${textSecondary} text-xs`}>or</span>
                      </div>
                      <input
                        type="text"
                        value={field.defaultValue || ''}
                        onChange={(e) => onUpdate({ defaultValue: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} \n                                   focus:outline-none focus:border-[#00C6FF]/50 font-mono text-sm`}
                        placeholder="Enter custom value or {{variable}}"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
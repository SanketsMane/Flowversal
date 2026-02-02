/**
 * Form Builder Tab Component
 * Used in NodeSetupModal for Form nodes
 * Inline field selection with options management in Data tab
 */

import React, { useState } from 'react';
import { Plus, X, Type, FileText, Mail, Hash, Phone, Link as LinkIcon, Calendar, Clock, List, Upload, CheckSquare, ToggleLeft, Star, Save, ArrowLeft, Trash2 } from 'lucide-react';
import { WorkflowNode } from '../../types';
import { useTheme } from '@/core/theme/ThemeContext';

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  description: string;
  required: boolean;
  validation: any;
  options?: string[]; // For dropdown, checkbox, radio
  defaultValue?: any; // Default value for fields
}

interface FormBuilderTabProps {
  node: WorkflowNode;
  onSave: (config: any) => void;
  containerId: string;
}

type Screen = 'main' | 'picker' | 'properties';
type FieldTab = 'edit' | 'validations' | 'data';

const AVAILABLE_FIELDS = [
  { type: 'text', icon: Type, label: 'Text Input', description: 'Single line text input' },
  { type: 'email', icon: Mail, label: 'Email', description: 'Email address input' },
  { type: 'number', icon: Hash, label: 'Number', description: 'Numeric input' },
  { type: 'phone', icon: Phone, label: 'Phone', description: 'Phone number input' },
  { type: 'url', icon: LinkIcon, label: 'URL', description: 'Website URL input' },
  { type: 'date', icon: Calendar, label: 'Date', description: 'Date picker' },
  { type: 'time', icon: Clock, label: 'Time', description: 'Time picker' },
  { type: 'dropdown', icon: List, label: 'Dropdown', description: 'Single selection dropdown' },
  { type: 'textarea', icon: FileText, label: 'Text Area', description: 'Multi-line text input' },
  { type: 'checkbox', icon: CheckSquare, label: 'Checkbox', description: 'Multiple selection checkboxes' },
  { type: 'radio', icon: CheckSquare, label: 'Radio', description: 'Single selection radio buttons' },
  { type: 'toggle', icon: ToggleLeft, label: 'Toggle', description: 'Toggle switch' },
  { type: 'rating', icon: Star, label: 'Rating', description: 'Star rating input' },
  { type: 'file', icon: Upload, label: 'File Upload', description: 'File upload input' },
  { type: 'image', icon: Upload, label: 'Upload Image', description: 'Image upload input' },
];

export function FormBuilderTab({ node, onSave, containerId }: FormBuilderTabProps) {
  const { theme } = useTheme();
  const [fields, setFields] = useState<FormField[]>(node.config?.formFields || []);
  const [screen, setScreen] = useState<Screen>('main');
  const [fieldTab, setFieldTab] = useState<FieldTab>('edit');
  const [editingField, setEditingField] = useState<FormField | null>(null);

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgSecondary = theme === 'dark' ? 'bg-[#13131F]' : 'bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  const handleAddField = (fieldType: typeof AVAILABLE_FIELDS[0]) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: fieldType.type,
      label: fieldType.label,
      placeholder: `Enter ${fieldType.label.toLowerCase()}...`,
      description: '',
      required: false,
      validation: {},
      options: ['dropdown', 'checkbox', 'radio'].includes(fieldType.type) 
        ? ['Option 1', 'Option 2', 'Option 3'] 
        : undefined,
      defaultValue: undefined,
    };
    const updatedFields = [...fields, newField];
    setFields(updatedFields);
    onSave({ ...node.config, formFields: updatedFields });
    setScreen('main');
  };

  const handleUpdateField = (updatedField: FormField) => {
    const updatedFields = fields.map(f => f.id === updatedField.id ? updatedField : f);
    setFields(updatedFields);
    onSave({ ...node.config, formFields: updatedFields });
  };

  const handleDeleteField = (fieldId: string) => {
    const updatedFields = fields.filter(f => f.id !== fieldId);
    setFields(updatedFields);
    onSave({ ...node.config, formFields: updatedFields });
  };

  const handleSaveAndClose = () => {
    if (editingField) {
      handleUpdateField(editingField);
    }
    setEditingField(null);
    setScreen('main');
  };

  // SCREEN 1: MAIN (EMPTY OR WITH FIELDS)
  if (screen === 'main') {
    return (
      <MainScreen
        fields={fields}
        onAddFieldClick={() => setScreen('picker')}
        onFieldClick={(field) => {
          setEditingField(field);
          setFieldTab('edit');
          setScreen('properties');
        }}
        onDeleteField={handleDeleteField}
        theme={theme}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        borderColor={borderColor}
      />
    );
  }

  // SCREEN 2: FIELD PICKER (INLINE, NOT MODAL)
  if (screen === 'picker') {
    return (
      <FieldPickerScreen
        onSelectField={handleAddField}
        onClose={() => setScreen('main')}
        theme={theme}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        bgSecondary={bgSecondary}
        borderColor={borderColor}
      />
    );
  }

  // SCREEN 3: FIELD PROPERTIES
  if (screen === 'properties' && editingField) {
    return (
      <FieldPropertiesScreen
        field={editingField}
        onFieldChange={setEditingField}
        onSave={handleSaveAndClose}
        onClose={() => setScreen('main')}
        fieldTab={fieldTab}
        setFieldTab={setFieldTab}
        theme={theme}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        bgCard={bgCard}
        borderColor={borderColor}
      />
    );
  }

  return null;
}

// ========================================
// SCREEN 1: MAIN (EMPTY OR WITH FIELDS)
// ========================================
interface MainScreenProps {
  fields: FormField[];
  onAddFieldClick: () => void;
  onFieldClick: (field: FormField) => void;
  onDeleteField: (fieldId: string) => void;
  theme: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
}

function MainScreen({
  fields,
  onAddFieldClick,
  onFieldClick,
  onDeleteField,
  theme,
  textPrimary,
  textSecondary,
  borderColor
}: MainScreenProps) {
  
  if (fields.length === 0) {
    // Empty State
    return (
      <div className="flex flex-col items-center justify-center h-full py-16">
        {/* Plus Icon Button */}
        <button
          onClick={onAddFieldClick}
          className={`w-24 h-24 rounded-full ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-[#00C6FF]/20 to-[#9D50BB]/20' 
              : 'bg-gradient-to-br from-blue-100 to-purple-100'
          } flex items-center justify-center mb-6 hover:scale-105 transition-transform`}
        >
          <Plus className={`w-12 h-12 ${theme === 'dark' ? 'text-[#00C6FF]' : 'text-blue-500'}`} />
        </button>

        {/* Title */}
        <h3 className={`${textPrimary} text-xl mb-2`}>No Fields Yet</h3>
        
        {/* Description */}
        <p className={`${textSecondary} text-sm mb-8 text-center`}>
          Click "Add Field" to start building your form
        </p>

        {/* Add Field Button */}
        <button
          onClick={onAddFieldClick}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:opacity-90 transition-all font-medium shadow-lg shadow-[#00C6FF]/30"
        >
          Add Field
        </button>
      </div>
    );
  }

  // With Fields
  return (
    <div className="flex flex-col h-full py-6">
      <div className="flex-1 overflow-y-auto space-y-4 mb-6">
        {fields.map((field) => {
          const fieldType = AVAILABLE_FIELDS.find(f => f.type === field.type);
          const Icon = fieldType?.icon || Type;
          
          return (
            <div
              key={field.id}
              onClick={() => onFieldClick(field)}
              className={`flex items-center gap-4 p-4 rounded-2xl ${
                theme === 'dark' 
                  ? 'bg-[#1A1A2E] border-[#2A2A3E] hover:border-[#00C6FF]/50 hover:bg-[#20203A]' 
                  : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50'
              } border transition-all cursor-pointer group`}
            >
              <div className={`w-12 h-12 rounded-xl ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-[#00C6FF]/20 to-[#9D50BB]/20' 
                  : 'bg-gradient-to-br from-blue-100 to-purple-100'
              } flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-[#00C6FF]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`${textPrimary} font-medium mb-1 truncate`}>{field.label}</div>
                <div className={`${textSecondary} text-sm truncate`}>{field.placeholder}</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteField(field.id);
                }}
                className={`p-2 rounded-lg ${textSecondary} hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Fields Button */}
      <button
        onClick={onAddFieldClick}
        className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:opacity-90 transition-all font-medium shadow-lg shadow-[#00C6FF]/30 flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Fields
      </button>
    </div>
  );
}

// ========================================
// SCREEN 2: FIELD PICKER (INLINE)
// ========================================
interface FieldPickerScreenProps {
  onSelectField: (fieldType: typeof AVAILABLE_FIELDS[0]) => void;
  onClose: () => void;
  theme: string;
  textPrimary: string;
  textSecondary: string;
  bgSecondary: string;
  borderColor: string;
}

function FieldPickerScreen({
  onSelectField,
  onClose,
  theme,
  textPrimary,
  textSecondary,
  bgSecondary,
  borderColor
}: FieldPickerScreenProps) {
  return (
    <div className="flex flex-col h-full py-6">
      {/* Header with close button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${textSecondary} hover:text-[#00C6FF] hover:bg-[#00C6FF]/10 transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className={`${textPrimary} text-lg font-medium`}>Select Field Type</h3>
        </div>
        <button
          onClick={onClose}
          className={`p-2 rounded-lg ${textSecondary} hover:text-[#00C6FF] hover:bg-[#00C6FF]/10 transition-colors`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Field List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {AVAILABLE_FIELDS.map((fieldType) => {
          const Icon = fieldType.icon;
          return (
            <button
              key={fieldType.type}
              onClick={() => onSelectField(fieldType)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl ${
                theme === 'dark' 
                  ? 'bg-[#1A1A2E] hover:bg-[#20203A] border-[#2A2A3E]' 
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              } border hover:border-[#00C6FF]/50 transition-all text-left group`}
            >
              <div className={`w-14 h-14 rounded-xl ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-[#00C6FF]/20 to-[#9D50BB]/20' 
                  : 'bg-gradient-to-br from-blue-100 to-purple-100'
              } flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-7 h-7 text-[#00C6FF]" />
              </div>
              <div className="flex-1">
                <div className={`${textPrimary} font-medium mb-1`}>{fieldType.label}</div>
                <div className={`${textSecondary} text-sm`}>{fieldType.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ========================================
// SCREEN 3: FIELD PROPERTIES
// ========================================
interface FieldPropertiesScreenProps {
  field: FormField;
  onFieldChange: (field: FormField) => void;
  onSave: () => void;
  onClose: () => void;
  fieldTab: FieldTab;
  setFieldTab: (tab: FieldTab) => void;
  theme: string;
  textPrimary: string;
  textSecondary: string;
  bgCard: string;
  borderColor: string;
}

function FieldPropertiesScreen({
  field,
  onFieldChange,
  onSave,
  onClose,
  fieldTab,
  setFieldTab,
  theme,
  textPrimary,
  textSecondary,
  bgCard,
  borderColor
}: FieldPropertiesScreenProps) {
  const [newOption, setNewOption] = useState('');
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);

  const hasOptions = ['dropdown', 'checkbox', 'radio'].includes(field.type);

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    const options = field.options || [];
    onFieldChange({ ...field, options: [...options, newOption.trim()] });
    setNewOption('');
  };

  const handleEditOption = (index: number, value: string) => {
    const options = [...(field.options || [])];
    options[index] = value;
    onFieldChange({ ...field, options });
  };

  const handleDeleteOption = (index: number) => {
    const options = [...(field.options || [])];
    options.splice(index, 1);
    onFieldChange({ ...field, options });
  };

  return (
    <div className="flex flex-col h-full py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${textSecondary} hover:text-[#00C6FF] hover:bg-[#00C6FF]/10 transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className={`${textPrimary} text-lg font-medium`}>Field Properties</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:opacity-90 transition-all font-medium flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${textSecondary} hover:text-[#00C6FF] hover:bg-[#00C6FF]/10 transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`border-b ${borderColor} mb-6`}>
        <div className="flex gap-6">
          <button
            onClick={() => setFieldTab('edit')}
            className={`px-4 py-3 border-b-2 transition-colors ${
              fieldTab === 'edit'
                ? 'border-[#00C6FF] text-[#00C6FF]'
                : `border-transparent ${textSecondary} hover:${textPrimary}`
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setFieldTab('validations')}
            className={`px-4 py-3 border-b-2 transition-colors ${
              fieldTab === 'validations'
                ? 'border-[#00C6FF] text-[#00C6FF]'
                : `border-transparent ${textSecondary} hover:${textPrimary}`
            }`}
          >
            Validations
          </button>
          <button
            onClick={() => setFieldTab('data')}
            className={`px-4 py-3 border-b-2 transition-colors ${
              fieldTab === 'data'
                ? 'border-[#00C6FF] text-[#00C6FF]'
                : `border-transparent ${textSecondary} hover:${textPrimary}`
            }`}
          >
            Data
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {fieldTab === 'edit' && (
          <>
            {/* Label */}
            <div>
              <label className={`${textSecondary} text-sm mb-2 block`}>Label</label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => onFieldChange({ ...field, label: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF] focus:ring-1 focus:ring-[#00C6FF]/30`}
              />
            </div>

            {/* Placeholder */}
            <div>
              <label className={`${textSecondary} text-sm mb-2 block`}>Placeholder</label>
              <input
                type="text"
                value={field.placeholder}
                onChange={(e) => onFieldChange({ ...field, placeholder: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF] focus:ring-1 focus:ring-[#00C6FF]/30`}
              />
            </div>

            {/* Description */}
            <div>
              <label className={`${textSecondary} text-sm mb-2 block`}>Description</label>
              <textarea
                value={field.description}
                onChange={(e) => onFieldChange({ ...field, description: e.target.value })}
                rows={4}
                placeholder="Enter field description"
                className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF] focus:ring-1 focus:ring-[#00C6FF]/30 resize-none`}
              />
            </div>

            {/* Default Value for Date */}
            {field.type === 'date' && (
              <div>
                <label className={`${textSecondary} text-sm mb-2 block`}>Default Date</label>
                <input
                  type="date"
                  value={field.defaultValue || ''}
                  onChange={(e) => onFieldChange({ ...field, defaultValue: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF] focus:ring-1 focus:ring-[#00C6FF]/30`}
                />
              </div>
            )}

            {/* Default Value for Time */}
            {field.type === 'time' && (
              <div>
                <label className={`${textSecondary} text-sm mb-2 block`}>Default Time</label>
                <input
                  type="time"
                  value={field.defaultValue || ''}
                  onChange={(e) => onFieldChange({ ...field, defaultValue: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF] focus:ring-1 focus:ring-[#00C6FF]/30`}
                />
              </div>
            )}

            {/* Default Value for File/Image Upload */}
            {(field.type === 'file' || field.type === 'image') && (
              <div>
                <label className={`${textSecondary} text-sm mb-2 block`}>Default File</label>
                <input
                  type="file"
                  accept={field.type === 'image' ? 'image/*' : undefined}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onFieldChange({ ...field, defaultValue: file.name });
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF] focus:ring-1 focus:ring-[#00C6FF]/30 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-[#00C6FF] file:to-[#9D50BB] file:text-white file:cursor-pointer hover:file:opacity-90`}
                />
                {field.defaultValue && (
                  <p className={`${textSecondary} text-sm mt-2`}>Selected: {field.defaultValue}</p>
                )}
              </div>
            )}

            {/* Required Toggle */}
            <div className="flex items-center justify-between">
              <label className={`${textPrimary} text-sm`}>Required Field</label>
              <button
                onClick={() => onFieldChange({ ...field, required: !field.required })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  field.required ? 'bg-[#00C6FF]' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    field.required ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </>
        )}

        {fieldTab === 'validations' && (
          <div className={`${textSecondary} text-sm p-6 text-center`}>
            <p className="mb-2">Validation options will be available in the next phase</p>
            <p className="text-xs">Configure field validation rules, min/max values, patterns, etc.</p>
          </div>
        )}

        {fieldTab === 'data' && (
          <div className="space-y-6">
            {/* Options Management for Dropdown, Checkbox, Radio */}
            {hasOptions ? (
              <>
                <div>
                  <label className={`${textSecondary} text-sm mb-3 block`}>Options</label>
                  
                  {/* Existing Options */}
                  <div className="space-y-2 mb-3">
                    {(field.options || []).map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {editingOptionIndex === index ? (
                          <>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleEditOption(index, e.target.value)}
                              onBlur={() => setEditingOptionIndex(null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') setEditingOptionIndex(null);
                              }}
                              autoFocus
                              className={`flex-1 px-3 py-2 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF] focus:ring-1 focus:ring-[#00C6FF]/30`}
                            />
                          </>
                        ) : (
                          <>
                            <div
                              onClick={() => setEditingOptionIndex(index)}
                              className={`flex-1 px-3 py-2 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm cursor-pointer hover:border-[#00C6FF]/50`}
                            >
                              {option}
                            </div>
                            <button
                              onClick={() => handleDeleteOption(index)}
                              className={`p-2 rounded-lg ${textSecondary} hover:text-red-500 hover:bg-red-500/10 transition-colors`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add New Option */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddOption();
                      }}
                      placeholder="Add new option..."
                      className={`flex-1 px-3 py-2 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF] focus:ring-1 focus:ring-[#00C6FF]/30`}
                    />
                    <button
                      onClick={handleAddOption}
                      disabled={!newOption.trim()}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:opacity-90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className={`${textSecondary} text-sm p-6 text-center`}>
                <p className="mb-2">Data options available for this field type</p>
                <p className="text-xs">Configure default values in the Edit tab</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

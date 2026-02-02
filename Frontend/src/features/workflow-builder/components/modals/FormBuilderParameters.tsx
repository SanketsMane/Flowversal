/**
 * Form Builder Parameters Component
 * Displays in Parameters tab for Form nodes
 * 3 screens: Main (Empty/Fields), Field Picker Modal, Field Properties Modal
 */

import React, { useState } from 'react';
import { Plus, X, Type, FileText, Mail, Hash, Phone, Link as LinkIcon, Calendar, Clock, List, Upload, CheckSquare, ToggleLeft, Star } from 'lucide-react';
import { WorkflowNode } from '../../types';
import { useTheme } from '../../../../components/ThemeContext';

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  description: string;
  required: boolean;
  validation: any;
}

interface FormBuilderParametersProps {
  node: WorkflowNode;
  onSave: (config: any) => void;
}

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
  { type: 'checkbox', icon: CheckSquare, label: 'Checkbox', description: 'Single checkbox' },
  { type: 'toggle', icon: ToggleLeft, label: 'Toggle', description: 'Toggle switch' },
  { type: 'rating', icon: Star, label: 'Rating', description: 'Star rating input' },
  { type: 'file', icon: Upload, label: 'File Upload', description: 'File upload input' },
  { type: 'image', icon: Upload, label: 'Upload Image', description: 'Image upload input' },
];

export function FormBuilderParameters({ node, onSave }: FormBuilderParametersProps) {
  const { theme } = useTheme();
  const [fields, setFields] = useState<FormField[]>(node.config?.fields || []);
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [fieldTab, setFieldTab] = useState<FieldTab>('edit');

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgSecondary = theme === 'dark' ? 'bg-[#13131F]' : 'bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';

  const handleAddField = (fieldType: typeof AVAILABLE_FIELDS[0]) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: fieldType.type,
      label: fieldType.label,
      placeholder: `Enter ${fieldType.label.toLowerCase()}...`,
      description: '',
      required: false,
      validation: {},
    };
    const updatedFields = [...fields, newField];
    setFields(updatedFields);
    onSave({ ...node.config, fields: updatedFields });
    setShowFieldPicker(false);
  };

  const handleUpdateField = (updatedField: FormField) => {
    const updatedFields = fields.map(f => f.id === updatedField.id ? updatedField : f);
    setFields(updatedFields);
    onSave({ ...node.config, fields: updatedFields });
  };

  const handleDeleteField = (fieldId: string) => {
    const updatedFields = fields.filter(f => f.id !== fieldId);
    setFields(updatedFields);
    onSave({ ...node.config, fields: updatedFields });
  };

  const handleSaveAndClose = () => {
    if (editingField) {
      handleUpdateField(editingField);
    }
    setEditingField(null);
  };

  return (
    <div className="relative">
      {/* SCREEN 1: MAIN VIEW - EMPTY OR WITH FIELDS */}
      {!showFieldPicker && !editingField && (
        <div className="space-y-4">
          {/* Header with field count */}
          {fields.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <p className={`${textSecondary} text-sm`}>{fields.length} field{fields.length !== 1 ? 's' : ''} added</p>
            </div>
          )}

          {/* Empty State */}
          {fields.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className={`w-20 h-20 rounded-full ${theme === 'dark' ? 'bg-gradient-to-br from-[#00C6FF]/20 to-[#9D50BB]/20' : 'bg-gradient-to-br from-blue-100 to-purple-100'} flex items-center justify-center mb-6`}>
                <Plus className={`w-10 h-10 ${theme === 'dark' ? 'text-[#00C6FF]' : 'text-blue-500'}`} />
              </div>
              <h3 className={`${textPrimary} text-lg mb-2`}>No Fields Yet</h3>
              <p className={`${textSecondary} text-sm mb-8 text-center`}>
                Click "Add Field" to start building your form
              </p>
              <button
                onClick={() => setShowFieldPicker(true)}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:opacity-90 transition-all font-medium shadow-lg shadow-[#00C6FF]/30"
              >
                Add Field
              </button>
            </div>
          )}

          {/* Fields List */}
          {fields.length > 0 && (
            <>
              <div className="space-y-3">
                {fields.map((field) => {
                  const fieldType = AVAILABLE_FIELDS.find(f => f.type === field.type);
                  const Icon = fieldType?.icon || Type;
                  
                  return (
                    <div
                      key={field.id}
                      onClick={() => {
                        setEditingField(field);
                        setFieldTab('edit');
                      }}
                      className={`flex items-center gap-4 p-4 rounded-2xl bg-[#1E1E2E] border border-[#2E2E3E] hover:border-[#00C6FF]/50 transition-all cursor-pointer group`}
                    >
                      <div className="w-14 h-14 rounded-xl bg-[#2A2A4E] flex items-center justify-center flex-shrink-0 group-hover:bg-[#3A3A5E] transition-colors">
                        <Icon className="w-7 h-7 text-[#00C6FF]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium mb-1">{field.label}</div>
                        <div className="text-[#CFCFE8] text-sm">{field.placeholder}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteField(field.id);
                        }}
                        className="p-2 rounded-lg text-[#CFCFE8] hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add Field Button */}
              <button
                onClick={() => setShowFieldPicker(true)}
                className="w-full px-6 py-4 rounded-2xl border-2 border-dashed border-[#2A2A3E] text-[#CFCFE8] hover:border-[#00C6FF]/50 hover:text-[#00C6FF] hover:bg-[#00C6FF]/5 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add Field</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* SCREEN 2: FIELD PICKER MODAL */}
      {showFieldPicker && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`${theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50'} rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col`}>
            {/* Header */}
            <div className="p-6 border-b border-[#2A2A3E] flex items-center justify-between">
              <h3 className={`${textPrimary} text-xl font-medium`}>Select a field type to add to your form</h3>
              <button
                onClick={() => setShowFieldPicker(false)}
                className="p-2 rounded-lg text-[#CFCFE8] hover:bg-[#1A1A2E] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Field Options */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {AVAILABLE_FIELDS.map((fieldType) => {
                const Icon = fieldType.icon;
                return (
                  <button
                    key={fieldType.type}
                    onClick={() => handleAddField(fieldType)}
                    className="w-full flex items-center gap-6 p-6 rounded-2xl bg-[#1E1E2E] hover:bg-[#252535] border border-[#2E2E3E] hover:border-[#00C6FF]/50 transition-all text-left group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-[#2A2A4E] flex items-center justify-center flex-shrink-0 group-hover:bg-[#3A3A5E] transition-colors">
                      <Icon className="w-8 h-8 text-[#00C6FF]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-lg font-medium mb-1">{fieldType.label}</div>
                      <div className="text-[#CFCFE8] text-sm">{fieldType.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 3: FIELD PROPERTIES MODAL */}
      {editingField && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`${theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50'} rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col`}>
            {/* Header */}
            <div className="p-6 border-b border-[#2A2A3E] flex items-center justify-between">
              <h3 className={`${textPrimary} text-xl font-medium`}>Field Properties</h3>
              <button
                onClick={handleSaveAndClose}
                className="p-2 rounded-lg text-[#CFCFE8] hover:bg-[#1A1A2E] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-[#2A2A3E]">
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
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {fieldTab === 'edit' && (
                <>
                  {/* Label */}
                  <div>
                    <label className={`${textSecondary} text-sm mb-2 block`}>Label</label>
                    <input
                      type="text"
                      value={editingField.label}
                      onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF] focus:ring-1 focus:ring-[#00C6FF]/30`}
                    />
                  </div>

                  {/* Placeholder */}
                  <div>
                    <label className={`${textSecondary} text-sm mb-2 block`}>Placeholder</label>
                    <input
                      type="text"
                      value={editingField.placeholder}
                      onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF] focus:ring-1 focus:ring-[#00C6FF]/30`}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className={`${textSecondary} text-sm mb-2 block`}>Description</label>
                    <textarea
                      value={editingField.description}
                      onChange={(e) => setEditingField({ ...editingField, description: e.target.value })}
                      rows={4}
                      placeholder="Enter field description"
                      className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF] focus:ring-1 focus:ring-[#00C6FF]/30 resize-none`}
                    />
                  </div>

                  {/* Required Toggle */}
                  <div className="flex items-center justify-between">
                    <label className={`${textPrimary} text-sm`}>Required Field</label>
                    <button
                      onClick={() => setEditingField({ ...editingField, required: !editingField.required })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        editingField.required ? 'bg-[#00C6FF]' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          editingField.required ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </>
              )}

              {fieldTab === 'validations' && (
                <div className="text-center py-12">
                  <p className={`${textSecondary} mb-2`}>Validation options will be available in the next phase</p>
                  <p className={`${textMuted} text-sm`}>Configure field validation rules, min/max values, patterns, etc.</p>
                </div>
              )}

              {fieldTab === 'data' && (
                <div className="text-center py-12">
                  <p className={`${textSecondary} mb-2`}>Data options will be available in the next phase</p>
                  <p className={`${textMuted} text-sm`}>Configure data sources, default values, dynamic options, etc.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

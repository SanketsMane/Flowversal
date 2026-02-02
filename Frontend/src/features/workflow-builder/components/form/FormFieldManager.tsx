/**
 * Form Field Manager Component
 * Phase 3 Part 3 - Form Builder
 * Phase 4 Part 1 - Drag & Drop System
 * 
 * Main form field management component with drag & drop
 */

import { useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { FormField, FormFieldType } from '../../types';
import { DraggableFieldCard } from '../dnd/DraggableFieldCard';
import { DndDropZone } from '../dnd/DndDropZone';
import { FormPreview } from './FormPreview';
import { Button } from '@/shared/components/ui/button';
import { Plus, Eye, EyeOff, Download, Upload as UploadIcon, ArrowLeft } from 'lucide-react';
import { reorderArray } from '../../utils/dnd.utils';
import { useUIStore } from '../../stores';
import { FieldTypeSelector } from './FieldTypeSelector';

interface FormFieldManagerProps {
  fields: FormField[];
  onFieldsChange: (fields: FormField[]) => void;
  formTitle?: string;
  formDescription?: string;
}

export function FormFieldManager({ 
  fields, 
  onFieldsChange,
  formTitle,
  formDescription 
}: FormFieldManagerProps) {
  const { theme } = useTheme();
  const { openFieldProperties } = useUIStore();
  const [insertPosition, setInsertPosition] = useState<number>(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showFieldTypeSelector, setShowFieldTypeSelector] = useState(false);

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  // Generate unique ID
  const generateId = () => `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create new field from type
  const createField = (type: FormFieldType): FormField => {
    return {
      id: generateId(),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      placeholder: `Enter ${type}...`,
      description: '',
      required: false,
      options: ['radio', 'dropdown', 'select', 'checklist'].includes(type) 
        ? ['Option 1', 'Option 2', 'Option 3'] 
        : undefined,
    };
  };

  // Add field
  const handleAddField = (type: FormFieldType) => {
    const newField = createField(type);
    const newFields = [...fields];
    newFields.splice(insertPosition, 0, newField);
    onFieldsChange(newFields);
    
    // Auto-open properties for new field
    openFieldProperties(newField.id);
  };

  // Delete field
  const handleDeleteField = (fieldId: string) => {
    if (confirm('Are you sure you want to delete this field?')) {
      onFieldsChange(fields.filter(f => f.id !== fieldId));
    }
  };

  // Duplicate field
  const handleDuplicateField = (field: FormField) => {
    const newField = {
      ...field,
      id: generateId(),
      label: `${field.label} (Copy)`,
    };
    const fieldIndex = fields.findIndex(f => f.id === field.id);
    const newFields = [...fields];
    newFields.splice(fieldIndex + 1, 0, newField);
    onFieldsChange(newFields);
  };

  // Move field
  const handleMoveField = (fromIndex: number, toIndex: number) => {
    const newFields = reorderArray(fields, fromIndex, toIndex);
    onFieldsChange(newFields);
  };

  // Export form
  const handleExport = () => {
    const data = {
      title: formTitle,
      description: formDescription,
      fields: fields,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-${Date.now()}.json`;
    a.click();
  };

  // Import form
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (data.fields) {
              onFieldsChange(data.fields);
            }
          } catch (error) {
            alert('Invalid JSON file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="flex h-full gap-4">
      {/* Field List or Field Type Selector */}
      <div className={`flex-1 ${bgCard} border ${borderColor} rounded-xl p-6 flex flex-col`}>
        {!showFieldTypeSelector ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`${textPrimary} text-xl font-semibold`}>Form Fields</h3>
                <p className={`${textSecondary} text-sm`}>
                  {fields.length} field{fields.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className={`${textSecondary} border-${borderColor}`}
                >
                  {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleImport}
                  className={`${textSecondary} border-${borderColor}`}
                  title="Import form"
                >
                  <UploadIcon className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExport}
                  className={`${textSecondary} border-${borderColor}`}
                  title="Export form"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setInsertPosition(fields.length);
                    setShowFieldTypeSelector(true);
                  }}
                  className="bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Field
                </Button>
              </div>
            </div>

            {/* Field List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {fields.length > 0 ? (
                <>
                  {/* Drop zone before first field */}
                  <DndDropZone
                    acceptTypes={['FORM_FIELD']}
                    position={0}
                    onDrop={(item, position) => {
                      // Handle drop from drag
                    }}
                    onAdd={(pos) => {
                      setInsertPosition(pos);
                      setShowFieldTypeSelector(true);
                    }}
                    isFirst
                  />

                  {/* Fields */}
                  {fields.map((field, index) => (
                    <div key={field.id}>
                      <DraggableFieldCard
                        field={field}
                        index={index}
                        onEdit={() => openFieldProperties(field.id)}
                        onDelete={() => handleDeleteField(field.id)}
                        onDuplicate={() => handleDuplicateField(field)}
                        onReorder={handleMoveField}
                      />

                      {/* Drop zone after field */}
                      <DndDropZone
                        acceptTypes={['FORM_FIELD']}
                        position={index + 1}
                        onDrop={(item, position) => {
                          // Handle drop from drag
                        }}
                        onAdd={(pos) => {
                          setInsertPosition(pos);
                          setShowFieldTypeSelector(true);
                        }}
                        isLast={index === fields.length - 1}
                      />
                    </div>
                  ))}
                </>
              ) : (
                // Empty State
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center py-12">
                    <div className={`${textSecondary} text-6xl mb-4`}>📝</div>
                    <h4 className={`${textPrimary} font-semibold mb-2`}>No fields yet</h4>
                    <p className={`${textSecondary} text-sm mb-4`}>
                      Create your first form field to get started
                    </p>
                    <Button
                      onClick={() => {
                        setInsertPosition(0);
                        setShowFieldTypeSelector(true);
                      }}
                      className="bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] hover:opacity-90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Field
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Stats */}
            <div className={`mt-4 pt-4 border-t ${borderColor} flex justify-between items-center`}>
              <div className={`${textSecondary} text-sm`}>
                {fields.filter(f => f.required).length} required • 
                {fields.filter(f => f.hidden).length} hidden • 
                {fields.filter(f => f.validation && Object.keys(f.validation).length > 0).length} with validations
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Field Type Selector View */}
            <div className="flex items-center gap-3 mb-6">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowFieldTypeSelector(false)}
                className={`${textSecondary} hover:${textPrimary}`}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Fields
              </Button>
            </div>
            <FieldTypeSelector
              onSelect={(type) => {
                handleAddField(type);
                setShowFieldTypeSelector(false);
              }}
              onClose={() => setShowFieldTypeSelector(false)}
            />
          </>
        )}
      </div>

      {/* Right: Preview */}
      {showPreview && (
        <div className="w-[500px]">
          <FormPreview 
            fields={fields} 
            formTitle={formTitle}
            formDescription={formDescription}
          />
        </div>
      )}
    </div>
  );
}
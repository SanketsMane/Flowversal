import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ChevronDown, Plus, Settings } from 'lucide-react';
import React, { useState } from 'react';
import { FORM_FIELD_TYPES } from '../../../../data/formFieldTypes';
import { FormFieldPanelProps } from '../types/form-setup.types';
import { SortableField } from './SortableField';

export function FormFieldPanel({
  formFields,
  selectedFieldId,
  onFieldSelect,
  onFieldDelete,
  onFieldAdd,
  onFieldsReorder,
  theme,
}: FormFieldPanelProps) {
  const [isFieldPickerOpen, setIsFieldPickerOpen] = useState(true);

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgSecondary = theme === 'dark' ? 'bg-[#16213E]' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = formFields.findIndex(field => field.id === active.id);
      const newIndex = formFields.findIndex(field => field.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedFields = [...formFields];
        const [movedField] = reorderedFields.splice(oldIndex, 1);
        reorderedFields.splice(newIndex, 0, movedField);
        onFieldsReorder(reorderedFields);
      }
    }
  };

  return (
    <div className={`flex flex-col h-full ${bgCard}`}>
      {/* Header */}
      <div className={`${bgSecondary} px-4 py-3 border-b ${borderColor} flex items-center justify-between`}>
        <h3 className={`${textPrimary} font-medium`}>Form Fields</h3>
        <button
          onClick={() => setIsFieldPickerOpen(!isFieldPickerOpen)}
          className={`flex items-center gap-1 px-2 py-1 ${bgCard} border ${borderColor} rounded text-xs ${textSecondary} hover:${textPrimary} transition-colors`}
        >
          {isFieldPickerOpen ? (
            <>
              <ChevronDown className="w-3 h-3" />
              <span>Hide Field Options</span>
            </>
          ) : (
            <>
              <Plus className="w-3 h-3" />
              <span>Add Field</span>
            </>
          )}
        </button>
      </div>

      {/* Field List */}
      <div className="flex-1 overflow-y-auto">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={formFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
            <div className="p-3 space-y-2">
              {formFields.length === 0 ? (
                <div className={`text-center py-8 ${textSecondary}`}>
                  <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No form fields yet</p>
                  <p className="text-xs">Click "Add Field" to get started</p>
                </div>
              ) : (
                formFields.map((field, index) => (
                  <SortableField
                    key={field.id}
                    field={field}
                    index={index}
                    isSelected={field.id === selectedFieldId}
                    onSelect={() => onFieldSelect(field.id)}
                    onDelete={() => onFieldDelete(field.id)}
                    theme={theme}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Field Type Picker - Collapsible */}
      {isFieldPickerOpen && (
        <div className={`border-t ${borderColor} p-3 overflow-hidden flex-shrink-0 flex flex-col`} style={{ maxHeight: '50%' }}>
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <span className={`text-xs font-medium ${textSecondary}`}>ADD NEW FIELD</span>
            <button 
              onClick={() => setIsFieldPickerOpen(false)}
              className={`${textSecondary} hover:${textPrimary}`}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 flex-1" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: theme === 'dark' ? '#4B5563 transparent' : '#9CA3AF transparent'
          }}>
            {FORM_FIELD_TYPES.map(fieldType => (
              <button
                key={fieldType.type}
                onClick={() => onFieldAdd({
                  id: '',
                  type: fieldType.type,
                  label: fieldType.label,
                  required: false,
                  placeholder: '',
                  description: '',
                  config: {},
                })}
                className={`flex items-center gap-2 p-2 ${bgSecondary} border ${borderColor} rounded text-xs ${textSecondary} hover:${textPrimary} hover:border-[#00C6FF]/50 transition-colors w-full text-left`}
              >
                {React.createElement(fieldType.icon, { className: 'w-3 h-3 flex-shrink-0' })}
                <span className="truncate">{fieldType.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormField } from '../../../types/form.types';
import { FORM_FIELD_TYPES } from '../../../../data/formFieldTypes';
import { SortableFieldProps } from '../types/form-setup.types';

export function SortableField({ field, index, isSelected, onSelect, onDelete, theme }: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  const fieldIcon = FORM_FIELD_TYPES.find(t => t.type === field.type)?.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${bgCard} border ${isSelected ? 'border-[#00C6FF]' : borderColor} rounded-lg p-3
                  cursor-pointer hover:border-[#00C6FF]/50 transition-all`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className={`w-4 h-4 ${textSecondary}`} />
        </div>

        {/* Field Icon */}
        <div className="w-8 h-8 rounded bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 flex items-center justify-center">
          {fieldIcon && React.createElement(fieldIcon, { className: 'w-4 h-4 text-[#00C6FF]' })}
        </div>

        {/* Field Info */}
        <div className="flex-1">
          <p className={`${textPrimary} text-sm font-medium`}>{field.label || 'Untitled Field'}</p>
          <p className={`${textSecondary} text-xs`}>{field.type}</p>
        </div>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:bg-red-500/10 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </div>
  );
}

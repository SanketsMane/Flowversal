/**
 * Form Field Card Component
 * Phase 3 Part 3 - Form Builder
 * 
 * Individual field card with drag/edit/delete
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { FormField } from '../../types';
import { 
  GripVertical, Edit2, Trash2, Eye, EyeOff, Lock, 
  AlertCircle, Type, FileText, Mail, Hash, ToggleLeft, 
  Circle, ChevronDown, CheckSquare, Calendar, Clock, 
  Link2, Upload, Image as ImageIcon 
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface FormFieldCardProps {
  field: FormField;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const FIELD_ICONS: Record<string, React.ReactNode> = {
  text: <Type className="h-4 w-4" />,
  textarea: <FileText className="h-4 w-4" />,
  paragraph: <FileText className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  number: <Hash className="h-4 w-4" />,
  toggle: <ToggleLeft className="h-4 w-4" />,
  switch: <ToggleLeft className="h-4 w-4" />,
  radio: <Circle className="h-4 w-4" />,
  dropdown: <ChevronDown className="h-4 w-4" />,
  select: <ChevronDown className="h-4 w-4" />,
  checklist: <CheckSquare className="h-4 w-4" />,
  date: <Calendar className="h-4 w-4" />,
  time: <Clock className="h-4 w-4" />,
  url: <Link2 className="h-4 w-4" />,
  link: <Link2 className="h-4 w-4" />,
  file: <Upload className="h-4 w-4" />,
  upload: <Upload className="h-4 w-4" />,
  upload_file: <Upload className="h-4 w-4" />,
  image: <ImageIcon className="h-4 w-4" />,
  image_upload: <ImageIcon className="h-4 w-4" />,
};

export function FormFieldCard({ field, index, onEdit, onDelete, onDuplicate }: FormFieldCardProps) {
  const { theme } = useTheme();

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  // Get field icon
  const fieldIcon = FIELD_ICONS[field.type] || <Type className="h-4 w-4" />;

  // Count validations
  const validationCount = Object.keys(field.validation || {}).length + (field.required ? 1 : 0);

  // Has data mapping
  const hasDataMapping = !!(field.dataKey || field.variable);

  return (
    <div 
      className={`${bgCard} border ${borderColor} rounded-lg p-4 group hover:border-[#00C6FF]/50 transition-all`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div className="cursor-move pt-1">
          <GripVertical className={`${textSecondary} h-5 w-5`} />
        </div>

        {/* Field Icon & Type */}
        <div className={`${textSecondary} pt-1`}>
          {fieldIcon}
        </div>

        {/* Field Content */}
        <div className="flex-1 min-w-0">
          {/* Field Label & Index */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`${textSecondary} text-xs`}>#{index + 1}</span>
                <h4 className={`${textPrimary} font-medium truncate`}>
                  {field.label || 'Untitled Field'}
                </h4>
              </div>
            </div>

            {/* Actions (visible on hover) */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={onEdit}
                className="h-7 w-7 p-0 hover:bg-[#00C6FF]/10"
                title="Edit field"
              >
                <Edit2 className="h-3.5 w-3.5 text-[#00C6FF]" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDuplicate}
                className="h-7 w-7 p-0 hover:bg-[#9D50BB]/10"
                title="Duplicate field"
              >
                <FileText className="h-3.5 w-3.5 text-[#9D50BB]" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                className="h-7 w-7 p-0 hover:bg-red-500/10"
                title="Delete field"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </div>
          </div>

          {/* Field Type & Description */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`${textSecondary} text-xs px-2 py-0.5 bg-[#00C6FF]/10 rounded`}>
              {field.type}
            </span>
            {field.description && (
              <span className={`${textSecondary} text-xs truncate`}>
                {field.description}
              </span>
            )}
          </div>

          {/* Field Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Required */}
            {field.required && (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 rounded text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />
                <span>Required</span>
              </div>
            )}

            {/* Hidden */}
            {field.hidden && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-500/10 rounded text-xs text-gray-500">
                <EyeOff className="h-3 w-3" />
                <span>Hidden</span>
              </div>
            )}

            {/* Read Only */}
            {field.readOnly && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-500/10 rounded text-xs text-gray-500">
                <Lock className="h-3 w-3" />
                <span>Read Only</span>
              </div>
            )}

            {/* Has Validations */}
            {validationCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-[#00C6FF]/10 rounded text-xs text-[#00C6FF]">
                <AlertCircle className="h-3 w-3" />
                <span>{validationCount} validation{validationCount !== 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Has Data Mapping */}
            {hasDataMapping && (
              <div className="flex items-center gap-1 px-2 py-1 bg-[#9D50BB]/10 rounded text-xs text-[#9D50BB]">
                <span>📊 Mapped</span>
              </div>
            )}

            {/* Has Default Value */}
            {field.defaultValue !== undefined && field.defaultValue !== '' && (
              <div className={`px-2 py-1 bg-green-500/10 rounded text-xs text-green-500`}>
                Default: {String(field.defaultValue).substring(0, 20)}
                {String(field.defaultValue).length > 20 ? '...' : ''}
              </div>
            )}

            {/* Has Options */}
            {field.options && field.options.length > 0 && (
              <div className={`px-2 py-1 bg-[#00C6FF]/10 rounded text-xs text-[#00C6FF]`}>
                {field.options.length} option{field.options.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Data Key Preview */}
          {field.dataKey && (
            <div className={`${textSecondary} text-xs mt-2 font-mono`}>
              Key: {field.dataKey}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

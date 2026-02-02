/**
 * Field Type Selector Component
 * Phase 3 Part 3 - Form Builder
 * 
 * Beautiful grid/list selector for field types
 */

import { useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { FormFieldType } from '../../types';
import { Input } from '@/shared/components/ui/input';
import { 
  Type, FileText, Mail, Hash, ToggleLeft, Circle, 
  ChevronDown, CheckSquare, Calendar, Clock, Link2, 
  Upload, Image as ImageIcon, Search, X 
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface FieldTypeOption {
  type: FormFieldType;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: 'basic' | 'choice' | 'advanced';
}

interface FieldTypeSelectorProps {
  onSelect: (type: FormFieldType) => void;
  onClose: () => void;
}

const FIELD_TYPES: FieldTypeOption[] = [
  // Basic
  { type: 'text', label: 'Text', description: 'Single line text input', icon: <Type className="h-5 w-5" />, category: 'basic' },
  { type: 'textarea', label: 'Textarea', description: 'Multi-line text input', icon: <FileText className="h-5 w-5" />, category: 'basic' },
  { type: 'email', label: 'Email', description: 'Email address input', icon: <Mail className="h-5 w-5" />, category: 'basic' },
  { type: 'number', label: 'Number', description: 'Numeric input', icon: <Hash className="h-5 w-5" />, category: 'basic' },
  
  // Choice
  { type: 'toggle', label: 'Toggle', description: 'On/off switch', icon: <ToggleLeft className="h-5 w-5" />, category: 'choice' },
  { type: 'radio', label: 'Radio', description: 'Single choice from options', icon: <Circle className="h-5 w-5" />, category: 'choice' },
  { type: 'dropdown', label: 'Dropdown', description: 'Select from dropdown', icon: <ChevronDown className="h-5 w-5" />, category: 'choice' },
  { type: 'checklist', label: 'Checklist', description: 'Multiple choice', icon: <CheckSquare className="h-5 w-5" />, category: 'choice' },
  
  // Advanced
  { type: 'date', label: 'Date', description: 'Date picker', icon: <Calendar className="h-5 w-5" />, category: 'advanced' },
  { type: 'time', label: 'Time', description: 'Time picker', icon: <Clock className="h-5 w-5" />, category: 'advanced' },
  { type: 'url', label: 'URL', description: 'Website link', icon: <Link2 className="h-5 w-5" />, category: 'advanced' },
  { type: 'file', label: 'File Upload', description: 'File upload field', icon: <Upload className="h-5 w-5" />, category: 'advanced' },
  { type: 'image', label: 'Image Upload', description: 'Image upload field', icon: <ImageIcon className="h-5 w-5" />, category: 'advanced' },
];

export function FieldTypeSelector({ onSelect, onClose }: FieldTypeSelectorProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'basic' | 'choice' | 'advanced'>('all');

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgHover = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  // Filter field types
  const filteredTypes = FIELD_TYPES.filter(field => {
    const matchesSearch = field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         field.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || field.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All Fields', count: FIELD_TYPES.length },
    { id: 'basic', label: 'Basic', count: FIELD_TYPES.filter(f => f.category === 'basic').length },
    { id: 'choice', label: 'Choice', count: FIELD_TYPES.filter(f => f.category === 'choice').length },
    { id: 'advanced', label: 'Advanced', count: FIELD_TYPES.filter(f => f.category === 'advanced').length },
  ];

  return (
    <div 
      className={`${bgCard} border ${borderColor} rounded-xl p-6 max-w-2xl w-full`}
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`${textPrimary} text-xl font-semibold`}>Add Field</h3>
          <p className={`${textSecondary} text-sm mt-1`}>Choose a field type to add to your form</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="hover:bg-[#00C6FF]/10"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${textSecondary}`} />
        <Input
          placeholder="Search field types..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`pl-10 ${bgCard} border ${borderColor} ${textPrimary}`}
        />
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`px-4 py-2 rounded-lg border-2 transition-all ${
              selectedCategory === cat.id
                ? 'border-[#00C6FF] bg-[#00C6FF]/10 text-[#00C6FF]'
                : `border-${borderColor} ${textSecondary} ${bgHover}`
            }`}
          >
            {cat.label} ({cat.count})
          </button>
        ))}
      </div>

      {/* Field Type Grid */}
      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {filteredTypes.map((fieldType) => (
          <button
            key={fieldType.type}
            onClick={() => onSelect(fieldType.type)}
            className={`${bgCard} border-2 ${borderColor} rounded-lg p-4 text-left transition-all ${bgHover} hover:border-[#00C6FF] group`}
          >
            <div className="flex items-start gap-3">
              <div className={`${textSecondary} group-hover:text-[#00C6FF] transition-colors`}>
                {fieldType.icon}
              </div>
              <div className="flex-1">
                <h4 className={`${textPrimary} font-medium mb-1`}>{fieldType.label}</h4>
                <p className={`${textSecondary} text-sm`}>{fieldType.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* No Results */}
      {filteredTypes.length === 0 && (
        <div className="text-center py-12">
          <Search className={`${textSecondary} h-12 w-12 mx-auto mb-3 opacity-50`} />
          <p className={`${textPrimary} font-medium mb-1`}>No fields found</p>
          <p className={`${textSecondary} text-sm`}>Try a different search or category</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-[#2A2A3E] flex justify-between items-center">
        <p className={`${textSecondary} text-sm`}>
          {filteredTypes.length} field{filteredTypes.length !== 1 ? 's' : ''} available
        </p>
        <Button
          variant="outline"
          onClick={onClose}
          className={`${textSecondary} border-${borderColor}`}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
/**
 * Field Edit Tab Component
 * Phase 3 Part 2 - Enhanced Field Properties
 * 
 * Edit tab for field properties (label, placeholder, default value, etc.)
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { FormField } from '../../types';
import { Input } from '@/shared/components/ui/input';
import { Switch } from '@/shared/components/ui/switch';
import { FieldDefaultValueInput } from './FieldDefaultValueInput';
import { FieldOptionsManager } from './FieldOptionsManager';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface FieldEditTabProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
}

export function FieldEditTab({ field, onUpdate }: FieldEditTabProps) {
  const { theme } = useTheme();

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  // Check if field type supports options
  const hasOptions = ['radio', 'dropdown', 'select', 'checklist'].includes(field.type);

  return (
    <div className="space-y-4">
      {/* Label */}
      <div>
        <label className={`${textSecondary} text-sm mb-2 block`}>Label</label>
        <Input
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Field label"
          className={`${bgInput} border ${borderColor} ${textPrimary}`}
        />
      </div>

      {/* Placeholder */}
      {!['toggle', 'switch', 'radio', 'checklist'].includes(field.type) && (
        <div>
          <label className={`${textSecondary} text-sm mb-2 block`}>Placeholder</label>
          <Input
            value={field.placeholder || ''}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            placeholder="Placeholder text"
            className={`${bgInput} border ${borderColor} ${textPrimary}`}
          />
        </div>
      )}

      {/* Description */}
      <div>
        <label className={`${textSecondary} text-sm mb-2 block`}>Description</label>
        <textarea
          value={field.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Help text for this field"
          rows={2}
          className={`w-full px-3 py-2 ${bgInput} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:border-[#00C6FF]`}
        />
      </div>

      {/* Options Manager (for radio, dropdown, checklist) */}
      {hasOptions && (
        <FieldOptionsManager
          options={field.options || []}
          onChange={(options) => onUpdate({ options })}
        />
      )}

      {/* Default Value */}
      <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
        <FieldDefaultValueInput
          field={field}
          onChange={(defaultValue) => onUpdate({ defaultValue, toggleDefault: defaultValue })}
        />
      </div>

      {/* Prefix & Suffix Prompts */}
      <div className={`${bgCard} border ${borderColor} rounded-lg p-4 space-y-3`}>
        <h4 className={`${textPrimary} font-medium`}>Prefix & Suffix</h4>
        
        <div>
          <label className={`${textSecondary} text-sm mb-2 block`}>Prefix</label>
          <Input
            value={field.prefix || ''}
            onChange={(e) => onUpdate({ prefix: e.target.value })}
            placeholder="Text before the value"
            className={`${bgInput} border ${borderColor} ${textPrimary}`}
          />
        </div>

        <div>
          <label className={`${textSecondary} text-sm mb-2 block`}>Prefix Prompt</label>
          <Input
            value={field.prefixPrompt || ''}
            onChange={(e) => onUpdate({ prefixPrompt: e.target.value })}
            placeholder="AI prompt for prefix"
            className={`${bgInput} border ${borderColor} ${textPrimary}`}
          />
        </div>

        <div>
          <label className={`${textSecondary} text-sm mb-2 block`}>Suffix</label>
          <Input
            value={field.suffix || ''}
            onChange={(e) => onUpdate({ suffix: e.target.value })}
            placeholder="Text after the value"
            className={`${bgInput} border ${borderColor} ${textPrimary}`}
          />
        </div>

        <div>
          <label className={`${textSecondary} text-sm mb-2 block`}>Suffix Prompt</label>
          <Input
            value={field.suffixPrompt || ''}
            onChange={(e) => onUpdate({ suffixPrompt: e.target.value })}
            placeholder="AI prompt for suffix"
            className={`${bgInput} border ${borderColor} ${textPrimary}`}
          />
        </div>
      </div>

      {/* Visibility & State Controls */}
      <div className={`${bgCard} border ${borderColor} rounded-lg p-4 space-y-4`}>
        <h4 className={`${textPrimary} font-medium mb-3`}>Visibility & State</h4>

        {/* Required */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`${textPrimary}`}>Required</span>
            <span className={`${textSecondary} text-xs`}>User must fill this field</span>
          </div>
          <Switch
            checked={field.required || false}
            onCheckedChange={(required) => onUpdate({ required })}
          />
        </div>

        {/* Hidden */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className={`${textSecondary} h-4 w-4`} />
            <span className={`${textPrimary}`}>Hidden</span>
            <span className={`${textSecondary} text-xs`}>Hide from form</span>
          </div>
          <Switch
            checked={field.hidden || false}
            onCheckedChange={(hidden) => onUpdate({ hidden })}
          />
        </div>

        {/* Read Only */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className={`${textSecondary} h-4 w-4`} />
            <span className={`${textPrimary}`}>Read Only</span>
            <span className={`${textSecondary} text-xs`}>Cannot be edited</span>
          </div>
          <Switch
            checked={field.readOnly || false}
            onCheckedChange={(readOnly) => onUpdate({ readOnly })}
          />
        </div>

        {/* Show in Advanced */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`${textPrimary}`}>Advanced Field</span>
            <span className={`${textSecondary} text-xs`}>Show in advanced section</span>
          </div>
          <Switch
            checked={field.showInAdvanced || false}
            onCheckedChange={(showInAdvanced) => onUpdate({ showInAdvanced })}
          />
        </div>
      </div>

      {/* Link Configuration (for URL type) */}
      {(field.type === 'url' || field.type === 'link') && (
        <div className={`${bgCard} border ${borderColor} rounded-lg p-4 space-y-3`}>
          <h4 className={`${textPrimary} font-medium`}>Link Settings</h4>
          
          <div>
            <label className={`${textSecondary} text-sm mb-2 block`}>Link Text</label>
            <Input
              value={field.linkName || ''}
              onChange={(e) => onUpdate({ linkName: e.target.value })}
              placeholder="Click here"
              className={`${bgInput} border ${borderColor} ${textPrimary}`}
            />
          </div>

          <div>
            <label className={`${textSecondary} text-sm mb-2 block`}>Link URL</label>
            <Input
              value={field.linkUrl || ''}
              onChange={(e) => onUpdate({ linkUrl: e.target.value })}
              placeholder="https://example.com"
              className={`${bgInput} border ${borderColor} ${textPrimary}`}
            />
          </div>
        </div>
      )}

      {/* Word Limits (for text/textarea) */}
      {['text', 'textarea', 'paragraph'].includes(field.type) && (
        <div className={`${bgCard} border ${borderColor} rounded-lg p-4 space-y-3`}>
          <h4 className={`${textPrimary} font-medium`}>Word Limits</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`${textSecondary} text-sm mb-2 block`}>Min Words</label>
              <Input
                type="number"
                value={field.minWords || ''}
                onChange={(e) => onUpdate({ minWords: parseInt(e.target.value) || undefined })}
                placeholder="0"
                className={`${bgInput} border ${borderColor} ${textPrimary}`}
              />
            </div>

            <div>
              <label className={`${textSecondary} text-sm mb-2 block`}>Max Words</label>
              <Input
                type="number"
                value={field.maxWords || ''}
                onChange={(e) => onUpdate({ maxWords: parseInt(e.target.value) || undefined })}
                placeholder="Unlimited"
                className={`${bgInput} border ${borderColor} ${textPrimary}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

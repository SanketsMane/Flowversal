/**
 * Field Default Value Input Component
 * Phase 3 Part 2 - Enhanced Field Properties
 * 
 * Field-type-specific default value UI
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { FormField } from '../../types';
import { Switch } from '@/shared/components/ui/switch';
import { Input } from '@/shared/components/ui/input';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Button } from '@/shared/components/ui/button';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface FieldDefaultValueInputProps {
  field: FormField;
  onChange: (value: any) => void;
}

export function FieldDefaultValueInput({ field, onChange }: FieldDefaultValueInputProps) {
  const { theme } = useTheme();
  const [date, setDate] = useState<Date | undefined>(
    field.defaultValue ? new Date(field.defaultValue as string) : undefined
  );

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  // Toggle (Switch) - true/false
  if (field.type === 'toggle' || field.type === 'switch') {
    return (
      <div className="flex items-center justify-between">
        <label className={`${textSecondary}`}>Default State</label>
        <Switch
          checked={field.toggleDefault || false}
          onCheckedChange={(checked) => onChange(checked)}
        />
      </div>
    );
  }

  // Radio, Dropdown, Checklist - Select from options
  if (field.type === 'radio' || field.type === 'dropdown' || field.type === 'select' || field.type === 'checklist') {
    if (!field.options || field.options.length === 0) {
      return (
        <div className={`${textSecondary} text-sm italic`}>
          Add options first to set a default value
        </div>
      );
    }

    return (
      <div>
        <label className={`${textSecondary} text-sm mb-2 block`}>Default Value</label>
        <select
          value={field.defaultValue as string || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2 ${bgInput} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:border-[#00C6FF]`}
        >
          <option value="">No default</option>
          {field.options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Date Picker
  if (field.type === 'date') {
    return (
      <div>
        <label className={`${textSecondary} text-sm mb-2 block`}>Default Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-start ${textPrimary} ${bgInput} border ${borderColor} hover:bg-[#1A1A2E]`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className={`w-auto p-0 ${bgInput} border ${borderColor}`}>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate);
                onChange(newDate ? newDate.toISOString() : '');
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Time Picker
  if (field.type === 'time') {
    return (
      <div>
        <label className={`${textSecondary} text-sm mb-2 block`}>Default Time</label>
        <div className="flex items-center gap-2">
          <Clock className={`${textSecondary} h-4 w-4`} />
          <Input
            type="time"
            value={field.defaultValue as string || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`flex-1 ${bgInput} border ${borderColor} ${textPrimary}`}
          />
        </div>
      </div>
    );
  }

  // URL Input
  if (field.type === 'url' || field.type === 'link') {
    return (
      <div>
        <label className={`${textSecondary} text-sm mb-2 block`}>Default URL</label>
        <Input
          type="url"
          placeholder="https://example.com"
          value={field.defaultValue as string || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`${bgInput} border ${borderColor} ${textPrimary}`}
        />
      </div>
    );
  }

  // File Upload - URL input for default
  if (field.type === 'file' || field.type === 'upload') {
    return (
      <div>
        <label className={`${textSecondary} text-sm mb-2 block`}>Default File URL</label>
        <Input
          type="url"
          placeholder="https://example.com/file.pdf"
          value={field.defaultValue as string || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`${bgInput} border ${borderColor} ${textPrimary}`}
        />
        <p className={`${textSecondary} text-xs mt-1`}>
          Enter a URL to a file to use as default
        </p>
      </div>
    );
  }

  // Image Upload - URL input for default
  if (field.type === 'image') {
    return (
      <div>
        <label className={`${textSecondary} text-sm mb-2 block`}>Default Image URL</label>
        <Input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={field.defaultValue as string || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`${bgInput} border ${borderColor} ${textPrimary}`}
        />
        <p className={`${textSecondary} text-xs mt-1`}>
          Enter a URL to an image to use as default
        </p>
      </div>
    );
  }

  // Number Input
  if (field.type === 'number') {
    return (
      <div>
        <label className={`${textSecondary} text-sm mb-2 block`}>Default Value</label>
        <Input
          type="number"
          placeholder="0"
          value={field.defaultValue as string || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`${bgInput} border ${borderColor} ${textPrimary}`}
        />
      </div>
    );
  }

  // Textarea
  if (field.type === 'textarea' || field.type === 'paragraph') {
    return (
      <div>
        <label className={`${textSecondary} text-sm mb-2 block`}>Default Value</label>
        <textarea
          placeholder="Enter default text..."
          value={field.defaultValue as string || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 ${bgInput} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:border-[#00C6FF]`}
        />
      </div>
    );
  }

  // Default: Text Input
  return (
    <div>
      <label className={`${textSecondary} text-sm mb-2 block`}>Default Value</label>
      <Input
        type="text"
        placeholder="Enter default value..."
        value={field.defaultValue as string || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`${bgInput} border ${borderColor} ${textPrimary}`}
      />
    </div>
  );
}

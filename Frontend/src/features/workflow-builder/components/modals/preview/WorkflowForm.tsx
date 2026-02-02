/**
 * Workflow Form Component
 * Renders dynamic form based on form fields with dynamic options support
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { FormField } from '../../../types';
import { Play, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface WorkflowFormProps {
  fields: FormField[];
  formData: Record<string, any>;
  onFormDataChange: (data: Record<string, any>) => void;
  executionState: 'idle' | 'running' | 'success' | 'error';
  onExecute?: () => void;
  validationErrors?: string[];
}

export function WorkflowForm({ fields, formData, onFormDataChange, executionState, onExecute, validationErrors = [] }: WorkflowFormProps) {
  const { theme } = useTheme();
  
  const bgInput = theme === 'dark' ? 'bg-[#13131F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  const handleChange = (fieldId: string, value: any) => {
    onFormDataChange({
      ...formData,
      [fieldId]: value
    });
  };

  const handleCheckboxGroupChange = (fieldId: string, option: string, checked: boolean) => {
    const currentValues = formData[fieldId] || [];
    let newValues;
    
    if (checked) {
      newValues = [...currentValues, option];
    } else {
      newValues = currentValues.filter((v: string) => v !== option);
    }
    
    onFormDataChange({
      ...formData,
      [fieldId]: newValues
    });
  };

  // Helper function to get options with custom default value added if needed
  const getOptionsWithCustomValue = (field: FormField) => {
    const options = field.options || [];
    const value = formData[field.id] !== undefined ? formData[field.id] : field.defaultValue;
    
    // If there's no value or value is empty, return original options
    if (!value || value === '') {
      return options;
    }
    
    // For checkbox groups, value could be an array
    if (Array.isArray(value)) {
      const newOptions = [...options];
      value.forEach(val => {
        const valueExists = options.some(option => {
          const optionValue = typeof option === 'string' ? option : option.value;
          return optionValue === val;
        });
        
        if (!valueExists && val !== '') {
          newOptions.push({ label: `${val} (Custom)`, value: val });
        }
      });
      return newOptions;
    }
    
    // For single value fields (dropdown, select, radio)
    const valueExists = options.some(option => {
      const optionValue = typeof option === 'string' ? option : option.value;
      return optionValue === value;
    });
    
    // If value doesn't exist in options and is not empty, add it as a custom option
    if (!valueExists && value !== '') {
      return [...options, { label: `${value} (Custom)`, value: value }];
    }
    
    return options;
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] !== undefined ? formData[field.id] : (field.defaultValue || '');

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'phone':
      case 'url':
      case 'tel':
        return (
          <input
            type={field.type === 'phone' ? 'tel' : field.type}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={executionState === 'running' || executionState === 'success'}
            className={`w-full px-4 py-2.5 ${bgInput} border ${borderColor} rounded-lg ${textPrimary} 
                       placeholder:${textSecondary} focus:outline-none focus:border-[#00C6FF] transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={executionState === 'running' || executionState === 'success'}
            rows={4}
            className={`w-full px-4 py-2.5 ${bgInput} border ${borderColor} rounded-lg ${textPrimary} 
                       placeholder:${textSecondary} focus:outline-none focus:border-[#00C6FF] transition-colors
                       resize-none disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        );

      case 'select':
      case 'dropdown':
        return (
          <select
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            required={field.required}
            disabled={executionState === 'running' || executionState === 'success'}
            className={`w-full px-4 py-2.5 ${bgInput} border ${borderColor} rounded-lg ${textPrimary} 
                       focus:outline-none focus:border-[#00C6FF] transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="">Select...</option>
            {/* Support both string array and object array */}
            {getOptionsWithCustomValue(field).map((option, index) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              return (
                <option key={index} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
        );

      case 'checkbox':
        // Multiple checkboxes with options
        if (field.options && field.options.length > 0) {
          // Get selected values from formData, fallback to default value
          let selectedValues = formData[field.id];
          
          // If selectedValues is undefined or null, use default value
          if (selectedValues === undefined || selectedValues === null) {
            if (field.defaultValue !== undefined && field.defaultValue !== null && field.defaultValue !== '') {
              // Handle default value as string or array
              if (typeof field.defaultValue === 'string') {
                selectedValues = field.defaultValue.includes(',')
                  ? field.defaultValue.split(',').map(v => v.trim())
                  : [field.defaultValue];
              } else if (Array.isArray(field.defaultValue)) {
                selectedValues = field.defaultValue;
              } else {
                selectedValues = [field.defaultValue];
              }
            } else {
              selectedValues = [];
            }
          }
          
          // Ensure selectedValues is always an array
          if (!Array.isArray(selectedValues)) {
            selectedValues = [selectedValues];
          }
          
          const optionsWithCustom = getOptionsWithCustomValue(field);
          
          return (
            <div className="space-y-3">
              {optionsWithCustom.map((option, index) => {
                const optionValue = typeof option === 'string' ? option : option.value;
                const optionLabel = typeof option === 'string' ? option : option.label;
                const isChecked = selectedValues.includes(optionValue);
                
                return (
                  <label key={index} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleCheckboxGroupChange(field.id, optionValue, e.target.checked)}
                      disabled={executionState === 'running' || executionState === 'success'}
                      className="w-5 h-5 rounded border-gray-600 text-[#00C6FF] focus:ring-[#00C6FF] 
                                disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className={`${textSecondary} group-hover:${textPrimary} transition-colors`}>
                      {optionLabel}
                    </span>
                  </label>
                );
              })}
            </div>
          );
        }
        
        // Single checkbox (toggle)
        return (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleChange(field.id, e.target.checked)}
              disabled={executionState === 'running' || executionState === 'success'}
              className="w-5 h-5 rounded border-gray-600 text-[#00C6FF] focus:ring-[#00C6FF] 
                        disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className={textSecondary}>{field.label}</span>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {getOptionsWithCustomValue(field).map((option, index) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              
              return (
                <label key={index} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name={field.id}
                    value={optionValue}
                    checked={value === optionValue}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    disabled={executionState === 'running' || executionState === 'success'}
                    className="w-5 h-5 text-[#00C6FF] focus:ring-[#00C6FF] 
                              disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className={`${textSecondary} group-hover:${textPrimary} transition-colors`}>
                    {optionLabel}
                  </span>
                </label>
              );
            })}
          </div>
        );

      case 'date':
      case 'time':
      case 'datetime':
        return (
          <input
            type={field.type === 'datetime' ? 'datetime-local' : field.type}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            required={field.required}
            disabled={executionState === 'running' || executionState === 'success'}
            className={`w-full px-4 py-2.5 ${bgInput} border ${borderColor} rounded-lg ${textPrimary} 
                       focus:outline-none focus:border-[#00C6FF] transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        );

      case 'toggle':
        return (
          <button
            type="button"
            onClick={() => handleChange(field.id, !value)}
            disabled={executionState === 'running' || executionState === 'success'}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? 'bg-[#00C6FF]' : 'bg-gray-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        );

      case 'rating':
        return (
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleChange(field.id, rating)}
                disabled={executionState === 'running' || executionState === 'success'}
                className="transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className={`w-8 h-8 ${
                    rating <= (value || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
            ))}
            {value && <span className={`${textSecondary} text-sm ml-2`}>{value}/5</span>}
          </div>
        );

      case 'file':
      case 'image':
        return (
          <div>
            <input
              type="file"
              accept={field.type === 'image' ? 'image/*' : undefined}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleChange(field.id, file.name);
                }
              }}
              disabled={executionState === 'running' || executionState === 'success'}
              className={`w-full px-4 py-2.5 ${bgInput} border ${borderColor} rounded-lg ${textPrimary} 
                         focus:outline-none focus:border-[#00C6FF] transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4
                         file:rounded-lg file:border-0 file:text-sm file:font-medium
                         file:bg-gradient-to-r file:from-[#00C6FF] file:to-[#9D50BB] file:text-white
                         file:cursor-pointer hover:file:opacity-90`}
            />
            {value && (
              <p className={`${textSecondary} text-sm mt-2`}>Selected: {value}</p>
            )}
          </div>
        );

      default:
        return (
          <div className={`${textSecondary} text-sm`}>
            Unsupported field type: {field.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {fields.map((field) => (
        <div key={field.id}>
          {/* Show label for all field types except single checkbox (not checkbox group) and toggle */}
          {!(field.type === 'checkbox' && (!field.options || field.options.length === 0)) && field.type !== 'toggle' && (
            <label className={`block ${textPrimary} text-sm font-medium mb-2`}>
              {field.label}
              {field.required && (
                <span className="text-red-400 ml-1">*</span>
              )}
            </label>
          )}
          {field.type === 'toggle' && (
            <div className="flex items-center gap-3 mb-2">
              <label className={`${textPrimary} text-sm font-medium`}>
                {field.label}
                {field.required && (
                  <span className="text-red-400 ml-1">*</span>
                )}
              </label>
            </div>
          )}
          {renderField(field)}
          {field.description && (
            <p className={`${textSecondary} text-xs mt-1.5`}>{field.description}</p>
          )}
        </div>
      ))}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-red-500 font-medium mb-2">Please fix the following errors:</h4>
              <ul className="space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-red-400 text-sm">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Execute Button - shown when onExecute is provided (single form mode) */}
      {onExecute && executionState !== 'success' && (
        <div className="pt-4 border-t border-[#2A2A3E]">
          <button
            onClick={onExecute}
            disabled={executionState === 'running'}
            className={`w-full px-6 py-2.5 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 ${
              executionState === 'running'
                ? 'bg-yellow-500/50 cursor-not-allowed'
                : executionState === 'success'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] hover:opacity-90'
            }`}
          >
            {executionState === 'running' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Executing...
              </>
            ) : executionState === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Executed
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Execute
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
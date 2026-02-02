/**
 * Form Preview Component
 * Phase 3 Part 3 - Form Builder
 * 
 * Live preview of the form
 */

import { useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { FormField } from '../../types';
import { Input } from '@/shared/components/ui/input';
import { Switch } from '@/shared/components/ui/switch';
import { Button } from '@/shared/components/ui/button';
import { AlertCircle, Eye, Code, Smartphone, Monitor } from 'lucide-react';

interface FormPreviewProps {
  fields: FormField[];
  formTitle?: string;
  formDescription?: string;
}

export function FormPreview({ fields, formTitle, formDescription }: FormPreviewProps) {
  const { theme } = useTheme();
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showCode, setShowCode] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  // Filter visible fields
  const visibleFields = fields.filter(f => !f.hidden);

  // Render field based on type
  const renderField = (field: FormField) => {
    const value = formValues[field.id] || field.defaultValue || '';

    switch (field.type) {
      case 'toggle':
      case 'switch':
        return (
          <div className="flex items-center justify-between">
            <label className={textPrimary}>{field.label}</label>
            <Switch
              checked={value || field.toggleDefault || false}
              onCheckedChange={(checked) => setFormValues({ ...formValues, [field.id]: checked })}
            />
          </div>
        );

      case 'radio':
        return (
          <div>
            <label className={`${textPrimary} block mb-2`}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {(field.options || []).map((option, idx) => (
                <label key={idx} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
                    className="accent-[#00C6FF]"
                  />
                  <span className={textSecondary}>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'dropdown':
      case 'select':
        return (
          <div>
            <label className={`${textPrimary} block mb-2`}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
              className={`w-full px-3 py-2 ${bgInput} border ${borderColor} rounded-lg ${textPrimary}`}
            >
              <option value="">Select an option</option>
              {(field.options || []).map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );

      case 'checklist':
        return (
          <div>
            <label className={`${textPrimary} block mb-2`}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {(field.options || []).map((option, idx) => (
                <label key={idx} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={option}
                    className="accent-[#00C6FF]"
                  />
                  <span className={textSecondary}>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'textarea':
      case 'paragraph':
        return (
          <div>
            <label className={`${textPrimary} block mb-2`}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
              rows={4}
              readOnly={field.readOnly}
              className={`w-full px-3 py-2 ${bgInput} border ${borderColor} rounded-lg ${textPrimary} ${
                field.readOnly ? 'cursor-not-allowed opacity-60' : ''
              }`}
            />
            {field.description && (
              <p className={`${textSecondary} text-sm mt-1`}>{field.description}</p>
            )}
          </div>
        );

      case 'date':
        return (
          <div>
            <label className={`${textPrimary} block mb-2`}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type="date"
              value={value}
              onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
              readOnly={field.readOnly}
              className={`${bgInput} border ${borderColor} ${textPrimary}`}
            />
            {field.description && (
              <p className={`${textSecondary} text-sm mt-1`}>{field.description}</p>
            )}
          </div>
        );

      case 'time':
        return (
          <div>
            <label className={`${textPrimary} block mb-2`}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type="time"
              value={value}
              onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
              readOnly={field.readOnly}
              className={`${bgInput} border ${borderColor} ${textPrimary}`}
            />
            {field.description && (
              <p className={`${textSecondary} text-sm mt-1`}>{field.description}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div>
            <label className={`${textPrimary} block mb-2`}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type="number"
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
              readOnly={field.readOnly}
              min={field.validation?.min}
              max={field.validation?.max}
              className={`${bgInput} border ${borderColor} ${textPrimary}`}
            />
            {field.description && (
              <p className={`${textSecondary} text-sm mt-1`}>{field.description}</p>
            )}
          </div>
        );

      default:
        return (
          <div>
            <label className={`${textPrimary} block mb-2`}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
              readOnly={field.readOnly}
              className={`${bgInput} border ${borderColor} ${textPrimary} ${
                field.readOnly ? 'cursor-not-allowed opacity-60' : ''
              }`}
            />
            {field.description && (
              <p className={`${textSecondary} text-sm mt-1`}>{field.description}</p>
            )}
          </div>
        );
    }
  };

  // Generate code preview
  const generateCode = () => {
    return `<form>\n${visibleFields.map(field => {
      return `  <div>\n    <label>${field.label}${field.required ? ' *' : ''}</label>\n    <input type="${field.type}" ${field.placeholder ? `placeholder="${field.placeholder}"` : ''} />\n  </div>`;
    }).join('\n')}\n  <button type="submit">Submit</button>\n</form>`;
  };

  return (
    <div className={`${bgCard} border ${borderColor} rounded-xl p-6 h-full flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Eye className={`${textSecondary} h-5 w-5`} />
          <h3 className={`${textPrimary} font-semibold`}>Form Preview</h3>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode('desktop')}
            className={`p-2 rounded ${
              previewMode === 'desktop' 
                ? 'bg-[#00C6FF]/10 text-[#00C6FF]' 
                : textSecondary
            }`}
            title="Desktop view"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`p-2 rounded ${
              previewMode === 'mobile' 
                ? 'bg-[#00C6FF]/10 text-[#00C6FF]' 
                : textSecondary
            }`}
            title="Mobile view"
          >
            <Smartphone className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowCode(!showCode)}
            className={`p-2 rounded ${
              showCode 
                ? 'bg-[#00C6FF]/10 text-[#00C6FF]' 
                : textSecondary
            }`}
            title="View code"
          >
            <Code className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto">
        {showCode ? (
          // Code View
          <pre className={`${bgInput} border ${borderColor} rounded-lg p-4 text-sm font-mono ${textPrimary} overflow-x-auto`}>
            {generateCode()}
          </pre>
        ) : (
          // Form Preview
          <div className={`mx-auto ${previewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl'}`}>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Form Header */}
              {(formTitle || formDescription) && (
                <div className="mb-6">
                  {formTitle && (
                    <h2 className={`${textPrimary} text-2xl font-semibold mb-2`}>
                      {formTitle}
                    </h2>
                  )}
                  {formDescription && (
                    <p className={textSecondary}>{formDescription}</p>
                  )}
                </div>
              )}

              {/* Fields */}
              {visibleFields.length > 0 ? (
                <>
                  {visibleFields.map((field) => (
                    <div key={field.id}>
                      {renderField(field)}
                    </div>
                  ))}

                  {/* Submit Button */}
                  <Button className="w-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] hover:opacity-90">
                    Submit
                  </Button>
                </>
              ) : (
                // Empty State
                <div className="text-center py-12">
                  <AlertCircle className={`${textSecondary} h-12 w-12 mx-auto mb-3 opacity-50`} />
                  <p className={`${textPrimary} font-medium mb-1`}>No fields yet</p>
                  <p className={`${textSecondary} text-sm`}>Add fields to see them in the preview</p>
                </div>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className={`mt-6 pt-4 border-t ${borderColor} flex justify-between items-center`}>
        <div className={`${textSecondary} text-sm`}>
          {visibleFields.length} field{visibleFields.length !== 1 ? 's' : ''} • 
          {fields.filter(f => f.required).length} required
        </div>
        <div className={`${textSecondary} text-xs`}>
          {previewMode === 'mobile' ? '📱' : '💻'} {previewMode}
        </div>
      </div>
    </div>
  );
}

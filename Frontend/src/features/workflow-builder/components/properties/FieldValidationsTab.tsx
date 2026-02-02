/**
 * Field Validations Tab Component
 * Phase 3 Part 2 - Enhanced Field Properties
 * 
 * Validation rules for form fields
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { FormField } from '../../types';
import { Input } from '@/shared/components/ui/input';
import { Switch } from '@/shared/components/ui/switch';
import { AlertCircle, Check, X } from 'lucide-react';
import { useState } from 'react';

interface FieldValidationsTabProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
}

export function FieldValidationsTab({ field, onUpdate }: FieldValidationsTabProps) {
  const { theme } = useTheme();
  const [testValue, setTestValue] = useState('');

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  // Get validation rules from field
  const validation = field.validation || {};

  const updateValidation = (updates: Record<string, any>) => {
    onUpdate({
      validation: {
        ...validation,
        ...updates,
      },
    });
  };

  // Test pattern validation
  const testPattern = () => {
    if (!validation.pattern || !testValue) return null;
    try {
      const regex = new RegExp(validation.pattern);
      return regex.test(testValue);
    } catch (e) {
      return null;
    }
  };

  const patternTestResult = testPattern();

  return (
    <div className="space-y-4">
      {/* Required Field */}
      <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className={`${textPrimary} font-medium`}>Required Field</h4>
            <p className={`${textSecondary} text-sm`}>User must provide a value</p>
          </div>
          <Switch
            checked={field.required || false}
            onCheckedChange={(required) => onUpdate({ required })}
          />
        </div>

        {field.required && (
          <div>
            <label className={`${textSecondary} text-sm mb-2 block`}>Error Message</label>
            <Input
              value={validation.requiredMessage || ''}
              onChange={(e) => updateValidation({ requiredMessage: e.target.value })}
              placeholder="This field is required"
              className={`${bgInput} border ${borderColor} ${textPrimary}`}
            />
          </div>
        )}
      </div>

      {/* Min/Max Length (for text fields) */}
      {['text', 'textarea', 'paragraph', 'email', 'url'].includes(field.type) && (
        <div className={`${bgCard} border ${borderColor} rounded-lg p-4 space-y-3`}>
          <h4 className={`${textPrimary} font-medium mb-3`}>Length Validation</h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`${textSecondary} text-sm mb-2 block`}>Min Length</label>
              <Input
                type="number"
                value={validation.minLength || ''}
                onChange={(e) => updateValidation({ minLength: parseInt(e.target.value) || undefined })}
                placeholder="0"
                className={`${bgInput} border ${borderColor} ${textPrimary}`}
              />
            </div>

            <div>
              <label className={`${textSecondary} text-sm mb-2 block`}>Max Length</label>
              <Input
                type="number"
                value={validation.maxLength || ''}
                onChange={(e) => updateValidation({ maxLength: parseInt(e.target.value) || undefined })}
                placeholder="Unlimited"
                className={`${bgInput} border ${borderColor} ${textPrimary}`}
              />
            </div>
          </div>

          <div>
            <label className={`${textSecondary} text-sm mb-2 block`}>Error Message</label>
            <Input
              value={validation.lengthMessage || ''}
              onChange={(e) => updateValidation({ lengthMessage: e.target.value })}
              placeholder="Must be between {min} and {max} characters"
              className={`${bgInput} border ${borderColor} ${textPrimary}`}
            />
          </div>
        </div>
      )}

      {/* Min/Max Value (for number fields) */}
      {field.type === 'number' && (
        <div className={`${bgCard} border ${borderColor} rounded-lg p-4 space-y-3`}>
          <h4 className={`${textPrimary} font-medium mb-3`}>Value Range</h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`${textSecondary} text-sm mb-2 block`}>Min Value</label>
              <Input
                type="number"
                value={validation.min || ''}
                onChange={(e) => updateValidation({ min: parseFloat(e.target.value) || undefined })}
                placeholder="No minimum"
                className={`${bgInput} border ${borderColor} ${textPrimary}`}
              />
            </div>

            <div>
              <label className={`${textSecondary} text-sm mb-2 block`}>Max Value</label>
              <Input
                type="number"
                value={validation.max || ''}
                onChange={(e) => updateValidation({ max: parseFloat(e.target.value) || undefined })}
                placeholder="No maximum"
                className={`${bgInput} border ${borderColor} ${textPrimary}`}
              />
            </div>
          </div>

          <div>
            <label className={`${textSecondary} text-sm mb-2 block`}>Error Message</label>
            <Input
              value={validation.rangeMessage || ''}
              onChange={(e) => updateValidation({ rangeMessage: e.target.value })}
              placeholder="Must be between {min} and {max}"
              className={`${bgInput} border ${borderColor} ${textPrimary}`}
            />
          </div>
        </div>
      )}

      {/* Pattern Validation (regex) */}
      <div className={`${bgCard} border ${borderColor} rounded-lg p-4 space-y-3`}>
        <h4 className={`${textPrimary} font-medium mb-3`}>Pattern Validation (Regex)</h4>

        <div>
          <label className={`${textSecondary} text-sm mb-2 block`}>Pattern</label>
          <Input
            value={validation.pattern || ''}
            onChange={(e) => updateValidation({ pattern: e.target.value })}
            placeholder="^[A-Za-z0-9]+$"
            className={`${bgInput} border ${borderColor} ${textPrimary} font-mono`}
          />
          <p className={`${textSecondary} text-xs mt-1`}>
            Enter a regex pattern (e.g., ^[0-9]+$ for numbers only)
          </p>
        </div>

        <div>
          <label className={`${textSecondary} text-sm mb-2 block`}>Error Message</label>
          <Input
            value={validation.patternMessage || ''}
            onChange={(e) => updateValidation({ patternMessage: e.target.value })}
            placeholder="Invalid format"
            className={`${bgInput} border ${borderColor} ${textPrimary}`}
          />
        </div>

        {/* Pattern Tester */}
        {validation.pattern && (
          <div className={`border ${borderColor} rounded-lg p-3 space-y-2`}>
            <label className={`${textSecondary} text-sm block`}>Test Pattern</label>
            <div className="flex gap-2">
              <Input
                value={testValue}
                onChange={(e) => setTestValue(e.target.value)}
                placeholder="Enter test value..."
                className={`flex-1 ${bgInput} border ${borderColor} ${textPrimary}`}
              />
              {patternTestResult !== null && (
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                  patternTestResult 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-red-500/10 border-red-500/20'
                } border`}>
                  {patternTestResult ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Email Validation */}
      {field.type === 'email' && (
        <div className={`${bgCard} border ${borderColor} rounded-lg p-4 space-y-3`}>
          <h4 className={`${textPrimary} font-medium mb-3`}>Email Validation</h4>

          <div className="flex items-center justify-between">
            <div>
              <p className={`${textPrimary}`}>Strict Email Validation</p>
              <p className={`${textSecondary} text-sm`}>Requires valid email format</p>
            </div>
            <Switch
              checked={validation.strictEmail !== false}
              onCheckedChange={(strictEmail) => updateValidation({ strictEmail })}
            />
          </div>

          <div>
            <label className={`${textSecondary} text-sm mb-2 block`}>Error Message</label>
            <Input
              value={validation.emailMessage || ''}
              onChange={(e) => updateValidation({ emailMessage: e.target.value })}
              placeholder="Please enter a valid email address"
              className={`${bgInput} border ${borderColor} ${textPrimary}`}
            />
          </div>
        </div>
      )}

      {/* URL Validation */}
      {(field.type === 'url' || field.type === 'link') && (
        <div className={`${bgCard} border ${borderColor} rounded-lg p-4 space-y-3`}>
          <h4 className={`${textPrimary} font-medium mb-3`}>URL Validation</h4>

          <div className="flex items-center justify-between">
            <div>
              <p className={`${textPrimary}`}>Require HTTPS</p>
              <p className={`${textSecondary} text-sm`}>Only allow secure URLs</p>
            </div>
            <Switch
              checked={validation.requireHttps || false}
              onCheckedChange={(requireHttps) => updateValidation({ requireHttps })}
            />
          </div>

          <div>
            <label className={`${textSecondary} text-sm mb-2 block`}>Error Message</label>
            <Input
              value={validation.urlMessage || ''}
              onChange={(e) => updateValidation({ urlMessage: e.target.value })}
              placeholder="Please enter a valid URL"
              className={`${bgInput} border ${borderColor} ${textPrimary}`}
            />
          </div>
        </div>
      )}

      {/* Custom Validation Function */}
      <div className={`${bgCard} border ${borderColor} rounded-lg p-4 space-y-3`}>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className={`${textSecondary} h-5 w-5`} />
          <h4 className={`${textPrimary} font-medium`}>Custom Validation</h4>
        </div>

        <div>
          <label className={`${textSecondary} text-sm mb-2 block`}>Custom Error Message</label>
          <textarea
            value={validation.customMessage || ''}
            onChange={(e) => updateValidation({ customMessage: e.target.value })}
            placeholder="Enter custom error message..."
            rows={2}
            className={`w-full px-3 py-2 ${bgInput} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:border-[#00C6FF]`}
          />
          <p className={`${textSecondary} text-xs mt-1`}>
            This message will be shown when custom validation fails
          </p>
        </div>
      </div>

      {/* Validation Summary */}
      <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
        <h4 className={`${textPrimary} font-medium mb-3`}>Active Validations</h4>
        <div className="space-y-2">
          {field.required && (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#00C6FF]" />
              <span className={`${textSecondary} text-sm`}>Required field</span>
            </div>
          )}
          {validation.minLength && (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#00C6FF]" />
              <span className={`${textSecondary} text-sm`}>Min length: {validation.minLength}</span>
            </div>
          )}
          {validation.maxLength && (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#00C6FF]" />
              <span className={`${textSecondary} text-sm`}>Max length: {validation.maxLength}</span>
            </div>
          )}
          {validation.min !== undefined && (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#00C6FF]" />
              <span className={`${textSecondary} text-sm`}>Min value: {validation.min}</span>
            </div>
          )}
          {validation.max !== undefined && (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#00C6FF]" />
              <span className={`${textSecondary} text-sm`}>Max value: {validation.max}</span>
            </div>
          )}
          {validation.pattern && (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#00C6FF]" />
              <span className={`${textSecondary} text-sm font-mono`}>Pattern: {validation.pattern}</span>
            </div>
          )}
          {!field.required && !validation.minLength && !validation.maxLength && 
           !validation.min && !validation.max && !validation.pattern && (
            <p className={`${textSecondary} text-sm italic`}>No validations configured</p>
          )}
        </div>
      </div>
    </div>
  );
}

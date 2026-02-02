import { useState, useEffect } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { X, Zap, Sparkles, Play, CheckCircle2, Upload, Calendar, Clock, XOctagon, Copy, FileDown, Lock, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { TriggerNodeType } from '@/features/workflow-builder/types/trigger.types';
import type { ContainerElement, FormElement } from '@/features/workflow-builder/types/workflow.types';

interface WorkflowPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formTitle: string;
  formDescription: string;
  containers: ContainerElement[];
  triggers: TriggerNodeType[];
  theme: string;
}

interface ValidationError {
  fieldId: string;
  fieldLabel: string;
  message: string;
}

// SearchableDropdown component
function SearchableDropdown({ options, value, onChange, placeholder, theme }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  
  const filteredOptions = options.filter((opt: string) => 
    opt.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border ${borderColor} rounded ${bgInput} text-sm ${textPrimary} text-left flex items-center justify-between`}
      >
        <span>{value || placeholder}</span>
        <ChevronDown className="w-4 h-4" />
      </button>
      {isOpen && (
        <div className={`absolute z-10 w-full mt-1 ${bgInput} border ${borderColor} rounded shadow-lg`}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className={`w-full px-3 py-2 border-b ${borderColor} ${bgInput} text-sm ${textPrimary} focus:outline-none`}
          />
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.map((opt: string, idx: number) => (
              <div
                key={idx}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`px-3 py-2 cursor-pointer hover:bg-[#00C6FF]/10 ${textPrimary} text-sm`}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkflowPreviewModal({
  isOpen,
  onClose,
  formTitle,
  formDescription,
  containers,
  triggers,
  theme
}: WorkflowPreviewModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showOutput, setShowOutput] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<'success' | 'error' | null>(null);
  const [outputText, setOutputText] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const bgColor = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const panelBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  
  const hasTriggers = triggers.length > 0;
  const hasNodes = containers.some(c => (c as any).nodes && (c as any).nodes.length > 0);
  const hasFields = containers.some(c => c.elements && c.elements.length > 0);
  const showManualTrigger = hasTriggers && !triggers.some(t => t.type === 'form-submission');

  // Initialize formData with default values when modal opens or containers change
  useEffect(() => {
    if (isOpen) {
      const initialData: Record<string, any> = {};
      containers.forEach(container => {
        container.elements?.forEach(element => {
          if (element.defaultValue !== undefined && element.defaultValue !== '') {
            initialData[element.id] = element.defaultValue;
          }
        });
      });
      setFormData(initialData);
    }
  }, [isOpen, containers]);

  const handleReset = () => {
    setShowOutput(false);
    setExecutionStatus(null);
    setOutputText('');
    setCurrentStepIndex(0);
    setFormData({});
    setIsExecuting(false);
    setValidationErrors([]);
    setShowValidationSummary(false);
    setShowAdvanced(false);
  };

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const validateForm = (): boolean => {
    const errors: ValidationError[] = [];
    const currentContainer = containers[currentStepIndex];
    
    if (!currentContainer) return true;
    
    // Get all visible fields (including advanced if shown)
    const fieldsToValidate = currentContainer.elements.filter(el => {
      if (el.hidden) return false;
      if (el.showInAdvanced && !showAdvanced) return false;
      return true;
    });
    
    fieldsToValidate.forEach(element => {
      const value = formData[element.id];
      
      // Skip validation for read-only fields
      if (element.readOnly) return;
      
      // Required field validation
      if (element.required) {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors.push({
            fieldId: element.id,
            fieldLabel: element.label,
            message: 'This field is required'
          });
          return; // Skip other validations if field is empty
        }
      }
      
      // Type-specific validations (only if field has value)
      if (value && typeof value === 'string' && value.trim() !== '') {
        // Email validation
        if (element.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push({
              fieldId: element.id,
              fieldLabel: element.label,
              message: 'Please enter a valid email address'
            });
          }
        }
        
        // URL validation
        if (element.type === 'url') {
          try {
            new URL(value);
          } catch {
            errors.push({
              fieldId: element.id,
              fieldLabel: element.label,
              message: 'Please enter a valid URL (e.g., https://example.com)'
            });
          }
        }
        
        // Phone validation
        if (element.type === 'phone') {
          const phoneRegex = /^[\d\s\-\+\(\)]+$/;
          if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
            errors.push({
              fieldId: element.id,
              fieldLabel: element.label,
              message: 'Please enter a valid phone number (at least 10 digits)'
            });
          }
        }
        
        // Number validation with min/max
        if (element.type === 'number') {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            errors.push({
              fieldId: element.id,
              fieldLabel: element.label,
              message: 'Please enter a valid number'
            });
          } else {
            // Check for min/max attributes (add to FormElement type if needed)
            if ((element as any).minValue !== undefined && numValue < (element as any).minValue) {
              errors.push({
                fieldId: element.id,
                fieldLabel: element.label,
                message: `Value must be at least ${(element as any).minValue}`
              });
            }
            if ((element as any).maxValue !== undefined && numValue > (element as any).maxValue) {
              errors.push({
                fieldId: element.id,
                fieldLabel: element.label,
                message: `Value must not exceed ${(element as any).maxValue}`
              });
            }
          }
        }
      }
      
      // Min words validation (only if field has value)
      if (element.minWords && typeof value === 'string' && value.trim() !== '') {
        const wordCount = countWords(value);
        if (wordCount < element.minWords) {
          errors.push({
            fieldId: element.id,
            fieldLabel: element.label,
            message: `Minimum ${element.minWords} words required, you have ${wordCount}`
          });
        }
      }
      
      // Max words validation (only if field has value)
      if (element.maxWords && typeof value === 'string' && value.trim() !== '') {
        const wordCount = countWords(value);
        if (wordCount > element.maxWords) {
          errors.push({
            fieldId: element.id,
            fieldLabel: element.label,
            message: `Maximum ${element.maxWords} words allowed, you have ${wordCount}`
          });
        }
      }
      
      // Custom regex validation (if pattern is provided)
      if ((element as any).pattern && typeof value === 'string' && value.trim() !== '') {
        try {
          const regex = new RegExp((element as any).pattern);
          if (!regex.test(value)) {
            errors.push({
              fieldId: element.id,
              fieldLabel: element.label,
              message: (element as any).patternMessage || 'Please enter a valid format'
            });
          }
        } catch (e) {
          console.error('Invalid regex pattern:', e);
        }
      }
    });
    
    setValidationErrors(errors);
    
    if (errors.length > 1) {
      setShowValidationSummary(true);
    }
    
    return errors.length === 0;
  };

  const handleManualTrigger = () => {
    if (!validateForm()) return;
    
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setShowOutput(true);
      const isSuccess = Math.random() > 0.2;
      setExecutionStatus(isSuccess ? 'success' : 'error');
      if (isSuccess) {
        // Generate output showing variables
        let output = 'Based on your input, I have successfully processed the workflow:\\n\\n';
        output += '📊 Form Data Submitted:\\n';
        Object.keys(formData).forEach(key => {
          const element = containers.flatMap(c => c.elements).find(el => el.id === key);
          if (element && formData[key]) {
            output += `  • ${element.label}: ${JSON.stringify(formData[key])}\\n`;
          }
        });
        output += '\\n✅ All validation passed\\n';
        output += '✅ Workflow nodes executed successfully\\n';
        output += '✅ Data stored and available as variables\\n';
        setOutputText(output);
      }
    }, 2000);
  };

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error for this field when user starts typing
    setValidationErrors(prev => prev.filter(err => err.fieldId !== key));
  };

  const getFieldError = (fieldId: string): string | null => {
    const error = validationErrors.find(err => err.fieldId === fieldId);
    return error ? error.message : null;
  };

  const renderFormElement = (element: FormElement) => {
    // Handle visibility
    if (element.hidden) {
      // Store default value for hidden fields
      if (element.defaultValue && !formData[element.id]) {
        setTimeout(() => updateFormData(element.id, element.defaultValue), 0);
      }
      return null;
    }
    
    // Handle advanced fields
    if (element.showInAdvanced && !showAdvanced) return null;

    const elementKey = element.id;
    const iconColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const isReadOnly = element.readOnly;
    const fieldError = getFieldError(element.id);
    const hasError = !!fieldError;
    
    // Set default value if exists and field is empty, or if default value has changed
    const currentValue = formData[elementKey] ?? element.defaultValue ?? '';
    if (element.defaultValue && (!formData[elementKey] || formData[elementKey] === '')) {
      setTimeout(() => updateFormData(elementKey, element.defaultValue), 0);
    }
    
    // Calculate word count for text fields
    const supportsWordCount = ['text', 'textarea', 'notes', 'rich-text', 'number', 'email'].includes(element.type);
    const wordCount = supportsWordCount && typeof currentValue === 'string' ? countWords(currentValue) : 0;
    const showWordCounter = supportsWordCount && (element.minWords || element.maxWords);

    return (
      <div key={element.id} className="space-y-2">
        <label className={`${textPrimary} text-sm flex items-center gap-1`}>
          {isReadOnly && <Lock className="w-3 h-3 text-gray-400" />}
          {element.label}
          {element.required && <span className="text-red-500">*</span>}
        </label>
        {element.description && (
          <p className={`${textSecondary} text-xs`}>{element.description}</p>
        )}
        
        {['text', 'email', 'number'].includes(element.type) && (
          <div>
            <input
              type={element.type}
              placeholder={element.placeholder}
              value={currentValue}
              onChange={(e) => updateFormData(elementKey, e.target.value)}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 border ${hasError ? 'border-red-500' : borderColor} rounded ${bgInput} text-sm ${textPrimary} ${
                isReadOnly ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60' : ''
              }`}
            />
            {showWordCounter && (
              <p className={`text-xs mt-1 ${
                (element.maxWords && wordCount > element.maxWords) || (element.minWords && wordCount < element.minWords) 
                  ? 'text-red-500' 
                  : textSecondary
              }`}>
                {wordCount} / {element.maxWords || element.minWords} words
              </p>
            )}
            {hasError && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldError}
              </p>
            )}
          </div>
        )}
        
        {['textarea', 'notes'].includes(element.type) && (
          <div>
            <textarea
              placeholder={element.placeholder}
              value={currentValue}
              onChange={(e) => updateFormData(elementKey, e.target.value)}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 border ${hasError ? 'border-red-500' : borderColor} rounded ${bgInput} text-sm ${textPrimary} ${
                isReadOnly ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60' : ''
              }`}
              rows={3}
            />
            {showWordCounter && (
              <p className={`text-xs mt-1 ${
                (element.maxWords && wordCount > element.maxWords) || (element.minWords && wordCount < element.minWords) 
                  ? 'text-red-500' 
                  : textSecondary
              }`}>
                {wordCount} / {element.maxWords || element.minWords} words
              </p>
            )}
            {hasError && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldError}
              </p>
            )}
          </div>
        )}
        
        {element.type === 'rich-text' && (
          <div>
            <div className={`w-full min-h-[120px] border ${hasError ? 'border-red-500' : borderColor} rounded ${bgInput} p-3 ${
              isReadOnly ? 'bg-gray-100 dark:bg-gray-800 opacity-60' : ''
            }`}>
              <textarea
                placeholder="Enter rich text content..."
                value={currentValue}
                onChange={(e) => updateFormData(elementKey, e.target.value)}
                disabled={isReadOnly}
                className={`w-full min-h-[100px] bg-transparent border-none outline-none resize-none ${textPrimary} text-sm`}
              />
              {!isReadOnly && (
                <div className={`flex items-center gap-2 pt-2 border-t ${borderColor} mt-2`}>
                  <button className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${textSecondary}`} title="Bold">
                    <span className="text-xs font-bold">B</span>
                  </button>
                  <button className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${textSecondary}`} title="Italic">
                    <span className="text-xs italic">I</span>
                  </button>
                  <button className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${textSecondary}`} title="Underline">
                    <span className="text-xs underline">U</span>
                  </button>
                </div>
              )}
            </div>
            {showWordCounter && (
              <p className={`text-xs mt-1 ${
                (element.maxWords && wordCount > element.maxWords) || (element.minWords && wordCount < element.minWords) 
                  ? 'text-red-500' 
                  : textSecondary
              }`}>
                {wordCount} / {element.maxWords || element.minWords} words
              </p>
            )}
            {hasError && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldError}
              </p>
            )}
          </div>
        )}
        
        {element.type === 'dropdown' && element.options && (
          <div>
            <SearchableDropdown
              options={element.options}
              value={currentValue}
              onChange={(value: any) => !isReadOnly && updateFormData(elementKey, value)}
              placeholder="Select an option"
              theme={theme}
            />
            {hasError && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldError}
              </p>
            )}
          </div>
        )}
        
        {element.type === 'radio' && element.options && (
          <div>
            <div className="space-y-2">
              {element.options.map((opt, idx) => (
                <label key={idx} className={`flex items-center gap-2 ${isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                  <input
                    type="radio"
                    name={elementKey}
                    checked={currentValue === opt}
                    onChange={() => !isReadOnly && updateFormData(elementKey, opt)}
                    disabled={isReadOnly}
                    className="cursor-pointer"
                  />
                  <span className={`${textPrimary} text-sm`}>{opt}</span>
                </label>
              ))}
            </div>
            {hasError && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldError}
              </p>
            )}
          </div>
        )}
        
        {element.type === 'checklist' && element.options && (
          <div>
            <div className="space-y-2">
              {element.options.map((opt, idx) => (
                <label key={idx} className={`flex items-center gap-2 ${isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                  <input
                    type="checkbox"
                    checked={currentValue?.includes(opt) || false}
                    onChange={(e) => {
                      if (isReadOnly) return;
                      const current = currentValue || [];
                      if (e.target.checked) {
                        updateFormData(elementKey, [...current, opt]);
                      } else {
                        updateFormData(elementKey, current.filter((v: string) => v !== opt));
                      }
                    }}
                    disabled={isReadOnly}
                    className="rounded cursor-pointer"
                  />
                  <span className={`${textPrimary} text-sm`}>{opt}</span>
                </label>
              ))}
            </div>
            {hasError && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldError}
              </p>
            )}
          </div>
        )}
        
        {element.type === 'toggle' && (
          <div>
            <label className={`relative inline-flex items-center ${isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                checked={currentValue || false}
                onChange={(e) => !isReadOnly && updateFormData(elementKey, e.target.checked)}
                disabled={isReadOnly}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cyan-600"></div>
              <span className={`ms-3 text-sm ${textPrimary}`}>Enable option</span>
            </label>
            {hasError && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldError}
              </p>
            )}
          </div>
        )}
        
        {element.type === 'date-picker' && (
          <div>
            <div className="relative">
              <input
                type="date"
                value={currentValue}
                onChange={(e) => !isReadOnly && updateFormData(elementKey, e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border ${hasError ? 'border-red-500' : borderColor} rounded ${bgInput} text-sm ${textPrimary} ${
                  isReadOnly ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}
              />
              <Calendar className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${iconColor}`} />
            </div>
            {hasError && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldError}
              </p>
            )}
          </div>
        )}
        
        {element.type === 'time' && (
          <div>
            <div className="relative">
              <input
                type="time"
                value={currentValue}
                onChange={(e) => !isReadOnly && updateFormData(elementKey, e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border ${hasError ? 'border-red-500' : borderColor} rounded ${bgInput} text-sm ${textPrimary} ${
                  isReadOnly ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}
              />
              <Clock className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${iconColor}`} />
            </div>
            {hasError && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldError}
              </p>
            )}
          </div>
        )}
        
        {(element.type === 'uploaded' || element.type === 'image') && (
          <div>
            <div className={`w-full h-24 border-2 border-dashed ${hasError ? 'border-red-500' : borderColor} rounded flex items-center justify-center ${
              isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-cyan-500/50'
            } transition-all`}>
              <div className="text-center">
                <Upload className={`w-6 h-6 mx-auto mb-2 ${textSecondary}`} />
                <span className={`${textSecondary} text-sm`}>{isReadOnly ? 'Read only' : 'Click to upload'}</span>
              </div>
            </div>
            {hasError && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldError}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  // Separate regular and advanced fields
  const currentContainer = containers[currentStepIndex];
  const regularFields = currentContainer?.elements.filter(el => !el.showInAdvanced) || [];
  const advancedFields = currentContainer?.elements.filter(el => el.showInAdvanced) || [];
  const hasAdvancedFields = advancedFields.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className={`${panelBg} rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col border ${borderColor}`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${borderColor}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h2 className={`${textPrimary} text-xl mb-1`}>
                {formTitle.length > 120 ? formTitle.substring(0, 120) + '...' : formTitle}
              </h2>
              {formDescription && (
                <p className={`${textSecondary} text-sm`}>
                  {formDescription.length > 180 ? formDescription.substring(0, 180) + '...' : formDescription}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className={`p-2 hover:bg-red-500/10 hover:text-red-500 rounded transition-all ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress Bar */}
          {containers.length > 1 && (
            <div className="mt-4">
              <div className="flex items-center justify-center gap-1">
                {containers.map((container, idx) => (
                  <div key={container.id} className="flex items-center">
                    {idx > 0 && (
                      <div className={`h-1 w-8 ${idx <= currentStepIndex ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB]' : 'bg-gray-300 dark:bg-gray-700'}`} />
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                      idx < currentStepIndex 
                        ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white' 
                        : idx === currentStepIndex
                        ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white ring-4 ring-[#00C6FF]/30'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {idx < currentStepIndex ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-6 ${bgColor}`}>
          <div className="max-w-7xl mx-auto">
            {/* Validation Summary Modal */}
            {showValidationSummary && validationErrors.length > 1 && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-red-500 font-semibold mb-2">Please fix the following errors:</h4>
                    <ul className="space-y-1">
                      {validationErrors.map((error, idx) => (
                        <li key={idx} className="text-red-500 text-sm">
                          • <strong>{error.fieldLabel}:</strong> {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => setShowValidationSummary(false)}
                    className="text-red-500 hover:bg-red-500/10 p-1 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            {/* Top Banner */}
            <div className={`${panelBg} rounded-lg p-4 border ${borderColor} flex items-center justify-between mb-6`}>
              <div className="flex items-center gap-3">
                {hasTriggers && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#00C6FF]/10 border border-[#00C6FF]/30">
                    <Zap className="w-4 h-4 text-[#00C6FF]" />
                    <span className={`${textSecondary} text-xs`}>Auto-execution enabled</span>
                  </div>
                )}
                {/* Schedule Trigger Info */}
                {triggers.some(t => t.type === 'schedule') && (() => {
                  const scheduleTrigger = triggers.find(t => t.type === 'schedule');
                  if (!scheduleTrigger) return null;
                  const { dueDate, dueTime, recurring } = scheduleTrigger.config;
                  return (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span className={`${textSecondary} text-xs`}>
                        {dueDate && dueTime ? `Scheduled: ${new Date(dueDate + 'T' + dueTime).toLocaleString()}` : 'Schedule configured'}
                        {recurring && recurring !== 'Never' && ` (${recurring})`}
                      </span>
                    </div>
                  );
                })()}
                {hasNodes && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#9D50BB]/10 border border-[#9D50BB]/30">
                    <Sparkles className="w-4 h-4 text-[#9D50BB]" />
                    <span className={`${textSecondary} text-xs`}>AI-powered</span>
                  </div>
                )}
                {hasFields && !hasTriggers && !hasNodes && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className={`${textSecondary} text-xs`}>Form submission</span>
                  </div>
                )}
              </div>
              {showManualTrigger && (
                <button
                  onClick={handleManualTrigger}
                  disabled={isExecuting}
                  className={`px-4 py-2 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all flex items-center gap-2 ${
                    isExecuting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Play className="w-4 h-4" />
                  {isExecuting ? 'Executing...' : 'Manual Trigger'}
                </button>
              )}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-[30%_70%] gap-6">
              {/* Left: Form */}
              <div className="flex flex-col">
                {hasFields ? (
                  <div className={`${panelBg} rounded-xl p-6 border ${borderColor} flex flex-col`}>
                    {containers[currentStepIndex] && (
                      <div className="mb-6">
                        <h3 className={`${textPrimary} text-lg mb-1`}>
                          {containers[currentStepIndex].title}
                        </h3>
                        <p className={`${textSecondary} text-sm`}>
                          {containers[currentStepIndex].subtitle}
                        </p>
                      </div>
                    )}
                    
                    {/* Regular Fields */}
                    <div className="space-y-4 mb-6">
                      {regularFields.map((element) => renderFormElement(element))}
                    </div>
                    
                    {/* Advanced Fields Section */}
                    {hasAdvancedFields && (
                      <div className="mb-6">
                        <button
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          className={`w-full flex items-center gap-3 px-0 py-3 ${textPrimary} hover:opacity-80 transition-all group`}
                        >
                          <div className="w-10 h-10 rounded-full bg-[#6366F1] flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold">{regularFields.length + 1}</span>
                          </div>
                          <div className="flex-1 text-left">
                            <span className="font-semibold">Advanced Settings</span>
                            <span className={`ml-2 ${textSecondary}`}>(optional)</span>
                          </div>
                          <div className={`w-10 h-10 rounded-full border ${borderColor} flex items-center justify-center flex-shrink-0 group-hover:border-[#00C6FF] transition-all`}>
                            {showAdvanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </button>
                        {showAdvanced && (
                          <div className={`mt-4 p-6 rounded-lg border ${borderColor} ${theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50'}`}>
                            <div className="space-y-4">
                              {advancedFields.map((element) => renderFormElement(element))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Navigation Buttons */}
                    <div className="flex gap-3 mt-4">
                      {currentStepIndex > 0 && (
                        <button
                          onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                          className={`flex-1 px-6 py-3 rounded-lg border-2 ${borderColor} ${textPrimary} hover:bg-gray-500/10 transition-all text-center font-medium`}
                        >
                          Previous
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (currentStepIndex < containers.length - 1) {
                            if (validateForm()) {
                              setCurrentStepIndex(currentStepIndex + 1);
                            }
                          } else {
                            handleManualTrigger();
                          }
                        }}
                        className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all text-center font-medium"
                      >
                        {currentStepIndex < containers.length - 1 ? 'Next Step' : 'Submit'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`${panelBg} rounded-xl p-12 border ${borderColor} text-center flex items-center justify-center`}>
                    <div className="space-y-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] flex items-center justify-center mx-auto">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <p className={`${textPrimary}`}>No input fields required</p>
                      <p className={`${textSecondary} text-sm`}>This workflow runs automatically with AI</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Output */}
              <div className="flex flex-col h-[600px]">
                <div className={`${panelBg} rounded-xl p-6 border ${borderColor} flex-1 flex flex-col overflow-hidden`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`${textPrimary}`}>Output</h3>
                    {showOutput && (
                      <button
                        onClick={handleReset}
                        className="px-4 py-2 rounded-lg border border-[#00C6FF] text-[#00C6FF] hover:bg-[#00C6FF]/10 transition-all text-sm"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  
                  {showOutput ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Status Badge */}
                      {executionStatus && (
                        <div className={`mb-4 flex items-center gap-2 px-4 py-2 rounded-lg ${
                          executionStatus === 'success' 
                            ? 'bg-green-500/10 border border-green-500/30' 
                            : 'bg-red-500/10 border border-red-500/30'
                        }`}>
                          {executionStatus === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <XOctagon className="w-5 h-5 text-red-500" />
                          )}
                          <span className={executionStatus === 'success' ? 'text-green-500' : 'text-red-500'}>
                            {executionStatus === 'success' ? 'Execution Successful' : 'Execution Failed'}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex-1 overflow-y-auto ${bgInput} border ${borderColor} rounded-lg p-4 mb-4`}>
                        <pre className={`${textPrimary} text-sm whitespace-pre-wrap`}>{outputText}</pre>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(outputText)}
                          className={`flex-1 px-4 py-2 rounded-lg border ${borderColor} ${textPrimary} hover:bg-gray-500/10 transition-all flex items-center justify-center gap-2`}
                        >
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </button>
                        <button
                          onClick={() => {
                            const blob = new Blob([outputText], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `workflow-result-${Date.now()}.txt`;
                            a.click();
                          }}
                          className={`flex-1 px-4 py-2 rounded-lg border ${borderColor} ${textPrimary} hover:bg-gray-500/10 transition-all flex items-center justify-center gap-2`}
                        >
                          <FileDown className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`w-16 h-16 rounded-full ${bgInput} border-2 ${borderColor} flex items-center justify-center mx-auto mb-4`}>
                          <Sparkles className={`w-8 h-8 ${textSecondary}`} />
                        </div>
                        <p className={`${textSecondary}`}>Output will appear here after execution</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
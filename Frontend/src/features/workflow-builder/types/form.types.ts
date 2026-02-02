/**
 * Form Field Types
 * Extracted from WorkflowBuilderV2.tsx - Phase 1 Refactor
 * Enhanced in Phase 3 Part 2 - Field Properties
 */

export type FormFieldType = 
  | 'text' 
  | 'textarea'
  | 'paragraph'
  | 'email' 
  | 'number' 
  | 'toggle'
  | 'switch'
  | 'radio' 
  | 'dropdown'
  | 'select'
  | 'checklist' 
  | 'date' 
  | 'time' 
  | 'url'
  | 'link'
  | 'upload_file'
  | 'file'
  | 'upload'
  | 'image_upload'
  | 'image';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  description?: string;
  placeholder?: string;
  
  // Default values
  defaultValue?: any;
  toggleDefault?: boolean; // For toggle/switch fields
  
  // Options (for radio, dropdown, checklist)
  options?: string[];
  
  // Link fields
  linkName?: string;
  linkUrl?: string;
  urlName?: string;
  
  // File/Image fields
  fileUrl?: string;
  imageUrl?: string;
  
  // Prefix/Suffix
  prefix?: string;
  suffix?: string;
  prefixPrompt?: string;
  suffixPrompt?: string;
  
  // Visibility & State
  required?: boolean;
  hidden?: boolean;
  readOnly?: boolean;
  showInAdvanced?: boolean;
  
  // Word limits (for text fields)
  minWords?: number;
  maxWords?: number;
  
  // Data mapping
  dataKey?: string;
  variable?: string;
  
  // Persistence
  persistence?: 'none' | 'client' | 'server';
  dbTable?: string;
  
  // Transformation
  transform?: string;
  customTransform?: string;
  
  // Computed values
  computedFormula?: string;
  isComputed?: boolean;
  
  // Conditional display
  showWhen?: string;
  hideWhen?: string;
  
  // API integration
  apiEndpoint?: string;
  apiMethod?: string;
  validateOnBlur?: boolean;
  
  // Validation rules
  validation?: FieldValidation;
}

export interface FieldValidation {
  // Required
  required?: boolean;
  requiredMessage?: string;
  
  // Length validation (text fields)
  minLength?: number;
  maxLength?: number;
  lengthMessage?: string;
  
  // Value range (number fields)
  min?: number;
  max?: number;
  rangeMessage?: string;
  
  // Pattern validation
  pattern?: string;
  patternMessage?: string;
  
  // Email validation
  strictEmail?: boolean;
  emailMessage?: string;
  
  // URL validation
  requireHttps?: boolean;
  urlMessage?: string;
  
  // Custom validation
  custom?: string;
  customMessage?: string;
}
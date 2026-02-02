/**
 * Variable Types
 * Phase 4 Part 3 - Variable System
 */

export type VariableType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'date'
  | 'null'
  | 'undefined'
  | 'any';

export type VariableScope = 
  | 'global'      // Available everywhere
  | 'workflow'    // Available in current workflow
  | 'step'        // Available in current step
  | 'local';      // Available in current context

export interface VariableDefinition {
  id: string;
  name: string;
  path: string;              // e.g., "trigger.formData.email"
  type: VariableType;
  value?: any;
  scope: VariableScope;
  description?: string;
  example?: string;
  source?: string;           // e.g., "step-1", "trigger-1"
  category?: string;         // e.g., "Form Data", "User Info"
  isArray?: boolean;
  isRequired?: boolean;
  defaultValue?: any;
  metadata?: Record<string, any>;
}

export interface VariableReference {
  raw: string;               // e.g., "{{trigger.formData.email}}"
  path: string;              // e.g., "trigger.formData.email"
  parts: string[];           // e.g., ["trigger", "formData", "email"]
  transformations?: string[]; // e.g., ["uppercase", "trim"]
}

export interface VariableContext {
  variables: Record<string, any>;
  stepOutputs: Record<string, any>;
  globalVariables: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface VariableTransformation {
  id: string;
  name: string;
  description: string;
  apply: (value: any, ...args: any[]) => any;
  example?: string;
  category?: string;
}

export interface VariableSuggestion {
  variable: VariableDefinition;
  score: number;             // Relevance score
  matchedOn: string[];       // What matched (name, path, description)
}

export interface ExpressionResult {
  success: boolean;
  value?: any;
  error?: string;
  variables?: string[];      // Variables used in expression
}

export interface VariableValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export type VariableCategory = 
  | 'trigger'
  | 'step'
  | 'form'
  | 'user'
  | 'system'
  | 'custom';

export interface VariableGroup {
  category: VariableCategory;
  label: string;
  icon?: string;
  variables: VariableDefinition[];
  description?: string;
}

export interface VariablePickerConfig {
  allowedTypes?: VariableType[];
  allowedScopes?: VariableScope[];
  allowedCategories?: VariableCategory[];
  showTransformations?: boolean;
  showExamples?: boolean;
  multiSelect?: boolean;
  customFilter?: (variable: VariableDefinition) => boolean;
}

export interface VariableInsertEvent {
  variable: VariableDefinition;
  reference: string;         // e.g., "{{trigger.email}}"
  withTransformations?: string[];
  insertAt?: number;         // Cursor position
}

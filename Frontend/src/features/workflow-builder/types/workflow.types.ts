/**
 * Core Workflow Types
 * Extracted from WorkflowBuilderV2.tsx - Phase 1 Refactor
 */

export interface WorkflowMetadata {
  name: string;
  description: string;
  category: string;
  icon: string;
  coverImage?: string;
}

export interface Container {
  id: string;
  type: 'container';
  title: string;
  subtitle?: string;
  elements: FormElement[];
  nodes: WorkflowNode[];
  fields?: FormField[];
  isFormContainer?: boolean; // Flag to identify AI Form container
  position?: { x: number; y: number }; // Absolute canvas position for branch containers
  isBranchContainer?: boolean; // Flag to identify branch containers
  parentNodeId?: string; // Reference to parent conditional node
}

export interface FormElement {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  hidden?: boolean;
  readOnly?: boolean;
  maxWords?: number;
  minWords?: number;
  defaultValue?: string;
  prefix?: string;
  suffix?: string;
  prefixPrompt?: string;
  suffixPrompt?: string;
  visibility?: 'default' | 'hidden' | 'readonly';
  advance?: boolean;
  showInAdvanced?: boolean;
  dataKey?: string;
  persistence?: 'none' | 'server' | 'client';
  variable?: string;
  options?: string[];
  toggleDefault?: boolean;
  linkName?: string;
  linkUrl?: string;
  defaultDate?: string;
  defaultTime?: string;
  grayedOut?: boolean;
  nestedFields?: FormElement[]; // Support for nested/sub-fields
  parentFieldId?: string; // Reference to parent field if nested
}

export interface Variable {
  id: string;
  name: string;
  value: string;
  type: string;
}

export interface NotificationState {
  show: boolean;
  message: string;
  type: 'error' | 'success' | 'info';
}

export type LeftPanelView = 'triggers' | 'nodes' | 'tools' | 'formfields' | 'configuration';

export type SelectedItem = 
  | { type: 'element'; containerIndex: number; elementIndex: number }
  | { type: 'container'; containerIndex: number }
  | null;
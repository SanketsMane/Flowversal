export interface WorkflowData {
  name: string;
  description: string;
  category: string;
  icon: string;
  coverImage?: string;
}

export interface WorkflowBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  workflowData?: WorkflowData;
  onNavigate?: (page: string) => void;
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

export interface ContainerElement {
  id: string;
  type: 'container';
  title: string;
  subtitle?: string;
  elements: FormElement[];
}

export interface Variable {
  id: string;
  name: string;
  value: string;
  type: string;
}

export type LeftPanelView = 'main' | 'form-fields' | 'nodes' | 'triggers' | 'variables' | 'configuration';

export type SelectedItem = 
  | { type: 'element'; containerIndex: number; elementIndex: number }
  | { type: 'container'; containerIndex: number }
  | null;

export interface NotificationState {
  show: boolean;
  message: string;
  type: 'error' | 'success' | 'info';
}

export interface AddedTool {
  type: string;
  label: string;
  config: Record<string, any>;
}
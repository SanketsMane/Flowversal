import { WorkflowNode } from '../../../types';
import { FormField } from '../../../types/form.types';

export interface FormSetupModalProps {
  node: WorkflowNode;
  onClose: () => void;
  onSave: (formFields: FormField[]) => void;
  theme?: 'dark' | 'light';
}

export interface SortableFieldProps {
  field: FormField;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  theme: 'dark' | 'light';
}

export type InputOutputTab = 'schema' | 'table' | 'json';
export type ConfigTab = 'parameters' | 'settings';
export type FieldTab = 'edit' | 'validations' | 'data';

export interface FormSetupState {
  formFields: FormField[];
  selectedFieldId: string | null;
  showFieldPicker: boolean;
  fieldTab: FieldTab;
  hasUnsavedChanges: boolean;
  showCloseConfirm: boolean;
  inputTab: InputOutputTab;
  outputTab: InputOutputTab;
  configTab: ConfigTab;
  executionData: any;
  newOption: string;
}

export interface FormFieldPanelProps {
  formFields: FormField[];
  selectedFieldId: string | null;
  onFieldSelect: (fieldId: string | null) => void;
  onFieldDelete: (fieldId: string) => void;
  onFieldAdd: (field: FormField) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  onFieldsReorder: (fields: FormField[]) => void;
  theme: 'dark' | 'light';
}

export interface InputOutputPanelProps {
  title: string;
  tab: InputOutputTab;
  onTabChange: (tab: InputOutputTab) => void;
  data: any;
  formFields: FormField[];
  theme: 'dark' | 'light';
}

export interface FieldPropertiesPanelProps {
  selectedField: FormField | null;
  fieldTab: FieldTab;
  onFieldTabChange: (tab: FieldTab) => void;
  onFieldUpdate: (updates: Partial<FormField>) => void;
  onSave: () => void;
  hasUnsavedChanges: boolean;
  theme: 'dark' | 'light';
}

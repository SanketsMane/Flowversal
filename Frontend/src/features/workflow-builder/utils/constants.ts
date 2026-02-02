import {
  FileText, GitBranch, Zap, Hash, Settings as SettingsIcon,
  Type, Circle, ToggleLeft, ChevronDown, CheckSquare,
  Layers, Mail, Image as ImageIcon, Link2, Upload, Calendar, Clock, Box, Wrench
} from 'lucide-react';
import type { LeftPanelView, Variable } from './types';

export const MAX_STEPS = 5;

export const mainButtons = [
  { id: 'triggers', view: 'triggers' as any, label: 'Triggers', icon: Zap },
  { id: 'nodes', view: 'nodes' as any, label: 'Nodes', icon: Box },
  { id: 'form-fields', view: 'form-fields' as LeftPanelView, label: 'Form Fields', icon: FileText },
  { id: 'variables', view: 'variables' as LeftPanelView, label: 'Variables', icon: Hash },
  { id: 'configuration', view: 'configuration' as LeftPanelView, label: 'Configuration', icon: SettingsIcon },
];

export const formFieldTemplates = [
  { type: 'text', icon: Type, label: 'Text', description: 'Single line text input' },
  { type: 'notes', icon: FileText, label: 'Notes', description: 'Multi-line text area' },
  { type: 'number', icon: Hash, label: 'Number', description: 'Numeric input' },
  { type: 'email', icon: Mail, label: 'Email', description: 'Email address field' },
  { type: 'rich-text', icon: FileText, label: 'Rich Text Editor', description: 'WYSIWYG editor' },
  { type: 'textarea', icon: FileText, label: 'Text Area', description: 'Plain multi-line text' },
  { type: 'toggle', icon: ToggleLeft, label: 'Toggle', description: 'On/off switch' },
  { type: 'radio', icon: Circle, label: 'Radio Group', description: 'Single choice selection' },
  { type: 'dropdown', icon: ChevronDown, label: 'Dropdown', description: 'Select from options' },
  { type: 'checklist', icon: CheckSquare, label: 'Checklist', description: 'Multiple items list' },
  { type: 'date-picker', icon: Calendar, label: 'Date Picker', description: 'Select a date' },
  { type: 'time', icon: Clock, label: 'Time Picker', description: 'Select a time' },
  { type: 'url', icon: Link2, label: 'URL', description: 'Web link input' },
  { type: 'uploaded', icon: Upload, label: 'Uploaded', description: 'File upload field' },
  { type: 'image', icon: ImageIcon, label: 'Image', description: 'Image upload' },
];

export const demoVariables: Variable[] = [
  { id: '1', name: 'uid', value: '59e725a7-c8fe-413c-b75d-884c70babec3', type: 'string' },
  { id: '2', name: 'email', value: 'Annette_Kihn53@yahoo.com', type: 'string' },
  { id: '3', name: 'firstname', value: 'Francis', type: 'string' },
  { id: '4', name: 'lastname', value: 'Fadel', type: 'string' },
  { id: '5', name: 'password', value: '$Zswx3sBG', type: 'string' },
  { id: '6', name: 'age', value: '28', type: 'number' },
  { id: '7', name: 'city', value: 'New York', type: 'string' },
  { id: '8', name: 'country', value: 'USA', type: 'string' },
];
/**
 * Form Field Types Configuration
 */

import {
  Calendar,
  CheckSquare,
  Circle,
  Clock,
  FileText,
  Hash,
  Link,
  List,
  LucideIcon,
  Mail,
  Phone,
  ToggleLeft,
  Type,
  Upload,
} from 'lucide-react';

export interface FormFieldType {
  type: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  category: 'input' | 'choice' | 'file' | 'advanced';
  defaultConfig?: {
    placeholder?: string;
    options?: string[];
    rows?: number;
  };
}

export const FORM_FIELD_TYPES: FormFieldType[] = [
  // Input Fields
  {
    type: 'text',
    label: 'Text Input',
    icon: Type,
    description: 'Single line text input',
    category: 'input',
    defaultConfig: {
      placeholder: 'Enter text...',
    },
  },
  {
    type: 'textarea',
    label: 'Text Area',
    icon: FileText,
    description: 'Multi-line text input',
    category: 'input',
    defaultConfig: {
      placeholder: 'Enter text...',
      rows: 4,
    },
  },
  {
    type: 'email',
    label: 'Email',
    icon: Mail,
    description: 'Email address input',
    category: 'input',
    defaultConfig: {
      placeholder: 'email@example.com',
    },
  },
  {
    type: 'number',
    label: 'Number',
    icon: Hash,
    description: 'Numeric input',
    category: 'input',
    defaultConfig: {
      placeholder: '0',
    },
  },
  {
    type: 'phone',
    label: 'Phone',
    icon: Phone,
    description: 'Phone number input',
    category: 'input',
    defaultConfig: {
      placeholder: '+1 (555) 000-0000',
    },
  },
  {
    type: 'url',
    label: 'URL',
    icon: Link,
    description: 'Website URL input',
    category: 'input',
    defaultConfig: {
      placeholder: 'https://example.com',
    },
  },
  {
    type: 'date',
    label: 'Date',
    icon: Calendar,
    description: 'Date picker',
    category: 'input',
  },
  {
    type: 'time',
    label: 'Time',
    icon: Clock,
    description: 'Time picker',
    category: 'input',
  },
  
  // Choice Fields
  {
    type: 'select',
    label: 'Dropdown',
    icon: List,
    description: 'Single selection dropdown',
    category: 'choice',
    defaultConfig: {
      options: ['Option 1', 'Option 2', 'Option 3'],
    },
  },
  {
    type: 'radio',
    label: 'Radio Buttons',
    icon: Circle,
    description: 'Single choice radio buttons',
    category: 'choice',
    defaultConfig: {
      options: ['Option 1', 'Option 2', 'Option 3'],
    },
  },
  {
    type: 'checkbox',
    label: 'Checkboxes',
    icon: CheckSquare,
    description: 'Multiple choice checkboxes',
    category: 'choice',
    defaultConfig: {
      options: ['Option 1', 'Option 2', 'Option 3'],
    },
  },
  {
    type: 'toggle',
    label: 'Toggle',
    icon: ToggleLeft,
    description: 'On/off toggle switch',
    category: 'choice',
  },
  
  // File Field
  {
    type: 'file',
    label: 'File Upload',
    icon: Upload,
    description: 'File upload field',
    category: 'file',
  },
];

export function getFormFieldType(type: string): FormFieldType | undefined {
  return FORM_FIELD_TYPES.find(t => t.type === type);
}
/**
 * Variable Transformations
 * Phase 4 Part 3 - Variable System
 * 
 * Built-in transformation functions for variables
 */

import { VariableTransformation } from '../types/variable.types';

/**
 * Built-in transformations
 */
export const TRANSFORMATIONS: Record<string, VariableTransformation> = {
  // String transformations
  uppercase: {
    id: 'uppercase',
    name: 'Uppercase',
    description: 'Convert string to uppercase',
    category: 'String',
    example: '{{name|uppercase}} → JOHN',
    apply: (value: any) => {
      return String(value).toUpperCase();
    },
  },

  lowercase: {
    id: 'lowercase',
    name: 'Lowercase',
    description: 'Convert string to lowercase',
    category: 'String',
    example: '{{name|lowercase}} → john',
    apply: (value: any) => {
      return String(value).toLowerCase();
    },
  },

  capitalize: {
    id: 'capitalize',
    name: 'Capitalize',
    description: 'Capitalize first letter of each word',
    category: 'String',
    example: '{{name|capitalize}} → John Doe',
    apply: (value: any) => {
      return String(value)
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    },
  },

  trim: {
    id: 'trim',
    name: 'Trim',
    description: 'Remove whitespace from both ends',
    category: 'String',
    example: '{{text|trim}} → "hello"',
    apply: (value: any) => {
      return String(value).trim();
    },
  },

  truncate: {
    id: 'truncate',
    name: 'Truncate',
    description: 'Truncate string to specified length',
    category: 'String',
    example: '{{text|truncate:10}} → "Hello wo..."',
    apply: (value: any, length: number = 50) => {
      const str = String(value);
      if (str.length <= length) return str;
      return str.substring(0, length) + '...';
    },
  },

  // Number transformations
  round: {
    id: 'round',
    name: 'Round',
    description: 'Round number to specified decimal places',
    category: 'Number',
    example: '{{price|round:2}} → 10.50',
    apply: (value: any, decimals: number = 0) => {
      const num = parseFloat(value);
      return Number(num.toFixed(decimals));
    },
  },

  abs: {
    id: 'abs',
    name: 'Absolute',
    description: 'Get absolute value',
    category: 'Number',
    example: '{{amount|abs}} → 10',
    apply: (value: any) => {
      return Math.abs(parseFloat(value));
    },
  },

  // Array transformations
  join: {
    id: 'join',
    name: 'Join',
    description: 'Join array elements with separator',
    category: 'Array',
    example: '{{items|join:", "}} → "a, b, c"',
    apply: (value: any, separator: string = ', ') => {
      if (Array.isArray(value)) {
        return value.join(separator);
      }
      return String(value);
    },
  },

  first: {
    id: 'first',
    name: 'First',
    description: 'Get first element of array',
    category: 'Array',
    example: '{{items|first}} → "a"',
    apply: (value: any) => {
      if (Array.isArray(value)) {
        return value[0];
      }
      return value;
    },
  },

  last: {
    id: 'last',
    name: 'Last',
    description: 'Get last element of array',
    category: 'Array',
    example: '{{items|last}} → "c"',
    apply: (value: any) => {
      if (Array.isArray(value)) {
        return value[value.length - 1];
      }
      return value;
    },
  },

  length: {
    id: 'length',
    name: 'Length',
    description: 'Get length of string or array',
    category: 'Array',
    example: '{{items|length}} → 3',
    apply: (value: any) => {
      if (Array.isArray(value) || typeof value === 'string') {
        return value.length;
      }
      return 0;
    },
  },

  // Date transformations
  dateFormat: {
    id: 'dateFormat',
    name: 'Date Format',
    description: 'Format date',
    category: 'Date',
    example: '{{date|dateFormat}} → "12/13/2024"',
    apply: (value: any, format: string = 'MM/DD/YYYY') => {
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;

      // Simple formatting
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();

      return format
        .replace('MM', month)
        .replace('DD', day)
        .replace('YYYY', String(year));
    },
  },

  // Type conversions
  json: {
    id: 'json',
    name: 'JSON',
    description: 'Convert to JSON string',
    category: 'Conversion',
    example: '{{data|json}} → "{"key":"value"}"',
    apply: (value: any) => {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    },
  },

  number: {
    id: 'number',
    name: 'Number',
    description: 'Convert to number',
    category: 'Conversion',
    example: '{{value|number}} → 42',
    apply: (value: any) => {
      return parseFloat(value);
    },
  },

  string: {
    id: 'string',
    name: 'String',
    description: 'Convert to string',
    category: 'Conversion',
    example: '{{value|string}} → "42"',
    apply: (value: any) => {
      return String(value);
    },
  },

  // Utility transformations
  default: {
    id: 'default',
    name: 'Default',
    description: 'Use default value if empty/null/undefined',
    category: 'Utility',
    example: '{{value|default:"N/A"}} → "N/A"',
    apply: (value: any, defaultValue: any = '') => {
      if (value === null || value === undefined || value === '') {
        return defaultValue;
      }
      return value;
    },
  },

  urlEncode: {
    id: 'urlEncode',
    name: 'URL Encode',
    description: 'URL encode string',
    category: 'Utility',
    example: '{{text|urlEncode}} → "hello%20world"',
    apply: (value: any) => {
      return encodeURIComponent(String(value));
    },
  },

  base64: {
    id: 'base64',
    name: 'Base64',
    description: 'Encode to base64',
    category: 'Utility',
    example: '{{text|base64}} → "aGVsbG8="',
    apply: (value: any) => {
      try {
        return btoa(String(value));
      } catch {
        return value;
      }
    },
  },
};

/**
 * Apply a transformation to a value
 */
export function applyTransformation(
  transformationId: string,
  value: any,
  ...args: any[]
): any {
  // Parse transformation with arguments (e.g., "truncate:10")
  const [id, ...rawArgs] = transformationId.split(':');
  const transformation = TRANSFORMATIONS[id];

  if (!transformation) {
    console.warn(`Unknown transformation: ${id}`);
    return value;
  }

  // Merge args
  const allArgs = [...rawArgs, ...args];

  try {
    return transformation.apply(value, ...allArgs);
  } catch (error) {
    console.error(`Error applying transformation ${id}:`, error);
    return value;
  }
}

/**
 * Get all available transformations
 */
export function getAllTransformations(): VariableTransformation[] {
  return Object.values(TRANSFORMATIONS);
}

/**
 * Get transformations by category
 */
export function getTransformationsByCategory(
  category: string
): VariableTransformation[] {
  return Object.values(TRANSFORMATIONS).filter(
    t => t.category === category
  );
}

/**
 * Get transformation categories
 */
export function getTransformationCategories(): string[] {
  const categories = new Set(
    Object.values(TRANSFORMATIONS)
      .map(t => t.category)
      .filter((c): c is string => c !== undefined)
  );
  return Array.from(categories);
}

/**
 * Register custom transformation
 */
export function registerTransformation(
  transformation: VariableTransformation
): void {
  TRANSFORMATIONS[transformation.id] = transformation;
}

/**
 * Check if transformation exists
 */
export function hasTransformation(id: string): boolean {
  return id in TRANSFORMATIONS;
}

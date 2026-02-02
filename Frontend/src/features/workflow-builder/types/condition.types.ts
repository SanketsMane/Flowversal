/**
 * Condition Types
 * For If/Switch node configuration
 */

export type ConditionDataType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'date_time' 
  | 'array' 
  | 'object';

export type ConditionOperator = 
  // Common operators
  | 'equals'
  | 'not_equals'
  | 'exists'
  | 'not_exists'
  | 'is_empty'
  | 'is_not_empty'
  // String operators
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'not_starts_with'
  | 'ends_with'
  | 'not_ends_with'
  | 'matches_regex'
  | 'not_matches_regex'
  // Number operators
  | 'greater_than'
  | 'greater_than_equals'
  | 'less_than'
  | 'less_than_equals'
  // Array operators
  | 'includes'
  | 'not_includes'
  | 'has_length'
  // Object operators
  | 'has_property'
  | 'not_has_property';

export type LogicalOperator = 'AND' | 'OR';

export interface Condition {
  id: string;
  leftOperand: string;
  operator: ConditionOperator;
  rightOperand: string;
  dataType: ConditionDataType;
}

export interface ConditionGroup {
  id: string;
  conditions: Condition[];
  logicalOperator: LogicalOperator;
  convertTypes?: boolean;
}

export interface ConditionalBranch {
  id: string;
  label: string;
  conditionGroups: ConditionGroup[];
  nodes: any[]; // ConditionalNode[]
}

export interface SwitchCase extends ConditionalBranch {
  isDefault?: boolean;
  priority?: number;
}

export interface IfNodeConfig {
  conditionGroups: ConditionGroup[];
  convertTypes: boolean;
  trueBranch: ConditionalBranch;
  falseBranch: ConditionalBranch;
}

export interface SwitchNodeConfig {
  cases: SwitchCase[];
  defaultCase: ConditionalBranch;
  convertTypes: boolean;
}

// Operator definitions for UI
export interface OperatorDefinition {
  value: ConditionOperator;
  label: string;
  requiresRightOperand: boolean;
  supportedTypes: ConditionDataType[];
}

export const OPERATORS: OperatorDefinition[] = [
  // Common
  { value: 'equals', label: 'is equal to', requiresRightOperand: true, supportedTypes: ['string', 'number', 'boolean', 'date_time'] },
  { value: 'not_equals', label: 'is not equal to', requiresRightOperand: true, supportedTypes: ['string', 'number', 'boolean', 'date_time'] },
  { value: 'exists', label: 'exists', requiresRightOperand: false, supportedTypes: ['string', 'number', 'boolean', 'date_time', 'array', 'object'] },
  { value: 'not_exists', label: 'does not exist', requiresRightOperand: false, supportedTypes: ['string', 'number', 'boolean', 'date_time', 'array', 'object'] },
  { value: 'is_empty', label: 'is empty', requiresRightOperand: false, supportedTypes: ['string', 'array', 'object'] },
  { value: 'is_not_empty', label: 'is not empty', requiresRightOperand: false, supportedTypes: ['string', 'array', 'object'] },
  
  // String
  { value: 'contains', label: 'contains', requiresRightOperand: true, supportedTypes: ['string'] },
  { value: 'not_contains', label: 'does not contain', requiresRightOperand: true, supportedTypes: ['string'] },
  { value: 'starts_with', label: 'starts with', requiresRightOperand: true, supportedTypes: ['string'] },
  { value: 'not_starts_with', label: 'does not start with', requiresRightOperand: true, supportedTypes: ['string'] },
  { value: 'ends_with', label: 'ends with', requiresRightOperand: true, supportedTypes: ['string'] },
  { value: 'not_ends_with', label: 'does not end with', requiresRightOperand: true, supportedTypes: ['string'] },
  { value: 'matches_regex', label: 'matches regex', requiresRightOperand: true, supportedTypes: ['string'] },
  { value: 'not_matches_regex', label: 'does not match regex', requiresRightOperand: true, supportedTypes: ['string'] },
  
  // Number
  { value: 'greater_than', label: 'is greater than', requiresRightOperand: true, supportedTypes: ['number', 'date_time'] },
  { value: 'greater_than_equals', label: 'is greater than or equal to', requiresRightOperand: true, supportedTypes: ['number', 'date_time'] },
  { value: 'less_than', label: 'is less than', requiresRightOperand: true, supportedTypes: ['number', 'date_time'] },
  { value: 'less_than_equals', label: 'is less than or equal to', requiresRightOperand: true, supportedTypes: ['number', 'date_time'] },
  
  // Array
  { value: 'includes', label: 'includes', requiresRightOperand: true, supportedTypes: ['array'] },
  { value: 'not_includes', label: 'does not include', requiresRightOperand: true, supportedTypes: ['array'] },
  { value: 'has_length', label: 'has length', requiresRightOperand: true, supportedTypes: ['array'] },
  
  // Object
  { value: 'has_property', label: 'has property', requiresRightOperand: true, supportedTypes: ['object'] },
  { value: 'not_has_property', label: 'does not have property', requiresRightOperand: true, supportedTypes: ['object'] },
];

export const DATA_TYPES: { value: ConditionDataType; label: string; icon: string }[] = [
  { value: 'string', label: 'String', icon: 'T' },
  { value: 'number', label: 'Number', icon: '#' },
  { value: 'boolean', label: 'Boolean', icon: '✓' },
  { value: 'date_time', label: 'Date & Time', icon: '📅' },
  { value: 'array', label: 'Array', icon: '[]' },
  { value: 'object', label: 'Object', icon: '{}' },
];

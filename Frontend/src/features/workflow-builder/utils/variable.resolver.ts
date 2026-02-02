/**
 * Variable Resolver
 * Phase 4 Part 3 - Variable System
 * 
 * Resolve variable values from context
 */

import { VariableContext, VariableReference, ExpressionResult } from '../types/variable.types';
import { parseVariableReferences } from './variable.parser';
import { applyTransformation } from './variable.transformations';

/**
 * Resolve a variable path to its value
 */
export function resolveVariablePath(
  path: string,
  context: VariableContext
): any {
  const parts = path.split('.');

  // Start with combined context
  const combinedContext = {
    ...context.globalVariables,
    ...context.variables,
    ...context.stepOutputs,
  };

  // Navigate through nested properties
  let value: any = combinedContext;
  
  for (const part of parts) {
    if (value === null || value === undefined) {
      return undefined;
    }

    // Handle array indexing (e.g., items[0])
    const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, arrayName, index] = arrayMatch;
      value = value[arrayName];
      if (Array.isArray(value)) {
        value = value[parseInt(index, 10)];
      } else {
        return undefined;
      }
    } else {
      value = value[part];
    }
  }

  return value;
}

/**
 * Resolve a variable reference (with transformations)
 */
export function resolveVariableReference(
  reference: VariableReference,
  context: VariableContext
): any {
  // Get base value
  let value = resolveVariablePath(reference.path, context);

  // Apply transformations
  if (reference.transformations && reference.transformations.length > 0) {
    for (const transform of reference.transformations) {
      value = applyTransformation(transform, value);
    }
  }

  return value;
}

/**
 * Resolve all variables in a string
 */
export function resolveVariablesInString(
  text: string,
  context: VariableContext
): string {
  if (!text) return text;

  const references = parseVariableReferences(text);
  let result = text;

  for (const ref of references) {
    const value = resolveVariableReference(ref, context);
    const stringValue = stringifyValue(value);
    result = result.replace(ref.raw, stringValue);
  }

  return result;
}

/**
 * Resolve variables in any value (string, object, array)
 */
export function resolveVariables(
  value: any,
  context: VariableContext
): any {
  if (value === null || value === undefined) {
    return value;
  }

  // String: resolve variable references
  if (typeof value === 'string') {
    return resolveVariablesInString(value, context);
  }

  // Array: resolve each element
  if (Array.isArray(value)) {
    return value.map(item => resolveVariables(item, context));
  }

  // Object: resolve each property
  if (typeof value === 'object') {
    const resolved: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      resolved[key] = resolveVariables(val, context);
    }
    return resolved;
  }

  // Other types: return as-is
  return value;
}

/**
 * Check if all variables in text can be resolved
 */
export function canResolveAllVariables(
  text: string,
  context: VariableContext
): boolean {
  const references = parseVariableReferences(text);

  for (const ref of references) {
    const value = resolveVariablePath(ref.path, context);
    if (value === undefined) {
      return false;
    }
  }

  return true;
}

/**
 * Get all unresolved variable paths in text
 */
export function getUnresolvedVariables(
  text: string,
  context: VariableContext
): string[] {
  const references = parseVariableReferences(text);
  const unresolved: string[] = [];

  for (const ref of references) {
    const value = resolveVariablePath(ref.path, context);
    if (value === undefined) {
      unresolved.push(ref.path);
    }
  }

  return unresolved;
}

/**
 * Evaluate a simple expression with variables
 */
export function evaluateExpression(
  expression: string,
  context: VariableContext
): ExpressionResult {
  try {
    // First resolve all variables
    const resolved = resolveVariablesInString(expression, context);

    // Try to evaluate as JavaScript expression
    // Note: This is a simple eval - in production, use a safe expression parser
    const result = evaluateSimpleExpression(resolved);

    return {
      success: true,
      value: result,
      variables: parseVariableReferences(expression).map(ref => ref.path),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      variables: parseVariableReferences(expression).map(ref => ref.path),
    };
  }
}

/**
 * Safely evaluate a simple expression (numbers, strings, basic operators)
 */
function evaluateSimpleExpression(expr: string): any {
  // Remove whitespace
  const trimmed = expr.trim();

  // Try to parse as number
  const num = parseFloat(trimmed);
  if (!isNaN(num) && trimmed === num.toString()) {
    return num;
  }

  // Try to parse as boolean
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;

  // Try to parse as string (remove quotes)
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1);
  }

  // For safety, only allow simple mathematical expressions
  // This is a simplified version - use a proper expression parser in production
  const mathPattern = /^[\d\s+\-*/().]+$/;
  if (mathPattern.test(trimmed)) {
    try {
      // Use Function constructor instead of eval for better safety
      return new Function(`return ${trimmed}`)();
    } catch {
      return trimmed;
    }
  }

  // Return as string if can't parse
  return trimmed;
}

/**
 * Convert value to string for replacement
 */
function stringifyValue(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value.toString();
  if (value instanceof Date) return value.toISOString();
  
  // For objects and arrays, use JSON
  try {
    return JSON.stringify(value);
  } catch {
    return '[Object]';
  }
}

/**
 * Preview variable resolution (without actually resolving)
 */
export function previewVariableResolution(
  text: string,
  context: VariableContext
): {
  original: string;
  resolved: string;
  variables: Array<{ path: string; value: any; resolved: boolean }>;
} {
  const references = parseVariableReferences(text);
  const variables = references.map(ref => ({
    path: ref.path,
    value: resolveVariablePath(ref.path, context),
    resolved: resolveVariablePath(ref.path, context) !== undefined,
  }));

  const resolved = resolveVariablesInString(text, context);

  return {
    original: text,
    resolved,
    variables,
  };
}

/**
 * Get available variable paths from context
 */
export function getAvailableVariables(context: VariableContext): string[] {
  const paths: string[] = [];

  const addPaths = (obj: any, prefix: string = '') => {
    if (obj === null || obj === undefined) return;

    if (typeof obj !== 'object') {
      if (prefix) paths.push(prefix);
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;
      
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively add nested paths
        addPaths(value, path);
      } else {
        paths.push(path);
      }
    }
  };

  // Add from all context sources
  addPaths(context.globalVariables, 'global');
  addPaths(context.variables);
  addPaths(context.stepOutputs);

  return paths;
}

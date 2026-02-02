/**
 * Variable Parser
 * Phase 4 Part 3 - Variable System
 * 
 * Parse and extract variable references from strings
 */

import { VariableReference } from '../types/variable.types';

/**
 * Variable reference patterns
 * Supports: {{variable}}, {{step.field}}, {{trigger.data.email}}, etc.
 */
const VARIABLE_PATTERN = /\{\{([^}]+)\}\}/g;
const TRANSFORMATION_PATTERN = /\|([a-zA-Z_][a-zA-Z0-9_]*)/g;

/**
 * Parse variable references from a string
 */
export function parseVariableReferences(text: string): VariableReference[] {
  const references: VariableReference[] = [];
  const matches = text.matchAll(VARIABLE_PATTERN);

  for (const match of matches) {
    const raw = match[0];
    const content = match[1].trim();

    // Split by pipe to separate path and transformations
    const parts = content.split('|').map(p => p.trim());
    const path = parts[0];
    const transformations = parts.slice(1);

    // Split path into parts
    const pathParts = path.split('.').map(p => p.trim());

    references.push({
      raw,
      path,
      parts: pathParts,
      transformations: transformations.length > 0 ? transformations : undefined,
    });
  }

  return references;
}

/**
 * Check if string contains variable references
 */
export function hasVariableReferences(text: string): boolean {
  return VARIABLE_PATTERN.test(text);
}

/**
 * Extract all unique variable paths from text
 */
export function extractVariablePaths(text: string): string[] {
  const references = parseVariableReferences(text);
  const paths = new Set(references.map(ref => ref.path));
  return Array.from(paths);
}

/**
 * Build variable reference string
 */
export function buildVariableReference(
  path: string,
  transformations?: string[]
): string {
  let reference = `{{${path}}}`;
  
  if (transformations && transformations.length > 0) {
    const transforms = transformations.join('|');
    reference = `{{${path}|${transforms}}}`;
  }

  return reference;
}

/**
 * Validate variable path format
 */
export function isValidVariablePath(path: string): boolean {
  // Must not be empty
  if (!path || path.trim() === '') return false;

  // Must contain only valid characters
  const validPattern = /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/;
  return validPattern.test(path.trim());
}

/**
 * Get variable name from path (last part)
 */
export function getVariableName(path: string): string {
  const parts = path.split('.');
  return parts[parts.length - 1];
}

/**
 * Get variable source from path (first part)
 */
export function getVariableSource(path: string): string {
  const parts = path.split('.');
  return parts[0];
}

/**
 * Check if path is nested (has dots)
 */
export function isNestedPath(path: string): boolean {
  return path.includes('.');
}

/**
 * Split nested path into parent and child
 */
export function splitNestedPath(path: string): { parent: string; child: string } {
  const lastDot = path.lastIndexOf('.');
  
  if (lastDot === -1) {
    return { parent: '', child: path };
  }

  return {
    parent: path.substring(0, lastDot),
    child: path.substring(lastDot + 1),
  };
}

/**
 * Escape variable reference for use in regex
 */
export function escapeVariableReference(reference: string): string {
  return reference.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find variable references at cursor position
 */
export function findVariableAtCursor(
  text: string,
  cursorPosition: number
): VariableReference | null {
  const references = parseVariableReferences(text);

  for (const ref of references) {
    const start = text.indexOf(ref.raw);
    const end = start + ref.raw.length;

    if (cursorPosition >= start && cursorPosition <= end) {
      return ref;
    }
  }

  return null;
}

/**
 * Replace variable reference in text
 */
export function replaceVariableReference(
  text: string,
  oldReference: string,
  newReference: string
): string {
  const escaped = escapeVariableReference(oldReference);
  const regex = new RegExp(escaped, 'g');
  return text.replace(regex, newReference);
}

/**
 * Get all transformations from text
 */
export function extractTransformations(text: string): string[] {
  const transformations = new Set<string>();
  const matches = text.matchAll(TRANSFORMATION_PATTERN);

  for (const match of matches) {
    transformations.add(match[1]);
  }

  return Array.from(transformations);
}

/**
 * Validate variable reference format
 */
export function validateVariableReference(reference: string): {
  isValid: boolean;
  error?: string;
} {
  // Must start with {{ and end with }}
  if (!reference.startsWith('{{') || !reference.endsWith('}}')) {
    return {
      isValid: false,
      error: 'Variable reference must be wrapped in {{ }}',
    };
  }

  // Extract content
  const content = reference.slice(2, -2).trim();

  if (!content) {
    return {
      isValid: false,
      error: 'Variable reference cannot be empty',
    };
  }

  // Split by pipe
  const parts = content.split('|');
  const path = parts[0].trim();

  // Validate path
  if (!isValidVariablePath(path)) {
    return {
      isValid: false,
      error: 'Invalid variable path format',
    };
  }

  return { isValid: true };
}

/**
 * Normalize variable path (remove extra spaces, dots, etc.)
 */
export function normalizeVariablePath(path: string): string {
  return path
    .trim()
    .split('.')
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .join('.');
}

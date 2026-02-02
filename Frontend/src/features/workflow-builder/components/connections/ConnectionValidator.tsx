/**
 * Connection Validator Component
 * Validates data type compatibility between nodes (n8n-style)
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

export interface ConnectionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface NodeDataType {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
  schema?: Record<string, any>;
  required?: string[];
}

export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  fromPort: string;
  toPort: string;
}

/**
 * Validate data type compatibility between two nodes
 */
export function validateConnection(
  fromNodeType: NodeDataType,
  toNodeType: NodeDataType,
  connection: Connection
): ConnectionValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Type compatibility check
  if (fromNodeType.type !== 'any' && toNodeType.type !== 'any') {
    if (fromNodeType.type !== toNodeType.type) {
      // Check for compatible types
      const compatibleTypes: Record<string, string[]> = {
        number: ['string'], // Can convert string to number
        string: ['number', 'boolean'], // Can convert number/boolean to string
        boolean: ['string', 'number'], // Can convert string/number to boolean
        array: ['object'], // Array is a type of object
      };

      const compatible = compatibleTypes[fromNodeType.type]?.includes(toNodeType.type);
      
      if (!compatible) {
        errors.push(
          `Type mismatch: ${fromNodeType.type} cannot be connected to ${toNodeType.type}`
        );
      } else {
        warnings.push(
          `Type conversion required: ${fromNodeType.type} will be converted to ${toNodeType.type}`
        );
        suggestions.push(
          `Consider adding a data transformation node between these nodes for explicit conversion`
        );
      }
    }
  }

  // Schema validation for objects
  if (fromNodeType.type === 'object' && toNodeType.type === 'object') {
    if (fromNodeType.schema && toNodeType.schema) {
      const fromKeys = Object.keys(fromNodeType.schema);
      const toRequired = toNodeType.required || [];
      
      // Check if required fields are present
      toRequired.forEach((requiredField) => {
        if (!fromKeys.includes(requiredField)) {
          errors.push(
            `Missing required field: "${requiredField}" is required by target node but not provided by source node`
          );
        }
      });

      // Check for unused fields
      const unusedFields = fromKeys.filter((key) => !Object.keys(toNodeType.schema).includes(key));
      if (unusedFields.length > 0) {
        warnings.push(
          `Unused fields: ${unusedFields.join(', ')} will be ignored by target node`
        );
      }
    }
  }

  // Array validation
  if (fromNodeType.type === 'array' && toNodeType.type !== 'array' && toNodeType.type !== 'any') {
    warnings.push(
      'Array data will be processed item by item. Consider using a loop or map node.'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Connection Validator UI Component
 */
interface ConnectionValidatorProps {
  validation: ConnectionValidationResult;
  connection: Connection;
  showDetails?: boolean;
}

export function ConnectionValidator({
  validation,
  connection,
  showDetails = false,
}: ConnectionValidatorProps) {
  const { theme } = useTheme();

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const bgError = theme === 'dark' ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200';
  const bgWarning = theme === 'dark' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200';
  const bgSuccess = theme === 'dark' ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200';

  if (!showDetails && validation.isValid && validation.warnings.length === 0) {
    return (
      <div className="inline-flex items-center gap-1 text-green-400">
        <CheckCircle2 className="h-3 w-3" />
      </div>
    );
  }

  return (
    <div className={`${bgCard} rounded-lg border ${borderColor} p-3 min-w-[300px]`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        {validation.isValid ? (
          <CheckCircle2 className="h-4 w-4 text-green-400" />
        ) : (
          <XCircle className="h-4 w-4 text-red-400" />
        )}
        <span className={`text-sm font-medium ${textPrimary}`}>
          Connection Validation
        </span>
      </div>

      {/* Errors */}
      {validation.errors.length > 0 && (
        <div className={`rounded border ${bgError} p-2 mb-2`}>
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="h-3 w-3 text-red-400" />
            <span className="text-xs font-medium text-red-400">Errors</span>
          </div>
          <ul className="text-xs text-red-300 space-y-1 ml-5">
            {validation.errors.map((error, idx) => (
              <li key={idx}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <div className={`rounded border ${bgWarning} p-2 mb-2`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-3 w-3 text-yellow-400" />
            <span className="text-xs font-medium text-yellow-400">Warnings</span>
          </div>
          <ul className="text-xs text-yellow-300 space-y-1 ml-5">
            {validation.warnings.map((warning, idx) => (
              <li key={idx}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {validation.suggestions.length > 0 && (
        <div className={`rounded border ${bgSuccess} p-2`}>
          <div className="flex items-center gap-2 mb-1">
            <Info className="h-3 w-3 text-blue-400" />
            <span className="text-xs font-medium text-blue-400">Suggestions</span>
          </div>
          <ul className="text-xs text-blue-300 space-y-1 ml-5">
            {validation.suggestions.map((suggestion, idx) => (
              <li key={idx}>• {suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Message */}
      {validation.isValid && validation.warnings.length === 0 && (
        <div className={`text-xs ${textSecondary} text-center py-2`}>
          Connection is valid ✓
        </div>
      )}
    </div>
  );
}

/**
 * Inline validation indicator for connection lines
 */
interface ConnectionValidationIndicatorProps {
  validation: ConnectionValidationResult;
  position?: { x: number; y: number };
}

export function ConnectionValidationIndicator({
  validation,
  position,
}: ConnectionValidationIndicatorProps) {
  const { theme } = useTheme();

  if (validation.isValid && validation.warnings.length === 0) {
    return null;
  }

  const indicatorColor = validation.isValid ? 'text-yellow-400' : 'text-red-400';
  const IndicatorIcon = validation.isValid ? AlertTriangle : XCircle;

  return (
    <div
      className={`absolute ${indicatorColor} pointer-events-none`}
      style={{
        left: position?.x || 0,
        top: position?.y || 0,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="relative">
        <IndicatorIcon className="h-4 w-4 drop-shadow-lg" />
        <div className="absolute inset-0 animate-ping opacity-75">
          <IndicatorIcon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

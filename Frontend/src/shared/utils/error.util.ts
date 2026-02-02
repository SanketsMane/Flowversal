/**
 * Standardized Error Utilities
 * 
 * Provides consistent error handling and formatting across the frontend.
 */

import { ApiError, ValidationError } from '../types/api.types';

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface FrontendError extends Error {
  code?: string;
  statusCode?: number;
  details?: any;
  validation?: Array<{ field: string; message: string }>;
}

// ============================================================================
// ERROR PARSING
// ============================================================================

/**
 * Parse API error response
 */
export function parseApiError(error: any): FrontendError {
  // If it's already a FrontendError, return it
  if (error instanceof Error && 'code' in error) {
    return error as FrontendError;
  }

  // If it's an ApiError from backend
  if (error.error && error.message) {
    const apiError = error as ApiError;
    const frontendError = new Error(apiError.message) as FrontendError;
    frontendError.code = apiError.code;
    frontendError.statusCode = apiError.statusCode;
    frontendError.details = apiError.details;
    
    // Add validation errors if present
    if (apiError.error === 'Validation Error') {
      const validationError = apiError as ValidationError;
      frontendError.validation = validationError.validation;
    }
    
    return frontendError;
  }

  // If it's a network error
  if (error.message && error.message.includes('fetch')) {
    return {
      ...new Error('Network error. Please check your connection.'),
      code: 'NETWORK_ERROR',
      statusCode: 0,
    } as FrontendError;
  }

  // Default error
  return {
    ...new Error(error.message || 'An unexpected error occurred'),
    code: 'UNKNOWN_ERROR',
  } as FrontendError;
}

// ============================================================================
// ERROR MESSAGES
// ============================================================================

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  const parsedError = parseApiError(error);
  
  // Return validation errors as formatted string
  if (parsedError.validation && parsedError.validation.length > 0) {
    return parsedError.validation
      .map((v) => `${v.field}: ${v.message}`)
      .join(', ');
  }
  
  // Return error message
  return parsedError.message || 'An unexpected error occurred';
}

/**
 * Get error code
 */
export function getErrorCode(error: any): string | undefined {
  const parsedError = parseApiError(error);
  return parsedError.code;
}

// ============================================================================
// ERROR HANDLING HELPERS
// ============================================================================

/**
 * Check if error is a specific type
 */
export function isErrorType(error: any, code: string): boolean {
  const parsedError = parseApiError(error);
  return parsedError.code === code;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: any): boolean {
  return isErrorType(error, 'VALIDATION_ERROR');
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  return isErrorType(error, 'NETWORK_ERROR');
}

/**
 * Check if error is unauthorized
 */
export function isUnauthorizedError(error: any): boolean {
  return isErrorType(error, 'UNAUTHORIZED');
}

// ============================================================================
// ERROR LOGGING
// ============================================================================

/**
 * Log error with context
 */
export function logError(error: any, context?: string): void {
  const parsedError = parseApiError(error);
  const prefix = context ? `[${context}]` : '[Error]';
  
  console.error(`${prefix} ${parsedError.message}`, {
    code: parsedError.code,
    statusCode: parsedError.statusCode,
    details: parsedError.details,
    validation: parsedError.validation,
    stack: parsedError.stack,
  });
}

// ============================================================================
// USER-FRIENDLY ERROR MESSAGES
// ============================================================================

const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'You are not authorized to perform this action. Please log in.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again later.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again.',
};

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: any): string {
  const code = getErrorCode(error);
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }
  
  return getErrorMessage(error);
}


/**
 * Standardized Error Utilities
 * 
 * Provides consistent error handling and formatting across the backend.
 */

import { FastifyReply } from 'fastify';
import { ApiError, ValidationError } from '../types/api.types';

// ============================================================================
// ERROR CODES
// ============================================================================

export enum ErrorCode {
  // Authentication
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

// ============================================================================
// ERROR CREATION
// ============================================================================

/**
 * Create standardized error response
 */
export function createError(
  error: string,
  message: string,
  code?: ErrorCode,
  details?: any,
  statusCode: number = 500
): ApiError {
  return {
    error,
    message,
    code: code || ErrorCode.INTERNAL_ERROR,
    details,
    statusCode,
  };
}

/**
 * Create validation error
 */
export function createValidationError(
  message: string,
  validation?: Array<{ field: string; message: string }>
): ValidationError {
  return {
    error: 'Validation Error',
    message,
    code: ErrorCode.VALIDATION_ERROR,
    validation,
    statusCode: 400,
  };
}

/**
 * Create not found error
 */
export function createNotFoundError(resource: string, id?: string): ApiError {
  return createError(
    'Not Found',
    id ? `${resource} with id '${id}' not found` : `${resource} not found`,
    ErrorCode.NOT_FOUND,
    { resource, id },
    404
  );
}

/**
 * Create unauthorized error
 */
export function createUnauthorizedError(message: string = 'Unauthorized'): ApiError {
  return createError(
    'Unauthorized',
    message,
    ErrorCode.UNAUTHORIZED,
    undefined,
    401
  );
}

/**
 * Create forbidden error
 */
export function createForbiddenError(message: string = 'Forbidden'): ApiError {
  return createError(
    'Forbidden',
    message,
    ErrorCode.FORBIDDEN,
    undefined,
    403
  );
}

// ============================================================================
// ERROR RESPONSE HELPERS
// ============================================================================

/**
 * Send error response
 */
export function sendError(reply: FastifyReply, error: ApiError): void {
  reply.code(error.statusCode || 500).send({
    success: false,
    ...error,
  });
}

/**
 * Send validation error response
 */
export function sendValidationError(
  reply: FastifyReply,
  message: string,
  validation?: Array<{ field: string; message: string }>
): void {
  const error = createValidationError(message, validation);
  sendError(reply, error);
}

/**
 * Send not found error response
 */
export function sendNotFoundError(
  reply: FastifyReply,
  resource: string,
  id?: string
): void {
  const error = createNotFoundError(resource, id);
  sendError(reply, error);
}

/**
 * Send unauthorized error response
 */
export function sendUnauthorizedError(
  reply: FastifyReply,
  message: string = 'Unauthorized'
): void {
  const error = createUnauthorizedError(message);
  sendError(reply, error);
}

/**
 * Send forbidden error response
 */
export function sendForbiddenError(
  reply: FastifyReply,
  message: string = 'Forbidden'
): void {
  const error = createForbiddenError(message);
  sendError(reply, error);
}

// ============================================================================
// ERROR HANDLING WRAPPER
// ============================================================================

/**
 * Wrap async route handler with error handling
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<any>
) {
  return async (...args: T) => {
    try {
      return await handler(...args);
    } catch (error: any) {
      const reply = args[args.length - 1] as FastifyReply;
      
      // If error is already an ApiError, send it
      if (error.error && error.message) {
        return sendError(reply, error);
      }
      
      // Otherwise, create internal error
      const apiError = createError(
        'Internal Server Error',
        error.message || 'An unexpected error occurred',
        ErrorCode.INTERNAL_ERROR,
        process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined,
        500
      );
      
      return sendError(reply, apiError);
    }
  };
}


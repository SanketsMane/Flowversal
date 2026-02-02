/**
 * Error Handling Utilities
 * Centralized error handling for API calls and workflow operations
 */

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class WorkflowError extends Error {
  code: string;
  status?: number;
  details?: any;

  constructor(message: string, code: string = 'WORKFLOW_ERROR', status?: number, details?: any) {
    super(message);
    this.name = 'WorkflowError';
    this.code = code;
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, WorkflowError.prototype);
  }
}

export class ExecutionError extends Error {
  code: string;
  executionId?: string;
  step?: string;
  details?: any;

  constructor(
    message: string,
    code: string = 'EXECUTION_ERROR',
    executionId?: string,
    step?: string,
    details?: any
  ) {
    super(message);
    this.name = 'ExecutionError';
    this.code = code;
    this.executionId = executionId;
    this.step = step;
    this.details = details;
    Object.setPrototypeOf(this, ExecutionError.prototype);
  }
}

/**
 * Parse API error response
 */
export function parseApiError(error: any, defaultMessage: string = 'An error occurred'): ApiError {
  // If it's already an ApiError, return it
  if (error && typeof error === 'object' && 'message' in error && 'code' in error) {
    return error as ApiError;
  }

  // If it's a WorkflowError or ExecutionError, convert it
  if (error instanceof WorkflowError || error instanceof ExecutionError) {
    return {
      message: error.message,
      code: error.code,
      status: 'status' in error ? error.status : undefined,
      details: 'details' in error ? error.details : undefined,
    };
  }

  // If it's a standard Error
  if (error instanceof Error) {
    return {
      message: error.message || defaultMessage,
      code: 'UNKNOWN_ERROR',
    };
  }

  // If it's a string
  if (typeof error === 'string') {
    return {
      message: error,
      code: 'UNKNOWN_ERROR',
    };
  }

  // If it's an object with error property
  if (error && typeof error === 'object') {
    return {
      message: error.message || error.error || defaultMessage,
      code: error.code || 'UNKNOWN_ERROR',
      status: error.status,
      details: error.details || error,
    };
  }

  // Fallback
  return {
    message: defaultMessage,
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Handle API response errors
 */
export async function handleApiResponse<T>(
  response: Response,
  defaultError: string = 'Request failed'
): Promise<{ success: boolean; data?: T; error?: ApiError }> {
  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: response.statusText || defaultError };
    }

    const error: ApiError = {
      message: errorData.message || errorData.error || defaultError,
      code: errorData.code || `HTTP_${response.status}`,
      status: response.status,
      details: errorData,
    };

    return { success: false, error };
  }

  try {
    const data = await response.json();
    return {
      success: data.success !== false, // Default to true if not specified
      data: data.data || data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: 'Failed to parse response',
        code: 'PARSE_ERROR',
        details: error,
      },
    };
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    retryable?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryable = () => true,
  } = options;

  let lastError: any;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry if it's the last attempt or error is not retryable
      if (attempt === maxRetries || !retryable(error)) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Increase delay for next retry (exponential backoff)
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Check if error is network-related
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
    return true;
  }

  return false;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  if (!error) return false;

  // Network errors are retryable
  if (isNetworkError(error)) {
    return true;
  }

  // 5xx server errors are retryable
  if (error.status && error.status >= 500 && error.status < 600) {
    return true;
  }

  // 429 Too Many Requests is retryable
  if (error.status === 429) {
    return true;
  }

  // 408 Request Timeout is retryable
  if (error.status === 408) {
    return true;
  }

  return false;
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error: any, defaultMessage: string = 'An error occurred'): string {
  const apiError = parseApiError(error, defaultMessage);

  // User-friendly error messages
  const errorMessages: Record<string, string> = {
    NETWORK_ERROR: 'Network error: Please check your internet connection',
    UNAUTHORIZED: 'Authentication required: Please log in',
    FORBIDDEN: 'Access denied: You don\'t have permission to perform this action',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Invalid input: Please check your data',
    TIMEOUT: 'Request timeout: Please try again',
    SERVER_ERROR: 'Server error: Please try again later',
  };

  // Check for specific error codes
  if (apiError.code && errorMessages[apiError.code]) {
    return errorMessages[apiError.code];
  }

  // Check for HTTP status codes
  if (apiError.status) {
    switch (apiError.status) {
      case 401:
        return errorMessages.UNAUTHORIZED;
      case 403:
        return errorMessages.FORBIDDEN;
      case 404:
        return errorMessages.NOT_FOUND;
      case 408:
        return errorMessages.TIMEOUT;
      case 422:
        return errorMessages.VALIDATION_ERROR;
      case 429:
        return 'Too many requests: Please wait a moment and try again';
      case 500:
      case 502:
      case 503:
        return errorMessages.SERVER_ERROR;
    }
  }

  // Return the error message
  return apiError.message || defaultMessage;
}


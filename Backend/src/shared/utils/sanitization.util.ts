import validator from 'validator';

/**
 * Sanitize HTML input to prevent XSS attacks
 * Note: DOMPurify is a browser library, so we use validator for server-side sanitization
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags and encode special characters
  return validator.escape(input.trim());
}

/**
 * Sanitize SQL input to prevent SQL injection
 */
export function sanitizeSqlInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove potentially dangerous characters
  return input.replace(/['";\\]/g, '').trim();
}

/**
 * Validate and sanitize email address
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  return validator.isEmail(email, {
    allow_utf8_local_part: false,
    require_tld: true,
  });
}

/**
 * Validate and sanitize URL
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
  });
}

/**
 * Sanitize user input string
 */
export function sanitizeString(input: string, options?: { maxLength?: number; allowHtml?: boolean }): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  if (!options?.allowHtml) {
    sanitized = sanitizeHtml(sanitized);
  }

  if (options?.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  return sanitized;
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T, options?: { maxDepth?: number }): T {
  const maxDepth = options?.maxDepth || 10;

  function sanitizeRecursive(value: any, depth: number): any {
    if (depth > maxDepth) {
      return value;
    }

    if (typeof value === 'string') {
      return sanitizeString(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => sanitizeRecursive(item, depth + 1));
    }

    if (value && typeof value === 'object') {
      const sanitized: any = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          sanitized[key] = sanitizeRecursive(value[key], depth + 1);
        }
      }
      return sanitized;
    }

    return value;
  }

  return sanitizeRecursive(obj, 0) as T;
}

/**
 * Validate MongoDB ObjectId format
 */
export function validateObjectId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }

  return validator.isMongoId(id);
}


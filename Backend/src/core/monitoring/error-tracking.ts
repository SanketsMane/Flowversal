import * as Sentry from '@sentry/node';
import { env } from '../config/env';
import { logger } from '../../shared/utils/logger.util';

/**
 * Initialize Sentry error tracking
 */
export function initializeErrorTracking(): void {
  if (!env.SENTRY_DSN) {
    logger.warn('Sentry DSN not configured, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Integrations are automatically included in newer Sentry versions
    // Manual configuration is only needed for custom behavior
    beforeSend(event, hint) {
      // Filter out sensitive information
      if (event.request) {
        if (event.request.headers) {
          const headers = event.request.headers as Record<string, any>;
          delete headers.authorization;
          delete headers.cookie;
        }
        if (event.request.data && typeof event.request.data === 'object' && event.request.data !== null) {
          // Remove sensitive fields from request data
          const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
          const data = event.request.data as Record<string, any>;
          sensitiveFields.forEach((field) => {
            if (data[field]) {
              data[field] = '[REDACTED]';
            }
          });
        }
      }
      return event;
    },
  });

  logger.info('Sentry error tracking initialized');
}

/**
 * Capture an error with context
 */
export function captureError(error: Error, context?: Record<string, any>): void {
  if (!env.SENTRY_DSN) {
    logger.error('Error occurred (Sentry not configured)', error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
    tags: {
      component: context?.component || 'unknown',
    },
  });

  logger.error('Error captured by Sentry', error, context);
}

/**
 * Capture a message with context
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>): void {
  if (!env.SENTRY_DSN) {
    logger.info(message, context);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>): void {
  if (!env.SENTRY_DSN) {
    return;
  }

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email?: string, username?: string): void {
  if (!env.SENTRY_DSN) {
    return;
  }

  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

/**
 * Clear user context
 */
export function clearUserContext(): void {
  if (!env.SENTRY_DSN) {
    return;
  }

  Sentry.setUser(null);
}


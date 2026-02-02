/**
 * Structured Logging Utility
 * Replaces console.log with Fastify's structured logger
 */

import { FastifyLoggerInstance } from 'fastify';

let loggerInstance: FastifyLoggerInstance | null = null;

/**
 * Initialize logger instance
 */
export function setLogger(logger: FastifyLoggerInstance) {
  loggerInstance = logger;
}

/**
 * Get logger instance
 */
function getLogger(): FastifyLoggerInstance {
  if (!loggerInstance) {
    // Fallback to console if logger not initialized
    return {
      info: console.log.bind(console),
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      debug: console.debug.bind(console),
      trace: console.trace.bind(console),
      fatal: console.error.bind(console),
    } as FastifyLoggerInstance;
  }
  return loggerInstance;
}

/**
 * Structured logging functions
 */
export const logger = {
  info: (message: string, data?: any) => {
    getLogger().info(data ? { msg: message, ...data } : message);
  },
  error: (message: string, error?: Error | any, data?: any) => {
    const logData: any = data || {};
    if (error) {
      if (error instanceof Error) {
        logData.error = {
          message: error.message,
          stack: error.stack,
          name: error.name,
        };
      } else {
        logData.error = error;
      }
    }
    getLogger().error({ msg: message, ...logData });
  },
  warn: (message: string, data?: any) => {
    getLogger().warn(data ? { msg: message, ...data } : message);
  },
  debug: (message: string, data?: any) => {
    getLogger().debug(data ? { msg: message, ...data } : message);
  },
  trace: (message: string, data?: any) => {
    getLogger().trace(data ? { msg: message, ...data } : message);
  },
  fatal: (message: string, error?: Error | any, data?: any) => {
    const logData: any = data || {};
    if (error) {
      if (error instanceof Error) {
        logData.error = {
          message: error.message,
          stack: error.stack,
          name: error.name,
        };
      } else {
        logData.error = error;
      }
    }
    getLogger().fatal({ msg: message, ...logData });
  },
};


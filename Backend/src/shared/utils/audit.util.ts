import { logger } from './logger.util';

export interface AuditEvent {
  actorId?: string;
  action: string;
  target?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  timestamp?: string;
}

/**
 * Minimal audit logger (console/logger sink).
 * Extend later to persist to DB or SIEM.
 */
export function audit(event: AuditEvent) {
  const payload = {
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  };
  logger.info('[AUDIT]', { audit: payload });
}


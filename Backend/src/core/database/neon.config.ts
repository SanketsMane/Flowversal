// Author: Sanket
// Neon PostgreSQL connection configuration using Drizzle ORM

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { logger } from '../../shared/utils/logger.util';
import { env } from '../config/env';
import * as schema from './schema/auth.schema';

/**
 * Neon database connection
 * Uses HTTP fetch for serverless environments
 */
export class NeonDatabase {
  private static instance: ReturnType<typeof drizzle> | null = null;

  static getClient() {
    if (!this.instance) {
      if (!env.NEON_DATABASE_URL) {
        if (process.env.NODE_ENV === 'test') {
          logger.warn('NEON_DATABASE_URL not configured, returning mock client for tests');
          // Return a dummy object that mimics Drizzle client structure sufficient to prevent crashes on load
          this.instance = {
            select: () => ({ from: () => ({ where: () => ({ limit: () => [] }) }) }),
            insert: () => ({ values: () => ({ returning: () => [{ id: 'test-user-id', email: 'test@example.com', created_at: new Date().toISOString() }] }) }),
            update: () => ({ set: () => ({ where: () => [{ id: 'test-user-id', email: 'test@example.com' }] }) }),
            delete: () => ({ where: () => [] }),
            execute: () => Promise.resolve([{ count: 1 }]),
          } as any;
          return this.instance;
        }
        logger.warn('NEON_DATABASE_URL not configured, Neon features disabled');
        throw new Error('Neon database URL not configured');
      }

      try {
        const sql = neon(env.NEON_DATABASE_URL);
        this.instance = drizzle(sql, { schema });
        logger.info('Neon database connected successfully');
      } catch (error: any) {
        logger.error('Failed to connect to Neon database', error);
        throw error;
      }
    }

    return this.instance;
  }

  /**
   * Health check - verifies database connectivity
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const db = this.getClient();
      
      if (!db) {
        logger.warn('Neon database client not initialized');
        return false;
      }

      // Simple query to test connection
      await db.execute('SELECT 1');
      return true;
    } catch (error: any) {
      logger.error('Neon health check failed', error);
      return false;
    }
  }
}

// Export singleton instance
export const neonDb = NeonDatabase.getClient();

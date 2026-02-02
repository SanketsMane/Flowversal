import { breakpointService } from '../../../modules/workflows/services/breakpoint.service';
import { logger } from '../../../shared/utils/logger.util';
import { inngest } from './inngest.client';

/**
 * Scheduled job to clean up expired breakpoints
 * Runs every 15 minutes to remove timed-out breakpoints
 */
export const cleanupExpiredBreakpoints = inngest.createFunction(
  {
    id: 'cleanup-expired-breakpoints',
    name: 'Cleanup Expired Breakpoints',
  },
  { cron: '*/15 * * * *' }, // Every 15 minutes
  async ({ step }) => {
    logger.info('Starting expired breakpoints cleanup job');

    try {
      // Step 1: Clean up expired breakpoints
      const cleanedCount = await breakpointService.cleanupExpiredBreakpoints();

      // Step 2: Log the results
      await step.run('log-results', async () => {
        logger.info('Expired breakpoints cleanup completed', {
          cleanedCount,
          timestamp: new Date().toISOString(),
        });

        return {
          cleanedCount,
          timestamp: new Date().toISOString(),
        };
      });

      return {
        success: true,
        cleanedCount,
        message: `Successfully cleaned up ${cleanedCount} expired breakpoints`,
      };

    } catch (error: any) {
      logger.error('Failed to cleanup expired breakpoints', {
        error: error.message,
        stack: error.stack,
      });

      // Send notification about the failure (could be email, Slack, etc.)
      await step.run('notify-failure', async () => {
        // In a real implementation, you might send an email or Slack notification
        logger.warn('Expired breakpoints cleanup job failed', { error: error.message });
      });

      throw error;
    }
  }
);

/**
 * Manual trigger for cleaning up expired breakpoints
 * Useful for testing or immediate cleanup
 */
export const cleanupExpiredBreakpointsManual = inngest.createFunction(
  {
    id: 'cleanup-expired-breakpoints-manual',
    name: 'Cleanup Expired Breakpoints (Manual)',
  },
  { event: 'breakpoints/cleanup-expired' },
  async ({ step, event }) => {
    logger.info('Manual expired breakpoints cleanup triggered', { event });

    try {
      const cleanedCount = await breakpointService.cleanupExpiredBreakpoints();

      logger.info('Manual expired breakpoints cleanup completed', {
        cleanedCount,
        triggeredBy: event.user?.email || 'system',
      });

      return {
        success: true,
        cleanedCount,
        message: `Manually cleaned up ${cleanedCount} expired breakpoints`,
      };

    } catch (error: any) {
      logger.error('Manual expired breakpoints cleanup failed', {
        error: error.message,
        event,
      });

      throw error;
    }
  }
);
import { humanApprovalService } from '../../../modules/workflows/services/human-approval.service';
import { logger } from '../../../shared/utils/logger.util';
import { inngest } from './inngest.client';

/**
 * Scheduled job to handle expired human approval requests
 * Runs every 30 minutes to clean up timed-out approvals
 */
export const handleExpiredApprovals = inngest.createFunction(
  {
    id: 'handle-expired-approvals',
    name: 'Handle Expired Approvals',
  },
  { cron: '*/30 * * * *' }, // Every 30 minutes
  async ({ step }) => {
    logger.info('Starting expired approvals cleanup job');

    try {
      // Step 1: Handle expired approvals
      const handledCount = await humanApprovalService.handleExpiredApprovals();

      // Step 2: Log the results
      await step.run('log-results', async () => {
        logger.info('Expired approvals cleanup completed', {
          handledCount,
          timestamp: new Date().toISOString(),
        });

        return {
          handledCount,
          timestamp: new Date().toISOString(),
        };
      });

      return {
        success: true,
        handledCount,
        message: `Successfully handled ${handledCount} expired approvals`,
      };

    } catch (error: any) {
      logger.error('Failed to handle expired approvals', {
        error: error.message,
        stack: error.stack,
      });

      // Send notification about the failure (could be email, Slack, etc.)
      await step.run('notify-failure', async () => {
        // In a real implementation, you might send an email or Slack notification
        logger.warn('Expired approvals job failed', { error: error.message });
      });

      throw error;
    }
  }
);

/**
 * Manual trigger for handling expired approvals
 * Useful for testing or immediate cleanup
 */
export const handleExpiredApprovalsManual = inngest.createFunction(
  {
    id: 'handle-expired-approvals-manual',
    name: 'Handle Expired Approvals (Manual)',
  },
  { event: 'approvals/handle-expired' },
  async ({ step, event }) => {
    logger.info('Manual expired approvals cleanup triggered', { event });

    try {
      const handledCount = await humanApprovalService.handleExpiredApprovals();

      logger.info('Manual expired approvals cleanup completed', {
        handledCount,
        triggeredBy: event.user?.email || 'system',
      });

      return {
        success: true,
        handledCount,
        message: `Manually handled ${handledCount} expired approvals`,
      };

    } catch (error: any) {
      logger.error('Manual expired approvals cleanup failed', {
        error: error.message,
        event,
      });

      throw error;
    }
  }
);
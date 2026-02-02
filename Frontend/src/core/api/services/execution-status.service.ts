/**
 * Execution Status Polling Service
 * Handles polling execution status and provides callbacks for updates
 */

import { ExecutionStatus, getExecutionStatus } from './workflow-execution.service';

// Re-export ExecutionStatus for convenience
export type { ExecutionStatus };

export interface StatusUpdateCallback {
  (status: ExecutionStatus): void;
}

export interface PollingOptions {
  interval?: number; // Polling interval in milliseconds (default: 1000)
  maxAttempts?: number; // Maximum polling attempts (default: 300 = 5 minutes)
  onUpdate?: StatusUpdateCallback;
  onComplete?: (status: ExecutionStatus) => void;
  onError?: (error: Error) => void;
}

export class ExecutionStatusService {
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private pollingAttempts: Map<string, number> = new Map();
  private accessToken?: string;

  /**
   * Set access token for API calls
   */
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  /**
   * Start polling execution status
   */
  startPolling(executionId: string, options: PollingOptions = {}): void {
    // Stop existing polling if any
    this.stopPolling(executionId);

    const {
      interval = 1000,
      maxAttempts = 300,
      onUpdate,
      onComplete,
      onError,
    } = options;

    let attempts = 0;

    const poll = async () => {
      attempts++;
      this.pollingAttempts.set(executionId, attempts);

      try {
        const result = await getExecutionStatus(executionId, this.accessToken);

        if (!result.success || !result.data) {
          if (onError) {
            onError(new Error(result.error || 'Failed to get execution status'));
          }
          this.stopPolling(executionId);
          return;
        }

        const status = result.data;

        // Call update callback
        if (onUpdate) {
          onUpdate(status);
        }

        // Check if execution is complete
        if (status.status === 'completed' || status.status === 'failed' || status.status === 'stopped') {
          this.stopPolling(executionId);
          if (onComplete) {
            onComplete(status);
          }
          return;
        }

        // Check max attempts
        if (attempts >= maxAttempts) {
          this.stopPolling(executionId);
          if (onError) {
            onError(new Error('Polling timeout: Maximum attempts reached'));
          }
          return;
        }

        // Schedule next poll
        const timeout = setTimeout(poll, interval);
        this.pollingIntervals.set(executionId, timeout);
      } catch (error: any) {
        this.stopPolling(executionId);
        if (onError) {
          onError(error instanceof Error ? error : new Error(error.message || 'Polling error'));
        }
      }
    };

    // Start polling immediately
    poll();
  }

  /**
   * Stop polling for an execution
   */
  stopPolling(executionId: string): void {
    const interval = this.pollingIntervals.get(executionId);
    if (interval) {
      clearTimeout(interval);
      this.pollingIntervals.delete(executionId);
    }
    this.pollingAttempts.delete(executionId);
  }

  /**
   * Stop all polling
   */
  stopAllPolling(): void {
    this.pollingIntervals.forEach((interval, executionId) => {
      clearTimeout(interval);
    });
    this.pollingIntervals.clear();
    this.pollingAttempts.clear();
  }

  /**
   * Get current polling attempts for an execution
   */
  getPollingAttempts(executionId: string): number {
    return this.pollingAttempts.get(executionId) || 0;
  }

  /**
   * Check if polling is active for an execution
   */
  isPolling(executionId: string): boolean {
    return this.pollingIntervals.has(executionId);
  }
}

// Singleton instance
export const executionStatusService = new ExecutionStatusService();


/**
 * Timeout Utility
 * Provides timeout functionality for async operations
 */

export interface TimeoutOptions {
  timeout: number; // in milliseconds
  errorMessage?: string;
}

/**
 * Execute a function with a timeout
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  options: TimeoutOptions
): Promise<T> {
  const { timeout, errorMessage = 'Operation timed out' } = options;

  return Promise.race([
    fn(),
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${errorMessage} (timeout: ${timeout}ms)`));
      }, timeout);
    }),
  ]);
}

/**
 * Create a timeout promise that can be cancelled
 */
export class CancellableTimeout {
  private timeoutId: NodeJS.Timeout | null = null;
  private reject: ((error: Error) => void) | null = null;

  constructor(timeout: number, errorMessage: string = 'Operation timed out') {
    this.timeoutId = setTimeout(() => {
      if (this.reject) {
        this.reject(new Error(`${errorMessage} (timeout: ${timeout}ms)`));
      }
    }, timeout);
  }

  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.reject = null;
  }

  getPromise(): Promise<never> {
    return new Promise<never>((_, reject) => {
      this.reject = reject;
    });
  }
}

/**
 * Execute with timeout and cancellation support
 */
export async function withCancellableTimeout<T>(
  fn: () => Promise<T>,
  timeout: number,
  errorMessage: string = 'Operation timed out'
): Promise<{ result: T; cancel: () => void }> {
  const timeoutHandler = new CancellableTimeout(timeout, errorMessage);

  const promise = Promise.race([
    fn().then((result) => {
      timeoutHandler.cancel();
      return result;
    }),
    timeoutHandler.getPromise(),
  ]) as Promise<T>;

  return {
    result: await promise,
    cancel: () => timeoutHandler.cancel(),
  };
}


/**
 * Workflow Execution Engine
 * Phase 4 Part 2 - Workflow Execution Engine
 * 
 * Core logic for executing workflows step-by-step
 */

import {
  ExecutionContext,
  ExecutionConfig,
  ExecutionLog,
  ExecutionStepResult,
  ExecutionStatus,
  ExecutionStepStatus,
  LogLevel,
  StepExecutor,
} from '../types/execution.types';

export class ExecutionEngine {
  private context: ExecutionContext | null = null;
  private config: ExecutionConfig = {};
  private executors: Map<string, StepExecutor> = new Map();
  private isPaused = false;
  private isStopped = false;
  private onStatusChange?: (status: ExecutionStatus) => void;
  private onStepComplete?: (result: ExecutionStepResult) => void;
  private onLog?: (log: ExecutionLog) => void;

  constructor() {
    this.initializeDefaultExecutors();
  }

  /**
   * Initialize default executors for common step types
   */
  private initializeDefaultExecutors() {
    // Trigger executor
    this.registerExecutor({
      id: 'trigger',
      name: 'Trigger',
      type: 'trigger',
      execute: async (input, context) => {
        this.log('info', 'Trigger executed', { input });
        return { triggered: true, timestamp: Date.now(), ...input };
      },
    });

    // Node executor
    this.registerExecutor({
      id: 'node',
      name: 'Node',
      type: 'node',
      execute: async (input, context) => {
        this.log('info', 'Node executed', { input });
        // Simulate processing
        await this.delay(500);
        return { processed: true, data: input };
      },
    });

    // Tool executor
    this.registerExecutor({
      id: 'tool',
      name: 'Tool',
      type: 'tool',
      execute: async (input, context) => {
        this.log('info', 'Tool executed', { input });
        // Simulate API call
        await this.delay(1000);
        return { result: 'success', data: input };
      },
    });

    // Condition executor
    this.registerExecutor({
      id: 'condition',
      name: 'Condition',
      type: 'condition',
      execute: async (input, context) => {
        this.log('info', 'Condition evaluated', { input });
        // Simple condition check
        const result = input?.value > 0;
        return { condition: result, branch: result ? 'true' : 'false' };
      },
    });
  }

  /**
   * Register a step executor
   */
  registerExecutor(executor: StepExecutor) {
    this.executors.set(executor.id, executor);
    this.log('debug', `Executor registered: ${executor.name}`, { executorId: executor.id });
  }

  /**
   * Start workflow execution
   */
  async start(
    workflowId: string,
    steps: StepExecutor[],
    config: ExecutionConfig = {}
  ): Promise<ExecutionContext> {
    this.config = { ...this.getDefaultConfig(), ...config };
    this.isPaused = false;
    this.isStopped = false;

    // Initialize execution context
    this.context = {
      workflowId,
      executionId: this.generateExecutionId(),
      startTime: Date.now(),
      status: 'running',
      currentStepIndex: 0,
      steps: [],
      logs: [],
      variables: { ...this.config.variables },
      errors: [],
    };

    this.updateStatus('running');
    this.log('info', `Workflow execution started: ${workflowId}`);

    try {
      // Execute all steps
      for (let i = 0; i < steps.length; i++) {
        if (this.isStopped) {
          this.updateStatus('stopped');
          break;
        }

        // Wait if paused
        while (this.isPaused && !this.isStopped) {
          await this.delay(100);
        }

        if (this.isStopped) break;

        this.context.currentStepIndex = i;
        const step = steps[i];

        // Check if step should be skipped
        if (step.shouldSkip?.(this.context)) {
          this.log('info', `Step skipped: ${step.name}`);
          this.addStepResult({
            stepId: step.id,
            stepName: step.name,
            status: 'skipped',
            startTime: Date.now(),
            endTime: Date.now(),
            duration: 0,
            logs: [],
          });
          continue;
        }

        // Execute step
        await this.executeStep(step);

        // Check for breakpoints
        if (this.config.breakpoints?.includes(step.id)) {
          this.log('info', `Breakpoint hit: ${step.name}`);
          this.pause();
        }

        // Step delay
        if (this.config.stepDelay && i < steps.length - 1) {
          await this.delay(this.config.stepDelay);
        }
      }

      // Mark as completed if not stopped
      if (!this.isStopped) {
        this.context.endTime = Date.now();
        this.context.duration = this.context.endTime - this.context.startTime;
        this.updateStatus('completed');
        this.log('success', `Workflow execution completed in ${this.context.duration}ms`);
      }
    } catch (error) {
      this.context.endTime = Date.now();
      this.context.duration = this.context.endTime - this.context.startTime;
      this.context.errors.push(error as Error);
      this.updateStatus('failed');
      this.log('error', 'Workflow execution failed', { error });
    }

    return this.context;
  }

  /**
   * Execute a single step
   */
  private async executeStep(step: StepExecutor): Promise<void> {
    const startTime = Date.now();
    const stepResult: ExecutionStepResult = {
      stepId: step.id,
      stepName: step.name,
      status: 'running',
      startTime,
      logs: [],
    };

    this.log('info', `Executing step: ${step.name}`, { stepId: step.id });

    try {
      // Get input from previous step output or context variables
      const input = this.getStepInput(step);

      // Validate input if validator exists
      if (step.validate && !step.validate(input)) {
        throw new Error(`Step input validation failed: ${step.name}`);
      }

      // Execute step
      const output = await step.execute(input, this.context!);

      // Store output in variables
      this.context!.variables[`step_${step.id}`] = output;
      this.context!.variables.lastOutput = output;

      // Update step result
      stepResult.status = 'completed';
      stepResult.endTime = Date.now();
      stepResult.duration = stepResult.endTime - startTime;
      stepResult.input = input;
      stepResult.output = output;

      this.log('success', `Step completed: ${step.name}`, { 
        stepId: step.id,
        duration: stepResult.duration,
      });
    } catch (error) {
      stepResult.status = 'failed';
      stepResult.endTime = Date.now();
      stepResult.duration = stepResult.endTime - startTime;
      stepResult.error = error as Error;

      this.log('error', `Step failed: ${step.name}`, { 
        stepId: step.id,
        error,
      });

      // Retry logic
      if (this.config.retryOnError && this.config.maxRetries) {
        // TODO: Implement retry logic
      }

      throw error;
    } finally {
      this.addStepResult(stepResult);
      this.onStepComplete?.(stepResult);
    }
  }

  /**
   * Get input for step from previous step or variables
   */
  private getStepInput(step: StepExecutor): any {
    if (!this.context) return null;

    const currentIndex = this.context.currentStepIndex;
    
    // First step gets initial variables
    if (currentIndex === 0) {
      return this.context.variables;
    }

    // Get output from previous step
    const previousStep = this.context.steps[currentIndex - 1];
    return previousStep?.output || this.context.variables.lastOutput;
  }

  /**
   * Pause execution
   */
  pause() {
    if (this.context?.status === 'running') {
      this.isPaused = true;
      this.updateStatus('paused');
      this.log('info', 'Execution paused');
    }
  }

  /**
   * Resume execution
   */
  resume() {
    if (this.context?.status === 'paused') {
      this.isPaused = false;
      this.updateStatus('running');
      this.log('info', 'Execution resumed');
    }
  }

  /**
   * Stop execution
   */
  stop() {
    this.isStopped = true;
    this.isPaused = false;
    if (this.context) {
      this.context.endTime = Date.now();
      this.context.duration = this.context.endTime - this.context.startTime;
    }
    this.updateStatus('stopped');
    this.log('warning', 'Execution stopped by user');
  }

  /**
   * Get current execution context
   */
  getContext(): ExecutionContext | null {
    return this.context;
  }

  /**
   * Add log entry
   */
  private log(level: LogLevel, message: string, data?: any) {
    if (!this.context) return;

    const log: ExecutionLog = {
      id: this.generateLogId(),
      timestamp: Date.now(),
      level,
      message,
      stepId: this.context.steps[this.context.currentStepIndex]?.stepId,
      stepName: this.context.steps[this.context.currentStepIndex]?.stepName,
      data,
    };

    this.context.logs.push(log);
    this.onLog?.(log);
  }

  /**
   * Add step result to context
   */
  private addStepResult(result: ExecutionStepResult) {
    if (this.context) {
      this.context.steps.push(result);
    }
  }

  /**
   * Update execution status
   */
  private updateStatus(status: ExecutionStatus) {
    if (this.context) {
      this.context.status = status;
      this.onStatusChange?.(status);
    }
  }

  /**
   * Set status change callback
   */
  onStatusChanged(callback: (status: ExecutionStatus) => void) {
    this.onStatusChange = callback;
  }

  /**
   * Set step complete callback
   */
  onStepCompleted(callback: (result: ExecutionStepResult) => void) {
    this.onStepComplete = callback;
  }

  /**
   * Set log callback
   */
  onLogAdded(callback: (log: ExecutionLog) => void) {
    this.onLog = callback;
  }

  /**
   * Utility: delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate unique execution ID
   */
  private generateExecutionId(): string {
    return `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get default config
   */
  private getDefaultConfig(): ExecutionConfig {
    return {
      stepDelay: 0,
      timeout: 300000, // 5 minutes
      retryOnError: false,
      maxRetries: 3,
      breakpoints: [],
      logLevel: 'info',
      variables: {},
    };
  }
}

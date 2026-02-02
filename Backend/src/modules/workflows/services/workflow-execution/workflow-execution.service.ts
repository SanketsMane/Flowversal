import { aiConfig } from '../../../../core/config/ai.config';
import { env } from '../../../../core/config/env';
import { workflowExecutionActive, workflowExecutionCount, workflowExecutionDuration } from '../../../../core/monitoring/metrics';
import { billingService } from '../../../../infrastructure/external/subscription/billing.service';
import { events, inngest } from '../../../../infrastructure/queue/jobs/inngest.client';
import { langGraphBuilderService } from '../../../../services/workflow/langgraph-builder.service';
import { langGraphPersistenceService } from '../../../../services/workflow/langgraph-persistence.service';
import { LangGraphWorkflowState } from '../../../../services/workflow/langgraph-state.types';
import { logger } from '../../../../shared/utils/logger.util';
import { WorkflowModel } from '../../models/Workflow.model';
import { ExecutionStatus, IWorkflowExecution, WorkflowExecutionModel } from '../../models/WorkflowExecution.model';
import { broadcastExecutionUpdate, broadcastNodeEvent } from '../../routes/workflow-websocket.routes';
import { NodeExecutor } from './executors/node-executor';
import { ExecutionContext, ExecutionInput, WorkflowExecutionOptions } from './types/workflow-execution.types';
import { validateExecutionId, validateExecutionInput, validateWorkflowId } from './validators';

export class WorkflowExecutionService {
  private nodeExecutor = new NodeExecutor();

  /**
   * Broadcast a lightweight execution update over WebSocket without blocking execution.
   */
  private broadcastProgress(execution: IWorkflowExecution, extra?: Record<string, any>) {
    try {
      const progress =
        execution.totalSteps && execution.totalSteps > 0
          ? Math.min(1, (execution.stepsExecuted || 0) / execution.totalSteps)
          : 0;

      broadcastExecutionUpdate(execution._id.toString(), {
        status: execution.status,
        stepsExecuted: execution.stepsExecuted || 0,
        totalSteps: execution.totalSteps || 0,
        progress,
        currentStep: extra?.currentStep || null,
        error: execution.error,
        ...extra,
      });
    } catch (err) {
      logger.warn('Failed to broadcast execution update', { executionId: execution._id, error: err });
    }
  }

  /**
   * Broadcast node-level execution event (n8n-style)
   */
  private broadcastNodeEvent(executionId: string, nodeId: string, eventType: 'node_start' | 'node_complete' | 'node_error', data?: any) {
    // #region agent log
    const fs = require('fs');
    const logPath = '/Users/nishantkumar/Documents/FloversalAI 1.0.0/.cursor/debug.log';
    fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:47',message:'broadcastNodeEvent called',data:{executionId,nodeId,eventType},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n');
    // #endregion
    try {
      broadcastNodeEvent(executionId, {
        type: eventType,
        executionId,
        nodeId,
        data,
        timestamp: Date.now(),
      });
      // #region agent log
      fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:55',message:'broadcastNodeEvent success',data:{executionId,nodeId,eventType},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n');
      // #endregion
    } catch (err: any) {
      // #region agent log
      fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:57',message:'broadcastNodeEvent error',data:{executionId,nodeId,eventType,errorMessage:err?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n');
      // #endregion
      logger.warn('Failed to broadcast node event', { executionId, nodeId, eventType, error: err });
    }
  }

  /**
   * Broadcast connection data flow event
   */
  private broadcastConnectionData(executionId: string, connectionId: string, data: any) {
    try {
      broadcastNodeEvent(executionId, {
        type: 'connection_data',
        executionId,
        connectionId,
        data,
        timestamp: Date.now(),
      });
    } catch (err) {
      logger.warn('Failed to broadcast connection data', { executionId, connectionId, error: err });
    }
  }

  /**
   * Start workflow execution
   */
  async startExecution(
    workflowId: string,
    userId: string,
    input: ExecutionInput = {},
    triggeredBy: 'manual' | 'webhook' | 'scheduled' | 'event' = 'manual',
    triggerData?: Record<string, any>,
    options: WorkflowExecutionOptions = {}
  ): Promise<IWorkflowExecution> {
    // #region agent log
    const fs = require('fs');
    const logPath = '/Users/nishantkumar/Documents/FloversalAI 1.0.0/.cursor/debug.log';
    fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:81',message:'startExecution entry',data:{workflowId,userId,triggeredBy},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n');
    // #endregion
    // Validate inputs
    const workflowValidation = validateWorkflowId(workflowId);
    if (!workflowValidation.isValid) {
      // #region agent log
      fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:91',message:'Workflow validation failed',data:{errors:workflowValidation.errors},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n');
      // #endregion
      throw new Error(workflowValidation.errors.join(', '));
    }

    const inputValidation = validateExecutionInput(input);
    if (!inputValidation.isValid) {
      // #region agent log
      fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:96',message:'Input validation failed',data:{errors:inputValidation.errors},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n');
      // #endregion
      throw new Error(inputValidation.errors.join(', '));
    }

    // Get workflow
    const workflow = await WorkflowModel.findById(workflowId);
    if (!workflow) {
      // #region agent log
      fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:102',message:'Workflow not found',data:{workflowId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n');
      // #endregion
      throw new Error('Workflow not found');
    }
    // #region agent log
    fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:105',message:'Workflow found',data:{workflowId,hasContainers:!!workflow.containers,containersCount:workflow.containers?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n');
    // #endregion

    // Verify user owns the workflow
    if (workflow.userId.toString() !== userId) {
      // #region agent log
      fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:108',message:'User ownership check failed',data:{workflowUserId:workflow.userId.toString(),requestedUserId:userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n');
      // #endregion
      throw new Error('Unauthorized: You do not own this workflow');
    }

    // Enforce per-tier concurrency limits
    await this.enforceConcurrencyLimit(userId);

    // Calculate total steps
    const totalSteps = (workflow.containers || []).reduce((sum: number, container: any) => {
      return sum + (container.nodes?.length || 0);
    }, 0);
    // #region agent log
    fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:117',message:'Total steps calculated',data:{totalSteps},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n');
    // #endregion

    // Decide whether to enqueue via Inngest
    const useQueue = options.useQueue ?? env.USE_INNGEST_FOR_EXECUTIONS;
    const workflowType = triggeredBy || 'manual';

    // Create execution record
    const execution = new WorkflowExecutionModel({
      workflowId: workflowId,
      userId: userId,
      status: 'pending',
      input: input,
      triggeredBy: triggeredBy,
      triggerData: triggerData,
      steps: [],
      totalSteps: totalSteps,
      stepsExecuted: 0,
      aiTokensUsed: 0,
      apiCallsMade: 0,
      metadata: {
        ...(workflow.version ? { workflowVersion: workflow.version } : {}),
      },
    });

    await execution.save();
    // #region agent log
    fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:142',message:'Execution saved',data:{executionId:execution._id.toString(),status:execution.status,useQueue},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n');
    // #endregion
    workflowExecutionActive.inc({ workflow_type: workflowType });

    if (useQueue && options.enqueue !== false) {
      // Enqueue execution to Inngest for async processing
      try {
        await inngest.send({
          name: events['workflow/execute'].name,
          data: {
            executionId: execution._id.toString(),
            workflowId,
            userId,
            input,
            triggeredBy,
            triggerData,
          },
        });
        logger.info('Enqueued workflow execution to Inngest', {
          executionId: execution._id.toString(),
          workflowId,
          userId,
        });
      } catch (err: any) {
        logger.error('Failed to enqueue workflow execution to Inngest; falling back to inline execution', {
          error: err.message,
          workflowId,
          userId,
        });
        await this.executeWorkflow(execution._id.toString(), options).catch((error) => {
          logger.error('Workflow execution error', error, {
            executionId: execution._id.toString(),
            workflowId: workflowId,
            userId: userId,
          });
        });
      }
    } else {
      // Start execution asynchronously inline
      // #region agent log
      const fs = require('fs');
      const logPath = '/Users/nishantkumar/Documents/FloversalAI 1.0.0/.cursor/debug.log';
      fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:205',message:'Starting inline execution',data:{executionId:execution._id.toString(),useQueue:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');
      // #endregion
      this.executeWorkflow(execution._id.toString(), options).catch((error) => {
        // #region agent log
        fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:206',message:'executeWorkflow error',data:{executionId:execution._id.toString(),errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');
        // #endregion
        logger.error('Workflow execution error', error, {
          executionId: execution._id.toString(),
          workflowId: workflowId,
          userId: userId,
        });
      });
    }

    return execution;
  }

  /**
   * Enforce per-tier concurrent execution limits
   */
  private async enforceConcurrencyLimit(userId: string) {
    try {
      const subscription = await billingService.getSubscription(userId);
      const tier = subscription?.tier || 'free';
      // Simple tier limits; adjust as needed
      const limits: Record<string, number> = {
        free: 1,
        pro: 5,
        enterprise: 20,
      };
      const allowed = limits[tier] ?? limits['free'];

      const runningCount = await WorkflowExecutionModel.countDocuments({
        userId,
        status: { $in: ['pending', 'running'] },
      });

      if (runningCount >= allowed) {
        throw new Error(
          `Concurrent execution limit reached for your plan (${tier}). Allowed: ${allowed}, running: ${runningCount}.`
        );
      }
    } catch (err: any) {
      // If billing is disabled, or any issue occurs, do not block
      if (billingService.isEnabled()) {
        throw err;
      }
      logger.warn('Concurrency check skipped (billing disabled or failed)', { userId, error: err?.message });
    }
  }

  /**
   * Start execution with workflow data (for unsaved workflows)
   */
  async startExecutionWithData(
    workflowData: any,
    userId: string,
    input: ExecutionInput = {},
    triggeredBy: 'manual' | 'webhook' | 'scheduled' | 'event' = 'manual',
    triggerData?: Record<string, any>,
    options: WorkflowExecutionOptions = {}
  ): Promise<IWorkflowExecution> {
    // #region agent log
    const fs = require('fs');
    const logPath = '/Users/nishantkumar/Documents/FloversalAI 1.0.0/.cursor/debug.log';
    fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:232',message:'startExecutionWithData entry',data:{userId,triggeredBy,hasContainers:!!workflowData.containers,containersCount:workflowData.containers?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})+'\n');
    // #endregion

    const inputValidation = validateExecutionInput(input);
    if (!inputValidation.isValid) {
      throw new Error(inputValidation.errors.join(', '));
    }

    // Enforce per-tier concurrency limits
    await this.enforceConcurrencyLimit(userId);

    // Calculate total steps from workflow data
    const totalSteps = (workflowData.containers || []).reduce((sum: number, container: any) => {
      return sum + (container.nodes?.length || 0);
    }, 0);

    // Create execution record without workflowId for unsaved workflows
    const execution = new WorkflowExecutionModel({
      // workflowId is omitted for unsaved workflows (optional in schema)
      userId: userId,
      status: 'pending',
      input: input,
      triggeredBy: triggeredBy,
      triggerData: triggerData,
      steps: [],
      totalSteps: totalSteps,
      stepsExecuted: 0,
      aiTokensUsed: 0,
      apiCallsMade: 0,
      metadata: {
        isUnsavedWorkflow: true,
        workflowData: workflowData, // Store workflow data in metadata
      },
    });

    await execution.save();
    // #region agent log
    fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:260',message:'Execution saved for unsaved workflow',data:{executionId:execution._id.toString(),status:execution.status,totalSteps},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})+'\n');
    // #endregion

    // Start execution asynchronously inline (use workflowData instead of looking up from DB)
    this.executeWorkflowWithData(execution._id.toString(), workflowData, options).catch((error) => {
      // #region agent log
      fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:263',message:'executeWorkflowWithData error',data:{executionId:execution._id.toString(),errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})+'\n');
      // #endregion
      logger.error('Workflow execution error', error, {
        executionId: execution._id.toString(),
        userId: userId,
      });
    });

    return execution;
  }

  /**
   * Execute workflow with provided data (for unsaved workflows)
   */
  async executeWorkflowWithData(executionId: string, workflowData: any, options: WorkflowExecutionOptions = {}): Promise<IWorkflowExecution> {
    // #region agent log
    const fs = require('fs');
    const logPath = '/Users/nishantkumar/Documents/FloversalAI 1.0.0/.cursor/debug.log';
    fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:273',message:'executeWorkflowWithData entry',data:{executionId,useLangGraph:options.useLangGraph,containersCount:workflowData.containers?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})+'\n');
    // #endregion
    const { useLangGraph = true, timeout } = options;
    const startHr = process.hrtime.bigint();

    const execution = await WorkflowExecutionModel.findById(executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }

    // Update status to running
    execution.status = 'running';
    execution.startedAt = new Date();
    await execution.save();
    this.broadcastProgress(execution, { currentStep: null });

    try {
      let result: IWorkflowExecution;

      // For unsaved workflows, use traditional execution (LangGraph requires saved workflow)
      result = await this.executeTraditionalWithData(executionId, workflowData, timeout);

      const duration = Number(process.hrtime.bigint() - startHr) / 1e9;
      workflowExecutionDuration.observe({ workflow_type: execution.triggeredBy || 'manual' }, duration);
      workflowExecutionCount.inc({ workflow_type: execution.triggeredBy || 'manual', status: result.status });

      return result;
    } catch (error: any) {
      execution.status = 'failed';
      execution.error = error.message || 'Execution failed';
      execution.completedAt = new Date();
      await execution.save();
      this.broadcastProgress(execution, { error: execution.error });

      workflowExecutionCount.inc({ workflow_type: execution.triggeredBy || 'manual', status: 'failed' });
      throw error;
    }
  }

  /**
   * Execute workflow using LangGraph or traditional execution
   */
  async executeWorkflow(executionId: string, options: WorkflowExecutionOptions = {}): Promise<IWorkflowExecution> {
    // #region agent log
    const fs = require('fs');
    const logPath = '/Users/nishantkumar/Documents/FloversalAI 1.0.0/.cursor/debug.log';
    fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:254',message:'executeWorkflow entry',data:{executionId,useLangGraph:options.useLangGraph},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');
    // #endregion
    const { useLangGraph = true, timeout } = options; // Default to LangGraph execution
    const startHr = process.hrtime.bigint();

    const executionValidation = validateExecutionId(executionId);
    if (!executionValidation.isValid) {
      // #region agent log
      fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:259',message:'Execution validation failed',data:{executionId,errors:executionValidation.errors},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');
      // #endregion
      throw new Error(executionValidation.errors.join(', '));
    }

    const execution = await WorkflowExecutionModel.findById(executionId).populate('workflowId');
    if (!execution) {
      // #region agent log
      fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:264',message:'Execution not found',data:{executionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');
      // #endregion
      throw new Error('Execution not found');
    }

    const workflow = execution.workflowId as any;
    if (!workflow) {
      // #region agent log
      fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:269',message:'Workflow not found',data:{executionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');
      // #endregion
      throw new Error('Workflow not found');
    }

    // #region agent log
    fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:273',message:'Workflow found, starting execution',data:{executionId,workflowId:workflow._id?.toString(),containersCount:workflow.containers?.length,nodesCount:workflow.containers?.reduce((s:number,c:any)=>s+(c.nodes?.length||0),0)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');
    // #endregion

    // Update status to running
    execution.status = 'running';
    execution.startedAt = new Date();
    await execution.save();
    this.broadcastProgress(execution, { currentStep: null });

    try {
      let result: IWorkflowExecution;

      if (useLangGraph) {
        // #region agent log
        fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:282',message:'Using LangGraph execution',data:{executionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})+'\n');
        // #endregion
        result = await this.executeWithLangGraph(executionId, timeout);
      } else {
        result = await this.executeTraditional(executionId, timeout);
      }

      const durationSeconds = Number(process.hrtime.bigint() - startHr) / 1e9;
      workflowExecutionCount.inc({ status: 'completed', workflow_type: execution.triggeredBy || 'manual' });
      workflowExecutionDuration.observe({ status: 'completed', workflow_type: execution.triggeredBy || 'manual' }, durationSeconds);
      workflowExecutionActive.dec({ workflow_type: execution.triggeredBy || 'manual' });

      return result;
    } catch (error: any) {
      logger.error('Workflow execution failed', error, { executionId });

      execution.status = 'failed';
      execution.error = error.message;
      execution.completedAt = new Date();
      await execution.save();
      this.broadcastProgress(execution, { error: error.message });

      const durationSeconds = Number(process.hrtime.bigint() - startHr) / 1e9;
      workflowExecutionCount.inc({ status: 'failed', workflow_type: execution.triggeredBy || 'manual' });
      workflowExecutionDuration.observe({ status: 'failed', workflow_type: execution.triggeredBy || 'manual' }, durationSeconds);
      workflowExecutionActive.dec({ workflow_type: execution.triggeredBy || 'manual' });

      throw error;
    }
  }

  /**
   * Execute workflow using LangGraph
   */
  private async executeWithLangGraph(executionId: string, timeout?: number): Promise<IWorkflowExecution> {
    const execution = await WorkflowExecutionModel.findById(executionId).populate('workflowId');
    if (!execution) {
      throw new Error('Execution not found');
    }

    const workflow = execution.workflowId as any;
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const startTime = Date.now();
    const executionTimeout = timeout || env.WORKFLOW_EXECUTION_TIMEOUT;

    try {
      // Build LangGraph from workflow
      logger.info('Building LangGraph for workflow execution', {
        executionId,
        workflowId: workflow._id.toString(),
      });

      const graph = langGraphBuilderService.buildGraph(workflow, execution);
      
      // Create initial state
      const initialState = langGraphBuilderService.createInitialState(
        workflow,
        execution,
        execution.input || {}
      );

      // Compile the graph
      const compiledGraph = graph.compile();

      // Execute with timeout
      const executionPromise = compiledGraph.invoke(initialState);
      
      let finalState: LangGraphWorkflowState;
      if (executionTimeout > 0) {
        finalState = await Promise.race([
          executionPromise,
          new Promise<LangGraphWorkflowState>((_, reject) =>
            setTimeout(() => reject(new Error(`Workflow execution timeout after ${executionTimeout}ms`)), executionTimeout)
          ),
        ]);
      } else {
        finalState = await executionPromise;
      }

      // Update execution with results
      const duration = Date.now() - startTime;
      
      execution.status = finalState.status === 'completed' ? 'completed' : 
                        finalState.status === 'failed' ? 'failed' : 
                        finalState.status === 'cancelled' ? 'cancelled' : 'completed';
      execution.completedAt = new Date();
      execution.startedAt = finalState.startedAt || new Date(startTime);
      execution.duration = duration;
      
      // Update variables and results
      (execution as any).variables = finalState.variables || {};
      execution.stepsExecuted = finalState.stepsExecuted || 0;
      execution.aiTokensUsed = finalState.aiTokensUsed || 0;
      execution.apiCallsMade = finalState.apiCallsMade || 0;

      // Convert steps from state
      execution.steps = finalState.steps.map((step) => ({
        stepId: step.stepId,
        stepName: step.stepName || step.stepId, // Use stepId as fallback for stepName
        stepType: step.stepType || 'unknown',
        status: (step.status as ExecutionStatus) || 'completed',
        startedAt: step.startedAt || new Date(),
        completedAt: step.completedAt || new Date(),
        duration: step.duration || 0,
        output: step.output,
        error: step.error,
      }));

      // Handle errors
      if (finalState.errors && finalState.errors.length > 0) {
        const lastError = finalState.errors[finalState.errors.length - 1];
        execution.error = {
          message: typeof lastError === 'string' ? lastError : lastError.message || 'Unknown error',
          stack: typeof lastError === 'object' && lastError.stack ? lastError.stack : undefined,
          stepId: typeof lastError === 'object' && (lastError.stepId || lastError.nodeId) ? (lastError.stepId || lastError.nodeId) : undefined,
        };
        if (execution.status !== 'failed') {
          execution.status = 'failed';
        }
      }

      // Save checkpoint if needed (for resumable workflows)
      if (finalState.checkpoint) {
        await langGraphPersistenceService.saveCheckpoint(
          executionId,
          finalState,
          finalState.checkpoint.nodeId
        );
      } else {
        // Clear checkpoint on successful completion
        await langGraphPersistenceService.clearCheckpoint(executionId);
      }

      await execution.save();
      this.broadcastProgress(execution, { currentStep: null });

      logger.info('LangGraph workflow execution completed', {
        executionId,
        status: execution.status,
        duration,
        stepsExecuted: execution.stepsExecuted,
      });

      return execution;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error('LangGraph workflow execution failed', error, {
        executionId,
        duration,
      });

      execution.status = 'failed';
      execution.error = error.message || 'LangGraph execution failed';
      execution.completedAt = new Date();
      execution.duration = duration;
      await execution.save();
      this.broadcastProgress(execution, { error: error.message });

      // If LangGraph fails, optionally fall back to traditional execution
      if (aiConfig.selection.fallbackToRemote) {
        logger.warn('LangGraph execution failed, falling back to traditional execution', {
          executionId,
        });
        try {
          return await this.executeTraditional(executionId, timeout);
        } catch (fallbackError: any) {
          logger.error('Traditional execution fallback also failed', fallbackError, {
            executionId,
          });
          throw error; // Throw original LangGraph error
        }
      }

      throw error;
    }
  }

  /**
   * Execute workflow using traditional execution engine with provided data
   */
  private async executeTraditionalWithData(executionId: string, workflowData: any, timeout?: number): Promise<IWorkflowExecution> {
    // #region agent log
    const fs = require('fs');
    const logPath = '/Users/nishantkumar/Documents/FloversalAI 1.0.0/.cursor/debug.log';
    fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:504',message:'executeTraditionalWithData entry',data:{executionId,containersCount:workflowData.containers?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})+'\n');
    // #endregion
    const execution = await WorkflowExecutionModel.findById(executionId);
    if (!execution) {
      throw new Error('Execution not found');
    }

    // Create execution context with provided workflow data
    const context: ExecutionContext = {
      workflow: workflowData,
      execution,
      input: execution.input || {},
      variables: { ...(execution.input || {}) },
      stepResults: new Map(),
    };

    // Execute containers
    const startTime = Date.now();

    try {
      await this.executeContainers(workflowData.containers || [], context);

      const duration = Date.now() - startTime;

      // Update execution status
      execution.status = 'completed';
      execution.completedAt = new Date();
      (execution as any).variables = context.variables;
      execution.stepsExecuted = context.stepResults.size;
      execution.aiTokensUsed = execution.aiTokensUsed || 0;
      execution.apiCallsMade = execution.apiCallsMade || 0;

      await execution.save();
      this.broadcastProgress(execution, { currentStep: null });

      return execution;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      execution.status = 'failed';
      execution.error = error.message;
      execution.completedAt = new Date();
      await execution.save();
      this.broadcastProgress(execution, { error: error.message });

      throw error;
    }
  }

  /**
   * Execute workflow using traditional execution engine
   */
  private async executeTraditional(executionId: string, timeout?: number): Promise<IWorkflowExecution> {
    // #region agent log
    const fs = require('fs');
    const logPath = '/Users/nishantkumar/Documents/FloversalAI 1.0.0/.cursor/debug.log';
    fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:493',message:'executeTraditional entry',data:{executionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n');
    // #endregion
    const execution = await WorkflowExecutionModel.findById(executionId).populate('workflowId');
    if (!execution) {
      throw new Error('Execution not found');
    }

    const workflow = execution.workflowId as any;
    // #region agent log
    fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:500',message:'Workflow loaded for traditional execution',data:{executionId,containersCount:workflow.containers?.length,totalNodes:workflow.containers?.reduce((s:number,c:any)=>s+(c.nodes?.length||0),0)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n');
    // #endregion

    // Create execution context
    const context: ExecutionContext = {
      workflow,
      execution,
      input: execution.input || {},
      variables: { ...(execution.input || {}) },
      stepResults: new Map(),
    };

    // Execute containers
    const startTime = Date.now();

    try {
      await this.executeContainers(workflow.containers || [], context);

      const duration = Date.now() - startTime;

      // Update execution status
      execution.status = 'completed';
      execution.completedAt = new Date();
      (execution as any).variables = context.variables;
      execution.stepsExecuted = context.stepResults.size;
      execution.aiTokensUsed = execution.aiTokensUsed || 0;
      execution.apiCallsMade = execution.apiCallsMade || 0;

      await execution.save();
      this.broadcastProgress(execution, { currentStep: null });

      return execution;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      execution.status = 'failed';
      execution.error = error.message;
      execution.completedAt = new Date();
      await execution.save();
      this.broadcastProgress(execution, { error: error.message });

      throw error;
    }
  }

  /**
   * Execute containers in sequence
   */
  private async executeContainers(containers: any[], context: ExecutionContext): Promise<void> {
    // #region agent log
    const fs = require('fs');
    const logPath = '/Users/nishantkumar/Documents/FloversalAI 1.0.0/.cursor/debug.log';
    fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:546',message:'executeContainers entry',data:{containersCount:containers.length,executionId:context.execution._id.toString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n');
    // #endregion
    for (const container of containers) {
      // #region agent log
      fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:548',message:'Executing container',data:{containerId:container.id,containerTitle:container.title,nodesCount:container.nodes?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n');
      // #endregion
      await this.executeContainer(container, context);
    }
  }

  /**
   * Execute a single container
   */
  private async executeContainer(container: any, context: ExecutionContext): Promise<void> {
    // #region agent log
    const fs = require('fs');
    const logPath = '/Users/nishantkumar/Documents/FloversalAI 1.0.0/.cursor/debug.log';
    // #endregion
    if (!container.nodes || !Array.isArray(container.nodes)) {
      // #region agent log
      fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:556',message:'Container has no nodes',data:{containerId:container.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n');
      // #endregion
      return;
    }
    // #region agent log
    fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:560',message:'executeContainer entry',data:{containerId:container.id,nodesCount:container.nodes.length,nodeIds:container.nodes.map((n:any)=>n.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n');
    // #endregion

    for (const node of container.nodes) {
      const nodeId = node.id;
      const nodeStartTime = Date.now();

      // Check for breakpoints before executing the node
      const { breakpointService } = await import('../breakpoint.service');
      const shouldBreakpoint = await breakpointService.shouldTriggerBreakpoint(
        nodeId,
        context.execution,
        context
      );

      if (shouldBreakpoint) {
        // Create checkpoint data
        const checkpointData = {
          nodeId,
          stepId: nodeId,
          stepName: node.name || node.type,
          inputData: context.variables,
          variables: context.variables,
          stepResults: context.stepResults,
          timestamp: new Date(),
          metadata: {
            containerId: container.id,
            nodeType: node.type,
            executionProgress: context.stepResults.size,
          },
        };

        // Trigger breakpoint
        const breakpointState = await breakpointService.triggerBreakpoint(
          nodeId,
          context.execution,
          context,
          checkpointData
        );

      // Broadcast breakpoint event
      this.broadcastNodeEvent(context.execution._id.toString(), nodeId, 'node_start', {
          breakpointId: breakpointState.breakpointId,
          checkpointData,
          resumeToken: breakpointState.resumeToken,
          canResume: breakpointState.canResume,
          timeout: breakpointState.timeout,
        });

        // #region agent log
        fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:562',message:'Breakpoint triggered - pausing execution',data:{nodeId,breakpointId:breakpointState.breakpointId,executionId:context.execution._id.toString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n');
        // #endregion

        // Execution is paused - return early
        return;
      }

      // #region agent log
      fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:562',message:'Starting node execution',data:{nodeId,nodeType:node.type,nodeName:node.name,executionId:context.execution._id.toString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n');
      // #endregion

      // Broadcast node start event
      // #region agent log
      fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:565',message:'Broadcasting node_start event',data:{executionId:context.execution._id.toString(),nodeId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n');
      // #endregion
      this.broadcastNodeEvent(context.execution._id.toString(), nodeId, 'node_start', {
        nodeType: node.type,
        nodeName: node.name || node.type,
        input: context.variables,
      });

      this.broadcastProgress(context.execution, { currentStep: nodeId });
      
      let result: any;
      try {
        result = await this.nodeExecutor.execute(node, context);
        context.stepResults.set(node.id, result);

        const nodeDuration = Date.now() - nodeStartTime;

        // Update execution steps
        context.execution.steps = context.execution.steps || [];
        const stepData = {
          stepId: node.id,
          stepName: node.name || node.type,
          stepType: node.type,
          status: (result.success ? 'completed' : 'failed') as ExecutionStatus,
          startedAt: new Date(nodeStartTime),
          completedAt: new Date(),
          duration: nodeDuration,
          input: context.variables,
          output: result.output,
          error: result.error,
        };
        context.execution.steps.push(stepData);

        await context.execution.save();
        
        // Broadcast node complete event
        if (result.success) {
          // #region agent log
          fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:640',message:'Node execution success, broadcasting node_complete',data:{nodeId,nodeType:node.type,executionId:context.execution._id.toString(),duration:nodeDuration},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n');
          // #endregion
          this.broadcastNodeEvent(context.execution._id.toString(), nodeId, 'node_complete', {
            nodeType: node.type,
            nodeName: node.name || node.type,
            output: result.output,
            duration: nodeDuration,
          });
        } else {
          // #region agent log
          fs.appendFileSync(logPath, JSON.stringify({location:'workflow-execution.service.ts:647',message:'Node execution failed, broadcasting node_error',data:{nodeId,nodeType:node.type,executionId:context.execution._id.toString(),error:result.error,duration:nodeDuration},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n');
          // #endregion
          this.broadcastNodeEvent(context.execution._id.toString(), nodeId, 'node_error', {
            nodeType: node.type,
            nodeName: node.name || node.type,
            error: result.error,
            duration: nodeDuration,
          });
        }
        
        this.broadcastProgress(context.execution, {
          currentStep: nodeId,
          error: result.success ? undefined : result.error,
        });

        if (!result.success) {
          throw new Error(`Node ${node.id} failed: ${result.error}`);
        }
      } catch (error: any) {
        const nodeDuration = Date.now() - nodeStartTime;
        
        // Broadcast node error event
        this.broadcastNodeEvent(context.execution._id.toString(), nodeId, 'node_error', {
          nodeType: node.type,
          nodeName: node.name || node.type,
          error: error.message,
          duration: nodeDuration,
        });
        
        throw error;
      }
    }
  }

  /**
   * Get execution by ID
   */
  async getExecution(executionId: string, userId: string): Promise<IWorkflowExecution | null> {
    const executionValidation = validateExecutionId(executionId);
    if (!executionValidation.isValid) {
      throw new Error(executionValidation.errors.join(', '));
    }

    const execution = await WorkflowExecutionModel.findById(executionId).populate('workflowId');
    if (!execution) {
      return null;
    }

    // Verify user owns the execution
    if (execution.userId.toString() !== userId) {
      return null;
    }

    return execution;
  }

  /**
   * Stop execution
   */
  async stopExecution(executionId: string, userId: string): Promise<boolean> {
    const executionValidation = validateExecutionId(executionId);
    if (!executionValidation.isValid) {
      throw new Error(executionValidation.errors.join(', '));
    }

    const execution = await WorkflowExecutionModel.findById(executionId);
    if (!execution) {
      return false;
    }

    // Verify user owns the execution
    if (execution.userId.toString() !== userId) {
      return false;
    }

    if (execution.status === 'running') {
      execution.status = 'stopped';
      execution.completedAt = new Date();
      await execution.save();
      this.broadcastProgress(execution, { currentStep: null });
      workflowExecutionCount.inc({ status: 'stopped', workflow_type: execution.triggeredBy || 'manual' });
      workflowExecutionActive.dec({ workflow_type: execution.triggeredBy || 'manual' });
    }

    return true;
  }

  /**
   * List executions for a workflow
   */
  async listExecutions(
    workflowId: string,
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    executions: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    // Verify workflow ownership
    const workflow = await import('../../models/Workflow.model').then(m => m.WorkflowModel.findOne({
      _id: workflowId,
      userId: userId,
    }));

    if (!workflow) {
      throw new Error('Workflow not found or unauthorized');
    }

    const WorkflowExecutionModel = await import('../../models/WorkflowExecution.model').then(m => m.WorkflowExecutionModel);

    const [executions, total] = await Promise.all([
      WorkflowExecutionModel.find({ workflowId: workflowId })
        .select('status startedAt completedAt stepsExecuted totalSteps triggeredBy')
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limit),
      WorkflowExecutionModel.countDocuments({ workflowId: workflowId }),
    ]);

    return {
      executions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

// Export service instance for backward compatibility
export const workflowExecutionService = new WorkflowExecutionService();

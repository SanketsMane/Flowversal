/**
 * Workflow Execution Hook
 * Integrates execution with registry and stats tracking
 * NOW USES REAL BACKEND API
 */
import { useAuthStore } from '@/core/stores/core/authStore';
import { useExecutionStore } from '@/core/stores/core/executionStore';
import { useUserStore } from '@/core/stores/core/userStore';
import { useWorkflowRegistryStore } from '@/core/stores/core/workflowRegistryStore';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { getAuthHeaders } from '../../../core/api/api.config';
import { ExecutionStatus, executionStatusService } from '../../../core/api/services/execution-status.service';
import { executeWorkflow as executeWorkflowAPI, stopExecution as stopExecutionAPI } from '../../../core/api/services/workflow-execution.service';
import { useAgentStore } from '../stores/agentStore';
import { useExecutionStore as useExecutionStoreModule } from '../stores/executionStore';
import { useUIStore } from '../stores/uiStore';
import { useWorkflowStore } from '../stores/workflowStore';
import { NodeExecutionState, useExecutionWebSocket } from './useExecutionWebSocket';
export function useWorkflowExecution() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null);
  const [currentBackendExecutionId, setCurrentBackendExecutionId] = useState<string | null>(null);
  const [nodeStates, setNodeStates] = useState<Map<string, NodeExecutionState>>(new Map());
  const workflowState = useWorkflowStore();
  const executionStoreModule = useExecutionStoreModule();
  const executionStore = useExecutionStore();
  const workflowRegistry = useWorkflowRegistryStore();
  const userStore = useUserStore();
  const authStore = useAuthStore();
  const uiStore = useUIStore();
  const agentStore = useAgentStore();
  // Get node position helper
  const getNodePosition = useCallback((nodeId: string, type: 'trigger' | 'node'): { x: number; y: number } => {
    const element = document.querySelector(`[data-node-id="${nodeId}"]`) || 
                   document.querySelector(`[data-trigger-id="${nodeId}"]`);
    if (element) {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
    return { x: 0, y: 0 };
  }, []);
  // WebSocket integration for real-time updates
  const { isConnected: wsConnected } = useExecutionWebSocket({
    executionId: currentBackendExecutionId,
    enabled: !!currentBackendExecutionId && isExecuting,
    // #region agent log
    // Debug logging for WebSocket connection
    // #endregion
    onNodeUpdate: (nodeState) => {
      setNodeStates((prev) => {
        const updated = new Map(prev);
        updated.set(nodeState.nodeId, nodeState);
        return updated;
      });
    },
    onConnectionData: (data) => {
      // Handle connection data flow visualization
      // Connection data flows will be handled by WorkflowCanvas component
    },
    onAgentReasoning: (event) => {
      // Handle agent reasoning events
      if (event.thought) {
        const agentState = agentStore.getAgent(event.agentId);
        if (agentState) {
          agentStore.addThought(event.agentId, event.thought);
        } else {
          // Create new agent state if it doesn't exist
          agentStore.addAgent({
            agentId: event.agentId,
            executionId: currentBackendExecutionId || '',
            thoughts: [event.thought],
            toolCalls: [],
            decisions: [],
            currentState: {},
          });
        }
      }
      if (event.toolCall) {
        agentStore.addToolCall(event.agentId, event.toolCall);
      }
      if (event.decision) {
        agentStore.addDecision(event.agentId, event.decision);
      }
    },
    onExecutionUpdate: (update) => {
      // Update execution store with real-time status
      if (currentExecutionId) {
        executionStore.updateExecution(currentExecutionId, {
          status: update.status === 'completed' ? 'success' : 
                  update.status === 'failed' ? 'failed' : 
                  update.status === 'stopped' ? 'canceled' : 'running',
          stepsExecuted: update.stepsExecuted || 0,
          aiTokensUsed: update.aiTokensUsed || 0,
          apiCallsMade: update.apiCallsMade || 0,
        });
      }
    },
  });
  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (currentBackendExecutionId) {
        executionStatusService.stopPolling(currentBackendExecutionId);
      }
    };
  }, [currentBackendExecutionId]);
  const executeWorkflow = async (workflowId?: string) => {
    const user = authStore.user;
    if (!user) {
      console.error('No user logged in');
      uiStore.showNotification('Please wait for authentication to complete and try again', 'error');
      return null;
    }
    // Get access token
    const headers = await getAuthHeaders();
    const accessToken = headers['Authorization']?.replace('Bearer ', '') || '';
    setIsExecuting(true);
    try {
      // Get workflow data
      const workflowName = workflowState.workflowName;
      const triggers = workflowState.triggers;
      const containers = workflowState.containers;
      // Calculate total steps
      const totalSteps = containers.reduce((sum, container) => sum + container.nodes.length, 0);
      // Determine trigger type
      const triggerType = triggers.length > 0 ? triggers[0].type : 'Manual';
      // Create local execution log for UI
      const localExecutionId = executionStore.addExecution({
        workflowId: workflowId || 'unsaved-workflow',
        workflowName,
        userId: user.id,
        userName: user.name,
        status: 'running',
        startedAt: Date.now(),
        triggerType,
        stepsExecuted: 0,
        totalSteps,
        aiTokensUsed: 0,
        apiCallsMade: 0,
      });
      setCurrentExecutionId(localExecutionId);
      // Call backend API to execute workflow
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4eca190d-c843-4d4a-a868-56d71e69b49f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useWorkflowExecution.ts:168',message:'Before API call',data:{workflowId,hasAccessToken:!!accessToken,isUnsaved:!workflowId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      let result;
      if (workflowId) {
        // Execute saved workflow
        result = await executeWorkflowAPI(
          workflowId,
          {
            input: {},
            triggeredBy: 'manual',
            triggerData: {},
          },
          accessToken
        );
      } else {
        // Execute unsaved workflow by sending workflow data
        result = await executeWorkflowAPI(
          undefined,
          {
            input: {},
            triggeredBy: 'manual',
            triggerData: {},
            workflow: {
              name: workflowName,
              triggers,
              containers,
            },
          },
          accessToken
        );
      }
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4eca190d-c843-4d4a-a868-56d71e69b49f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useWorkflowExecution.ts:177',message:'After API call',data:{success:result.success,executionId:result.executionId,error:result.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      if (!result.success || !result.executionId) {
        // #region agent log
        console.error('[DEBUG] API call failed', { success: result.success, executionId: result.executionId, error: result.error, resultData: result.data });
        fetch('http://127.0.0.1:7242/ingest/4eca190d-c843-4d4a-a868-56d71e69b49f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useWorkflowExecution.ts:179',message:'API call failed',data:{success:result.success,executionId:result.executionId,error:result.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        throw new Error(result.error || 'Failed to start workflow execution');
      }
      const backendExecutionId = result.executionId;
      // Set execution ID - this will trigger WebSocket connection via useExecutionWebSocket hook
      setCurrentBackendExecutionId(backendExecutionId);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/4eca190d-c843-4d4a-a868-56d71e69b49f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useWorkflowExecution.ts:184',message:'Execution ID set',data:{backendExecutionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // WebSocket connection is handled by useExecutionWebSocket hook
      // Give WebSocket a moment to connect, then check connection status
      // Note: wsConnected state might not update immediately, so we check after a delay
      const pollingFallbackTimeout = setTimeout(() => {
        // Note: wsConnected might be stale here due to closure, but the WebSocket hook should handle connection
        // We'll rely on the WebSocket hook's connection status
          // Set up status polling as fallback
          executionStatusService.setAccessToken(accessToken);
          executionStatusService.startPolling(backendExecutionId, {
        interval: 1000, // Poll every second
        maxAttempts: 600, // 10 minutes max
        onUpdate: (status: ExecutionStatus) => {
          // Update local execution store with real status
          executionStore.updateExecution(localExecutionId, {
            status: status.status === 'completed' ? 'success' : 
                    status.status === 'failed' ? 'failed' : 
                    status.status === 'stopped' ? 'canceled' : 'running',
            stepsExecuted: status.stepsExecuted || 0,
            aiTokensUsed: status.aiTokensUsed || 0,
            apiCallsMade: status.apiCallsMade || 0,
          });
          // Update UI notification for progress
          if (status.stepsExecuted && status.totalSteps) {
            const progress = Math.round((status.stepsExecuted / status.totalSteps) * 100);
            // Only show notification every 25% to avoid spam
            if (progress % 25 === 0) {
              uiStore.showNotification(`Execution progress: ${progress}%`, 'info');
            }
          }
        },
        onComplete: (status: ExecutionStatus) => {
          const success = status.status === 'completed';
          const duration = status.duration || (status.completedAt ? 
            new Date(status.completedAt).getTime() - new Date(status.startedAt).getTime() : 0);
          // Complete local execution
          executionStore.completeExecution(
            localExecutionId,
            success ? 'success' : 'failed',
            { 
              result: status.output || 'Execution completed', 
              stepsExecuted: status.stepsExecuted || 0 
            },
            success ? undefined : {
              message: status.error?.message || 'Execution failed',
              step: status.error?.step || 'Unknown',
              code: status.error?.code || 'EXECUTION_ERROR'
            }
          );
          // Update AI tokens used
          executionStore.updateExecution(localExecutionId, {
            aiTokensUsed: status.aiTokensUsed || 0,
            apiCallsMade: status.apiCallsMade || 0,
          });
          // Update workflow stats if workflow is saved
          if (workflowId) {
            workflowRegistry.updateExecutionStats(workflowId, duration, success);
            workflowRegistry.incrementExecutionCount(workflowId);
          }
          // Update user stats
          userStore.incrementWorkflowExecuted(user.id);
          if (status.aiTokensUsed && status.aiTokensUsed > 0) {
            userStore.addAITokenUsage(user.id, status.aiTokensUsed);
          }
          setIsExecuting(false);
          setCurrentExecutionId(null);
          setCurrentBackendExecutionId(null);
          // Show completion notification
          uiStore.showNotification(
            success 
              ? `Workflow executed successfully in ${Math.round(duration / 1000)}s`
              : `Workflow execution failed: ${status.error?.message || 'Unknown error'}`,
            success ? 'success' : 'error'
          );
        },
        onError: (error: Error) => {
          console.error('[Workflow Execution] Polling error:', error);
          executionStore.completeExecution(
            localExecutionId,
            'failed',
            undefined,
            { message: error.message, step: 'Status polling', code: 'POLLING_ERROR' }
          );
          setIsExecuting(false);
          setCurrentExecutionId(null);
          setCurrentBackendExecutionId(null);
          uiStore.showNotification(`Execution error: ${error.message}`, 'error');
        },
      });
      }, 2000);
      return {
        success: true,
        executionId: localExecutionId,
        backendExecutionId: backendExecutionId,
      };
    } catch (error: any) {
      console.error('[Workflow Execution] Execution failed:', error);
      if (currentExecutionId) {
        executionStore.completeExecution(
          currentExecutionId,
          'failed',
          undefined,
          { message: error.message || 'Execution error', step: 'Unknown', code: 'EXECUTION_ERROR' }
        );
      }
      setIsExecuting(false);
      setCurrentExecutionId(null);
      setCurrentBackendExecutionId(null);
      uiStore.showNotification(`Failed to execute workflow: ${error.message || 'Unknown error'}`, 'error');
      return null;
    }
  };
  const cancelExecution = async () => {
    if (!currentBackendExecutionId) {
      // If no backend execution, just cancel local
      if (currentExecutionId) {
        executionStore.updateExecution(currentExecutionId, {
          status: 'canceled',
          completedAt: Date.now(),
        });
        setIsExecuting(false);
        setCurrentExecutionId(null);
      }
      return;
    }
    // Stop backend execution
    try {
      const headers = await getAuthHeaders();
      const accessToken = headers['Authorization']?.replace('Bearer ', '') || '';
      const result = await stopExecutionAPI(currentBackendExecutionId, accessToken);
      if (result.success) {
        executionStatusService.stopPolling(currentBackendExecutionId);
        if (currentExecutionId) {
          executionStore.updateExecution(currentExecutionId, {
            status: 'canceled',
            completedAt: Date.now(),
          });
        }
        setIsExecuting(false);
        setCurrentExecutionId(null);
        setCurrentBackendExecutionId(null);
        uiStore.showNotification('Execution stopped successfully', 'success');
      } else {
        uiStore.showNotification(`Failed to stop execution: ${result.error}`, 'error');
      }
    } catch (error: any) {
      console.error('[Workflow Execution] Stop error:', error);
      uiStore.showNotification(`Failed to stop execution: ${error.message}`, 'error');
    }
  };
  // Convert nodeStates Map to array format for VisualExecutionOverlay
  // Use useMemo to recalculate when nodeStates changes
  const nodeStatesArray = useMemo(() => {
    const states = Array.from(nodeStates.values()).map((state) => {
      // Try to get position - if element doesn't exist yet, return 0,0
      // Position will be recalculated on next render when DOM is ready
      const position = getNodePosition(state.nodeId, 'node');
      // Log if position is 0,0 (element not found)
      if (position.x === 0 && position.y === 0) {
        console.warn('[DEBUG] Node position not found (element may not be rendered yet)', { 
          nodeId: state.nodeId,
          selector: `[data-node-id="${state.nodeId}"]`,
          nodeStatesSize: nodeStates.size
        });
      }
      return {
        id: state.nodeId,
        status: state.status,
        position,
        type: 'node' as const,
        inputData: state.inputData,
        outputData: state.outputData,
        duration: state.duration,
        error: state.error,
      };
    });
    // Debug logging
    if (states.length > 0) {
    }
    return states;
  }, [nodeStates, getNodePosition]);
  // Recalculate positions after DOM updates using useLayoutEffect
  // This ensures positions are accurate even if nodes are rendered after WebSocket events arrive
  const [nodeStatesWithPositions, setNodeStatesWithPositions] = useState(nodeStatesArray);
  useLayoutEffect(() => {
    // Recalculate positions for all node states
    const updatedStates = nodeStatesArray.map((state) => {
      const position = getNodePosition(state.id, 'node');
      // Only update if position changed (element now exists)
      if (position.x !== state.position.x || position.y !== state.position.y) {
      }
      return {
        ...state,
        position,
      };
    });
    setNodeStatesWithPositions(updatedStates);
  }, [nodeStatesArray, getNodePosition]);
  return {
    executeWorkflow,
    cancelExecution,
    isExecuting,
    currentExecutionId,
    nodeStates: nodeStatesWithPositions,
    backendExecutionId: currentBackendExecutionId,
  };
}

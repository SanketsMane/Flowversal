/**
 * Visual Execution Hook
 * Manages visual execution states for nodes with animations
 */

import { useState, useCallback } from 'react';
import { useWorkflowStore } from '../stores/workflowStore';
import { useExecutionStore } from '@/core/stores/core/executionStore';
import { useWorkflowRegistryStore } from '@/core/stores/core/workflowRegistryStore';
import { useUserStore } from '@/core/stores/core/userStore';
import { useAuthStore } from '@/core/stores/core/authStore';
import { useUIStore } from '../stores/uiStore';
import { NodeExecutionState } from '@/shared/components/ui/execution/VisualExecutionOverlay';

export function useVisualExecution() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [nodeStates, setNodeStates] = useState<NodeExecutionState[]>([]);
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null);
  
  const workflowState = useWorkflowStore();
  const executionStore = useExecutionStore();
  const workflowRegistry = useWorkflowRegistryStore();
  const userStore = useUserStore();
  const authStore = useAuthStore();
  const uiStore = useUIStore();

  const getNodePosition = useCallback((nodeId: string, type: 'trigger' | 'node'): { x: number; y: number } => {
    // Find the DOM element for this node
    const element = document.querySelector(`[data-node-id="${nodeId}"]`) || 
                   document.querySelector(`[data-trigger-id="${nodeId}"]`);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
    
    // Default position if element not found
    return { x: 0, y: 0 };
  }, []);

  const executeWorkflow = async (workflowId?: string) => {
    const user = authStore.user;
    if (!user) {
      console.error('No user logged in');
      uiStore.showNotification('Please wait for authentication to complete and try again', 'error');
      return null;
    }

    setIsExecuting(true);
    setNodeStates([]);

    try {
      // Get workflow data
      const workflowName = workflowState.workflowName;
      const triggers = workflowState.triggers;
      const containers = workflowState.containers;
      
      // Calculate total steps
      const totalSteps = containers.reduce((sum, container) => sum + container.nodes.length, 0);
      
      // Determine trigger type
      const triggerType = triggers.length > 0 ? triggers[0].type : 'Manual';

      // Create execution log
      const executionId = executionStore.addExecution({
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

      setCurrentExecutionId(executionId);

      const startTime = Date.now();
      let stepsExecuted = 0;
      let aiTokensUsed = 0;
      const allNodeStates: NodeExecutionState[] = [];

      // Execute triggers first
      for (const trigger of triggers) {
        const position = getNodePosition(trigger.id, 'trigger');
        
        // Add running state
        const triggerState: NodeExecutionState = {
          id: trigger.id,
          status: 'running',
          position,
          type: 'trigger',
        };
        allNodeStates.push(triggerState);
        setNodeStates([...allNodeStates]);
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Update to success
        triggerState.status = 'success';
        setNodeStates([...allNodeStates]);
        
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      // Execute nodes in sequence
      for (const container of containers) {
        for (const node of container.nodes) {
          const position = getNodePosition(node.id, 'node');
          
          // Add running state
          const nodeState: NodeExecutionState = {
            id: node.id,
            status: 'running',
            position,
            type: 'node',
          };
          allNodeStates.push(nodeState);
          setNodeStates([...allNodeStates]);
          
          // Update progress
          stepsExecuted++;
          executionStore.updateExecution(executionId, {
            stepsExecuted,
          });
          
          // Simulate node execution
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Random success/failure (10% failure rate)
          const success = Math.random() > 0.1;
          
          if (!success) {
            // Mark as error
            nodeState.status = 'error';
            setNodeStates([...allNodeStates]);
            
            // Complete execution with failure
            executionStore.completeExecution(
              executionId,
              'failed',
              undefined,
              { message: `Node "${node.name}" failed`, step: node.name, code: 'NODE_ERROR' }
            );
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            setIsExecuting(false);
            
            // Show notification
            uiStore.showNotification(`Workflow failed at "${node.name}"`, 'error');
            
            // Keep error states visible for 3 seconds
            setTimeout(() => {
              setNodeStates([]);
              setCurrentExecutionId(null);
            }, 3000);
            
            return {
              success: false,
              executionId,
              duration,
              stepsExecuted,
              aiTokensUsed,
            };
          }
          
          // Mark as success
          nodeState.status = 'success';
          setNodeStates([...allNodeStates]);
          
          // Simulate AI token usage for AI nodes
          if (node.type === 'Prompt Builder' || node.type === 'AI Generator') {
            aiTokensUsed += Math.floor(Math.random() * 200) + 50;
          }
          
          await new Promise(resolve => setTimeout(resolve, 400));
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Complete execution successfully
      executionStore.completeExecution(
        executionId,
        'success',
        { result: 'Execution completed successfully', stepsExecuted },
      );

      // Update AI tokens used
      executionStore.updateExecution(executionId, {
        aiTokensUsed,
        apiCallsMade: Math.floor(Math.random() * 5) + 1,
      });

      // Update workflow stats if workflow is saved
      if (workflowId) {
        workflowRegistry.updateExecutionStats(workflowId, duration, true);
        workflowRegistry.incrementExecutionCount(workflowId);
      }

      // Update user stats
      userStore.incrementWorkflowExecuted(user.id);
      if (aiTokensUsed > 0) {
        userStore.addAITokenUsage(user.id, aiTokensUsed);
      }

      setIsExecuting(false);
      
      // Show success notification
      uiStore.showNotification('Workflow executed successfully!', 'success');
      
      // Clear execution states after 2 seconds
      setTimeout(() => {
        setNodeStates([]);
        setCurrentExecutionId(null);
      }, 2000);

      return {
        success: true,
        executionId,
        duration,
        stepsExecuted,
        aiTokensUsed,
      };
    } catch (error) {
      console.error('Workflow execution failed:', error);
      
      if (currentExecutionId) {
        executionStore.completeExecution(
          currentExecutionId,
          'failed',
          undefined,
          { message: 'Execution error', step: 'Unknown', code: 'EXECUTION_ERROR' }
        );
      }
      
      setIsExecuting(false);
      uiStore.showNotification('Workflow execution failed', 'error');
      
      setTimeout(() => {
        setNodeStates([]);
        setCurrentExecutionId(null);
      }, 3000);
      
      return null;
    }
  };

  const cancelExecution = () => {
    if (currentExecutionId) {
      executionStore.updateExecution(currentExecutionId, {
        status: 'canceled',
        completedAt: Date.now(),
      });
      setIsExecuting(false);
      setNodeStates([]);
      setCurrentExecutionId(null);
      uiStore.showNotification('Execution canceled', 'info');
    }
  };

  return {
    executeWorkflow,
    cancelExecution,
    isExecuting,
    nodeStates,
    currentExecutionId,
  };
}

import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { IWorkflow } from '../../modules/workflows/models/Workflow.model';
import { IWorkflowExecution } from '../../modules/workflows/models/WorkflowExecution.model';
import { createTriggerNodeAdapter, getNodeAdapter } from './langgraph-node-adapters';
import { LangGraphWorkflowState, WorkflowGraph, WorkflowGraphNode } from './langgraph-state.types';

export class LangGraphBuilderService {
  /**
   * Build a LangGraph StateGraph from workflow JSON
   * Simplified version to reduce memory usage
   */
  buildGraph(
    workflow: IWorkflow,
    execution: IWorkflowExecution
  ): any {
    // Create state annotation for LangGraph v1.0.3
    // Using Annotation.Root with a simplified schema
    // Note: Annotation is a function that creates state definitions
    const stateAnnotation = Annotation.Root({
      workflowId: Annotation(),
      userId: Annotation(),
      executionId: Annotation(),
      status: Annotation(),
      triggers: Annotation(),
      containers: Annotation(),
      input: Annotation(),
      variables: Annotation(),
      nodeResults: Annotation(),
      steps: Annotation(),
      currentStep: Annotation(),
      currentContainer: Annotation(),
      branchConditions: Annotation(),
      activeBranches: Annotation(),
      errors: Annotation(),
      aiTokensUsed: Annotation(),
      apiCallsMade: Annotation(),
      totalSteps: Annotation(),
      stepsExecuted: Annotation(),
      startedAt: Annotation(),
      completedAt: Annotation(),
      duration: Annotation(),
      triggeredBy: Annotation(),
      triggerData: Annotation(),
      checkpoint: Annotation(),
    });

    // Create StateGraph with state annotation
    // Use type assertion to work around complex generic types
    const graph = new (StateGraph as any)(stateAnnotation);

    // Build workflow graph structure
    const workflowGraph = this.buildWorkflowGraph(workflow, execution);
    
    // Add trigger nodes
    const triggerNodeIds: string[] = [];
    if (workflow.triggers && workflow.triggers.length > 0) {
      for (const trigger of workflow.triggers) {
        const triggerId = trigger.id || `trigger-${Date.now()}`;
        triggerNodeIds.push(triggerId);
        
        const triggerAdapter = createTriggerNodeAdapter(triggerId, trigger, workflow, execution);
        // Use type assertion to work around LangGraph's complex type system
        graph.addNode(triggerId, triggerAdapter as any);
      }
    } else {
      // Default manual trigger
      const manualTriggerId = 'trigger-manual';
      triggerNodeIds.push(manualTriggerId);
      graph.addNode(manualTriggerId, (async (state: LangGraphWorkflowState) => {
        return { nodeResults: new Map(state.nodeResults).set(manualTriggerId, { fired: true }) };
      }) as any);
    }

    // Add container and node handlers
    const containerNodeIds: string[] = [];
    const nodeIdMap = new Map<string, string>(); // Maps node IDs to graph node names
    
    if (workflow.containers && workflow.containers.length > 0) {
      for (let containerIndex = 0; containerIndex < workflow.containers.length; containerIndex++) {
        const container = workflow.containers[containerIndex];
        const containerId = container.id || `container-${containerIndex}`;
        containerNodeIds.push(containerId);
        
        // Create a handler for the entire container
        const containerHandler = this.createContainerHandler(
          containerId,
          container,
          workflow,
          execution,
          nodeIdMap
        );
        graph.addNode(containerId, containerHandler as any);
        
        // Connect containers sequentially
        if (containerIndex === 0) {
          // First container connects from triggers
          for (const triggerId of triggerNodeIds) {
            graph.addEdge(triggerId as any, containerId);
          }
        } else {
          // Subsequent containers connect from previous container
          const prevContainerId = containerNodeIds[containerIndex - 1];
          graph.addEdge(prevContainerId as any, containerId);
        }
      }
    }

    // Set entry point
    if (triggerNodeIds.length > 0) {
      graph.addEdge(START, triggerNodeIds[0] as any);
      // Chain triggers if multiple
      for (let i = 1; i < triggerNodeIds.length; i++) {
        graph.addEdge(triggerNodeIds[i - 1] as any, triggerNodeIds[i]);
      }
      // Connect last trigger to first container
      if (containerNodeIds.length > 0) {
        graph.addEdge(triggerNodeIds[triggerNodeIds.length - 1] as any, containerNodeIds[0]);
      }
    } else if (containerNodeIds.length > 0) {
      graph.addEdge(START, containerNodeIds[0] as any);
    }

    // Set exit point
    if (containerNodeIds.length > 0) {
      graph.addEdge(containerNodeIds[containerNodeIds.length - 1] as any, END);
    } else {
      // If no containers, connect triggers directly to END
      if (triggerNodeIds.length > 0) {
        graph.addEdge(triggerNodeIds[triggerNodeIds.length - 1] as any, END);
      }
    }

    return graph as any;
  }

  /**
   * Create a handler for a container that executes all nodes within it
   */
  private createContainerHandler(
    containerId: string,
    container: any,
    workflow: IWorkflow,
    execution: IWorkflowExecution,
    nodeIdMap: Map<string, string>
  ) {
    return async (state: LangGraphWorkflowState): Promise<Partial<LangGraphWorkflowState>> => {
      const updatedState: Partial<LangGraphWorkflowState> = {
        currentContainer: containerId,
      };

      // Initialize step for container
      const stepId = container.id || containerId;
      const stepName = container.label || container.title || container.type || 'Unknown Step';
      const stepType = container.type || 'container';

      const step = {
        stepId,
        stepName,
        stepType,
        status: 'running' as const,
        startedAt: new Date(),
        input: container.config || {},
      };

      updatedState.steps = [...state.steps, step];

      try {
        // Execute nodes in the container
        const nodeOutputs: any[] = [];
        
        if (container.nodes && Array.isArray(container.nodes)) {
          // Sequential execution of nodes within container
          for (const node of container.nodes) {
            const nodeId = node.id || `node-${Date.now()}`;
            const nodeAdapter = getNodeAdapter(nodeId, node, workflow, execution);
            
            // Execute node with current state
            const nodeStateUpdate = await nodeAdapter(state);
            
            // Merge state updates
            Object.assign(updatedState, nodeStateUpdate);
            Object.assign(state, nodeStateUpdate);
            
            // Store output
            const nodeOutput = nodeStateUpdate.nodeResults?.get(nodeId);
            if (nodeOutput) {
              nodeOutputs.push(nodeOutput);
            }
          }
        } else {
          // If container doesn't have nodes, treat container as a single node
          const nodeAdapter = getNodeAdapter(stepId, container, workflow, execution);
          const nodeStateUpdate = await nodeAdapter(state);
          Object.assign(updatedState, nodeStateUpdate);
          Object.assign(state, nodeStateUpdate);
          
          const nodeOutput = nodeStateUpdate.nodeResults?.get(stepId);
          if (nodeOutput) {
            nodeOutputs.push(nodeOutput);
          }
        }

        // Update step with success
        const stepIndex = updatedState.steps!.findIndex((s) => s.stepId === stepId);
        if (stepIndex >= 0) {
          updatedState.steps![stepIndex].status = 'completed';
          updatedState.steps![stepIndex].completedAt = new Date();
          updatedState.steps![stepIndex].duration =
            updatedState.steps![stepIndex].completedAt.getTime() -
            (updatedState.steps![stepIndex].startedAt?.getTime() || Date.now());
          updatedState.steps![stepIndex].output =
            nodeOutputs.length === 1 ? nodeOutputs[0] : nodeOutputs;
        }

        updatedState.stepsExecuted = updatedState.steps!.filter(
          (s) => s.status === 'completed' || s.status === 'failed'
        ).length;

        return updatedState;
      } catch (error: any) {
        // Update step with failure
        const stepIndex = updatedState.steps!.findIndex((s) => s.stepId === stepId);
        if (stepIndex >= 0) {
          updatedState.steps![stepIndex].status = 'failed';
          updatedState.steps![stepIndex].completedAt = new Date();
          updatedState.steps![stepIndex].duration =
            updatedState.steps![stepIndex].completedAt.getTime() -
            (updatedState.steps![stepIndex].startedAt?.getTime() || Date.now());
          updatedState.steps![stepIndex].error = error.message;
        }

        updatedState.errors = [
          ...(state.errors || []),
          {
            stepId,
            message: error.message || 'Container execution failed',
            stack: error.stack,
            timestamp: new Date(),
          },
        ];

        throw error;
      }
    };
  }

  /**
   * Build workflow graph structure (for analysis/debugging)
   */
  private buildWorkflowGraph(
    workflow: IWorkflow,
    _execution: IWorkflowExecution
  ): WorkflowGraph {
    const nodes = new Map<string, WorkflowGraphNode>();
    const edges: Array<{ from: string; to: string; condition?: string }> = [];
    const entryNodes: string[] = [];
    const exitNodes: string[] = [];

    // Add trigger nodes
    if (workflow.triggers && workflow.triggers.length > 0) {
      for (const trigger of workflow.triggers) {
        const triggerId = trigger.id || `trigger-${Date.now()}`;
        entryNodes.push(triggerId);
        nodes.set(triggerId, {
          id: triggerId,
          type: trigger.type || 'trigger',
          label: trigger.label || trigger.type || 'Trigger',
          config: trigger.config || {},
          dependencies: [],
        });
      }
    }

    // Add container and node nodes
    if (workflow.containers && workflow.containers.length > 0) {
      for (let containerIndex = 0; containerIndex < workflow.containers.length; containerIndex++) {
        const container = workflow.containers[containerIndex];
        const containerId = container.id || `container-${containerIndex}`;

        if (container.nodes && Array.isArray(container.nodes)) {
          for (let nodeIndex = 0; nodeIndex < container.nodes.length; nodeIndex++) {
            const node = container.nodes[nodeIndex];
            const nodeId = node.id || `node-${nodeIndex}`;

            const dependencies: string[] = [];
            if (nodeIndex > 0) {
              const prevNodeId = container.nodes[nodeIndex - 1].id || `node-${nodeIndex - 1}`;
              dependencies.push(prevNodeId);
            }
            if (containerIndex > 0) {
              const prevContainer = workflow.containers[containerIndex - 1];
              if (prevContainer.nodes && prevContainer.nodes.length > 0) {
                const lastNodeId =
                  prevContainer.nodes[prevContainer.nodes.length - 1].id ||
                  `node-${prevContainer.nodes.length - 1}`;
                dependencies.push(lastNodeId);
              }
            }

            nodes.set(nodeId, {
              id: nodeId,
              type: node.type || 'unknown',
              label: node.label || node.type || 'Node',
              config: node.config || {},
              category: node.category,
              dependencies,
              branches: node.branches || node.routes,
            });

            // Add edges
            if (nodeIndex > 0) {
              const prevNodeId = container.nodes[nodeIndex - 1].id || `node-${nodeIndex - 1}`;
              edges.push({ from: prevNodeId, to: nodeId });
            }
          }
        } else {
          // Container as single node
          nodes.set(containerId, {
            id: containerId,
            type: container.type || 'container',
            label: container.label || container.title || 'Container',
            config: container.config || {},
            dependencies: containerIndex > 0 ? [workflow.containers[containerIndex - 1].id || `container-${containerIndex - 1}`] : [],
          });
        }

        // Add container edges
        if (containerIndex > 0) {
          const prevContainerId = workflow.containers[containerIndex - 1].id || `container-${containerIndex - 1}`;
          edges.push({ from: prevContainerId, to: containerId });
        }
      }

      // Last container's last node is exit
      const lastContainer = workflow.containers[workflow.containers.length - 1];
      if (lastContainer.nodes && lastContainer.nodes.length > 0) {
        const lastNodeId =
          lastContainer.nodes[lastContainer.nodes.length - 1].id ||
          `node-${lastContainer.nodes.length - 1}`;
        exitNodes.push(lastNodeId);
      } else {
        exitNodes.push(lastContainer.id || `container-${workflow.containers.length - 1}`);
      }
    }

    return {
      nodes,
      edges,
      entryNodes,
      exitNodes,
    };
  }

  /**
   * Support for loop nodes (for, while)
   * This is a placeholder for future loop implementation
   */
  private createLoopNode(
    nodeId: string,
    node: any,
    workflow: IWorkflow,
    execution: IWorkflowExecution
  ) {
    return async (state: LangGraphWorkflowState): Promise<Partial<LangGraphWorkflowState>> => {
      const loopType = node.config?.loopType || 'for';
      const iterations = node.config?.iterations || 1;
      const condition = node.config?.condition;

      // For loop
      if (loopType === 'for') {
        const results: any[] = [];
        for (let i = 0; i < iterations; i++) {
          // Execute loop body nodes
          if (node.nodes && Array.isArray(node.nodes)) {
            for (const loopNode of node.nodes) {
              const adapter = getNodeAdapter(`${nodeId}-iter-${i}-${loopNode.id}`, loopNode, workflow, execution);
              const stateUpdate = await adapter(state);
              Object.assign(state, stateUpdate);
              results.push(stateUpdate.nodeResults?.get(`${nodeId}-iter-${i}-${loopNode.id}`));
            }
          }
        }
        return {
          nodeResults: new Map(state.nodeResults).set(nodeId, results),
        };
      }

      // While loop
      if (loopType === 'while' && condition) {
        const results: any[] = [];
        let iteration = 0;
        const maxIterations = node.config?.maxIterations || 100;

        // Evaluate condition (simplified - would use conditional node executor)
        while (iteration < maxIterations) {
          // Execute loop body
          if (node.nodes && Array.isArray(node.nodes)) {
            for (const loopNode of node.nodes) {
              const adapter = getNodeAdapter(`${nodeId}-iter-${iteration}-${loopNode.id}`, loopNode, workflow, execution);
              const stateUpdate = await adapter(state);
              Object.assign(state, stateUpdate);
              results.push(stateUpdate.nodeResults?.get(`${nodeId}-iter-${iteration}-${loopNode.id}`));
            }
          }
          iteration++;
          // TODO: Evaluate condition to break loop
        }
        return {
          nodeResults: new Map(state.nodeResults).set(nodeId, results),
        };
      }

      return {};
    };
  }

  /**
   * Create initial state for workflow execution
   */
  createInitialState(
    workflow: IWorkflow,
    execution: IWorkflowExecution,
    input: Record<string, any> = {}
  ): LangGraphWorkflowState {
    // Calculate total steps
    const totalSteps = (workflow.containers || []).reduce((sum: number, container: any) => {
      return sum + (container.nodes?.length || 0) + (container.nodes ? 0 : 1);
    }, 0);

    // Initialize steps
    const steps: LangGraphWorkflowState['steps'] = [];
    if (workflow.containers && workflow.containers.length > 0) {
      for (const container of workflow.containers) {
        if (container.nodes && Array.isArray(container.nodes)) {
          for (const node of container.nodes) {
            steps.push({
              stepId: node.id || `node-${Date.now()}`,
              stepName: node.label || node.type || 'Node',
              stepType: node.type || 'unknown',
              status: 'pending',
              input: node.config || {},
            });
          }
        } else {
          steps.push({
            stepId: container.id || `container-${Date.now()}`,
            stepName: container.label || container.title || container.type || 'Container',
            stepType: container.type || 'container',
            status: 'pending',
            input: container.config || {},
          });
        }
      }
    }

    return {
      workflowId: workflow._id.toString(),
      userId: execution.userId.toString(),
      executionId: execution._id.toString(),
      status: 'pending',
      triggers: workflow.triggers || [],
      containers: workflow.containers || [],
      input: input,
      variables: { ...input },
      nodeResults: new Map(),
      steps: steps,
      branchConditions: new Map(),
      activeBranches: [],
      errors: [],
      aiTokensUsed: 0,
      apiCallsMade: 0,
      totalSteps: totalSteps,
      stepsExecuted: 0,
      triggeredBy: (execution.triggeredBy as 'manual' | 'webhook' | 'scheduled' | 'event' | 'task-scheduled') || 'manual',
      triggerData: execution.triggerData,
      loopCounters: {},
      loopLimits: {},
      version: workflow.version?.toString() || '1',
    };
  }
}

export const langGraphBuilderService = new LangGraphBuilderService();


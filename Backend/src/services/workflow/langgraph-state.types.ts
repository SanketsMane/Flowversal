
/**
 * LangGraph Workflow State
 * This state is passed through the LangGraph execution graph
 */
export interface LangGraphWorkflowState {
  // Workflow metadata
  workflowId: string;
  userId: string;
  executionId: string;
  
  // Execution status
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'stopped';
  
  // Workflow structure
  triggers: any[];
  containers: any[];
  
  // Execution context
  input: Record<string, any>;
  variables: Record<string, any>;
  
  // Node execution results
  // Key: nodeId, Value: node output
  nodeResults: Map<string, any>;
  
  // Step execution tracking
  steps: Array<{
    stepId: string;
    stepName: string;
    stepType: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startedAt?: Date;
    completedAt?: Date;
    duration?: number;
    input?: any;
    output?: any;
    error?: string;
  }>;
  
  // Current execution path
  currentStep?: string;
  currentContainer?: string;
  
  // Branch conditions and routing
  branchConditions: Map<string, boolean>;
  activeBranches: string[];
  
  // Error tracking
  errors: Array<{
    nodeId?: string;
    stepId?: string;
    message: string;
    stack?: string;
    timestamp: Date;
  }>;
  
  // Execution metrics
  aiTokensUsed: number;
  apiCallsMade: number;
  totalSteps: number;
  stepsExecuted: number;
  
  // Timing
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  
  // Trigger data
  triggeredBy: 'manual' | 'webhook' | 'scheduled' | 'event' | 'task-scheduled';
  triggerData?: Record<string, any>;
  
  // Checkpointing
  checkpoint?: {
    nodeId: string;
    state: Partial<LangGraphWorkflowState>;
    timestamp: Date;
  };
  // Loop tracking
  loopCounters?: Record<string, number>;
  loopLimits?: Record<string, number>;
  // Workflow versioning
  version?: string;
}

/**
 * Node execution context for LangGraph nodes
 */
export interface LangGraphNodeContext {
  nodeId: string;
  nodeType: string;
  nodeConfig: any;
  workflowState: LangGraphWorkflowState;
  previousNodeOutputs: Map<string, any>;
}

/**
 * Node execution result
 */
export interface LangGraphNodeResult {
  success: boolean;
  output?: any;
  error?: {
    message: string;
    stack?: string;
  };
  metadata?: {
    tokensUsed?: number;
    apiCallsMade?: number;
    duration?: number;
  };
}

/**
 * Branch condition result
 */
export interface BranchConditionResult {
  condition: string;
  result: boolean;
  branchPath: string;
}

/**
 * Workflow graph node definition
 */
export interface WorkflowGraphNode {
  id: string;
  type: string;
  label: string;
  config: any;
  category?: string;
  dependencies: string[]; // IDs of nodes that must execute before this one
  branches?: Array<{
    condition: string;
    targetNodeId: string;
  }>;
}

/**
 * Workflow graph structure
 */
export interface WorkflowGraph {
  nodes: Map<string, WorkflowGraphNode>;
  edges: Array<{
    from: string;
    to: string;
    condition?: string;
  }>;
  entryNodes: string[]; // Nodes that can start execution
  exitNodes: string[]; // Nodes that end execution
}



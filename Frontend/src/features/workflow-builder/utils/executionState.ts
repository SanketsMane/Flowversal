/**
 * Execution State Utilities
 * Tracks workflow execution status for visual feedback
 */

export type NodeExecutionState = 'idle' | 'pending' | 'running' | 'success' | 'error' | 'skipped';

export interface NodeExecutionResult {
  nodeId: string;
  state: NodeExecutionState;
  startTime?: number;
  endTime?: number;
  duration?: number;
  error?: string;
  output?: any;
}

export interface WorkflowExecutionState {
  isExecuting: boolean;
  currentStep: number;
  totalSteps: number;
  nodeStates: Map<string, NodeExecutionState>;
  nodeResults: Map<string, NodeExecutionResult>;
  startTime?: number;
  endTime?: number;
}

/**
 * Get color for execution state
 */
export function getExecutionStateColor(state: NodeExecutionState, theme: 'light' | 'dark'): string {
  const colors = {
    idle: theme === 'dark' ? '#888899' : '#9CA3AF',
    pending: theme === 'dark' ? '#FCD34D' : '#F59E0B',
    running: theme === 'dark' ? '#818CF8' : '#6366F1',
    success: theme === 'dark' ? '#34D399' : '#10B981',
    error: theme === 'dark' ? '#FCA5A5' : '#EF4444',
    skipped: theme === 'dark' ? '#888899' : '#9CA3AF',
  };
  return colors[state];
}

/**
 * Get icon name for execution state
 */
export function getExecutionStateIcon(state: NodeExecutionState): string {
  const icons = {
    idle: 'Circle',
    pending: 'Clock',
    running: 'Loader',
    success: 'CheckCircle2',
    error: 'XCircle',
    skipped: 'MinusCircle',
  };
  return icons[state];
}

/**
 * Format execution duration
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

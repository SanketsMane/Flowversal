/**
 * Connection Point Types for Flowversal
 * Supports spine-based architecture with branches
 */

export type ConnectionPointType = 
  | 'trigger-output'      // Purple spine output
  | 'step-input'          // Blue spine input (receives from trigger/previous step)
  | 'step-output'         // Blue spine output (continues to next step)
  | 'node-input'          // Node left dot (receives from spine or previous node)
  | 'node-output'         // Node right dot (connects to next node or spine)
  | 'branch-split'        // Red spine split point
  | 'branch-output'       // Red spine output
  | 'branch-rejoin';      // Red spine rejoin point

export type ConnectionLineType =
  | 'spine-purple'        // Trigger spine
  | 'spine-blue'          // Main workflow spine
  | 'spine-red'           // Branch spine
  | 'node-connection'     // Node to node
  | 'node-to-spine'       // Node back to spine
  | 'spine-to-node';      // Spine to node input

export interface ConnectionPoint {
  id: string;
  type: ConnectionPointType;
  
  // Identity
  ownerId: string;        // triggerId, stepId, nodeId, or branchId
  ownerType: 'trigger' | 'step' | 'node' | 'branch';
  
  // Position (absolute canvas coordinates)
  position: { x: number; y: number };
  
  // Visual
  color: 'purple' | 'blue' | 'red' | 'green';
  size: 'small' | 'medium' | 'large';
  
  // Connection rules
  canConnectTo: ConnectionPointType[];
  
  // DOM reference
  element: HTMLElement | null;
}

export interface ConnectionLine {
  id: string;
  type: ConnectionLineType;
  
  sourceId: string;       // Source dot ID
  targetId: string;       // Target dot ID
  
  // Visual
  color: string;
  width: number;
  animated?: boolean;
  
  // Path type
  pathStyle: 'straight' | 'curved' | 'step' | 'spine';
}

// Helper: Define which connection types can connect to which
export function getCompatibleTargets(type: ConnectionPointType): ConnectionPointType[] {
  const rules: Record<ConnectionPointType, ConnectionPointType[]> = {
    'trigger-output': ['step-input'],
    'step-input': [],  // Can't initiate connections
    'step-output': ['step-input'],
    'node-input': [],  // Can't initiate connections
    'node-output': ['node-input', 'step-input'],
    'branch-split': ['node-input'],
    'branch-output': ['branch-rejoin', 'step-input'],
    'branch-rejoin': [],  // Can't initiate connections
  };
  
  return rules[type] || [];
}

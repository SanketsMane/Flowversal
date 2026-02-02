/**
 * Node Types
 * Extracted from WorkflowBuilderV2.tsx - Phase 1 Refactor
 */

import { LucideIcon } from 'lucide-react';

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  category: string;
  icon?: LucideIcon; // Made optional since it's stripped during serialization
  config: Record<string, any>;
  enabled?: boolean;
  branches?: BranchContainer[]; // For If/Switch nodes (old system)
  routes?: BranchRoute[]; // For If/Switch nodes (new routing system)
}

export interface BranchContainer {
  id: string;
  type: string; // 'true' | 'false' | 'case1' | 'case2' | ... | 'default'
  label: string; // "True", "False", "Case 1", etc.
  condition?: any; // Condition for this branch
  nodes: WorkflowNode[]; // Nodes in this branch
  position?: { x: number; y: number }; // Canvas position for draggable branch boxes
}

export interface BranchRoute {
  id: string;
  type: string; // 'true' | 'false' | 'case1' | 'case2' | ... | 'default'
  label: string; // "True", "False", "Case 1", etc.
  condition?: any; // Condition for this branch
  action: 'continue' | 'end' | 'goto'; // Routing action
  targetStepId?: string | null; // Target step ID for 'goto' action
}

export interface NodeTemplate {
  type: string;
  label: string;
  category: string;
  icon: LucideIcon;
  description?: string;
  defaultConfig?: Record<string, any>;
  color?: string;
  tags?: string[];
}

export interface ConditionalNode {
  id: string;
  type: string;
  label: string;
  category: 'node' | 'tool';
  config: Record<string, any>;
  enabled?: boolean;
}

export type NodeCategory = 'logic' | 'ai' | 'action' | 'output' | 'integration' | 'ai-agents';
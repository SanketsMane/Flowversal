/**
 * Drag & Drop Types
 * Phase 4 Part 1 - Drag & Drop System
 */

export type DragItemType = 
  | 'FORM_FIELD'
  | 'WORKFLOW_STEP'
  | 'TRIGGER_CARD'
  | 'NODE_CARD'
  | 'TOOL_CARD'
  | 'SIDEBAR_TRIGGER'
  | 'SIDEBAR_NODE'
  | 'SIDEBAR_TOOL';

export interface DragItem {
  type: DragItemType;
  id: string;
  index?: number;
  data?: any;
}

export interface FormFieldDragItem extends DragItem {
  type: 'FORM_FIELD';
  fieldId: string;
  index: number;
}

export interface WorkflowStepDragItem extends DragItem {
  type: 'WORKFLOW_STEP';
  stepIndex: number;
}

export interface TriggerDragItem extends DragItem {
  type: 'TRIGGER_CARD';
  triggerId: string;
}

export interface NodeDragItem extends DragItem {
  type: 'NODE_CARD';
  nodeId: string;
  stepIndex: number;
  nodeIndex: number;
}

export interface ToolDragItem extends DragItem {
  type: 'TOOL_CARD';
  toolId: string;
  stepIndex: number;
  toolIndex: number;
}

export interface SidebarTriggerDragItem extends DragItem {
  type: 'SIDEBAR_TRIGGER';
  templateId: string;
  data: any;
}

export interface SidebarNodeDragItem extends DragItem {
  type: 'SIDEBAR_NODE';
  templateId: string;
  data: any;
}

export interface SidebarToolDragItem extends DragItem {
  type: 'SIDEBAR_TOOL';
  templateId: string;
  data: any;
}

export interface DropResult {
  dropIndex?: number;
  dropPosition?: 'before' | 'after';
  targetId?: string;
  dropZone?: string;
}

export interface DragPreviewData {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  type: DragItemType;
}

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface CanvasDropResult extends DropResult {
  position: CanvasPosition;
}

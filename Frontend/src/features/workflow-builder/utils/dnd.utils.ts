/**
 * Drag & Drop Utilities
 * Phase 4 Part 1 - Drag & Drop System
 */

import { DragItemType, CanvasPosition } from '../types/dnd.types';

/**
 * Reorder items in an array
 */
export function reorderArray<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const result = Array.from(array);
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Move item from one array to another
 */
export function moveItemBetweenArrays<T>(
  sourceArray: T[],
  destinationArray: T[],
  sourceIndex: number,
  destinationIndex: number
): { source: T[]; destination: T[] } {
  const sourceClone = Array.from(sourceArray);
  const destClone = Array.from(destinationArray);
  const [removed] = sourceClone.splice(sourceIndex, 1);
  destClone.splice(destinationIndex, 0, removed);

  return {
    source: sourceClone,
    destination: destClone,
  };
}

/**
 * Calculate drop position based on mouse position
 */
export function calculateDropPosition(
  mouseY: number,
  elementRect: DOMRect
): 'before' | 'after' {
  const elementMiddle = elementRect.top + elementRect.height / 2;
  return mouseY < elementMiddle ? 'before' : 'after';
}

/**
 * Calculate canvas position from client coordinates
 */
export function calculateCanvasPosition(
  clientX: number,
  clientY: number,
  canvasRect: DOMRect,
  scale: number = 1
): CanvasPosition {
  return {
    x: (clientX - canvasRect.left) / scale,
    y: (clientY - canvasRect.top) / scale,
  };
}

/**
 * Get drag item type display name
 */
export function getDragItemTypeName(type: DragItemType): string {
  const names: Record<DragItemType, string> = {
    FORM_FIELD: 'Form Field',
    WORKFLOW_STEP: 'Workflow Step',
    TRIGGER_CARD: 'Trigger',
    NODE_CARD: 'Node',
    TOOL_CARD: 'Tool',
    SIDEBAR_TRIGGER: 'Trigger Template',
    SIDEBAR_NODE: 'Node Template',
    SIDEBAR_TOOL: 'Tool Template',
  };
  return names[type] || 'Unknown';
}

/**
 * Check if drag types are compatible for drop
 */
export function canDrop(dragType: DragItemType, dropType: DragItemType): boolean {
  const compatibilityMap: Record<DragItemType, DragItemType[]> = {
    FORM_FIELD: ['FORM_FIELD'],
    WORKFLOW_STEP: ['WORKFLOW_STEP'],
    TRIGGER_CARD: ['TRIGGER_CARD'],
    NODE_CARD: ['NODE_CARD', 'SIDEBAR_NODE'],
    TOOL_CARD: ['TOOL_CARD', 'SIDEBAR_TOOL'],
    SIDEBAR_TRIGGER: ['TRIGGER_CARD'],
    SIDEBAR_NODE: ['NODE_CARD'],
    SIDEBAR_TOOL: ['TOOL_CARD'],
  };

  return compatibilityMap[dragType]?.includes(dropType) || false;
}

/**
 * Generate unique drop zone ID
 */
export function generateDropZoneId(prefix: string, index: number): string {
  return `${prefix}-drop-${index}`;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Snap position to grid
 */
export function snapToGrid(position: CanvasPosition, gridSize: number = 20): CanvasPosition {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
}

/**
 * Get element center position
 */
export function getElementCenter(rect: DOMRect): { x: number; y: number } {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if element is in viewport
 */
export function isInViewport(rect: DOMRect): boolean {
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Auto-scroll when dragging near edges
 */
export function autoScroll(
  clientX: number,
  clientY: number,
  scrollContainer: HTMLElement,
  threshold: number = 50,
  speed: number = 10
): void {
  const rect = scrollContainer.getBoundingClientRect();

  // Scroll vertically
  if (clientY < rect.top + threshold) {
    scrollContainer.scrollTop -= speed;
  } else if (clientY > rect.bottom - threshold) {
    scrollContainer.scrollTop += speed;
  }

  // Scroll horizontally
  if (clientX < rect.left + threshold) {
    scrollContainer.scrollLeft -= speed;
  } else if (clientX > rect.right - threshold) {
    scrollContainer.scrollLeft += speed;
  }
}

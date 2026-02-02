/**
 * Connections Utils - FIXED
 * Uses getBoundingClientRect for accurate positioning
 */

export interface Point {
  x: number;
  y: number;
}

export interface ConnectionPath {
  from: Point;
  to: Point;
  path: string;
  midPoint: Point;
}

/**
 * Calculate a smooth curved path between two points
 */
export function calculateSmoothPath(from: Point, to: Point): ConnectionPath {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  const offset = Math.min(Math.abs(dy) * 0.5, 100);
  
  const path = `M ${from.x} ${from.y} C ${from.x} ${from.y + offset}, ${to.x} ${to.y - offset}, ${to.x} ${to.y}`;
  
  const midPoint = {
    x: from.x + dx * 0.5,
    y: from.y + dy * 0.5,
  };
  
  return { from, to, path, midPoint };
}

/**
 * Calculate a straight path between two points
 */
export function calculateStraightPath(from: Point, to: Point): ConnectionPath {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  const path = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  
  const midPoint = {
    x: from.x + dx * 0.5,
    y: from.y + dy * 0.5,
  };
  
  return { from, to, path, midPoint };
}

/**
 * Calculate a stepped path (right angle) between two points
 */
export function calculateSteppedPath(from: Point, to: Point): ConnectionPath {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  const cornerY = from.y + dy * 0.5;
  
  const path = `M ${from.x} ${from.y} L ${from.x} ${cornerY} L ${to.x} ${cornerY} L ${to.x} ${to.y}`;
  
  const midPoint = {
    x: from.x + dx * 0.5,
    y: cornerY,
  };
  
  return { from, to, path, midPoint };
}

/**
 * Get element position using getBoundingClientRect relative to a reference element
 * @param element - The element to get position for
 * @param referenceElement - The reference element (usually SVG or container)
 * @param position - Which point of the element to get
 */
function getElementPosition(
  element: HTMLElement | null,
  referenceElement: HTMLElement | null,
  position: 'top' | 'bottom' | 'center' | 'left' | 'right'
): Point | null {
  if (!element || !referenceElement) return null;

  try {
    const elementRect = element.getBoundingClientRect();
    const referenceRect = referenceElement.getBoundingClientRect();

    let x = elementRect.left - referenceRect.left;
    let y = elementRect.top - referenceRect.top;

    // Adjust for desired position
    switch (position) {
      case 'top':
        x += elementRect.width / 2;
        break;
      case 'bottom':
        x += elementRect.width / 2;
        y += elementRect.height;
        break;
      case 'left':
        y += elementRect.height / 2;
        break;
      case 'right':
        x += elementRect.width;
        y += elementRect.height / 2;
        break;
      case 'center':
      default:
        x += elementRect.width / 2;
        y += elementRect.height / 2;
        break;
    }

    return { x, y };
  } catch (error) {
    return null;
  }
}

/**
 * Get the bottom center point of a DOM element
 */
export function getElementBottom(element: HTMLElement | null, containerElement?: HTMLElement | null): Point | null {
  return getElementPosition(element, containerElement || element?.offsetParent as HTMLElement, 'bottom');
}

/**
 * Get the top center point of a DOM element
 */
export function getElementTop(element: HTMLElement | null, containerElement?: HTMLElement | null): Point | null {
  return getElementPosition(element, containerElement || element?.offsetParent as HTMLElement, 'top');
}

/**
 * Get the center point of a DOM element
 */
export function getElementCenter(element: HTMLElement | null, containerElement?: HTMLElement | null): Point | null {
  return getElementPosition(element, containerElement || element?.offsetParent as HTMLElement, 'center');
}

/**
 * Get the right center point of a DOM element
 */
export function getElementRight(element: HTMLElement | null, containerElement?: HTMLElement | null): Point | null {
  return getElementPosition(element, containerElement || element?.offsetParent as HTMLElement, 'right');
}

/**
 * Get the left center point of a DOM element
 */
export function getElementLeft(element: HTMLElement | null, containerElement?: HTMLElement | null): Point | null {
  return getElementPosition(element, containerElement || element?.offsetParent as HTMLElement, 'left');
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(from: Point, to: Point): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if a point is near a line (for click detection)
 */
export function isPointNearPath(point: Point, path: ConnectionPath, threshold: number = 10): boolean {
  const distance = calculateDistance(point, path.midPoint);
  return distance < threshold;
}

/**
 * Legacy function for compatibility
 */
export function getElementPositionInCanvas(
  element: HTMLElement | null,
  containerElement: HTMLElement | null,
  position: 'top' | 'bottom' | 'center' | 'left' | 'right'
): Point | null {
  return getElementPosition(element, containerElement, position);
}

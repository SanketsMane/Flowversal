/**
 * Canvas Position Utilities
 * Provides accurate position calculations for elements in canvas space
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Get the current zoom level from the transformed container
 */
function getCurrentZoom(): number {
  // Find the transformed container
  const elements = document.querySelectorAll('[style*="transform"]');
  for (const el of elements) {
    const style = (el as HTMLElement).style.transform;
    if (style && style.includes('scale') && style.includes('translate')) {
      const scaleMatch = style.match(/scale\(([\d.]+)\)/);
      if (scaleMatch) {
        return parseFloat(scaleMatch[1]);
      }
    }
  }
  return 1;
}

/**
 * Get the transformed container element
 */
function getTransformedContainer(): HTMLElement | null {
  const elements = document.querySelectorAll('[style*="transform"]');
  for (const el of elements) {
    const style = (el as HTMLElement).style.transform;
    if (style && style.includes('scale') && style.includes('translate')) {
      return el as HTMLElement;
    }
  }
  return null;
}

/**
 * Get element position in canvas space (zoom-independent coordinates)
 * Works by converting screen-space positions to canvas-space
 */
export function getElementCanvasPosition(
  element: HTMLElement | null,
  anchorPoint: 'top' | 'bottom' | 'center' | 'left' | 'right' = 'center'
): Point | null {
  if (!element) return null;

  try {
    const transformedContainer = getTransformedContainer();
    if (!transformedContainer) {
      console.warn('Transformed container not found');
      return null;
    }

    // Get bounding rects (screen-space coordinates)
    const elementRect = element.getBoundingClientRect();
    const containerRect = transformedContainer.getBoundingClientRect();

    // Get current zoom level
    const zoom = getCurrentZoom();

    // Calculate position in screen space relative to container
    const screenX = elementRect.left - containerRect.left;
    const screenY = elementRect.top - containerRect.top;

    // Convert from screen space to canvas space by dividing by zoom
    let canvasX = screenX / zoom;
    let canvasY = screenY / zoom;

    // Add element dimensions in canvas space
    const elementWidth = elementRect.width / zoom;
    const elementHeight = elementRect.height / zoom;

    // Adjust for anchor point
    switch (anchorPoint) {
      case 'top':
        canvasX += elementWidth / 2;
        break;
      case 'bottom':
        canvasX += elementWidth / 2;
        canvasY += elementHeight;
        break;
      case 'center':
        canvasX += elementWidth / 2;
        canvasY += elementHeight / 2;
        break;
      case 'left':
        canvasY += elementHeight / 2;
        break;
      case 'right':
        canvasX += elementWidth;
        canvasY += elementHeight / 2;
        break;
    }

    return { x: canvasX, y: canvasY };
  } catch (error) {
    console.error('Error calculating canvas position:', error);
    return null;
  }
}

/**
 * Get connection dot position in canvas space
 * Specifically for connection points with data attributes
 */
export function getConnectionDotPosition(
  nodeId: string,
  routeId: string,
  pointType: 'output' | 'input'
): Point | null {
  try {
    let dotElement: HTMLElement | null = null;

    if (pointType === 'output') {
      // Output dot on parent node (If/Switch node)
      const nodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
      if (!nodeEl) return null;
      
      dotElement = nodeEl.querySelector(
        `[data-connection-point="node-output"][data-route-id="${routeId}"]`
      ) as HTMLElement;
    } else {
      // Input dot on branch card
      const branchEl = document.querySelector(`[data-branch-id="${routeId}"]`);
      if (!branchEl) return null;
      
      dotElement = branchEl.querySelector(
        '[data-connection-point="branch-input"]'
      ) as HTMLElement;
    }

    if (!dotElement) {
      console.warn(`Connection dot not found: nodeId=${nodeId}, routeId=${routeId}, type=${pointType}`);
      return null;
    }

    // Get center of the dot
    return getElementCanvasPosition(dotElement, 'center');
  } catch (error) {
    console.error('Error getting connection dot position:', error);
    return null;
  }
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

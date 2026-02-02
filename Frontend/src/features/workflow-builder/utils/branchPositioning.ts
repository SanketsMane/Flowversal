/**
 * Branch Positioning System with Collision Detection
 * Implements HORIZONTAL SIDE-BY-SIDE LAYOUT
 * 
 * Pattern: Branch cards positioned HORIZONTALLY to the RIGHT of parent node
 * All cards aligned at same Y position as parent, spaced horizontally
 * 
 * HORIZONTAL SPACING RULES:
 * - First card: parent right edge + 20px
 * - Second card: first card right edge + 10px
 * - Third card: second card right edge + 10px
 * - Formula: X = parentX + parentWidth + 20 (first) | previousX + cardWidth + 10 (subsequent)
 * 
 * CARD ORDER:
 * - IF node: True first, then False
 * - Switch node: Default first, then Case 1, Case 2, Case 3, etc.
 * 
 * Example Layout (IF node):
 * 
 * [Workflow]
 *   [IF Node] ──20px──> [True] ──10px──> [False]
 *      Y=200              Y=200            Y=200
 * 
 * Example Layout (Switch node):
 * 
 * [Workflow]
 *   [Switch] ──20px──> [Default] ──10px──> [Case 1] ──10px──> [Case 2]
 *     Y=300               Y=300              Y=300              Y=300
 * 
 * Card Spacing:
 * - First card from parent: 20px horizontal gap
 * - Between cards: 10px horizontal gap
 * - Y-alignment: same as parent node
 * - Card width: 280px
 * - Collision padding: 20px minimum spacing
 * 
 * Connection Lines:
 * - Connect from colored dots (green/red/grey/blue) on parent node
 * - Lines go horizontally to respective branch cards
 * - All cards at same vertical level for clean horizontal flow
 */

import { WorkflowNode } from '../types/node.types';

// ============================================================================
// TYPES
// ============================================================================

interface Obstacle {
  id: string;
  type: 'trigger' | 'node' | 'tool' | 'branch';
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BranchPositionConfig {
  branchWidth: number;
  horizontalGap: number;
  verticalGap: number;
  minSpacing: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: BranchPositionConfig = {
  branchWidth: 280,
  horizontalGap: 300,
  verticalGap: 120,
  minSpacing: 40,
};

// ============================================================================
// DOM HELPERS
// ============================================================================

/**
 * Get node dimensions from DOM with proper coordinate transformation
 * Returns null if node is not found (silently - no error)
 */
function getNodeDimensions(nodeId: string): {
  x: number;
  y: number;
  width: number;
  height: number;
} | null {
  const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement;
  if (!nodeElement) {
    // Node might not be in DOM yet or might be inside a branch
    // This is normal during initial render
    return null;
  }

  const rect = nodeElement.getBoundingClientRect();
  const canvas = document.querySelector('.infinite-canvas-content') as HTMLElement;
  if (!canvas) {
    return null;
  }

  const canvasRect = canvas.getBoundingClientRect();
  const transform = window.getComputedStyle(canvas).transform;
  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  if (transform && transform !== 'none') {
    const matrix = transform.match(/matrix\(([^)]+)\)/);
    if (matrix) {
      const values = matrix[1].split(',').map(parseFloat);
      scale = values[0];
      translateX = values[4];
      translateY = values[5];
    }
  }

  return {
    x: (rect.left - canvasRect.left - translateX) / scale,
    y: (rect.top - canvasRect.top - translateY) / scale,
    width: rect.width / scale,
    height: rect.height / scale,
  };
}

/**
 * Get branch box height from DOM
 */
function getBranchBoxHeight(branchId: string): number {
  const branchElement = document.querySelector(`[data-branch-id="${branchId}"]`) as HTMLElement;
  if (!branchElement) {
    return 200; // Default height
  }

  const rect = branchElement.getBoundingClientRect();
  const canvas = document.querySelector('.infinite-canvas-content') as HTMLElement;
  if (!canvas) {
    return rect.height;
  }

  const transform = window.getComputedStyle(canvas).transform;
  let scale = 1;

  if (transform && transform !== 'none') {
    const matrix = transform.match(/matrix\(([^)]+)\)/);
    if (matrix) {
      const values = matrix[1].split(',').map(parseFloat);
      scale = values[0];
    }
  }

  return rect.height / scale;
}

/**
 * Collect all obstacles (triggers, nodes, tools) from the DOM
 */
function collectAllObstacles(): Obstacle[] {
  const obstacles: Obstacle[] = [];
  const canvas = document.querySelector('.infinite-canvas-content') as HTMLElement;
  if (!canvas) return obstacles;

  const canvasRect = canvas.getBoundingClientRect();
  const transform = window.getComputedStyle(canvas).transform;
  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  if (transform && transform !== 'none') {
    const matrix = transform.match(/matrix\(([^)]+)\)/);
    if (matrix) {
      const values = matrix[1].split(',').map(parseFloat);
      scale = values[0];
      translateX = values[4];
      translateY = values[5];
    }
  }

  // Collect triggers
  const triggers = document.querySelectorAll('[data-trigger-id]');
  triggers.forEach((el) => {
    const id = (el as HTMLElement).dataset.triggerId;
    if (!id) return;

    const rect = el.getBoundingClientRect();
    obstacles.push({
      id,
      type: 'trigger',
      x: (rect.left - canvasRect.left - translateX) / scale,
      y: (rect.top - canvasRect.top - translateY) / scale,
      width: rect.width / scale,
      height: rect.height / scale,
    });
  });

  // Collect nodes
  const nodes = document.querySelectorAll('[data-node-id]');
  nodes.forEach((el) => {
    const id = (el as HTMLElement).dataset.nodeId;
    if (!id) return;

    const rect = el.getBoundingClientRect();
    obstacles.push({
      id,
      type: 'node',
      x: (rect.left - canvasRect.left - translateX) / scale,
      y: (rect.top - canvasRect.top - translateY) / scale,
      width: rect.width / scale,
      height: rect.height / scale,
    });
  });

  // Collect tools
  const tools = document.querySelectorAll('[data-tool-id]');
  tools.forEach((el) => {
    const id = (el as HTMLElement).dataset.toolId;
    if (!id) return;

    const rect = el.getBoundingClientRect();
    obstacles.push({
      id,
      type: 'tool',
      x: (rect.left - canvasRect.left - translateX) / scale,
      y: (rect.top - canvasRect.top - translateY) / scale,
      width: rect.width / scale,
      height: rect.height / scale,
    });
  });

  // Collect branches
  const branches = document.querySelectorAll('[data-branch-id]');
  branches.forEach((el) => {
    const id = (el as HTMLElement).dataset.branchId;
    if (!id) return;

    const rect = el.getBoundingClientRect();
    obstacles.push({
      id,
      type: 'branch',
      x: (rect.left - canvasRect.left - translateX) / scale,
      y: (rect.top - canvasRect.top - translateY) / scale,
      width: rect.width / scale,
      height: rect.height / scale,
    });
  });

  return obstacles;
}

// ============================================================================
// COLLISION DETECTION
// ============================================================================

/**
 * Check if two boxes overlap with minimum spacing
 */
function boxesOverlap(
  box1: { x: number; y: number; width: number; height: number },
  box2: { x: number; y: number; width: number; height: number },
  minSpacing: number
): boolean {
  return !(
    box1.x + box1.width + minSpacing < box2.x ||
    box2.x + box2.width + minSpacing < box1.x ||
    box1.y + box1.height + minSpacing < box2.y ||
    box2.y + box2.height + minSpacing < box1.y
  );
}

/**
 * Avoid collision with existing obstacles
 * Smart collision avoidance: tries small adjustments first, then larger moves
 */
function avoidCollision(
  proposedPos: { x: number; y: number },
  size: { width: number; height: number },
  obstacles: Obstacle[],
  padding: number
): { x: number; y: number } {
  const testBox = {
    x: proposedPos.x,
    y: proposedPos.y,
    width: size.width,
    height: size.height,
  };
  
  // Check if proposed position has collision
  const hasCollision = obstacles.some(obs => 
    boxesOverlap(testBox, obs, padding)
  );
  
  if (!hasCollision) {
    return proposedPos; // No collision, use as-is
  }
  
  console.log(`    ⚠️ Collision detected, finding alternative position...`);
  
  // Strategy 1: Try small vertical adjustments (±30px increments) - preserves horizontal alignment
  for (let offset = 30; offset <= 150; offset += 30) {
    // Try down first
    const downPos = { x: proposedPos.x, y: proposedPos.y + offset };
    const downBox = { ...testBox, y: downPos.y };
    if (!obstacles.some(obs => boxesOverlap(downBox, obs, padding))) {
      console.log(`    ✓ Moved down ${offset}px to avoid collision`);
      return downPos;
    }
    
    // Try up
    const upPos = { x: proposedPos.x, y: proposedPos.y - offset };
    const upBox = { ...testBox, y: upPos.y };
    if (!obstacles.some(obs => boxesOverlap(upBox, obs, padding))) {
      console.log(`    ✓ Moved up ${offset}px to avoid collision`);
      return upPos;
    }
  }
  
  // Strategy 2: Try moving right (move to next column)
  for (let offset = 330; offset <= 660; offset += 330) {
    const rightPos = { x: proposedPos.x + offset, y: proposedPos.y };
    const rightBox = { ...testBox, x: rightPos.x };
    if (!obstacles.some(obs => boxesOverlap(rightBox, obs, padding))) {
      console.log(`    ✓ Moved right ${offset}px to avoid collision`);
      return rightPos;
    }
  }
  
  // Strategy 3: Try larger vertical moves
  for (let offset = 200; offset <= 600; offset += 100) {
    const largeDownPos = { x: proposedPos.x, y: proposedPos.y + offset };
    const largeDownBox = { ...testBox, y: largeDownPos.y };
    if (!obstacles.some(obs => boxesOverlap(largeDownBox, obs, padding))) {
      console.log(`    ✓ Moved down ${offset}px to avoid collision`);
      return largeDownPos;
    }
  }
  
  // Last resort: move far right and down
  console.log(`    ⚠️ Using fallback position (far right)`);
  return { x: proposedPos.x + 400, y: proposedPos.y + 100 };
}

// ============================================================================
// MAIN POSITIONING LOGIC
// ============================================================================

/**
 * Calculate optimal positions for all branch boxes
 * NEW LOGIC: HORIZONTAL SIDE-BY-SIDE LAYOUT
 * 
 * Pattern: Branch cards positioned HORIZONTALLY to the RIGHT of parent node
 * All cards aligned at same Y position as parent, spaced horizontally
 * 
 * HORIZONTAL SPACING RULES:
 * - First card: parent right edge + 20px
 * - Second card: first card right edge + 10px
 * - Third card: second card right edge + 10px
 * - Formula: X = parentX + parentWidth + 20 (first) | previousX + cardWidth + 10 (subsequent)
 * 
 * CARD ORDER:
 * - IF node: True first, then False
 * - Switch node: Default first, then Case 1, Case 2, Case 3, etc.
 * 
 * Example Layout (IF node):
 * 
 * [Workflow]
 *   [IF Node] ──20px──> [True] ──10px──> [False]
 *      Y=200              Y=200            Y=200
 * 
 * Example Layout (Switch node):
 * 
 * [Workflow]
 *   [Switch] ──20px──> [Default] ──10px──> [Case 1] ──10px──> [Case 2]
 *     Y=300               Y=300              Y=300              Y=300
 * 
 * Card Spacing:
 * - First card from parent: 20px horizontal gap
 * - Between cards: 10px horizontal gap
 * - Y-alignment: same as parent node
 * - Card width: 280px
 * - Collision padding: 20px minimum spacing
 * 
 * Connection Lines:
 * - Connect from colored dots (green/red/grey/blue) on parent node
 * - Lines go horizontally to respective branch cards
 * - All cards at same vertical level for clean horizontal flow
 */
export function calculateAllBranchPositionsWithCollision(
  nodes: WorkflowNode[],
  config: Partial<BranchPositionConfig> = {}
): Map<string, { x: number; y: number }> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const positionsMap = new Map<string, { x: number; y: number }>();
  
  // Constants for the zig-zag pattern
  const HORIZONTAL_SPACING = 450; // Horizontal offset for zig-zag
  const VERTICAL_SPACING = 220; // Vertical spacing between cards
  const FIRST_CARD_OFFSET_X = 450; // Distance from parent to first card
  const FIRST_CARD_OFFSET_Y_START = -50; // Start slightly above parent
  const COLLISION_PADDING = 20; // 20px spacing between all elements
  
  try {
    // Get all obstacles EXCEPT branch cards (we'll add them as we position them)
    const allObstacles = collectAllObstacles().filter(obs => obs.type !== 'branch');
    
    // Get conditional nodes
    const conditionalNodes = nodes.filter(n => n && n.id && (n.type === 'if' || n.type === 'switch'));
    
    if (conditionalNodes.length === 0) return positionsMap;
    
    console.log('🎯 Calculating HORIZONTAL SIDE-BY-SIDE BRANCH POSITIONS:', {
      totalNodes: conditionalNodes.length,
      obstacles: allObstacles.length,
      pattern: 'Horizontal cards: parent+20px, then prev+10px for each subsequent card',
      cardOrder: 'IF: True→False | Switch: Default→Case1→Case2...',
    });
    
    // Track placed boxes
    const placedBoxes: Obstacle[] = [...allObstacles];
    
    // Process each node's branches
    conditionalNodes.forEach(node => {
      if (!node || !node.id) return;
      
      const parentDims = getNodeDimensions(node.id);
      if (!parentDims) {
        // Node not in DOM yet - skip silently (will retry on next render)
        return;
      }
      
      const routes = node.routes || [];
      const branches = node.branches || [];
      
      console.log(`\n📍 Processing ${node.type} node with ${routes.length} branches`);
      
      // Order routes based on node type:
      // IF node: True first, then False
      // Switch node: Default first, then Case 1, Case 2, Case 3, etc.
      let orderedRoutes: typeof routes = [];
      
      if (node.type === 'if') {
        // IF node: True first, then False
        const trueRoute = routes.find(r => 
          r.label?.toLowerCase().includes('true') || r.condition === 'true'
        );
        const falseRoute = routes.find(r => 
          r.label?.toLowerCase().includes('false') || r.condition === 'false'
        );
        
        if (trueRoute) orderedRoutes.push(trueRoute);
        if (falseRoute) orderedRoutes.push(falseRoute);
      } else if (node.type === 'switch') {
        // Switch node: Default first, then Cases in order
        const defaultRoute = routes.find(r => 
          r.label?.toLowerCase().includes('default') || r.condition === 'default'
        );
        const caseRoutes = routes.filter(r => 
          !(r.label?.toLowerCase().includes('default') || r.condition === 'default')
        );
        
        if (defaultRoute) orderedRoutes.push(defaultRoute);
        orderedRoutes.push(...caseRoutes);
      }
      
      console.log(`  📋 Order: ${orderedRoutes.map(r => r.label).join(' → ')}`);
      
      let processedCount = 0;
      
      // ============================================================================
      // Process routes in order: Cases first, Default last
      // HORIZONTAL ROW LAYOUT: Cards positioned from workflow container's right edge
      // ============================================================================
      
      // Get workflow container's right edge - THIS is the reference point
      const workflowContainerRight = getWorkflowContainerRightEdge();
      
      console.log(`  📐 Workflow container right edge: ${Math.round(workflowContainerRight)}px`);
      console.log(`  📐 Parent node position: (${Math.round(parentDims.x)}, ${Math.round(parentDims.y)})`);
      console.log(`  📐 Parent node right edge: ${Math.round(parentDims.x + parentDims.width)}px`);
      
      // Track horizontal position for placing cards side by side
      let cumulativeX = parentDims.x + parentDims.width + 20; // Start 20px right of parent
      
      // NEW: Track vertical position for different Y levels
      // Start from parent's Y position and increment for each branch
      let cumulativeY = parentDims.y; // Start at same Y as parent
      
      orderedRoutes.forEach((route, index) => {
        if (!route || !route.id) return;
        
        const branch = branches.find(b => b && b.id === route.id);
        const height = getBranchBoxHeight(route.id);
        
        let newPosition: { x: number; y: number };
        
        // Check if this branch was manually positioned (not at 0,0 and not at temp 2000,500)
        const isAtOrigin = !branch?.position || (branch.position.x === 0 && branch.position.y === 0);
        const isAtTempPosition = branch?.position && branch.position.x === 2000 && branch.position.y === 500;
        const isManuallyPositioned = branch?.position && !isAtOrigin && !isAtTempPosition;
        
        if (isManuallyPositioned) {
          // Use existing position and add to placed boxes
          newPosition = { x: branch.position!.x, y: branch.position!.y };
          console.log(`  🖱️ ${route.label} [${index + 1}]: Using manual position (${Math.round(newPosition.x)}, ${Math.round(newPosition.y)})`);
          
          // Add to placed boxes for future collision checks
          placedBoxes.push({
            id: route.id,
            type: 'branch',
            x: newPosition.x,
            y: newPosition.y,
            width: finalConfig.branchWidth,
            height: height,
          });
        } else {
          // HORIZONTAL ROW LAYOUT - cards side by side
          // First card: parent right + 20px
          // Subsequent cards: previous card right + 10px
          
          // NEW LOGIC: VERTICALLY STACKED AT DIFFERENT Y LEVELS
          // X position: Always same X (right of parent + 450px fixed distance)
          const xPosition = parentDims.x + parentDims.width + 450;
          
          // Y position: DIFFERENT for each branch - vertically stacked
          // First branch at parent's Y, next branches 250px below previous
          const yPosition = cumulativeY;
          
          // Initial proposed position
          const proposedPosition = {
            x: xPosition,
            y: yPosition,
          };
          
          console.log(`  → ${route.label} [${index}]: Proposed X=${Math.round(xPosition)} (parent+450px fixed), Y=${Math.round(proposedPosition.y)} (stack level ${index}), height=${Math.round(height)}`);
          
          // CHECK FOR COLLISIONS with all previously placed boxes
          const boxSize = { width: finalConfig.branchWidth, height: height };
          const adjustedPosition = avoidCollision(
            proposedPosition,
            boxSize,
            placedBoxes,
            COLLISION_PADDING
          );
          
          newPosition = adjustedPosition;
          
          console.log(`  ✓ ${route.label} [${index}]: Final X=${Math.round(newPosition.x)}, Y=${Math.round(newPosition.y)} (parent${yPosition >= 0 ? '+' : ''}${yPosition})`);
          
          // Add to placed boxes for future collision checks
          placedBoxes.push({
            id: route.id,
            type: 'branch',
            x: newPosition.x,
            y: newPosition.y,
            width: finalConfig.branchWidth,
            height: height,
          });
          
          // Update cumulative X for next card
          cumulativeX = newPosition.x + finalConfig.branchWidth + 10;
          
          // Update cumulative Y for next branch
          cumulativeY += 250;
        }
        
        positionsMap.set(route.id, newPosition);
        processedCount++;
        
        // Calculate offset from parent and workflow container
        const offsetFromParentX = Math.round(newPosition.x - (parentDims.x + parentDims.width));
        const offsetFromParentY = Math.round(newPosition.y - parentDims.y);
        const offsetFromWorkflow = Math.round(newPosition.x - workflowContainerRight);
        
        console.log(`  📍 ${route.label} Offsets: workflow+${offsetFromWorkflow}px | parent+(${offsetFromParentX}, ${offsetFromParentY})`);
      });
    });
  } catch (error) {
    console.error('❌ Error calculating branch positions:', error);
  }
  
  return positionsMap;
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export function getObstaclesExcept(excludeIds: string[]): Obstacle[] {
  return collectAllObstacles().filter(obs => !excludeIds.includes(obs.id));
}

/**
 * Get workflow container right edge (for reference)
 * ONLY considers nodes and tools - NOT triggers
 */
export function getWorkflowContainerRightEdge(): number {
  const canvas = document.querySelector('.infinite-canvas-content') as HTMLElement;
  if (!canvas) return 1400;

  // ONLY nodes and tools - NO triggers
  const nodes = Array.from(document.querySelectorAll('[data-node-id]'));
  const tools = Array.from(document.querySelectorAll('[data-tool-id]'));
  
  const transform = window.getComputedStyle(canvas).transform;
  let scale = 1;
  let translateX = 0;
  
  if (transform && transform !== 'none') {
    const matrix = transform.match(/matrix\(([^)]+)\)/);
    if (matrix) {
      const values = matrix[1].split(',').map(parseFloat);
      scale = values[0];
      translateX = values[4];
    }
  }

  const canvasRect = canvas.getBoundingClientRect();
  let maxRight = 0;
  
  // Only calculate from nodes and tools (workflow container items)
  [...nodes, ...tools].forEach(el => {
    const rect = (el as HTMLElement).getBoundingClientRect();
    const rightInCanvas = (rect.right - canvasRect.left - translateX) / scale;
    maxRight = Math.max(maxRight, rightInCanvas);
  });

  // Return actual right edge without padding - padding applied in positioning logic
  return maxRight > 0 ? maxRight : 1400;
}
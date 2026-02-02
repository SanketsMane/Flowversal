/**
 * SIMPLE Branch Positioning - NO COLLISION DETECTION
 * Just places cards to the right in a simple vertical grid
 * GUARANTEED TO WORK
 */

import { WorkflowNode } from '../types/node.types';

/**
 * Simple position calculation - just right side, vertical spacing
 */
export function calculateSimpleBranchPositions(
  nodes: WorkflowNode[]
): Map<string, { x: number; y: number }> {
  const positionsMap = new Map<string, { x: number; y: number }>();
  
  // Simple counter for vertical offset
  let globalVerticalOffset = 0;
  
  // Find all If/Switch nodes
  const conditionalNodes = nodes.filter(n => n && n.id && (n.type === 'if' || n.type === 'switch'));
  
  if (conditionalNodes.length === 0) return positionsMap;
  
  console.log('🎯 SIMPLE positioning for', conditionalNodes.length, 'nodes');
  
  conditionalNodes.forEach((node, nodeIndex) => {
    if (!node || !node.id) return;
    
    const routes = node.routes || [];
    const branches = node.branches || [];
    
    if (routes.length === 0) return;
    
    console.log(`📍 Node ${nodeIndex}: ${node.type} with ${routes.length} branches`);
    
    // Simple layout: 400px to the right, vertical spacing 220px
    routes.forEach((route, index) => {
      if (!route || !route.id) return;
      
      const position = {
        x: 1000, // Fixed right position
        y: globalVerticalOffset,
      };
      
      positionsMap.set(route.id, position);
      
      console.log(`  ✓ ${route.label}: x=${position.x}, y=${position.y}`);
      
      // Move down for next branch
      globalVerticalOffset += 220;
    });
    
    // Add extra space between different nodes
    globalVerticalOffset += 50;
  });
  
  return positionsMap;
}

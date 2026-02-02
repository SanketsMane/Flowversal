/**
 * BRANCH OUTPUT DOTS - Clean Rewrite v3
 * IF Node: True/False outputs
 * SWITCH Node: Multiple case outputs
 * Half-in, half-out positioning on right edge
 * UPDATED: Added [+] button on hover to add sub-steps + Delete button for switch cases
 */

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useConnectionStore } from '@/features/workflow-builder/stores/connectionStore';
import { useSubStepStore } from '@/features/workflow-builder/stores/subStepStore';
import { useViewport } from '../../contexts/ViewportContext';
import { useUIStore } from '../../stores/uiStore';

interface BranchOutputDotsProps {
  nodeId: string;
  nodeType: 'if' | 'switch';
  ownerType: 'node';
  branches: string[]; // ['true', 'false'] for IF, ['case1', 'case2', ...] for SWITCH
  parentContainerId?: string; // Container ID to add sub-steps
  onAddBranch?: () => void; // For switch nodes to add more branches
  onDeleteBranch?: (branch: string) => void; // For switch nodes to delete a branch
}

export function BranchOutputDots({ nodeId, nodeType, ownerType, branches, parentContainerId, onAddBranch, onDeleteBranch }: BranchOutputDotsProps) {
  const { theme } = useTheme();
  const { updateViewport, viewport } = useViewport();
  const [hoveringBranch, setHoveringBranch] = useState<string | null>(null);
  const dragConnection = useConnectionStore((state) => state.dragConnection);
  const connections = useConnectionStore((state) => state.connections);

  const bgColor = theme === 'dark' ? '#1A1A2E' : '#FFFFFF';
  
  // Get connection count for a specific branch
  const getConnectionCount = (branch: string) => {
    return connections.filter(c => 
      c.sourceId === nodeId && c.branchOutput === branch
    ).length;
  };

  // Colors for different branch types
  const getBranchColor = (branch: string) => {
    if (nodeType === 'if') {
      if (branch === 'true') return theme === 'dark' ? '#9D50BB' : '#8B3AA8'; // Purple
      if (branch === 'false') return theme === 'dark' ? '#9D50BB' : '#8B3AA8'; // Purple
    }
    // Switch node - all purple for consistency
    return theme === 'dark' ? '#9D50BB' : '#8B3AA8';
  };

  const getBranchLabel = (branch: string) => {
    if (nodeType === 'if') {
      return branch === 'true' ? 'True' : 'False';
    }
    // For switch nodes
    if (branch === 'default') {
      return 'Default';
    }
    // Extract case number from 'case1', 'case2', etc.
    const caseMatch = branch.match(/case(\d+)/i);
    if (caseMatch) {
      return `Case ${caseMatch[1]}`;
    }
    return branch; // Fallback to original name
  };

  const handleMouseDown = (e: React.MouseEvent, branchOutput: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Direct store access - no destructuring
    const store = useConnectionStore.getState();
    store.startDragConnection(nodeId, ownerType, branchOutput);
    store.updateDragPosition({ x: e.clientX, y: e.clientY });

    // Auto-scroll state
    let autoScrollInterval: number | null = null;
    const EDGE_THRESHOLD = 120; // Pixels from edge to trigger scroll (increased from 100)
    const MIN_SCROLL_SPEED = 5; // Minimum scroll speed
    const MAX_SCROLL_SPEED = 25; // Maximum scroll speed (increased from 15)

    const handleMouseMove = (e: MouseEvent) => {
      const store = useConnectionStore.getState();
      store.updateDragPosition({ x: e.clientX, y: e.clientY });
      
      // Auto-scroll logic
      const canvasElement = document.querySelector('.infinite-canvas-content') as HTMLElement;
      if (!canvasElement) return;
      
      const canvasRect = canvasElement.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      // Calculate distances from edges
      const distanceFromLeft = mouseX - canvasRect.left;
      const distanceFromRight = canvasRect.right - mouseX;
      const distanceFromTop = mouseY - canvasRect.top;
      const distanceFromBottom = canvasRect.bottom - mouseY;
      
      // Clear existing interval
      if (autoScrollInterval) {
        cancelAnimationFrame(autoScrollInterval);
        autoScrollInterval = null;
      }
      
      // Calculate progressive scroll speeds based on distance from edge
      // Closer to edge = faster scroll
      let scrollX = 0;
      let scrollY = 0;
      
      if (distanceFromLeft < EDGE_THRESHOLD && distanceFromLeft > 0) {
        // Progressive speed: closer to edge = faster
        const intensity = 1 - (distanceFromLeft / EDGE_THRESHOLD);
        scrollX = -(MIN_SCROLL_SPEED + (MAX_SCROLL_SPEED - MIN_SCROLL_SPEED) * intensity);
      } else if (distanceFromRight < EDGE_THRESHOLD && distanceFromRight > 0) {
        const intensity = 1 - (distanceFromRight / EDGE_THRESHOLD);
        scrollX = MIN_SCROLL_SPEED + (MAX_SCROLL_SPEED - MIN_SCROLL_SPEED) * intensity;
      }
      
      if (distanceFromTop < EDGE_THRESHOLD && distanceFromTop > 0) {
        const intensity = 1 - (distanceFromTop / EDGE_THRESHOLD);
        scrollY = -(MIN_SCROLL_SPEED + (MAX_SCROLL_SPEED - MIN_SCROLL_SPEED) * intensity);
      } else if (distanceFromBottom < EDGE_THRESHOLD && distanceFromBottom > 0) {
        const intensity = 1 - (distanceFromBottom / EDGE_THRESHOLD);
        scrollY = MIN_SCROLL_SPEED + (MAX_SCROLL_SPEED - MIN_SCROLL_SPEED) * intensity;
      }
      
      // Apply scrolling using viewport transform
      if (scrollX !== 0 || scrollY !== 0) {
        const autoScroll = () => {
          // Update viewport offset to "scroll" the canvas
          const currentViewport = useViewport.getState?.().viewport || viewport;
          updateViewport({
            offsetX: currentViewport.offsetX + scrollX,
            offsetY: currentViewport.offsetY + scrollY,
          });
          autoScrollInterval = requestAnimationFrame(autoScroll);
        };
        autoScrollInterval = requestAnimationFrame(autoScroll);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const store = useConnectionStore.getState();
      
      // Clear auto-scroll
      if (autoScrollInterval) {
        cancelAnimationFrame(autoScrollInterval);
        autoScrollInterval = null;
      }
      
      // Check if dropped on a valid LEFT side target
      const targetElement = document.elementFromPoint(e.clientX, e.clientY);
      const targetPoint = targetElement?.closest('[data-connection-point][data-side="left"]');
      
      if (targetPoint) {
        const targetId = targetPoint.getAttribute('data-owner-id');
        const targetType = targetPoint.getAttribute('data-owner-type') as 'trigger' | 'step' | 'node';
        
        if (targetId && targetType && targetId !== nodeId) {
          store.endDragConnection(targetId, targetType);
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
          return;
        }
      }
      
      // No valid target - cancel
      store.cancelDragConnection();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const isDragging = (branch: string) => {
    return dragConnection.isActive && 
           dragConnection.sourceId === nodeId && 
           dragConnection.branchOutput === branch;
  };

  // Handle adding sub-step for a specific branch
  const handleAddSubStep = (e: React.MouseEvent, branch: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🎯 [+] button clicked for branch!', { nodeId, branch, parentContainerId });
    
    if (parentContainerId) {
      // Open the node picker modal with branch substep context
      // This will allow the user to select which node to add to the new sub-step
      const uiStore = useUIStore.getState();
      const branchLabel = getBranchLabel(branch);
      
      console.log('✅ Opening node picker for branch sub-step:', { 
        nodeId, 
        branch, 
        branchLabel,
        parentContainerId 
      });
      
      uiStore.openNodePicker(
        'branch-substep',       // source: indicates we're adding a substep from a branch
        parentContainerId,      // containerId: the parent container
        nodeId,                 // nodeId: the node this substep is attached to
        branch,                 // branchId: the specific branch (true/false/case1/default)
        undefined               // insertIndex: not needed
      );
      
      console.log('✅ Node picker opened for branch sub-step creation!');
    } else {
      console.warn('⚠️ No parentContainerId provided');
    }
  };

  // Calculate vertical spacing for dots
  const dotSpacing = 56; // Increased gap between dots for [+] button
  const totalHeight = (branches.length - 1) * dotSpacing;
  const startOffset = -totalHeight / 2;

  return (
    <div
      className="absolute z-10"
      style={{
        right: '0',
        top: '50%',
        transform: 'translateX(50%) translateY(-50%)',
      }}
    >
      {branches.map((branch, index) => {
        const branchColor = getBranchColor(branch);
        const branchLabel = getBranchLabel(branch);
        const isHovering = hoveringBranch === branch;
        const isDrag = isDragging(branch);
        const offsetY = startOffset + (index * dotSpacing);
        
        // Can delete this case if it's a switch node AND it's not 'default'
        const canDelete = nodeType === 'switch' && branch !== 'default';

        return (
          <div
            key={`${nodeId}-${branch}-${index}`}
            className="absolute flex items-center gap-2 cursor-pointer"
            style={{
              top: `${offsetY}px`,
              left: '0',
            }}
            onMouseEnter={() => setHoveringBranch(branch)}
            onMouseLeave={() => setHoveringBranch(null)}
          >
            {/* ACTUAL CONNECTION DOT - This is what we query! */}
            <div
              data-connection-point="true"
              data-owner-id={nodeId}
              data-owner-type={ownerType}
              data-side="right"
              data-branch-output={branch}
              className="transition-all duration-200 relative cursor-pointer"
              style={{
                width: isHovering || isDrag ? '24px' : '12px', // Doubled size on hover
                height: isHovering || isDrag ? '24px' : '12px',
                background: branchColor,
                borderRadius: '50%',
                border: `${isHovering || isDrag ? '3px' : '2px'} solid ${bgColor}`, // Thicker border
                boxShadow: isHovering || isDrag
                  ? `0 0 24px ${branchColor}, 0 0 12px ${branchColor}60` // Stronger glow
                  : `0 0 8px ${branchColor}80`,
              }}
              onMouseDown={(e) => handleMouseDown(e, branch)}
              title={getConnectionCount(branch) > 0 ? `${getConnectionCount(branch)} connection${getConnectionCount(branch) > 1 ? 's' : ''}` : 'Drag to create connection'}
            />

            {/* Label - now participates in hover */}
            <span
              className="text-xs font-medium whitespace-nowrap"
              style={{
                color: branchColor,
                opacity: isHovering || isDrag ? 1 : 0.8,
                cursor: 'pointer',
              }}
              onMouseDown={(e) => handleMouseDown(e, branch)}
            >
              {branchLabel}
            </span>

            {/* [+] Add Sub-Step Button on hover */}
            {isHovering && parentContainerId && (
              <button
                onClick={(e) => handleAddSubStep(e, branch)}
                onMouseDown={(e) => e.stopPropagation()} // Prevent drag from starting
                className="ml-2 w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 flex items-center justify-center shadow-lg transition-all border-2 z-[1001]"
                style={{
                  borderColor: bgColor,
                }}
                title="Add sub-step to this branch"
              >
                <Plus className="w-4 h-4 text-white" style={{ strokeWidth: 3 }} />
              </button>
            )}
            
            {/* [X] Delete Case Button on hover - only for switch nodes with >1 case */}
            {isHovering && canDelete && onDeleteBranch && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDeleteBranch(branch);
                }}
                onMouseDown={(e) => e.stopPropagation()} // Prevent drag from starting
                className="ml-1 w-6 h-6 rounded-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 flex items-center justify-center shadow-lg transition-all border-2 z-[1001]"
                style={{
                  borderColor: bgColor,
                }}
                title="Delete this case"
              >
                <X className="w-3.5 h-3.5 text-white" style={{ strokeWidth: 3 }} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
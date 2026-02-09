/**
 * CONNECTION POINT - Clean Rewrite v2
 * Simple, maintainable connection dots with proper positioning
 * Half-in, half-out on container edges
 * UPDATED: Direct store access to avoid destructuring issues
 * UPDATED: [+] button on RIGHT dot hover to add sub-steps
 */
import { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useConnectionStore } from '@/features/workflow-builder/stores/connectionStore';
import { useViewport } from '../../contexts/ViewportContext';
import { useSubStepStore } from '@/features/workflow-builder/stores/subStepStore';
import { useUIStore } from '../../stores/uiStore';
interface ConnectionPointProps {
  ownerId: string;
  ownerType: 'trigger' | 'step' | 'node';
  side: 'left' | 'right';
  isConnected?: boolean;
  ownerName?: string;
  parentContainerId?: string; // Needed for creating sub-steps
}
export function ConnectionPoint({ ownerId, ownerType, side, isConnected = false, ownerName, parentContainerId }: ConnectionPointProps) {
  const { theme } = useTheme();
  const { updateViewport, viewport } = useViewport();
  const [isHovering, setIsHovering] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  // Get connection count for this dot
  const connections = useConnectionStore((state) => state.connections);
  const connectionCount = connections.filter(c => 
    side === 'left' ? c.targetId === ownerId : c.sourceId === ownerId
  ).length;
  // Colors
  const bgColor = theme === 'dark' ? '#1A1A2E' : '#FFFFFF';
  const dotColor = theme === 'dark' ? '#9D50BB' : '#8B3AA8'; // Purple
  const hoverColor = theme === 'dark' ? '#9D50BB20' : '#8B3AA810';
  // LEFT SIDE (Input) - Line visual
  const isLeftSide = side === 'left';
  // Mouse handlers for RIGHT side (draggable source)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (side !== 'right') return;
    e.preventDefault();
    e.stopPropagation();
    // Direct store access - no destructuring
    const store = useConnectionStore.getState();
    store.startDragConnection(ownerId, ownerType);
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
      // Apply scrolling using viewport transform instead of scrollBy
      if (scrollX !== 0 || scrollY !== 0) {
        const autoScroll = () => {
          // Update viewport offset to "scroll" the canvas
          // Get the latest viewport state each frame
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
        if (targetId && targetType && targetId !== ownerId) {
          store.endDragConnection(targetId, targetType);
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
          return;
        }
      }
      // No valid target - cancel
      if (typeof store.cancelDragConnection === 'function') {
        store.cancelDragConnection();
      } else {
        console.error('❌ cancelDragConnection is not a function!', store);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  // LEFT SIDE - Input connection line
  if (isLeftSide) {
    return (
      <div
        className="absolute z-10"
        style={{
          left: '0',
          top: '50%',
          transform: 'translateX(-50%) translateY(-50%)', // Half-in, half-out
        }}
      >
        {/* Hover glow background */}
        {isHovering && isConnected && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: '-40px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '80px',
              height: '64px',
              background: hoverColor,
              borderRadius: '8px',
            }}
          />
        )}
        {/* ACTUAL CONNECTION LINE - This is what we query! */}
        <div
          data-connection-point="true"
          data-owner-id={ownerId}
          data-owner-type={ownerType}
          data-side={side}
          className="relative flex items-center justify-center transition-all duration-200 cursor-pointer"
          style={{
            width: isHovering ? '28px' : '20px', // Increased from 20/24
            height: isHovering ? '48px' : '28px', // Increased from 24/32
            borderRadius: '6px 0 0 6px', // Slightly larger radius
            background: dotColor,
            border: `3px solid ${bgColor}`, // Thicker border on hover
            boxShadow: isHovering
              ? `0 0 24px ${dotColor}, 0 0 12px ${dotColor}60` // Stronger glow
              : `0 0 8px ${dotColor}80`,
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          title={connectionCount > 0 ? `${connectionCount} connection${connectionCount > 1 ? 's' : ''}` : 'Drop connections here'}
        >
          {/* Inner line accent */}
          <div
            style={{
              width: isHovering ? '8px' : '6px',
              height: isHovering ? '24px' : '14px', // More prominent
              background: bgColor,
              borderRadius: '3px',
              opacity: 0.4,
            }}
          />
        </div>
      </div>
    );
  }
  // RIGHT SIDE - Output connection dot with [+] button
  const handleAddSubStep = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (parentContainerId) {
      // Open the node picker modal with substep context
      // This will allow the user to select which node to add to the new sub-step
      const uiStore = useUIStore.getState();
      uiStore.openNodePicker(
        'substep',           // source: indicates we're adding a substep
        parentContainerId,   // containerId: the parent container
        ownerId,             // nodeId: the node this substep is attached to
        undefined,           // branchId: not needed
        undefined            // insertIndex: not needed
      );
    } else {
      console.warn('⚠️ No parentContainerId provided');
    }
  };
  return (
    <div
      className="absolute z-10"
      style={{
        right: '0',
        top: '50%',
        transform: 'translateX(50%) translateY(-50%)', // Half-in, half-out
      }}
    >
      {/* Extended hover area that includes the button space */}
      <div
        className="absolute cursor-pointer"
        style={{
          right: '-40px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '120px', // Extended to cover button area
          height: '64px',
          pointerEvents: 'auto', // Make sure it captures hover
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Hover glow background */}
        {isHovering && (
          <div
            className="absolute pointer-events-none"
            style={{
              right: '40px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '80px',
              height: '64px',
              background: hoverColor,
              borderRadius: '8px',
            }}
          />
        )}
        {/* [+] Add Sub-Step Button on hover */}
        {isHovering && parentContainerId && (
          <button
            onClick={handleAddSubStep}
            onMouseDown={(e) => e.stopPropagation()} // Prevent drag from starting
            className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 flex items-center justify-center shadow-lg transition-all z-[1001] border-2 border-white/20"
            title="Add sub-step"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
      {/* ACTUAL CONNECTION DOT - This is what we query! */}
      <div
        data-connection-point="true"
        data-owner-id={ownerId}
        data-owner-type={ownerType}
        data-side={side}
        className="relative transition-all duration-200 cursor-pointer"
        style={{
          width: isHovering ? '24px' : '12px', // Doubled size on hover
          height: isHovering ? '24px' : '12px',
          background: dotColor,
          borderRadius: '50%',
          border: `${isHovering ? '3px' : '2px'} solid ${bgColor}`, // Thicker border
          boxShadow: isHovering
            ? `0 0 24px ${dotColor}, 0 0 12px ${dotColor}60` // Stronger glow
            : `0 0 8px ${dotColor}80`,
        }}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        title={connectionCount > 0 ? `${connectionCount} connection${connectionCount > 1 ? 's' : ''}` : 'Drag to create connection'}
      />
    </div>
  );
}
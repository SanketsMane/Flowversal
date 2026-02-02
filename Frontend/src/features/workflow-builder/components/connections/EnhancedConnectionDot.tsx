/**
 * Enhanced Connection Dot Component
 * Phase 3 - New Connection System
 * 
 * LEFT SIDE (Automatic Sequential):
 * - Automatic connection management
 * - Shows [+] button to insert nodes in between
 * - Vertical sequential flow
 * 
 * RIGHT SIDE (Manual Parallel):
 * - Drag-to-connect functionality
 * - Manual connection management
 * - Horizontal expansion for parallel workflows
 */

import { Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../../components/ThemeContext';
import { useConnectionStore } from '@/core/stores/connectionStore';

interface EnhancedConnectionDotProps {
  ownerId: string;
  ownerType: 'trigger' | 'step' | 'node';
  side: 'left' | 'right';
  // For left side only
  onInsertClick?: () => void;
  showInsertButton?: boolean;
  isConnected?: boolean;
}

export function EnhancedConnectionDot({
  ownerId,
  ownerType,
  side,
  onInsertClick,
  showInsertButton = false,
  isConnected = false,
}: EnhancedConnectionDotProps) {
  const { theme } = useTheme();
  const [isHovering, setIsHovering] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const { startDragConnection, updateDragPosition, endDragConnection, dragConnection } = useConnectionStore();

  const isLeftSide = side === 'left';
  const isRightSide = side === 'right';
  const isDragging = dragConnection.isActive && dragConnection.sourceId === ownerId;

  // Color logic:
  // - Left side of triggers and steps: BLUE (sequential flow)
  // - Internal nodes: PURPLE
  // - Right side: BLUE (for manual connections)
  const isMainFlowElement = ownerType === 'trigger' || ownerType === 'step';
  const isInternalNode = ownerType === 'node';
  
  let dotColor: string;
  if (isLeftSide && isMainFlowElement) {
    // Left side of triggers/steps = BLUE (sequential)
    dotColor = theme === 'dark' ? '#00C6FF' : '#0099CC';
  } else if (isInternalNode) {
    // Internal nodes = PURPLE
    dotColor = theme === 'dark' ? '#9D50BB' : '#8B3AA8';
  } else {
    // Right side and other cases = BLUE
    dotColor = theme === 'dark' ? '#00C6FF' : '#0099CC';
  }
  
  const bgColor = theme === 'dark' ? '#1A1A2E' : '#FFFFFF';

  // Position styling
  const positionStyle = isLeftSide
    ? { left: '-12px' }
    : { right: '-12px' };

  // Allow dragging for:
  // - All right-side dots
  // - Purple dots (internal nodes) on both sides
  const isDraggable = isRightSide || isInternalNode;

  // Handle mouse down (start connection)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDraggable) {
      e.preventDefault();
      e.stopPropagation();
      startDragConnection(ownerId, ownerType, { x: e.clientX, y: e.clientY });
    }
  };

  // Global mouse move and mouse up listeners
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateDragPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Check if mouse is over a valid target dot
      const targetElement = document.elementFromPoint(e.clientX, e.clientY);
      const targetDot = targetElement?.closest('[data-connection-dot][data-side="left"]');
      
      if (targetDot) {
        const targetId = targetDot.getAttribute('data-owner-id');
        const targetType = targetDot.getAttribute('data-owner-type') as 'trigger' | 'step' | 'node';
        
        if (targetId && targetType) {
          endDragConnection(targetId, targetType);
          return;
        }
      }
      
      // No valid target, cancel
      endDragConnection();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, ownerId, ownerType, updateDragPosition, endDragConnection]);

  return (
    <div
      ref={dotRef}
      className="absolute top-1/2 -translate-y-1/2 z-10"
      style={positionStyle}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      data-connection-dot
      data-owner-id={ownerId}
      data-owner-type={ownerType}
      data-side={side}
    >
      {/* Connection Dot */}
      <div
        className={`relative transition-all duration-200 ${isDraggable ? 'cursor-pointer' : 'cursor-default'}`}
        style={{
          width: isHovering || isDragging ? '16px' : '12px',
          height: isHovering || isDragging ? '16px' : '12px',
          background: dotColor,
          borderRadius: '50%',
          border: `2px solid ${bgColor}`,
          boxShadow: isHovering || isDragging
            ? `0 0 12px ${dotColor}`
            : 'none',
        }}
        onMouseDown={isDraggable ? handleMouseDown : undefined}
      />

      {/* LEFT SIDE: Insert [+] Button */}
      {isLeftSide && showInsertButton && isConnected && isHovering && (
        <div
          className="absolute -left-8 top-1/2 -translate-y-1/2"
          style={{ zIndex: 20 }}
        >
          <button
            onClick={onInsertClick}
            className="flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
            style={{
              width: '24px',
              height: '24px',
              background: 'linear-gradient(135deg, #00C6FF 0%, #9D50BB 100%)',
              border: `2px solid ${bgColor}`,
              boxShadow: '0 4px 12px rgba(0, 198, 255, 0.4)',
            }}
            title="Insert node here"
          >
            <Plus className="w-3 h-3 text-white" />
          </button>
        </div>
      )}

      {/* RIGHT SIDE: Drag Indicator */}
      {isDraggable && isHovering && (
        <div
          className="absolute -right-6 top-1/2 -translate-y-1/2 text-xs whitespace-nowrap pointer-events-none"
          style={{
            color: dotColor,
            fontSize: '10px',
            opacity: 0.8,
          }}
        >
          Drag to connect
        </div>
      )}

      {/* Connection Line Preview (when dragging) */}
      {isDragging && (
        <div
          className="absolute top-1/2 pointer-events-none"
          style={{
            left: isLeftSide ? '100%' : 'auto',
            right: isRightSide ? '100%' : 'auto',
            width: '40px',
            height: '2px',
            background: `linear-gradient(to ${isLeftSide ? 'right' : 'left'}, ${dotColor}, transparent)`,
            transform: 'translateY(-50%)',
          }}
        />
      )}
    </div>
  );
}
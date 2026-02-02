/**
 * Node Drop Zone Component
 * Wraps a node to provide drop zone indicators above and below
 */

import { useDrop } from 'react-dnd';
import { DropIndicator } from './DropIndicator';
import { useState } from 'react';

interface NodeDropZoneProps {
  children: React.ReactNode;
  containerIndex: number;
  nodeIndex: number;
  totalNodes: number;
  onDrop: (draggedNodeIndex: number, targetIndex: number) => void;
}

export function NodeDropZone({ 
  children, 
  containerIndex, 
  nodeIndex, 
  totalNodes,
  onDrop 
}: NodeDropZoneProps) {
  const [dropPosition, setDropPosition] = useState<'top' | 'bottom' | null>(null);

  // Drop zone for top (before this node)
  const [{ isOverTop }, dropTop] = useDrop(() => ({
    accept: 'NODE',
    hover: (item: { containerIndex: number; nodeIndex: number }, monitor) => {
      // Only show indicator if dragging within the same container
      if (item.containerIndex === containerIndex && item.nodeIndex !== nodeIndex) {
        const clientOffset = monitor.getClientOffset();
        const hoverBoundingRect = (monitor as any).targetId 
          ? document.querySelector(`[data-node-index="${nodeIndex}"]`)?.getBoundingClientRect()
          : null;
        
        if (clientOffset && hoverBoundingRect) {
          const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
          const hoverClientY = clientOffset.y - hoverBoundingRect.top;
          
          if (hoverClientY < hoverMiddleY) {
            setDropPosition('top');
          }
        }
      }
    },
    drop: (item: { containerIndex: number; nodeIndex: number }) => {
      if (item.containerIndex === containerIndex && item.nodeIndex !== nodeIndex) {
        // Drop before this node
        const targetIndex = nodeIndex;
        if (item.nodeIndex < targetIndex) {
          onDrop(item.nodeIndex, targetIndex - 1);
        } else {
          onDrop(item.nodeIndex, targetIndex);
        }
        setDropPosition(null);
      }
    },
    collect: (monitor) => ({
      isOverTop: monitor.isOver() && monitor.canDrop(),
    }),
  }), [containerIndex, nodeIndex, onDrop]);

  // Drop zone for bottom (after this node)
  const [{ isOverBottom }, dropBottom] = useDrop(() => ({
    accept: 'NODE',
    hover: (item: { containerIndex: number; nodeIndex: number }, monitor) => {
      // Only show indicator if dragging within the same container
      if (item.containerIndex === containerIndex && item.nodeIndex !== nodeIndex) {
        const clientOffset = monitor.getClientOffset();
        const hoverBoundingRect = (monitor as any).targetId 
          ? document.querySelector(`[data-node-index="${nodeIndex}"]`)?.getBoundingClientRect()
          : null;
        
        if (clientOffset && hoverBoundingRect) {
          const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
          const hoverClientY = clientOffset.y - hoverBoundingRect.top;
          
          if (hoverClientY >= hoverMiddleY) {
            setDropPosition('bottom');
          }
        }
      }
    },
    drop: (item: { containerIndex: number; nodeIndex: number }) => {
      if (item.containerIndex === containerIndex && item.nodeIndex !== nodeIndex) {
        // Drop after this node
        const targetIndex = nodeIndex + 1;
        if (item.nodeIndex < targetIndex) {
          onDrop(item.nodeIndex, targetIndex - 1);
        } else {
          onDrop(item.nodeIndex, targetIndex);
        }
        setDropPosition(null);
      }
    },
    collect: (monitor) => ({
      isOverBottom: monitor.isOver() && monitor.canDrop(),
    }),
  }), [containerIndex, nodeIndex, onDrop]);

  return (
    <div 
      ref={(el) => {
        dropTop(el);
        dropBottom(el);
      }}
      className="relative"
      data-node-index={nodeIndex}
    >
      {/* Top drop indicator - only show on first node or when hovering */}
      <DropIndicator 
        position="top" 
        isVisible={dropPosition === 'top' || (nodeIndex === 0 && isOverTop)}
      />
      
      {children}
      
      {/* Bottom drop indicator - only show when hovering */}
      <DropIndicator 
        position="bottom" 
        isVisible={dropPosition === 'bottom' || isOverBottom}
      />
    </div>
  );
}

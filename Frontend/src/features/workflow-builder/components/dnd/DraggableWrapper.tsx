/**
 * Draggable Wrapper Component
 * Phase 4 Part 1 - Drag & Drop System
 * 
 * Wraps any component to make it draggable
 */

import { ReactNode, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useDndContext } from '../../context/DndContext';
import { DragItem, DropResult } from '../../types/dnd.types';

interface DraggableWrapperProps {
  children: ReactNode;
  dragItem: DragItem;
  canDrag?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (result: DropResult | null) => void;
  onDrop?: (item: DragItem, result: DropResult) => void;
  acceptTypes?: string[];
  className?: string;
  dragClassName?: string;
  dropClassName?: string;
}

export function DraggableWrapper({
  children,
  dragItem,
  canDrag = true,
  onDragStart,
  onDragEnd,
  onDrop,
  acceptTypes = [],
  className = '',
  dragClassName = '',
  dropClassName = '',
}: DraggableWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { setDragging } = useDndContext();

  // Drag configuration
  const [{ isDragging }, drag, preview] = useDrag({
    type: dragItem.type,
    item: () => {
      onDragStart?.();
      setDragging(true, dragItem);
      return dragItem;
    },
    canDrag,
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<DropResult>();
      setDragging(false);
      onDragEnd?.(dropResult || null);
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Drop configuration (optional)
  const [{ isOver, canDrop: canDropHere }, drop] = useDrop({
    accept: acceptTypes.length > 0 ? acceptTypes : dragItem.type,
    drop: (item: DragItem) => {
      const result: DropResult = {
        targetId: dragItem.id,
      };
      onDrop?.(item, result);
      return result;
    },
    canDrop: (item) => {
      // Don't drop on self
      return item.id !== dragItem.id;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Use empty image for drag preview (we'll use custom preview)
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  // Combine drag and drop refs
  drag(drop(ref));

  // Dynamic classes
  const classes = [
    className,
    isDragging ? dragClassName || 'opacity-40 cursor-grabbing' : '',
    isOver && canDropHere ? dropClassName || 'ring-2 ring-[#00C6FF]' : '',
    canDrag ? 'cursor-grab' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  );
}

/**
 * Draggable Field Card Component
 * Phase 4 Part 1 - Drag & Drop System
 * 
 * Form field card with drag & drop support
 */

import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { FormField, FormFieldDragItem, DropResult } from '../../types';
import { FormFieldCard } from '../form/FormFieldCard';
import { useDndContext } from '../../context/DndContext';

interface DraggableFieldCardProps {
  field: FormField;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function DraggableFieldCard({
  field,
  index,
  onEdit,
  onDelete,
  onDuplicate,
  onReorder,
}: DraggableFieldCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Safe context usage with try-catch
  let setDragging: (dragging: boolean, item?: any) => void;
  try {
    const context = useDndContext();
    setDragging = context.setDragging;
  } catch (error) {
    // Context not available, use no-op function
    setDragging = () => {};
  }

  // Drag configuration
  const dragItem: FormFieldDragItem = {
    type: 'FORM_FIELD',
    id: field.id,
    fieldId: field.id,
    index,
  };

  const [{ isDragging }, drag] = useDrag({
    type: 'FORM_FIELD',
    item: () => {
      setDragging(true, dragItem);
      return dragItem;
    },
    end: () => {
      setDragging(false);
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Drop configuration (for hover reordering)
  const [{ isOver }, drop] = useDrop({
    accept: 'FORM_FIELD',
    hover: (item: FormFieldDragItem, monitor) => {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      onReorder(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Combine drag and drop refs
  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`transition-all ${isDragging ? 'opacity-40 scale-95' : 'opacity-100 scale-100'} ${
        isOver ? 'scale-102' : ''
      }`}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <FormFieldCard
        field={field}
        index={index}
        onEdit={onEdit}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
      />
    </div>
  );
}
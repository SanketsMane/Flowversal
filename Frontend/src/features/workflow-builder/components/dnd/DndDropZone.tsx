/**
 * DnD Drop Zone Component
 * Phase 4 Part 1 - Drag & Drop System
 * 
 * Enhanced drop zone with drag & drop support
 */

import { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { useTheme } from '@/core/theme/ThemeContext';
import { useDndContext } from '../../context/DndContext';
import { DragItem, DropResult, DragItemType } from '../../types/dnd.types';
import { Plus } from 'lucide-react';

interface DndDropZoneProps {
  acceptTypes: DragItemType[];
  position: number;
  onDrop: (item: DragItem, position: number) => void;
  onAdd?: (position: number) => void;
  isFirst?: boolean;
  isLast?: boolean;
  disabled?: boolean;
  className?: string;
}

export function DndDropZone({
  acceptTypes,
  position,
  onDrop,
  onAdd,
  isFirst,
  isLast,
  disabled = false,
  className = '',
}: DndDropZoneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  // Safe context usage with try-catch
  let contextData;
  try {
    contextData = useDndContext();
  } catch (error) {
    // Context not available, use defaults
    contextData = { isDragging: false, dragType: null };
  }
  
  const { isDragging, dragType } = contextData;

  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  // Drop configuration
  const [{ isOver, canDrop: canDropHere }, drop] = useDrop({
    accept: acceptTypes,
    drop: (item: DragItem) => {
      const result: DropResult = {
        dropIndex: position,
        dropPosition: 'after',
      };
      onDrop(item, position);
      return result;
    },
    canDrop: () => !disabled,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  drop(ref);

  // Check if current drag type is compatible
  const isCompatible = dragType ? acceptTypes.includes(dragType) : false;
  const shouldShow = isDragging && isCompatible;
  const isActive = isOver && canDropHere;

  return (
    <div
      ref={ref}
      className={`relative transition-all ${
        shouldShow ? 'h-16' : isFirst || isLast ? 'h-12' : 'h-4'
      } ${className}`}
    >
      {/* Drop Zone Line */}
      {shouldShow && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <div
            className={`flex-1 h-px border-t-2 border-dashed transition-colors ${
              isActive ? 'border-[#00C6FF]' : borderColor
            }`}
          />

          {/* Drop Indicator */}
          <div
            className={`mx-3 px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
              isActive
                ? 'border-[#00C6FF] bg-[#00C6FF]/20 text-[#00C6FF] scale-105'
                : `border-[#00C6FF]/50 bg-[#00C6FF]/10 text-[#00C6FF] scale-100`
            }`}
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">
              {isActive ? 'Drop Here' : 'Drop Zone'}
            </span>
          </div>

          <div
            className={`flex-1 h-px border-t-2 border-dashed transition-colors ${
              isActive ? 'border-[#00C6FF]' : borderColor
            }`}
          />
        </div>
      )}

      {/* Manual Add Button (when not dragging) */}
      {!shouldShow && onAdd && (isFirst || isLast) && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity group">
          <div className={`h-px border-t border-dashed ${borderColor} flex-1`} />
          <button
            onClick={() => onAdd(position)}
            className={`mx-3 px-3 py-1.5 rounded border ${borderColor} ${textSecondary} hover:border-[#00C6FF] hover:text-[#00C6FF] hover:bg-[#00C6FF]/10 transition-all text-xs flex items-center gap-1`}
          >
            <Plus className="h-3 w-3" />
            <span>Add</span>
          </button>
          <div className={`h-px border-t border-dashed ${borderColor} flex-1`} />
        </div>
      )}

      {/* Static Line for First/Last (when not showing drop zone) */}
      {(isFirst || isLast) && !shouldShow && !onAdd && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <div className={`h-px border-t border-dashed ${borderColor} opacity-30`} />
        </div>
      )}
    </div>
  );
}
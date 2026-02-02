/**
 * Drag Preview Component
 * Phase 4 Part 1 - Drag & Drop System
 * 
 * Custom drag preview that follows cursor
 */

import { useTheme } from '../../../../components/ThemeContext';
import { DragPreviewData } from '../../types/dnd.types';
import { GripVertical } from 'lucide-react';

interface DragPreviewProps {
  data: DragPreviewData;
}

export function DragPreview({ data }: DragPreviewProps) {
  const { theme } = useTheme();

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';

  return (
    <div 
      className={`${bgCard} border-2 border-[#00C6FF] rounded-lg p-3 shadow-2xl min-w-[200px] max-w-[300px] opacity-90`}
      style={{ cursor: 'grabbing' }}
    >
      <div className="flex items-center gap-3">
        <GripVertical className={`${textSecondary} h-5 w-5`} />
        
        {data.icon && (
          <div className="text-[#00C6FF]">
            {data.icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className={`${textPrimary} font-medium truncate`}>
            {data.title}
          </div>
          {data.subtitle && (
            <div className={`${textSecondary} text-xs truncate`}>
              {data.subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Dragging indicator */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00C6FF] animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#00C6FF] animate-pulse delay-75" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#00C6FF] animate-pulse delay-150" />
        </div>
        <span className={`${textSecondary} text-xs`}>Dragging...</span>
      </div>
    </div>
  );
}

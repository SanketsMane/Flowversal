/**
 * Field Drop Zone Component
 * Phase 3 Part 3 - Form Builder
 * 
 * Drop zone for adding fields between existing ones
 */

import { useState } from 'react';
import { useTheme } from '../../../../components/ThemeContext';
import { Plus } from 'lucide-react';

interface FieldDropZoneProps {
  position: number;
  onAdd: (position: number) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function FieldDropZone({ position, onAdd, isFirst, isLast }: FieldDropZoneProps) {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative transition-all ${
        isHovered ? 'h-16' : isFirst || isLast ? 'h-12' : 'h-4'
      }`}
    >
      {/* Drop Zone Line */}
      <div 
        className={`absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center transition-all ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className={`flex-1 h-px border-t-2 border-dashed ${
          isHovered ? 'border-[#00C6FF]' : borderColor
        }`} />
        
        {/* Add Button */}
        <button
          onClick={() => onAdd(position)}
          className={`mx-3 px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
            isHovered 
              ? 'border-[#00C6FF] bg-[#00C6FF]/10 text-[#00C6FF] scale-100' 
              : `border-transparent scale-75`
          }`}
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">Add Field Here</span>
        </button>
        
        <div className={`flex-1 h-px border-t-2 border-dashed ${
          isHovered ? 'border-[#00C6FF]' : borderColor
        }`} />
      </div>

      {/* Static Line for First/Last */}
      {(isFirst || isLast) && !isHovered && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <div className={`h-px border-t border-dashed ${borderColor} opacity-30`} />
        </div>
      )}
    </div>
  );
}

import { GripVertical, X } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { AddedTool } from './types';
import { toolTemplates } from './toolTemplates';

interface AddedToolItemProps {
  tool: AddedTool;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onMove?: (fromIndex: number, toIndex: number) => void;
  theme: string;
}

export function AddedToolItem({ 
  tool, 
  index, 
  isSelected, 
  onClick, 
  onDelete, 
  onMove, 
  theme 
}: AddedToolItemProps) {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'ADDED_TOOL',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: 'ADDED_TOOL',
    hover: (item: { index: number }) => {
      if (onMove && item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    },
  }));

  const template = toolTemplates.find(t => t.type === tool.type);
  const ToolIcon = template?.icon;
  
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <div
      ref={(node) => preview(drop(node))}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      data-connection-id={`tool-${index}`}
      data-connection-type="added-tool"
      className={`relative p-3 rounded-lg border-2 ${
        isSelected 
          ? 'border-[#00C6FF] bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 ring-2 ring-[#00C6FF]/30 shadow-lg shadow-[#00C6FF]/20' 
          : `border-transparent ${bgInput} hover:border-[#00C6FF]/50`
      } transition-all cursor-pointer group ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      {/* Connection Point Dot (left side) */}
      <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] border-2 border-[#1A1A2E] z-10" />
      
      {/* Drag Handle */}
      <div
        ref={drag}
        className="absolute left-1 top-1/2 -translate-y-1/2 cursor-move hover:text-[#00C6FF] transition-colors"
      >
        <GripVertical className="w-4 h-4 text-gray-500" />
      </div>

      {/* Content */}
      <div className="ml-5 mr-8 flex items-center gap-2">
        <div className={`w-6 h-6 rounded ${
          isSelected 
            ? 'bg-gradient-to-br from-[#00C6FF] to-[#9D50BB]' 
            : 'bg-gradient-to-br from-[#00C6FF] to-[#0072FF]'
        } flex items-center justify-center flex-shrink-0`}>
          {ToolIcon && <ToolIcon className="w-3 h-3 text-white" />}
        </div>
        <span className={`${isSelected ? 'text-[#00C6FF]' : textPrimary} text-sm`}>
          {tool.label}
        </span>
      </div>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-red-500/10 transition-all ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <X className="w-4 h-4 text-red-500" />
      </button>
    </div>
  );
}
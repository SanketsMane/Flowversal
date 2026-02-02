import { GripVertical, X, Zap, MoreVertical, Wrench } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { toolTemplates } from './toolTemplates';

export interface TriggerNodeType {
  id: string;
  type: string;
  label: string;
  config: Record<string, any>;
  enabled?: boolean; // Add enabled property
}

interface TriggerNodeProps {
  trigger: TriggerNodeType;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onSettingsClick?: () => void;
  onMove?: (fromIndex: number, toIndex: number) => void;
  theme: string;
}

export function TriggerNode({ trigger, index, isSelected, onClick, onDelete, onSettingsClick, onMove, theme }: TriggerNodeProps) {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'TRIGGER',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: 'TRIGGER',
    hover: (item: { index: number }) => {
      if (onMove && item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    },
  }));

  // Check if this trigger is actually a tool
  const isTool = toolTemplates.some(t => t.type === trigger.type);
  const toolTemplate = toolTemplates.find(t => t.type === trigger.type);
  const ToolIcon = toolTemplate?.icon;

  const bgColor = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  return (
    <div
      ref={(node) => preview(drop(node))}
      onClick={onClick}
      data-connection-type="added-trigger"
      data-connection-id={`trigger-${trigger.id}`}
      className={`relative ${bgColor} border-2 ${
        isSelected ? 'border-[#00C6FF] shadow-lg shadow-[#00C6FF]/20' : borderColor
      } rounded-xl p-4 transition-all ${isDragging ? 'opacity-50' : 'opacity-100'} cursor-pointer hover:border-[#00C6FF]/50`}
    >
      {/* Drag Handle */}
      <div
        ref={drag}
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move hover:text-[#00C6FF] transition-colors"
      >
        <GripVertical className="w-4 h-4 text-gray-500" />
      </div>

      {/* Content */}
      <div className="ml-6 mr-8 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${
          isTool 
            ? 'bg-gradient-to-br from-[#9D50BB] to-[#6366F1]' 
            : 'bg-gradient-to-br from-[#00C6FF] to-[#9D50BB]'
        } flex items-center justify-center flex-shrink-0`}>
          {isTool && ToolIcon ? (
            <ToolIcon className="w-5 h-5 text-white" />
          ) : (
            <Zap className="w-5 h-5 text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`${textPrimary} text-sm truncate`}>{trigger.label}</h3>
          <p className={`${textSecondary} text-xs truncate`}>
            {isTool ? 'Tool Action' : trigger.type}
          </p>
        </div>
      </div>

      {/* Settings and Delete Buttons */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {onSettingsClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSettingsClick();
            }}
            className={`p-1.5 rounded hover:bg-gray-500/10 hover:text-[#00C6FF] transition-all ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
            title="Settings"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={`p-1.5 rounded hover:bg-red-500/10 hover:text-red-500 transition-all ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
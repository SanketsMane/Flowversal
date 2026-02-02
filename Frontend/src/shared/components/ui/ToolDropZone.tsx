import { useDrop } from 'react-dnd';
import { Plus } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { AddedToolItem } from './AddedToolItem';
import { AddedTool } from './types';

interface ToolDropZoneProps {
  tools: AddedTool[];
  onAddTool: (toolType: string) => void;
  onRemoveTool: (index: number) => void;
  onToolClick: (index: number) => void;
  onOpenToolsPanel: () => void;
  isSelected?: boolean;
  selectedToolIndex?: number | null;
  onMoveTool?: (fromIndex: number, toIndex: number) => void;
}

export function ToolDropZone({ 
  tools, 
  onAddTool, 
  onRemoveTool, 
  onToolClick,
  onOpenToolsPanel,
  isSelected = false,
  selectedToolIndex = null,
  onMoveTool
}: ToolDropZoneProps) {
  const { theme } = useTheme();
  
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['TOOL', 'NODE_TEMPLATE', 'TRIGGER_TEMPLATE', 'TOOL_TEMPLATE'], // Accept all types
    drop: (item: { toolType?: string; nodeType?: string; triggerType?: string }) => {
      const itemType = item.toolType || item.nodeType || item.triggerType;
      if (itemType) {
        onAddTool(itemType);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  return (
    <div className="space-y-2">
      {tools.length > 0 && (
        <div className="space-y-2 mb-3">
          {tools.map((tool, index) => (
            <AddedToolItem
              key={index}
              tool={tool}
              index={index}
              isSelected={selectedToolIndex === index}
              onClick={() => onToolClick(index)}
              onDelete={() => onRemoveTool(index)}
              onMove={onMoveTool}
              theme={theme}
            />
          ))}
        </div>
      )}
      
      <div
        ref={drop}
        onClick={(e) => {
          e.stopPropagation();
          onOpenToolsPanel();
        }}
        className={`p-6 border-2 border-dashed ${
          isSelected
            ? 'border-cyan-500 bg-cyan-500/10'
            : isOver
              ? 'border-[#00C6FF] bg-[#00C6FF]/5'
              : `${borderColor} hover:border-[#00C6FF]/50`
        } rounded-lg transition-all cursor-pointer`}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <Plus className={`w-5 h-5 ${isSelected ? 'text-cyan-500' : textSecondary}`} />
          <p className={`${isSelected ? 'text-cyan-500' : textSecondary} text-sm text-center`}>
            {tools.length === 0 ? 'Add Items Here' : 'Add more items'}
          </p>
          <p className={`${isSelected ? 'text-cyan-500' : textSecondary} text-xs text-center`}>
            Drag & drop or click to add
          </p>
        </div>
      </div>
    </div>
  );
}
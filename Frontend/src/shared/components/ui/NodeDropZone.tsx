import { useDrop } from 'react-dnd';
import { Plus, Sparkles } from 'lucide-react';

interface NodeDropZoneProps {
  containerIndex: number;
  onDrop: (containerIndex: number, nodeType: string) => void;
  theme: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export function NodeDropZone({ containerIndex, onDrop, theme, onClick, isSelected = false }: NodeDropZoneProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['NODE_TEMPLATE', 'TRIGGER_TEMPLATE', 'TOOL_TEMPLATE'], // Accept all types
    drop: (item: { nodeType?: string; triggerType?: string; toolType?: string }) => {
      const itemType = item.nodeType || item.triggerType || item.toolType;
      if (itemType) {
        onDrop(containerIndex, itemType);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  return (
    <div
      ref={drop}
      onClick={onClick}
      className={`w-full p-4 border-2 border-dashed rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
        isSelected
          ? 'border-cyan-500 bg-cyan-500/10'
          : isOver
            ? 'border-[#9D50BB] bg-[#9D50BB]/10'
            : `${borderColor} hover:border-[#9D50BB]/50`
      } ${isSelected ? 'text-cyan-500' : textColor}`}
    >
      <Plus className="w-4 h-4" />
      <span>Add Items Here</span>
    </div>
  );
}
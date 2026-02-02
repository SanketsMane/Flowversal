import { useDrop } from 'react-dnd';
import { Plus, Zap } from 'lucide-react';

interface TriggerDropZoneProps {
  onDrop: (triggerType: string) => void;
  theme: string;
  hasExistingTriggers?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
}

export function TriggerDropZone({ onDrop, theme, hasExistingTriggers = false, onClick, isSelected = false }: TriggerDropZoneProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['TRIGGER_TEMPLATE', 'NODE_TEMPLATE', 'TOOL_TEMPLATE'], // Accept all types
    drop: (item: { triggerType?: string; nodeType?: string; toolType?: string }) => {
      const itemType = item.triggerType || item.nodeType || item.toolType;
      if (itemType) {
        onDrop(itemType);
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
      data-connection-id="trigger-box"
      data-connection-type="trigger-zone"
      className={`w-full ${hasExistingTriggers ? 'p-4' : 'p-6'} border-2 border-dashed rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
        isSelected
          ? 'border-cyan-500 bg-cyan-500/10'
          : isOver
            ? 'border-[#00C6FF] bg-[#00C6FF]/10'
            : `${borderColor} hover:border-[#00C6FF]/50`
      } ${isSelected ? 'text-cyan-500' : textColor}`}
    >
      {hasExistingTriggers ? (
        <>
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add more items</span>
        </>
      ) : (
        <>
          <Plus className="w-5 h-5" />
          <span>Add Items Here</span>
        </>
      )}
    </div>
  );
}
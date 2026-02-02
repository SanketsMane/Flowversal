import { useDrag } from 'react-dnd';
import { LucideIcon } from 'lucide-react';

interface DraggableTriggerProps {
  trigger: {
    type: string;
    label: string;
    description: string;
    icon: LucideIcon;
  };
  onClick: () => void;
  theme?: string;
}

export function DraggableTrigger({ trigger, onClick, theme = 'dark' }: DraggableTriggerProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TRIGGER_TEMPLATE',
    item: { triggerType: trigger.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const Icon = trigger.icon;
  
  // Theme-aware colors
  const bgColor = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const hoverBorder = theme === 'dark' ? 'hover:border-[#00C6FF]/50' : 'hover:border-[#00C6FF]/50';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  return (
    <button
      ref={drag}
      onClick={onClick}
      className={`w-full p-3 rounded-lg border ${borderColor} ${bgColor} ${hoverBorder} transition-all text-left cursor-move ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className={`${textPrimary} text-sm`}>{trigger.label}</p>
          <p className={`${textSecondary} text-xs`}>{trigger.description}</p>
        </div>
      </div>
    </button>
  );
}
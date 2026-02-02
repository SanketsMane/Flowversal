import { useDrag } from 'react-dnd';
import { LucideIcon, ChevronRight } from 'lucide-react';

interface DraggableNodeTemplateProps {
  node: {
    type: string;
    label: string;
    description: string;
    icon: LucideIcon;
    category: string;
  };
  onClick: () => void;
  theme?: string;
  showRecommended?: boolean;
  showExpandIcon?: boolean;
  isExpanded?: boolean;
}

export function DraggableNodeTemplate({ 
  node, 
  onClick, 
  theme = 'dark', 
  showRecommended = false,
  showExpandIcon = false,
  isExpanded = false
}: DraggableNodeTemplateProps) {
  // Determine the drag type based on the node category
  const dragType = node.category === 'trigger' 
    ? 'TRIGGER_TEMPLATE' 
    : node.category === 'tool' 
      ? 'TOOL_TEMPLATE' 
      : 'NODE_TEMPLATE';

  // Determine the item structure based on category
  const dragItem = node.category === 'trigger'
    ? { triggerType: node.type }
    : node.category === 'tool'
      ? { toolType: node.type }
      : { nodeType: node.type };

  const [{ isDragging }, drag] = useDrag(() => ({
    type: dragType,
    item: dragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const Icon = node.icon;
  
  // Theme-aware colors
  const bgColor = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const hoverBorder = theme === 'dark' ? 'hover:border-[#9D50BB]/50' : 'hover:border-[#9D50BB]/50';
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
        <div className="w-8 h-8 rounded bg-gradient-to-br from-[#9D50BB] to-[#0072FF] flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`${textPrimary} text-sm`}>{node.label}</p>
            {showRecommended && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981]">
                Recommended
              </span>
            )}
          </div>
          <p className={`${textSecondary} text-xs truncate`}>{node.description}</p>
        </div>
        {showExpandIcon && (
          <ChevronRight 
            className={`w-4 h-4 ${textSecondary} flex-shrink-0 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        )}
      </div>
    </button>
  );
}
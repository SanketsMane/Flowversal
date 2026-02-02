import { useDrag } from 'react-dnd';
import { ToolTemplate } from './toolTemplates';
import { useTheme } from '../ThemeContext';

interface DraggableToolProps {
  tool: ToolTemplate;
  onClick?: () => void;
}

export function DraggableTool({ tool, onClick }: DraggableToolProps) {
  const { theme } = useTheme();
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TOOL',
    item: { toolType: tool.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  return (
    <div
      ref={drag}
      onClick={onClick}
      className={`p-3 rounded-lg border ${borderColor} ${bgInput} hover:border-[#00C6FF]/50 transition-all cursor-pointer ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-[#00C6FF] to-[#0072FF] flex items-center justify-center">
          <tool.icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className={`${textPrimary} text-sm`}>{tool.label}</p>
          <p className={`${textSecondary} text-xs truncate`}>{tool.description}</p>
        </div>
      </div>
    </div>
  );
}

import { useDrag } from 'react-dnd';
import { useTheme } from '../ThemeContext';

interface DraggableElementProps {
  template: {
    type: string;
    icon: React.ElementType;
    label: string;
    description: string;
  };
  onClick?: () => void;
}

export function DraggableElement({ template, onClick }: DraggableElementProps) {
  const { theme } = useTheme();
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'FORM_ELEMENT',
    item: { elementType: template.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const Icon = template.icon;
  const bgColor = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const hoverBg = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-50';

  return (
    <div
      ref={drag}
      onClick={onClick}
      className={`${bgColor} ${borderColor} border rounded-lg p-3 cursor-pointer ${hoverBg} transition-all ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${textColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className={`${textColor} text-sm`}>{template.label}</p>
          <p className={`${textColor} opacity-60 text-xs mt-0.5`}>{template.description}</p>
        </div>
      </div>
    </div>
  );
}

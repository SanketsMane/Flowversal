import { useDrop } from 'react-dnd';
import { Plus } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface ContainerDropZoneProps {
  containerIndex: number;
  onDrop: (containerIndex: number, elementType: string) => void;
  onClick?: () => void;
  isSelected?: boolean;
}

export function ContainerDropZone({ containerIndex, onDrop, onClick, isSelected = false }: ContainerDropZoneProps) {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'FORM_ELEMENT',
    drop: (item: { elementType: string }) => {
      if (item.elementType !== 'workflow-step') {
        onDrop(containerIndex, item.elementType);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`py-6 text-center border-2 border-dashed rounded-lg transition-all cursor-pointer ${
        isSelected
          ? 'border-cyan-500 bg-cyan-500/10'
          : isOver 
            ? 'border-cyan-500 bg-cyan-500/5' 
            : 'border-gray-300 dark:border-gray-700 bg-transparent'
      }`}
    >
      <Plus className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-cyan-500' : textColor} ${isSelected ? 'opacity-100' : 'opacity-50'}`} />
      <p className={`text-sm ${isSelected ? 'text-cyan-500' : textColor} ${isSelected ? 'opacity-100' : 'opacity-50'}`}>Add Fields Here</p>
    </div>
  );
}
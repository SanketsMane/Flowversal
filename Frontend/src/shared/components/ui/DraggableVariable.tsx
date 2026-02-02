import { useDrag } from 'react-dnd';
import { useTheme } from '../ThemeContext';
import type { Variable } from './types';

interface DraggableVariableProps {
  variable: Variable;
  onClick?: (variablePath: string) => void;
}

export function DraggableVariable({ variable, onClick }: DraggableVariableProps) {
  const { theme } = useTheme();
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'VARIABLE',
    item: { variable },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const bgColor = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  const handleClick = () => {
    if (onClick) {
      onClick(`{{ $json.${variable.name} }}`);
    }
  };

  return (
    <div
      ref={drag}
      onClick={handleClick}
      className={`${bgColor} border ${borderColor} rounded p-2 ${onClick ? 'cursor-pointer' : 'cursor-move'} ${isDragging ? 'opacity-50' : 'opacity-100'} hover:border-cyan-500/50 transition-all`}
    >
      <div className="flex items-center gap-2">
        <span className={`${textColor} text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded`}>A</span>
        <div className="flex-1 min-w-0">
          <p className={`${textColor} text-sm truncate`}>{variable.name}</p>
          <p className={`${textColor} opacity-60 text-xs truncate`}>{variable.value}</p>
        </div>
      </div>
    </div>
  );
}

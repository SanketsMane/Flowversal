import { Fragment } from 'react';
import { useDrop } from 'react-dnd';
import { useTheme } from '@/core/theme/ThemeContext';
import { Task } from '@/core/stores/projectStore';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

interface BoardColumnProps {
  status: string;
  title: string;
  tasks: Task[];
  color: string;
  onDrop: (taskId: string, newStatus: string, targetIndex?: number) => void;
  onTaskClick: (task: Task) => void;
  onAddTask?: (status: string) => void;
}

const DropZone = ({
  status,
  onDrop,
  index,
}: {
  status: string;
  onDrop: (taskId: string, newStatus: string, targetIndex?: number) => void;
  index: number;
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    hover: () => undefined,
    drop: (item: { id: string }) => {
      onDrop(item.id, status, index);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`h-3 transition-all ${isOver ? 'bg-blue-500/20 rounded-full' : ''}`}
    >
      {isOver && <div className="h-0.5 rounded-full bg-blue-500" />}
    </div>
  );
};

export function BoardColumn({
  status,
  title,
  tasks,
  color,
  onDrop,
  onTaskClick,
  onAddTask,
}: BoardColumnProps) {
  const { theme } = useTheme();
  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]/50' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  return (
    <div className="flex flex-col w-[280px] flex-shrink-0 h-full">
      <div className="mb-3 px-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
            <h3 className={`${textPrimary} text-sm font-semibold`}>
              {title}
            </h3>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${textSecondary} bg-white/10`}>
            {tasks.length}
          </span>
        </div>
        {onAddTask && (
          <button
            onClick={() => onAddTask(status)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border border-dashed text-[10px] mt-2 w-full justify-center transition-colors ${textSecondary} hover:border-[#00C6FF]`}
          >
            <Plus className="w-3 h-3" />
            Add Card
          </button>
        )}
      </div>

      <div className={`flex-1 ${bgMain} rounded-xl border ${borderColor} flex flex-col gap-3 p-3`}>
        <DropZone status={status} onDrop={onDrop} index={0} />
        {tasks.map((task, index) => (
          <Fragment key={task.id}>
            <TaskCard task={task} onClick={() => onTaskClick(task)} />
            <DropZone status={status} onDrop={onDrop} index={index + 1} />
          </Fragment>
        ))}
        {tasks.length === 0 && (
          <div className={`flex-1 text-center text-xs font-medium mt-4 ${textSecondary}`}>
            No tasks in this column
          </div>
        )}
      </div>
    </div>
  );
}


import { useDrag } from 'react-dnd';
import { useTheme } from '@/core/theme/ThemeContext';
import { Task } from '@/core/stores/projectStore';
import { Workflow, AlertCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const priorityConfig: Record<string, { color: string }> = {
  Critical: { color: 'text-red-500' },
  High: { color: 'text-orange-500' },
  Medium: { color: 'text-yellow-500' },
  Low: { color: 'text-gray-500' },
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { theme } = useTheme();

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const attachRef = (el: HTMLDivElement | null) => {
    drag(el);
  };

  const bgCard = theme === 'dark' ? 'bg-[#1A1E3A]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  const priorityColor = priorityConfig[task.priority]?.color || 'text-gray-500';

  return (
    <div
      ref={attachRef}
      onClick={onClick}
    className={`${bgCard} border ${borderColor} rounded-lg p-4 cursor-move hover:shadow-lg transition-all ${
      isDragging ? 'opacity-50' : 'opacity-100'
    }`}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-xs ${textSecondary}`}>{task.taskId}</span>
            {task.hasWorkflow && (
              <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center">
                <Workflow className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <h4 className={`${textPrimary} mt-1 line-clamp-2`}>{task.name}</h4>
        </div>
        <AlertCircle className={`w-4 h-4 ${priorityColor} flex-shrink-0`} />
      </div>

      {task.description && (
        <p className={`text-sm ${textSecondary} mb-3 line-clamp-2`}>{task.description}</p>
      )}

      {task.labels && task.labels.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-3">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label.id}
              className={`${label.color} text-white px-2 py-0.5 rounded-full text-xs font-medium`}
            >
              {label.name}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="bg-gray-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
              +{task.labels.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          {task.assignedTo.slice(0, 3).map((assignee) => (
            <div
              key={assignee.id}
              className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs border-2 border-[#1A1A2E]"
              title={assignee.name}
            >
              {assignee.avatar}
            </div>
          ))}
          {task.assignedTo.length > 3 && (
            <div className="w-7 h-7 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs border-2 border-[#1A1A2E]">
              +{task.assignedTo.length - 3}
            </div>
          )}
        </div>

        {task.dueDate && (
          <span className={`text-xs ${textSecondary} whitespace-nowrap`}>
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}


import { Task } from '@/core/stores/projectStore';
import { RenderIconByName } from '@/shared/components/ui/SimpleIconPicker';

interface MyTasksSegments {
  overdue: Task[];
  today: Task[];
  tomorrow: Task[];
  thisWeek: Task[];
  thisMonth: Task[];
  future: Task[];
}

interface MyTasksPanelProps {
  segments: MyTasksSegments;
  projects: { id: string; name: string; icon: string; iconColor: string }[];
  boards: { id: string; name: string; icon: string; iconColor: string }[];
  statusColors: Record<string, string>;
  priorityColors: Record<string, string>;
  textPrimary: string;
  textSecondary: string;
  bgCard: string;
  borderColor: string;
  hoverBg: string;
  onSelectTask: (task: Task) => void;
}

const sectionConfig = [
  { key: 'overdue', label: 'Overdue', dot: 'text-red-500', variant: 'detailed' },
  { key: 'today', label: 'Today', dot: 'text-orange-500', variant: 'compact', grid: 'grid-cols-1 md:grid-cols-2' },
  { key: 'tomorrow', label: 'Tomorrow', dot: 'text-yellow-500', variant: 'compact', grid: 'grid-cols-1 md:grid-cols-2' },
  { key: 'thisWeek', label: 'This Week', dot: 'text-blue-500', variant: 'compact', grid: 'grid-cols-1 md:grid-cols-2' },
  { key: 'thisMonth', label: 'This Month', dot: 'text-purple-500', variant: 'compact', grid: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' },
  { key: 'future', label: 'Future', dot: 'text-gray-500', variant: 'compact', grid: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' },
] as const;

type SectionKey = (typeof sectionConfig)[number]['key'];

export function MyTasksPanel({
  segments,
  projects,
  boards,
  statusColors,
  priorityColors,
  textPrimary,
  textSecondary,
  bgCard,
  borderColor,
  hoverBg,
  onSelectTask,
}: MyTasksPanelProps) {
  const getProject = (projectId?: string) => projects.find((p) => p.id === projectId);
  const getBoard = (boardId?: string) => boards.find((b) => b.id === boardId);
  const hasTasks = Object.values(segments).some((taskList) => taskList.length > 0);

  if (!hasTasks) {
    return (
      <div className={`${bgCard} rounded-xl border ${borderColor} p-10 text-center`}>
        <p className={`text-lg font-semibold ${textPrimary}`}>No tasks yet</p>
        <p className={`${textSecondary} text-sm mt-2`}>Create a task under a board to see it here.</p>
      </div>
    );
  }

  const renderTaskPreview = (task: Task, variant: 'compact' | 'detailed') => {
    const taskProject = getProject(task.projectId);
    const taskBoard = getBoard(task.boardId);

    if (variant === 'detailed') {
      return (
        <div
          key={task.id}
          onClick={() => onSelectTask(task)}
          className={`${bgCard} rounded-xl border ${borderColor} border-l-4 border-l-yellow-500 p-6 ${hoverBg} cursor-pointer transition-all`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-sm ${textSecondary}`}>{task.taskId}</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: statusColors[task.status] }}></div>
                  <span className={`text-sm ${textPrimary}`}>{task.status}</span>
                </div>
                {task.priority && (
                  <span className={`text-sm ${priorityColors[task.priority]}`}>{task.priority}</span>
                )}
              </div>
              <h3 className={`text-lg ${textPrimary} mb-2`}>{task.name}</h3>
              {task.description && (
                <p className={`text-sm ${textSecondary} mb-3 line-clamp-2`}>{task.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm">
                {taskProject && (
                  <div className="flex items-center gap-2">
                    <RenderIconByName name={taskProject.icon} className="w-4 h-4" style={{ color: taskProject.iconColor }} />
                    <span className={textSecondary}>{taskProject.name}</span>
                  </div>
                )}
                {taskBoard && (
                  <div className="flex items-center gap-2">
                    <RenderIconByName name={taskBoard.icon} className="w-4 h-4" style={{ color: taskBoard.iconColor }} />
                    <span className={textSecondary}>{taskBoard.name}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center -space-x-2">
              {task.assignedTo.slice(0, 3).map((assignee) => (
                <div
                  key={assignee.id}
                  className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs border-2 border-[#1A1A2E]"
                  title={assignee.name}
                >
                  {assignee.avatar}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={task.id}
        onClick={() => onSelectTask(task)}
        className={`${bgCard} rounded-xl border ${borderColor} p-4 ${hoverBg} cursor-pointer transition-all`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs ${textSecondary}`}>{task.taskId}</span>
              {variant !== 'detailed' && (
                <div className="w-2 h-2 rounded" style={{ backgroundColor: statusColors[task.status] }}></div>
              )}
            </div>
            <h3 className={`${textPrimary} mb-2 truncate`}>{task.name}</h3>
            <div className="flex items-center gap-3 text-xs">
              {getBoard(task.boardId) && (
                <div className="flex items-center gap-1">
                  <RenderIconByName
                    name={getBoard(task.boardId)!.icon}
                    className="w-3 h-3"
                    style={{ color: getBoard(task.boardId)!.iconColor }}
                  />
                  <span className={textSecondary}>{getBoard(task.boardId)!.name}</span>
                </div>
              )}
              {task.dueDate && (
                <span className={textSecondary}>
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {sectionConfig.map((section) => {
        const tasks = segments[section.key as keyof MyTasksSegments];
        if (tasks.length === 0) return null;

        const gridClasses = section.grid ?? 'grid-cols-1';

        return (
          <div key={section.key}>
            <h2 className={`text-xl ${textPrimary} mb-4 flex items-center gap-2`}>
              <span className={section.dot}>●</span> {section.label} ({tasks.length})
            </h2>
            <div className={`grid ${gridClasses} gap-3`}>
              {tasks.map((task) =>
                renderTaskPreview(task, section.variant === 'detailed' ? 'detailed' : 'compact')
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}


import { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Plus, Zap } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';

interface Task {
  id: string;
  name: string;
  description: string;
  assignee: string;
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'blocked' | 'done';
  hasAutomation: boolean;
}

interface TaskCardProps {
  task: Task;
  onDrop: (taskId: string, newStatus: Task['status']) => void;
}

interface ColumnProps {
  status: Task['status'];
  title: string;
  tasks: Task[];
  color: string;
  onDrop: (taskId: string, newStatus: Task['status']) => void;
}

function TaskCard({ task, onDrop }: TaskCardProps) {
  const { theme } = useTheme();
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div
      ref={drag}
      className={`${bgCard} border ${borderColor} rounded-lg p-4 cursor-move hover:shadow-lg transition-all ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className={`${textPrimary} flex-1`}>{task.name}</h4>
        {task.hasAutomation && (
          <div className="w-6 h-6 rounded bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Description */}
      <p className={`${textSecondary} text-xs mb-3 line-clamp-2`}>{task.description}</p>

      {/* Assignee */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center text-white text-xs">
          {getInitials(task.assignee)}
        </div>
        <span className={`${textSecondary} text-xs`}>{task.assignee}</span>
      </div>
    </div>
  );
}

function Column({ status, title, tasks, color, onDrop }: ColumnProps) {
  const { theme } = useTheme();
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item: { id: string; status: Task['status'] }) => {
      if (item.status !== status) {
        onDrop(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]/50' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <div
      ref={drop}
      className={`${bgMain} border ${borderColor} rounded-xl p-4 min-h-[600px] ${
        isOver ? 'ring-2 ring-[#00C6FF]' : ''
      }`}
    >
      {/* Column Header */}
      <div className="mb-4">
        <div className={`flex items-center justify-between mb-2 pb-3 border-b-2`} style={{ borderColor: color }}>
          <h3 className={`${textPrimary}`}>{title}</h3>
          <span className="text-xs bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-current opacity-30 hover:opacity-60 transition-all">
          <Plus className="w-4 h-4" />
          <span className="text-xs">Add Item</span>
        </button>
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onDrop={onDrop} />
        ))}
      </div>
    </div>
  );
}

export function MyBoards() {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      name: 'Yash Sharma - TPF',
      description: 'Complete the third-party form integration with API endpoints',
      assignee: 'Yash Sharma',
      status: 'todo',
      hasAutomation: true,
    },
    {
      id: '2',
      name: 'Design System Update',
      description: 'Update the design system with new color palette and typography',
      assignee: 'John Doe',
      status: 'in-progress',
      hasAutomation: false,
    },
    {
      id: '3',
      name: 'Authentication Module',
      description: 'Implement OAuth 2.0 authentication with social login providers',
      assignee: 'Jane Smith',
      status: 'review',
      hasAutomation: true,
    },
    {
      id: '4',
      name: 'Database Optimization',
      description: 'Optimize database queries and add proper indexing',
      assignee: 'Mike Johnson',
      status: 'backlog',
      hasAutomation: false,
    },
    {
      id: '5',
      name: 'API Documentation',
      description: 'Create comprehensive API documentation with examples',
      assignee: 'Sarah Williams',
      status: 'done',
      hasAutomation: false,
    },
  ]);

  const handleDrop = (taskId: string, newStatus: Task['status']) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const columns: { status: Task['status']; title: string; color: string }[] = [
    { status: 'backlog', title: 'Backlogs', color: '#94A3B8' },
    { status: 'todo', title: 'To do', color: '#F59E0B' },
    { status: 'in-progress', title: 'In Progress', color: '#3B82F6' },
    { status: 'review', title: 'Review', color: '#8B5CF6' },
    { status: 'blocked', title: 'Blocked', color: '#EF4444' },
    { status: 'done', title: 'Done', color: '#10B981' },
  ];

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  return (
    <div className={`min-h-screen ${bgMain} transition-colors duration-300`}>
        {/* Main Content */}
        <main className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className={`${textPrimary} text-3xl mb-2`}>My Boards</h1>
              <p className={`${textSecondary} text-sm`}>Manage your tasks with Kanban board</p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all">
              <Plus className="w-4 h-4" />
              New Item/Subitem
            </button>
          </div>

          {/* Kanban Board */}
          <div className="overflow-x-auto pb-8">
            <div className="inline-flex gap-4 min-w-full">
              {columns.map((column) => (
                <div key={column.status} className="w-80 flex-shrink-0">
                  <Column
                    status={column.status}
                    title={column.title}
                    tasks={tasks.filter((task) => task.status === column.status)}
                    color={column.color}
                    onDrop={handleDrop}
                  />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
  );
}

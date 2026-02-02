import { useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Plus, Zap, Search, Filter, SortAsc, LayoutList, LayoutGrid, BarChart3, X, Workflow, AlertCircle, ChevronDown, Users } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { TaskDetailModal } from './TaskDetailModal';
import { TeamManagement } from './TeamManagement';

// Unique ID generator with counter to avoid collisions
let idCounter = 0;
const generateUniqueId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${++idCounter}`;
};

interface Task {
  id: string;
  taskId: string;
  name: string;
  description: string;
  assignedTo: Array<{ id: string; name: string; avatar: string }>;
  status: string;
  priority: string;
  labels: Array<{ id: string; name: string; color: string }>;
  dueDate?: Date;
  hasWorkflow: boolean;
  boardName: string;
  folderName?: string;
  createdBy: { id: string; name: string; avatar: string };
  createdAt: Date;
  updatedAt: Date;
}

interface TaskCardProps {
  task: Task;
  onDrop: (taskId: string, newStatus: string) => void;
  onClick: () => void;
}

interface ColumnProps {
  status: string;
  title: string;
  tasks: Task[];
  color: string;
  onDrop: (taskId: string, newStatus: string) => void;
  onTaskClick: (task: Task) => void;
  onAddTask?: (status: string) => void;
}

const LOGGED_IN_USER_ID = '1'; // Current logged-in user

function TaskCard({ task, onDrop, onClick }: TaskCardProps) {
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

  const priorityConfig: Record<string, { icon: typeof AlertCircle; color: string }> = {
    'Critical': { icon: AlertCircle, color: 'text-red-500' },
    'High': { icon: AlertCircle, color: 'text-orange-500' },
    'Medium': { icon: AlertCircle, color: 'text-yellow-500' },
    'Low': { icon: AlertCircle, color: 'text-gray-500' }
  };

  const PriorityIcon = priorityConfig[task.priority]?.icon || AlertCircle;
  const priorityColor = priorityConfig[task.priority]?.color || 'text-gray-500';

  return (
    <div
      ref={drag}
      onClick={onClick}
      className={`${bgCard} border ${borderColor} rounded-lg p-4 cursor-move hover:shadow-lg transition-all ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {/* Header */}
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
          <h4 className={`${textPrimary} text-sm mt-1`} title={task.name}>
            {task.name.length > 60 ? `${task.name.substring(0, 60)}...` : task.name}
          </h4>
        </div>
        <PriorityIcon className={`w-4 h-4 ${priorityColor} flex-shrink-0 ml-2`} />
      </div>

      {/* Description */}
      <p className={`${textSecondary} text-xs mb-3 line-clamp-2`}>{task.description}</p>

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex gap-1 mb-3 flex-wrap">
          {task.labels.slice(0, 2).map(label => (
            <span
              key={label.id}
              className={`${label.color} text-white px-2 py-0.5 rounded text-xs`}
            >
              {label.name}
            </span>
          ))}
          {task.labels.length > 2 && (
            <span className={`text-xs ${textSecondary}`}>+{task.labels.length - 2}</span>
          )}
        </div>
      )}

      {/* Assignees */}
      <div className="flex items-center gap-2">
        <div className="flex items-center -space-x-2">
          {task.assignedTo.slice(0, 3).map(assignee => (
            <div
              key={assignee.id}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center text-white text-xs border-2 border-[#1A1A2E]"
              title={assignee.name}
            >
              {assignee.avatar}
            </div>
          ))}
          {task.assignedTo.length > 3 && (
            <div className={`w-7 h-7 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs border-2 border-[#1A1A2E]`}>
              +{task.assignedTo.length - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Column({ status, title, tasks, color, onDrop, onTaskClick, onAddTask }: ColumnProps) {
  const { theme } = useTheme();
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item: { id: string; status: string }) => {
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
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  return (
    <div
      ref={drop}
      className={`${bgMain} border ${borderColor} rounded-xl p-4 min-h-[400px] ${
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
        <button 
          onClick={() => onAddTask && onAddTask(status)}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed ${borderColor} ${textSecondary} hover:bg-white/5 transition-all`}
        >
          <Plus className="w-4 h-4" />
          <span className="text-xs">Add Task</span>
        </button>
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onDrop={onDrop}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>
    </div>
  );
}

interface ProjectsProps {
  externalNewTaskTrigger?: number;
  externalTeamManagementTrigger?: number;
}

export function Projects({ externalNewTaskTrigger, externalTeamManagementTrigger }: ProjectsProps = {}) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'active' | 'backlogs' | 'completed'>('active');
  const [view, setView] = useState<'list' | 'kanban' | 'chart'>('kanban');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showMyTasks, setShowMyTasks] = useState(false);
  const [sortBy, setSortBy] = useState('dueDate');
  const [newTaskStatus, setNewTaskStatus] = useState('To do');
  const [showTeamManagement, setShowTeamManagement] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      taskId: 'TSK-001',
      name: 'Design new landing page',
      description: 'Create a modern, conversion-focused landing page with gradient effects',
      assignedTo: [
        { id: '1', name: 'John Doe', avatar: 'JD' },
        { id: '2', name: 'Jane Smith', avatar: 'JS' }
      ],
      status: 'In Progress',
      priority: 'High',
      labels: [
        { id: '1', name: 'Design', color: 'bg-purple-500' },
        { id: '2', name: 'Frontend', color: 'bg-blue-500' }
      ],
      dueDate: new Date('2025-11-10'),
      hasWorkflow: true,
      boardName: 'Marketing Campaign',
      folderName: 'Marketing Projects',
      createdBy: { id: '1', name: 'John Doe', avatar: 'JD' },
      createdAt: new Date('2025-10-15'),
      updatedAt: new Date('2025-11-04')
    },
    {
      id: '2',
      taskId: 'TSK-002',
      name: 'Implement user authentication',
      description: 'Add OAuth and email/password authentication with JWT tokens',
      assignedTo: [
        { id: '3', name: 'Bob Wilson', avatar: 'BW' }
      ],
      status: 'To do',
      priority: 'Critical',
      labels: [
        { id: '3', name: 'Backend', color: 'bg-green-500' },
        { id: '4', name: 'Security', color: 'bg-red-500' }
      ],
      dueDate: new Date('2025-11-08'),
      hasWorkflow: false,
      boardName: 'Sprint Planning',
      folderName: 'Development',
      createdBy: { id: '3', name: 'Bob Wilson', avatar: 'BW' },
      createdAt: new Date('2025-10-20'),
      updatedAt: new Date('2025-11-02')
    },
    {
      id: '3',
      taskId: 'TSK-003',
      name: 'Create marketing materials',
      description: 'Design social media graphics and email templates for campaign',
      assignedTo: [
        { id: '4', name: 'Alice Brown', avatar: 'AB' }
      ],
      status: 'Review',
      priority: 'Medium',
      labels: [
        { id: '1', name: 'Design', color: 'bg-purple-500' },
        { id: '5', name: 'Marketing', color: 'bg-pink-500' }
      ],
      dueDate: new Date('2025-11-15'),
      hasWorkflow: true,
      boardName: 'Content Calendar',
      folderName: 'Marketing Projects',
      createdBy: { id: '4', name: 'Alice Brown', avatar: 'AB' },
      createdAt: new Date('2025-09-25'),
      updatedAt: new Date('2025-11-03')
    },
    {
      id: '4',
      taskId: 'TSK-004',
      name: 'Fix bug in payment flow',
      description: 'Resolve issue with failed transactions in checkout process',
      assignedTo: [
        { id: '3', name: 'Bob Wilson', avatar: 'BW' },
        { id: '5', name: 'Charlie Davis', avatar: 'CD' }
      ],
      status: 'Done',
      priority: 'Critical',
      labels: [
        { id: '6', name: 'Bug', color: 'bg-red-500' },
        { id: '3', name: 'Backend', color: 'bg-green-500' }
      ],
      hasWorkflow: false,
      boardName: 'Bug Tracking',
      folderName: 'Development',
      createdBy: { id: '3', name: 'Bob Wilson', avatar: 'BW' },
      createdAt: new Date('2025-10-25'),
      updatedAt: new Date('2025-11-03')
    },
    {
      id: '5',
      taskId: 'TSK-005',
      name: 'Update documentation',
      description: 'Update API documentation and user guides with new features',
      assignedTo: [
        { id: '2', name: 'Jane Smith', avatar: 'JS' }
      ],
      status: 'Backlog',
      priority: 'Low',
      labels: [
        { id: '7', name: 'Documentation', color: 'bg-yellow-500' }
      ],
      dueDate: new Date('2025-11-20'),
      hasWorkflow: false,
      boardName: 'Sprint Planning',
      folderName: 'Development',
      createdBy: { id: '2', name: 'Jane Smith', avatar: 'JS' },
      createdAt: new Date('2025-10-10'),
      updatedAt: new Date('2025-10-10')
    },
    {
      id: '6',
      taskId: 'TSK-006',
      name: 'Database optimization',
      description: 'Optimize slow queries and add proper indexing to improve performance',
      assignedTo: [
        { id: '1', name: 'John Doe', avatar: 'JD' }
      ],
      status: 'Blocked',
      priority: 'High',
      labels: [
        { id: '3', name: 'Backend', color: 'bg-green-500' },
        { id: '8', name: 'Performance', color: 'bg-orange-500' }
      ],
      dueDate: new Date('2025-11-12'),
      hasWorkflow: true,
      boardName: 'Sprint Planning',
      folderName: 'Development',
      createdBy: { id: '3', name: 'Bob Wilson', avatar: 'BW' },
      createdAt: new Date('2025-10-28'),
      updatedAt: new Date('2025-11-04')
    },
    {
      id: '7',
      taskId: 'TSK-007',
      name: 'Quarterly report completed',
      description: 'Finished Q3 quarterly business report',
      assignedTo: [
        { id: '1', name: 'John Doe', avatar: 'JD' }
      ],
      status: 'Done',
      priority: 'High',
      labels: [
        { id: '9', name: 'Report', color: 'bg-indigo-500' }
      ],
      hasWorkflow: false,
      boardName: 'Reports',
      folderName: 'Management',
      createdBy: { id: '1', name: 'John Doe', avatar: 'JD' },
      createdAt: new Date('2025-09-15'),
      updatedAt: new Date('2025-09-30')
    },
    {
      id: '8',
      taskId: 'TSK-008',
      name: 'Client meeting notes',
      description: 'Document client feedback from August meeting',
      assignedTo: [
        { id: '2', name: 'Jane Smith', avatar: 'JS' }
      ],
      status: 'Done',
      priority: 'Medium',
      labels: [
        { id: '10', name: 'Meeting', color: 'bg-teal-500' }
      ],
      hasWorkflow: false,
      boardName: 'Client Relations',
      folderName: 'Sales',
      createdBy: { id: '2', name: 'Jane Smith', avatar: 'JS' },
      createdAt: new Date('2025-08-20'),
      updatedAt: new Date('2025-08-22')
    }
  ]);

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgPanel = theme === 'dark' ? 'bg-[#252540]' : 'bg-gray-100';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  const handleDrop = (taskId: string, newStatus: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus, updatedAt: new Date() } : task
      )
    );
  };

  const handleCreateTask = (status: string = 'To do') => {
    setNewTaskStatus(status);
    setSelectedTask({
      id: `new-${Date.now()}`,
      taskId: `TSK-${String(tasks.length + 1).padStart(3, '0')}`,
      name: '',
      description: '',
      assignedTo: [],
      status: status,
      priority: 'Medium',
      labels: [],
      hasWorkflow: false,
      boardName: 'Sprint Planning',
      createdBy: { id: '1', name: 'Current User', avatar: 'CU' },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    setIsCreatingTask(true);
  };

  const handleTaskUpdate = (taskId: string, updates: any) => {
    setTasks(prevTasks => {
      const existingTaskIndex = prevTasks.findIndex(t => t.id === taskId);
      
      if (existingTaskIndex >= 0) {
        // Update existing task
        const updatedTasks = [...prevTasks];
        updatedTasks[existingTaskIndex] = {
          ...updatedTasks[existingTaskIndex],
          ...updates,
          updatedAt: new Date()
        };
        return updatedTasks;
      } else {
        // Create new task
        const newTask: Task = {
          id: taskId,
          taskId: updates.taskId || `TSK-${String(prevTasks.length + 1).padStart(3, '0')}`,
          name: updates.name || 'Untitled Task',
          description: updates.description || '',
          assignedTo: updates.members || [],
          status: updates.status || 'To do',
          priority: updates.priority || 'Medium',
          labels: updates.labels || [],
          dueDate: updates.dueDate,
          hasWorkflow: updates.hasWorkflow || false,
          boardName: updates.boardName || 'Sprint Planning',
          folderName: updates.folderName,
          createdBy: { id: '1', name: 'Current User', avatar: 'CU' },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        return [...prevTasks, newTask];
      }
    });
    setIsCreatingTask(false);
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
  };

  const statusColors: Record<string, string> = {
    'Backlog': '#94A3B8',
    'To do': '#F59E0B',
    'In Progress': '#3B82F6',
    'Review': '#8B5CF6',
    'Blocked': '#EF4444',
    'Done': '#10B981'
  };

  const priorityColors: Record<string, string> = {
    'Critical': 'text-red-500',
    'High': 'text-orange-500',
    'Medium': 'text-yellow-500',
    'Low': 'text-gray-500'
  };

  const columns: { status: string; title: string; color: string }[] = [
    { status: 'Backlog', title: 'Backlog', color: statusColors['Backlog'] },
    { status: 'To do', title: 'To do', color: statusColors['To do'] },
    { status: 'In Progress', title: 'In Progress', color: statusColors['In Progress'] },
    { status: 'Review', title: 'Review', color: statusColors['Review'] },
    { status: 'Blocked', title: 'Blocked', color: statusColors['Blocked'] },
    { status: 'Done', title: 'Done', color: statusColors['Done'] },
  ];

  // Filter tasks based on active tab
  const getFilteredTasksByTab = () => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    if (activeTab === 'backlogs') {
      return tasks.filter(task => task.status === 'Backlog');
    } else if (activeTab === 'completed') {
      return tasks.filter(task => task.status === 'Done');
    } else {
      // Active tab: show all except backlog, and include done items from last month
      return tasks.filter(task => {
        if (task.status === 'Backlog') return false;
        if (task.status === 'Done') {
          return task.updatedAt >= oneMonthAgo;
        }
        return true;
      });
    }
  };

  // Filter and sort tasks
  let filteredTasks = getFilteredTasksByTab().filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.taskId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(task.status);
    const matchesPriority = selectedPriority.length === 0 || selectedPriority.includes(task.priority);
    const matchesMyTasks = !showMyTasks || task.assignedTo.some(user => user.id === LOGGED_IN_USER_ID);
    return matchesSearch && matchesStatus && matchesPriority && matchesMyTasks;
  });

  // Sort tasks
  filteredTasks.sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      case 'priority':
        const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
        return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Group completed tasks by month
  const groupTasksByMonth = (tasks: Task[]) => {
    const groups: Record<string, Task[]> = {};
    tasks.forEach(task => {
      const monthYear = task.updatedAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(task);
    });
    return groups;
  };

  const completedTasksByMonth = activeTab === 'completed' ? groupTasksByMonth(filteredTasks) : {};

  // Calculate stats for chart view
  const statusCounts = columns.map(col => ({
    status: col.status,
    count: filteredTasks.filter(t => t.status === col.status).length,
    color: col.color
  }));

  const maxCount = Math.max(...statusCounts.map(s => s.count), 1);

  // Listen to external triggers from header buttons
  useEffect(() => {
    if (externalNewTaskTrigger && externalNewTaskTrigger > 0) {
      handleCreateTask('To do');
    }
  }, [externalNewTaskTrigger]);

  useEffect(() => {
    if (externalTeamManagementTrigger && externalTeamManagementTrigger > 0) {
      setShowTeamManagement(true);
    }
  }, [externalTeamManagementTrigger]);

  return (
    <>
      <div 
        className={`min-h-full h-full flex flex-col transition-colors duration-300 ${
          theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white'
        }`}
        onClick={() => {
          setShowFilters(false);
          setShowSort(false);
        }}
      >
        <div className="flex-shrink-0 p-8 pb-0">
          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-white/5">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-3 ${activeTab === 'active' ? 'border-b-2 border-blue-500 text-blue-500' : `${textSecondary} ${hoverBg}`}`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('backlogs')}
              className={`px-6 py-3 ${activeTab === 'backlogs' ? 'border-b-2 border-blue-500 text-blue-500' : `${textSecondary} ${hoverBg}`}`}
            >
              Backlogs
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-3 ${activeTab === 'completed' ? 'border-b-2 border-blue-500 text-blue-500' : `${textSecondary} ${hoverBg}`}`}
            >
              Completed
            </button>
          </div>

          {/* Toolbar - Only show for Active tab */}
          {activeTab === 'active' && (
            <div className={`${bgCard} rounded-xl border ${borderColor} p-4 mb-6`}>
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Left Side - Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
                  {/* Search */}
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${bgPanel} flex-1 sm:max-w-md`}>
                    <Search className={`w-4 h-4 ${textSecondary}`} />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`flex-1 bg-transparent outline-none ${textPrimary} text-sm`}
                    />
                  </div>

                  {/* Filters */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFilters(!showFilters);
                        setShowSort(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${borderColor} ${bgPanel} ${hoverBg} ${textPrimary}`}
                    >
                      <Filter className="w-4 h-4" />
                      <span className="text-sm">Filter</span>
                      {(selectedStatus.length > 0 || selectedPriority.length > 0 || showMyTasks) && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs">
                          {selectedStatus.length + selectedPriority.length + (showMyTasks ? 1 : 0)}
                        </span>
                      )}
                    </button>

                    {showFilters && (
                      <div 
                        className={`absolute top-full left-0 mt-2 w-72 ${bgCard} rounded-lg border ${borderColor} shadow-xl z-20 p-4`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`${textPrimary}`}>Filters</h3>
                          <button
                            onClick={() => {
                              setSelectedStatus([]);
                              setSelectedPriority([]);
                              setShowMyTasks(false);
                            }}
                            className={`text-sm text-blue-500 hover:underline`}
                          >
                            Clear all
                          </button>
                        </div>

                        {/* My Tasks Filter */}
                        <div className="mb-4 pb-4 border-b border-white/5">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={showMyTasks}
                              onChange={(e) => setShowMyTasks(e.target.checked)}
                              className="rounded"
                            />
                            <span className={`text-sm ${textPrimary}`}>My Tasks</span>
                          </label>
                        </div>

                        {/* Status Filter */}
                        <div className="mb-4">
                          <label className={`block text-sm ${textSecondary} mb-2`}>Status</label>
                          <div className="space-y-2">
                            {columns.map(col => (
                              <label key={col.status} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedStatus.includes(col.status)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedStatus([...selectedStatus, col.status]);
                                    } else {
                                      setSelectedStatus(selectedStatus.filter(s => s !== col.status));
                                    }
                                  }}
                                  className="rounded"
                                />
                                <div className={`w-3 h-3 rounded`} style={{ backgroundColor: col.color }}></div>
                                <span className={`text-sm ${textPrimary}`}>{col.status}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Priority Filter */}
                        <div>
                          <label className={`block text-sm ${textSecondary} mb-2`}>Priority</label>
                          <div className="space-y-2">
                            {['Critical', 'High', 'Medium', 'Low'].map(priority => (
                              <label key={priority} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedPriority.includes(priority)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedPriority([...selectedPriority, priority]);
                                    } else {
                                      setSelectedPriority(selectedPriority.filter(p => p !== priority));
                                    }
                                  }}
                                  className="rounded"
                                />
                                <span className={`text-sm ${priorityColors[priority]}`}>{priority}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sort */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSort(!showSort);
                        setShowFilters(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${borderColor} ${bgPanel} ${hoverBg} ${textPrimary}`}
                    >
                      <SortAsc className="w-4 h-4" />
                      <span className="text-sm">Sort</span>
                    </button>

                    {showSort && (
                      <div 
                        className={`absolute top-full left-0 mt-2 w-48 ${bgCard} rounded-lg border ${borderColor} shadow-xl z-20`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => { setSortBy('dueDate'); setShowSort(false); }}
                          className={`w-full px-4 py-2 text-left ${hoverBg} ${textPrimary} text-sm ${sortBy === 'dueDate' ? 'bg-blue-500/10' : ''}`}
                        >
                          Due Date
                        </button>
                        <button
                          onClick={() => { setSortBy('priority'); setShowSort(false); }}
                          className={`w-full px-4 py-2 text-left ${hoverBg} ${textPrimary} text-sm ${sortBy === 'priority' ? 'bg-blue-500/10' : ''}`}
                        >
                          Priority
                        </button>
                        <button
                          onClick={() => { setSortBy('name'); setShowSort(false); }}
                          className={`w-full px-4 py-2 text-left ${hoverBg} ${textPrimary} text-sm ${sortBy === 'name' ? 'bg-blue-500/10' : ''}`}
                        >
                          Name
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - View Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 rounded-lg ${view === 'list' ? 'bg-blue-500 text-white' : `${bgPanel} ${textSecondary} ${hoverBg}`}`}
                    title="List View"
                  >
                    <LayoutList className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setView('kanban')}
                    className={`p-2 rounded-lg ${view === 'kanban' ? 'bg-blue-500 text-white' : `${bgPanel} ${textSecondary} ${hoverBg}`}`}
                    title="Kanban View"
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setView('chart')}
                    className={`p-2 rounded-lg ${view === 'chart' ? 'bg-blue-500 text-white' : `${bgPanel} ${textSecondary} ${hoverBg}`}`}
                    title="Chart View"
                  >
                    <BarChart3 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {/* Active Tab Content */}
          {activeTab === 'active' && (
            <>
              {/* Kanban View */}
              {view === 'kanban' && (
                <div className="overflow-x-auto">
                  <div className="inline-flex gap-4 min-w-full">
                    {columns.filter(col => col.status !== 'Backlog').map((column) => (
                      <div key={column.status} className="w-80 flex-shrink-0">
                        <Column
                          status={column.status}
                          title={column.title}
                          tasks={filteredTasks.filter((task) => task.status === column.status)}
                          color={column.color}
                          onDrop={handleDrop}
                          onTaskClick={setSelectedTask}
                          onAddTask={handleCreateTask}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* List View */}
              {view === 'list' && (
                <div className={`${bgCard} rounded-xl border ${borderColor} overflow-hidden`}>
                  <table className="w-full">
                    <thead className={`${bgPanel} border-b ${borderColor}`}>
                      <tr>
                        <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Task ID</th>
                        <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Name</th>
                        <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Status</th>
                        <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Priority</th>
                        <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Members</th>
                        <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Labels</th>
                        <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Workflow</th>
                        <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.map((task) => (
                        <tr
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className={`border-b ${borderColor} ${hoverBg} cursor-pointer transition-colors`}
                        >
                          <td className={`px-6 py-4 text-sm ${textSecondary}`}>{task.taskId}</td>
                          <td className={`px-6 py-4 text-sm ${textPrimary}`}>{task.name}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded`} style={{ backgroundColor: statusColors[task.status] }}></div>
                              <span className={`text-sm ${textPrimary}`}>{task.status}</span>
                            </div>
                          </td>
                          <td className={`px-6 py-4 text-sm ${priorityColors[task.priority]}`}>{task.priority}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center -space-x-2">
                              {task.assignedTo.slice(0, 3).map(assignee => (
                                <div
                                  key={assignee.id}
                                  className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs border-2 border-[#1A1A2E]"
                                  title={assignee.name}
                                >
                                  {assignee.avatar}
                                </div>
                              ))}
                              {task.assignedTo.length > 3 && (
                                <div className={`w-8 h-8 rounded-full ${bgPanel} flex items-center justify-center ${textSecondary} text-xs border-2 border-[#1A1A2E]`}>
                                  +{task.assignedTo.length - 3}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1 flex-wrap">
                              {task.labels.slice(0, 2).map(label => (
                                <span
                                  key={label.id}
                                  className={`${label.color} text-white px-2 py-1 rounded text-xs`}
                                >
                                  {label.name}
                                </span>
                              ))}
                              {task.labels.length > 2 && (
                                <span className={`${bgPanel} ${textSecondary} px-2 py-1 rounded text-xs`}>
                                  +{task.labels.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {task.hasWorkflow && (
                              <div className="w-7 h-7 rounded bg-green-500 flex items-center justify-center">
                                <Workflow className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </td>
                          <td className={`px-6 py-4 text-sm ${textSecondary}`}>
                            {task.dueDate ? task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Chart View */}
              {view === 'chart' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bar Chart */}
                  <div className={`${bgCard} rounded-xl border ${borderColor} p-6`}>
                    <h3 className={`${textPrimary} text-xl mb-6`}>Tasks by Status</h3>
                    <div className="space-y-4">
                      {statusCounts.filter(s => s.status !== 'Backlog').map(({ status, count, color }) => (
                        <div key={status}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded`} style={{ backgroundColor: color }}></div>
                              <span className={`text-sm ${textPrimary}`}>{status}</span>
                            </div>
                            <span className={`text-sm ${textSecondary}`}>{count}</span>
                          </div>
                          <div className={`w-full h-8 rounded-lg ${bgPanel} overflow-hidden`}>
                            <div
                              className={`h-full transition-all`}
                              style={{ 
                                width: `${(count / maxCount) * 100}%`,
                                backgroundColor: color
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Priority Distribution */}
                  <div className={`${bgCard} rounded-xl border ${borderColor} p-6`}>
                    <h3 className={`${textPrimary} text-xl mb-6`}>Tasks by Priority</h3>
                    <div className="space-y-4">
                      {['Critical', 'High', 'Medium', 'Low'].map(priority => {
                        const count = filteredTasks.filter(t => t.priority === priority).length;
                        return (
                          <div key={priority}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-sm ${priorityColors[priority]}`}>{priority}</span>
                              <span className={`text-sm ${textSecondary}`}>{count}</span>
                            </div>
                            <div className={`w-full h-8 rounded-lg ${bgPanel} overflow-hidden`}>
                              <div
                                className={`h-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] transition-all`}
                                style={{ width: `${filteredTasks.length > 0 ? (count / filteredTasks.length) * 100 : 0}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`${bgCard} rounded-xl border ${borderColor} p-6`}>
                      <div className={`text-3xl ${textPrimary} mb-2`}>{filteredTasks.length}</div>
                      <div className={`text-sm ${textSecondary}`}>Total Tasks</div>
                    </div>
                    <div className={`${bgCard} rounded-xl border ${borderColor} p-6`}>
                      <div className={`text-3xl text-blue-500 mb-2`}>{filteredTasks.filter(t => t.status === 'In Progress').length}</div>
                      <div className={`text-sm ${textSecondary}`}>In Progress</div>
                    </div>
                    <div className={`${bgCard} rounded-xl border ${borderColor} p-6`}>
                      <div className={`text-3xl text-green-500 mb-2`}>{filteredTasks.filter(t => t.status === 'Done').length}</div>
                      <div className={`text-sm ${textSecondary}`}>Completed</div>
                    </div>
                    <div className={`${bgCard} rounded-xl border ${borderColor} p-6`}>
                      <div className={`text-3xl text-red-500 mb-2`}>
                        {filteredTasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== 'Done').length}
                      </div>
                      <div className={`text-sm ${textSecondary}`}>Overdue</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Backlogs Tab Content */}
          {activeTab === 'backlogs' && (
            <div className={`${bgCard} rounded-xl border ${borderColor} overflow-hidden`}>
              <table className="w-full">
                <thead className={`${bgPanel} border-b ${borderColor}`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Task ID</th>
                    <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Name</th>
                    <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Priority</th>
                    <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Members</th>
                    <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Labels</th>
                    <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Workflow</th>
                    <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`border-b ${borderColor} ${hoverBg} cursor-pointer transition-colors`}
                    >
                      <td className={`px-6 py-4 text-sm ${textSecondary}`}>{task.taskId}</td>
                      <td className={`px-6 py-4 text-sm ${textPrimary}`}>{task.name}</td>
                      <td className={`px-6 py-4 text-sm ${priorityColors[task.priority]}`}>{task.priority}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center -space-x-2">
                          {task.assignedTo.slice(0, 3).map(assignee => (
                            <div
                              key={assignee.id}
                              className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs border-2 border-[#1A1A2E]"
                              title={assignee.name}
                            >
                              {assignee.avatar}
                            </div>
                          ))}
                          {task.assignedTo.length > 3 && (
                            <div className={`w-8 h-8 rounded-full ${bgPanel} flex items-center justify-center ${textSecondary} text-xs border-2 border-[#1A1A2E]`}>
                              +{task.assignedTo.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {task.labels.slice(0, 2).map(label => (
                            <span
                              key={label.id}
                              className={`${label.color} text-white px-2 py-1 rounded text-xs`}
                            >
                              {label.name}
                            </span>
                          ))}
                          {task.labels.length > 2 && (
                            <span className={`${bgPanel} ${textSecondary} px-2 py-1 rounded text-xs`}>
                              +{task.labels.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {task.hasWorkflow && (
                          <div className="w-7 h-7 rounded bg-green-500 flex items-center justify-center">
                            <Workflow className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </td>
                      <td className={`px-6 py-4 text-sm ${textSecondary}`}>
                        {task.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Completed Tab Content */}
          {activeTab === 'completed' && (
            <div className="space-y-6">
              {Object.entries(completedTasksByMonth).sort((a, b) => {
                const dateA = new Date(a[0]);
                const dateB = new Date(b[0]);
                return dateB.getTime() - dateA.getTime();
              }).map(([month, tasks]) => (
                <div key={month}>
                  <h3 className={`${textPrimary} text-xl mb-4`}>{month}</h3>
                  <div className={`${bgCard} rounded-xl border ${borderColor} overflow-hidden`}>
                    <table className="w-full">
                      <thead className={`${bgPanel} border-b ${borderColor}`}>
                        <tr>
                          <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Task ID</th>
                          <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Name</th>
                          <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Priority</th>
                          <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Members</th>
                          <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Labels</th>
                          <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Workflow</th>
                          <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Completed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((task) => (
                          <tr
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className={`border-b ${borderColor} ${hoverBg} cursor-pointer transition-colors`}
                          >
                            <td className={`px-6 py-4 text-sm ${textSecondary}`}>{task.taskId}</td>
                            <td className={`px-6 py-4 text-sm ${textPrimary}`}>{task.name}</td>
                            <td className={`px-6 py-4 text-sm ${priorityColors[task.priority]}`}>{task.priority}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center -space-x-2">
                                {task.assignedTo.slice(0, 3).map(assignee => (
                                  <div
                                    key={assignee.id}
                                    className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs border-2 border-[#1A1A2E]"
                                    title={assignee.name}
                                  >
                                    {assignee.avatar}
                                  </div>
                                ))}
                                {task.assignedTo.length > 3 && (
                                  <div className={`w-8 h-8 rounded-full ${bgPanel} flex items-center justify-center ${textSecondary} text-xs border-2 border-[#1A1A2E]`}>
                                    +{task.assignedTo.length - 3}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-1 flex-wrap">
                                {task.labels.slice(0, 2).map(label => (
                                  <span
                                    key={label.id}
                                    className={`${label.color} text-white px-2 py-1 rounded text-xs`}
                                  >
                                    {label.name}
                                  </span>
                                ))}
                                {task.labels.length > 2 && (
                                  <span className={`${bgPanel} ${textSecondary} px-2 py-1 rounded text-xs`}>
                                    +{task.labels.length - 2}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {task.hasWorkflow && (
                                <div className="w-7 h-7 rounded bg-green-500 flex items-center justify-center">
                                  <Workflow className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </td>
                            <td className={`px-6 py-4 text-sm ${textSecondary}`}>
                              {task.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal for Editing and Creating */}
      {selectedTask && (
        <TaskDetailModal
          task={{
            id: selectedTask.id,
            taskId: selectedTask.taskId,
            name: selectedTask.name,
            status: selectedTask.status,
            description: selectedTask.description,
            assignee: selectedTask.assignedTo[0]?.name || 'Unassigned',
            avatar: selectedTask.assignedTo[0]?.avatar || 'U',
            dueDate: selectedTask.dueDate,
            boardName: selectedTask.boardName,
            folderName: selectedTask.folderName
          }}
          onClose={() => {
            setSelectedTask(null);
            setIsCreatingTask(false);
          }}
          onUpdate={(taskId, updates) => {
            // Check if this is a new task
            if (isCreatingTask) {
              const newTask: Task = {
                id: generateUniqueId('task'),
                taskId: `TSK-${String(tasks.length + 1).padStart(3, '0')}`,
                name: updates.name || 'New Task',
                description: updates.description || '',
                assignedTo: updates.members || [],
                status: updates.status || 'To do',
                priority: updates.priority || 'Medium',
                labels: updates.labels || [],
                dueDate: updates.dueDate,
                hasWorkflow: updates.hasWorkflow || false,
                boardName: updates.boardName || 'Sprint Planning',
                folderName: updates.folderName,
                createdBy: { id: LOGGED_IN_USER_ID, name: 'John Doe', avatar: 'JD' },
                createdAt: new Date(),
                updatedAt: new Date()
              };
              setTasks(prevTasks => [newTask, ...prevTasks]);
              setIsCreatingTask(false);
            } else {
              // Update existing task
              setTasks(prevTasks =>
                prevTasks.map(task =>
                  task.id === taskId ? { 
                    ...task, 
                    name: updates.name || task.name,
                    description: updates.description || task.description,
                    status: updates.status || task.status,
                    priority: updates.priority || task.priority,
                    labels: updates.labels || task.labels,
                    dueDate: updates.dueDate || task.dueDate,
                    assignedTo: updates.members || task.assignedTo,
                    hasWorkflow: updates.hasWorkflow !== undefined ? updates.hasWorkflow : task.hasWorkflow,
                    updatedAt: new Date() 
                  } : task
                )
              );
            }
            setSelectedTask(null);
          }}
          onDelete={(taskId) => {
            if (!isCreatingTask) {
              setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
            }
            setSelectedTask(null);
            setIsCreatingTask(false);
          }}
        />
      )}

      {/* Team Management Modal */}
      {showTeamManagement && (
        <TeamManagement
          onClose={() => setShowTeamManagement(false)}
        />
      )}
    </>
  );
}
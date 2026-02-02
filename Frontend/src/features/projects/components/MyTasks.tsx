/**
 * My Tasks Component
 * Shows all tasks assigned to the current user, grouped by due date
 */

import React, { useState, useMemo } from 'react';
import { useTheme } from '../../../components/ThemeContext';
import { Plus, Calendar, Folder, ChevronDown, ChevronRight, Workflow, AlertCircle } from 'lucide-react';
import { useProjectStore } from '../store';
import { CreateTaskModal } from './CreateTaskModal';

// Mock current user ID
const CURRENT_USER_ID = '1';

interface TaskWithProject {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'blocked' | 'done';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  assignee?: string;
  dueDate?: string;
  projectName: string;
  projectColor: string;
  projectIcon: string;
  boardName: string;
  boardId: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

interface MyTasksProps {
  onAddTask?: () => void;
}

// Helper function to categorize tasks by due date
function categorizeTasks(tasks: TaskWithProject[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + (7 - today.getDay()));
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const yesterday: TaskWithProject[] = [];
  const todayTasks: TaskWithProject[] = [];
  const tomorrowTasks: TaskWithProject[] = [];
  const thisWeek: TaskWithProject[] = [];
  const thisMonth: TaskWithProject[] = [];

  tasks.forEach((task) => {
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    
    // If no due date, add to today
    if (!dueDate) {
      todayTasks.push(task);
      return;
    }

    const taskDate = new Date(dueDate);
    const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());

    // Yesterday (overdue)
    if (taskDateOnly < today) {
      yesterday.push(task);
    }
    // Today
    else if (taskDateOnly.getTime() === today.getTime()) {
      todayTasks.push(task);
    }
    // Tomorrow
    else if (taskDateOnly.getTime() === tomorrow.getTime()) {
      tomorrowTasks.push(task);
    }
    // This week
    else if (taskDateOnly <= endOfWeek) {
      thisWeek.push(task);
    }
    // This month
    else if (taskDateOnly <= endOfMonth) {
      thisMonth.push(task);
    }
  });

  return {
    yesterday,
    today: todayTasks,
    tomorrow: tomorrowTasks,
    thisWeek,
    thisMonth,
  };
}

export function MyTasks({ onAddTask }: MyTasksProps) {
  const { theme } = useTheme();
  const { projects } = useProjectStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['yesterday', 'today', 'tomorrow'])
  );
  const [showCreateTask, setShowCreateTask] = useState(false);

  // Theme colors
  const bgPage = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-[#252540]' : 'hover:bg-gray-50';

  // Get all tasks from all projects and boards (in production, filter by assignee)
  const allTasks = useMemo(() => {
    const tasks: TaskWithProject[] = [];
    
    projects.forEach(project => {
      project.boards.forEach(board => {
        board.tasks.forEach(task => {
          // In production, filter by assignee === CURRENT_USER_ID
          // For now, show all tasks
          tasks.push({
            ...task,
            projectName: project.name,
            projectColor: project.color || '#00C6FF',
            projectIcon: project.icon || '📁',
            boardName: board.name,
            boardId: board.id,
            projectId: project.id,
          });
        });
      });
    });
    
    return tasks;
  }, [projects]);

  const categorizedTasks = useMemo(() => categorizeTasks(allTasks), [allTasks]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const priorityColors = {
    'high': 'text-orange-500',
    'medium': 'text-yellow-500',
    'low': 'text-gray-500',
  };

  const TaskCard = ({ task }: { task: TaskWithProject }) => (
    <div className={`${bgCard} border ${borderColor} rounded-lg p-4 ${hoverBg} transition-all cursor-pointer group`}>
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs ${textSecondary}`}>{task.id}</span>
            <span className={`w-1 h-1 rounded-full ${theme === 'dark' ? 'bg-white/20' : 'bg-gray-300'}`}></span>
            <span className={`text-xs ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
              {task.priority}
            </span>
            {task.tags.includes('workflow') && (
              <div className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                Workflow
              </div>
            )}
          </div>
          <h3 className={`${textPrimary} mb-1 group-hover:text-blue-500 transition-colors`}>
            {task.title}
          </h3>
          <p className={`text-sm ${textSecondary} line-clamp-2`}>{task.description}</p>
        </div>
      </div>

      {/* Labels */}
      {task.tags.length > 0 && (
        <div className="flex gap-1 mb-3 flex-wrap">
          {task.tags.map(tag => (
            <span
              key={tag}
              className={`bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded text-xs`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Project & Board Info */}
      <div className="flex items-center gap-3 pt-3 border-t ${borderColor}">
        <div className="flex items-center gap-2 flex-1">
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0"
            style={{ backgroundColor: task.projectColor }}
          >
            {task.projectIcon}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-xs ${textPrimary} truncate`}>{task.projectName}</div>
            <div className={`text-xs ${textSecondary} truncate flex items-center gap-1`}>
              <Folder className="w-3 h-3" />
              {task.boardName}
            </div>
          </div>
        </div>
        {task.dueDate && (
          <div className={`text-xs ${textSecondary} flex items-center gap-1 flex-shrink-0`}>
            <Calendar className="w-3 h-3" />
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t ${borderColor}">
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded text-xs ${
            task.status === 'done'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : task.status === 'in-progress'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}>
            {task.status}
          </div>
        </div>
      </div>
    </div>
  );

  const TaskSection = ({
    title,
    count,
    tasks,
    sectionKey,
    color,
  }: {
    title: string;
    count: number;
    tasks: TaskWithProject[];
    sectionKey: string;
    color: string;
  }) => {
    const isExpanded = expandedSections.has(sectionKey);

    return (
      <div className={`${bgCard} rounded-xl border ${borderColor} overflow-hidden`}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`w-full px-6 py-4 flex items-center justify-between ${hoverBg} transition-colors`}
        >
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className={`w-5 h-5 ${textSecondary}`} />
            ) : (
              <ChevronRight className={`w-5 h-5 ${textSecondary}`} />
            )}
            <div
              className={`w-1 h-8 rounded-full`}
              style={{ backgroundColor: color }}
            ></div>
            <div>
              <h2 className={`text-lg ${textPrimary} text-left`}>{title}</h2>
              <p className={`text-xs ${textSecondary} text-left`}>
                {count} {count === 1 ? 'task' : 'tasks'}
              </p>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm`}
            style={{ backgroundColor: `${color}20`, color }}
          >
            {count}
          </div>
        </button>

        {isExpanded && (
          <div className={`px-6 pb-6 border-t ${borderColor}`}>
            {tasks.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 mt-4">
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 ${textSecondary}`}>
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tasks in this category</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#0E0E1F] overflow-hidden">
      {/* Header */}
      <div className={`flex-shrink-0 ${bgCard} border-b ${borderColor} px-8 py-6`}>
        <div>
          <h1 className={`text-3xl ${textPrimary} mb-1`}>My Tasks</h1>
          <p className={`text-sm ${textSecondary}`}>
            {allTasks.length} {allTasks.length === 1 ? 'task' : 'tasks'} assigned to you
          </p>
        </div>
        <button
          onClick={() => setShowCreateTask(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="space-y-4">
          {/* Yesterday (Overdue) */}
          <TaskSection
            title="Yesterday (Overdue)"
            count={categorizedTasks.yesterday.length}
            tasks={categorizedTasks.yesterday}
            sectionKey="yesterday"
            color="#EF4444"
          />

          {/* Today */}
          <TaskSection
            title="Today"
            count={categorizedTasks.today.length}
            tasks={categorizedTasks.today}
            sectionKey="today"
            color="#3B82F6"
          />

          {/* Tomorrow */}
          <TaskSection
            title="Tomorrow"
            count={categorizedTasks.tomorrow.length}
            tasks={categorizedTasks.tomorrow}
            sectionKey="tomorrow"
            color="#10B981"
          />

          {/* This Week */}
          <TaskSection
            title="This Week"
            count={categorizedTasks.thisWeek.length}
            tasks={categorizedTasks.thisWeek}
            sectionKey="thisWeek"
            color="#8B5CF6"
          />

          {/* This Month */}
          <TaskSection
            title="This Month"
            count={categorizedTasks.thisMonth.length}
            tasks={categorizedTasks.thisMonth}
            sectionKey="thisMonth"
            color="#F59E0B"
          />
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        show={showCreateTask}
        onClose={() => setShowCreateTask(false)}
      />
    </div>
  );
}
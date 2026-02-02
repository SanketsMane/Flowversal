import { useMemo } from 'react';
import { Task } from '@/core/stores/projectStore';
import { FilterOptions } from '@/shared/components/ui/AdvancedFilters';
import { SortOption } from '@/shared/components/ui/AdvancedSort';

const LOGGED_IN_USER_ID = '4';

interface UseProjectFilteringParams {
  tasks: Task[];
  mainView: 'home' | 'board' | 'my-tasks';
  selectedProjectId: string;
  selectedBoardId: string;
  advancedFilters: FilterOptions;
  searchQuery: string;
  activeTab: 'active' | 'backlogs' | 'archive';
  selectedStatus: string[];
  selectedPriority: string[];
  showMyTasks: boolean;
  sortBy: SortOption;
  getBoardsTasks: (boardId: string) => Task[];
}

interface ProjectsFilteringResult {
  filteredTasks: Task[];
  archiveTasksByMonth: Record<string, Task[]>;
  myTasksSegments: Record<string, Task[]>;
}

export function useProjectFiltering({
  tasks,
  mainView,
  selectedProjectId,
  selectedBoardId,
  advancedFilters,
  searchQuery,
  activeTab,
  selectedStatus,
  selectedPriority,
  showMyTasks,
  sortBy,
  getBoardsTasks,
}: UseProjectFilteringParams): ProjectsFilteringResult {
  const filteredTasks = useMemo(() => {
    let cloned: Task[] = [];

    if (mainView === 'my-tasks') {
      cloned = tasks.filter(
        (task) =>
          task.assignedTo.some((user) => user.id === LOGGED_IN_USER_ID) ||
          task.createdBy.id === LOGGED_IN_USER_ID
      );
    } else if (mainView === 'board' && selectedBoardId) {
      cloned = getBoardsTasks(selectedBoardId);
    } else {
      cloned = tasks.filter((task) => task.projectId === selectedProjectId);
    }

    if (mainView === 'board') {
      if (activeTab === 'active') {
        cloned = cloned.filter((task) => task.status !== 'Done' && task.status !== 'Backlog');
      } else if (activeTab === 'backlogs') {
        cloned = cloned.filter((task) => task.status === 'Backlog');
      } else if (activeTab === 'archive') {
        cloned = cloned.filter((task) => task.status === 'Done' || task.status === 'Cancelled');
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      cloned = cloned.filter(
        (task) =>
          task.name.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.taskId.toLowerCase().includes(query)
      );
    }

    if (advancedFilters.members.length > 0) {
      cloned = cloned.filter((task) =>
        task.assignedTo.some((user) => advancedFilters.members.includes(user.id))
      );
    }
    if (advancedFilters.statuses.length > 0) {
      cloned = cloned.filter((task) => advancedFilters.statuses.includes(task.status));
    }
    if (advancedFilters.priorities.length > 0) {
      cloned = cloned.filter((task) => advancedFilters.priorities.includes(task.priority));
    }
    if (advancedFilters.labels.length > 0) {
      cloned = cloned.filter((task) =>
        task.labels && task.labels.some((label) => advancedFilters.labels.includes(label))
      );
    }
    if (advancedFilters.dueDateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

      cloned = cloned.filter((task) => {
        if (advancedFilters.dueDateRange === 'no-date') {
          return !task.dueDate;
        }
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        switch (advancedFilters.dueDateRange) {
          case 'overdue':
            return dueDate < today;
          case 'today':
            return dueDate.toDateString() === today.toDateString();
          case 'week':
            return dueDate >= today && dueDate <= weekFromNow;
          case 'month':
            return dueDate >= today && dueDate <= monthFromNow;
          default:
            return true;
        }
      });
    }

    if (selectedStatus.length > 0) {
      cloned = cloned.filter((task) => selectedStatus.includes(task.status));
    }
    if (selectedPriority.length > 0) {
      cloned = cloned.filter((task) => selectedPriority.includes(task.priority));
    }
    if (showMyTasks) {
      cloned = cloned.filter(
        (task) =>
          task.assignedTo.some((user) => user.id === LOGGED_IN_USER_ID) ||
          task.createdBy.id === LOGGED_IN_USER_ID
      );
    }

    cloned.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority': {
          const priorityOrder: Record<string, number> = {
            Critical: 0,
            High: 1,
            Medium: 2,
            Low: 3,
          };
          return (
            (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4)
          );
        }
        case 'name':
          return a.name.localeCompare(b.name);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'assignee': {
          const aAssignee = a.assignedTo[0]?.name || '';
          const bAssignee = b.assignedTo[0]?.name || '';
          return aAssignee.localeCompare(bAssignee);
        }
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    return cloned;
  }, [
    tasks,
    mainView,
    selectedProjectId,
    selectedBoardId,
    advancedFilters,
    searchQuery,
    activeTab,
    selectedStatus,
    selectedPriority,
    showMyTasks,
    sortBy,
    getBoardsTasks,
  ]);

  const archiveTasksByMonth = useMemo(() => {
    const grouping: Record<string, Task[]> = {};
    filteredTasks.forEach((task) => {
      if (task.status !== 'Done' && task.status !== 'Cancelled') return;
      const month = new Date(task.updatedAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
      if (!grouping[month]) grouping[month] = [];
      grouping[month].push(task);
    });
    return grouping;
  }, [filteredTasks]);

  const myTasksSegments = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const monthEnd = new Date(now);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const segments: Record<string, Task[]> = {
      overdue: [],
      today: [],
      tomorrow: [],
      thisWeek: [],
      thisMonth: [],
      future: [],
    };

    filteredTasks.forEach((task) => {
      if (task.status === 'Done') return;
      if (!task.dueDate) {
        segments.future.push(task);
        return;
      }
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      if (dueDate < now) {
        segments.overdue.push(task);
      } else if (dueDate.getTime() === now.getTime()) {
        segments.today.push(task);
      } else if (dueDate.getTime() === tomorrow.getTime()) {
        segments.tomorrow.push(task);
      } else if (dueDate <= weekEnd) {
        segments.thisWeek.push(task);
      } else if (dueDate <= monthEnd) {
        segments.thisMonth.push(task);
      } else {
        segments.future.push(task);
      }
    });

    return segments;
  }, [filteredTasks]);

  return {
    filteredTasks,
    archiveTasksByMonth,
    myTasksSegments,
  };
}


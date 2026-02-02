import { useEffect, useState, useCallback } from 'react';
import type { Member, Label, Workflow } from '../types/taskDetail.types';

interface UseTaskMetadataParams {
  task: {
    status?: string;
    priority?: string;
    projectId?: string;
    boardId?: string;
    recurring?: string;
    reminder?: string;
    startDate?: Date | string;
    selectedDays?: string[];
  };
  normalized: {
    labels: Label[];
    members: Member[];
    workflows: Workflow[];
    priority: string;
    recurring: string;
    reminder: string;
    startDate?: Date;
    selectedDays: string[];
  };
}

export function useTaskMetadata({ task, normalized }: UseTaskMetadataParams) {
  const [selectedStatus, setSelectedStatus] = useState(task.status || 'Todo');
  const [selectedPriority, setSelectedPriority] = useState(normalized.priority);
  const [labels, setLabels] = useState<Label[]>(normalized.labels);
  const [members, setMembers] = useState<Member[]>(normalized.members);
  const [attachedWorkflows, setAttachedWorkflows] = useState<Workflow[]>(normalized.workflows);
  const [dueDate, setDueDate] = useState<Date | undefined>(task.dueDate instanceof Date ? task.dueDate : normalized.startDate);
  const [recurring, setRecurring] = useState(task.recurring || normalized.recurring);
  const [reminder, setReminder] = useState(task.reminder || normalized.reminder);
  const [startDate, setStartDate] = useState<Date | undefined>(normalized.startDate);
  const [selectedDays, setSelectedDays] = useState<string[]>(normalized.selectedDays || []);

  const statusOptions = [
    { name: 'Todo', color: 'bg-yellow-500' },
    { name: 'In Progress', color: 'bg-blue-500' },
    { name: 'Review', color: 'bg-purple-500' },
    { name: 'Blocked', color: 'bg-red-500' },
    { name: 'Done', color: 'bg-green-500' },
    { name: 'Cancelled', color: 'bg-[#0F172A] ring-2 ring-white/70 ring-offset-1 ring-offset-slate-100 dark:ring-offset-slate-900' },
    { name: 'Backlog', color: 'bg-gray-500' },
  ];

  const addMember = useCallback((member: Member) => {
    setMembers(prev => {
      if (!prev.find(m => m.id === member.id)) {
        return [...prev, member];
      }
      return prev;
    });
  }, []);

  const removeMember = useCallback((memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
  }, []);

  const addLabelToSet = useCallback((label: Label) => {
    setLabels(prev => {
      if (prev.find(l => l.id === label.id)) {
        return prev;
      }
      return [...prev, label];
    });
  }, []);

  const removeLabel = useCallback((labelId: string) => {
    setLabels(prev => prev.filter(l => l.id !== labelId));
  }, []);

  const addWorkflow = useCallback((workflow: Workflow) => {
    setAttachedWorkflows(prev => {
      if (prev.find(w => w.id === workflow.id)) {
        return prev;
      }
      return [...prev, workflow];
    });
  }, []);

  const removeWorkflow = useCallback((workflowId: string) => {
    setAttachedWorkflows(prev => prev.filter(w => w.id !== workflowId));
  }, []);

  return {
    selectedStatus,
    setSelectedStatus,
    selectedPriority,
    setSelectedPriority,
    statusOptions,
    priorityOptions: [
      { name: 'Critical', color: 'text-red-500' },
      { name: 'High', color: 'text-orange-500' },
      { name: 'Medium', color: 'text-yellow-500' },
      { name: 'Low', color: 'text-gray-500' },
    ],
    labels,
    setLabels,
    addLabelToSet,
    removeLabel,
    members,
    setMembers,
    addMember,
    removeMember,
    attachedWorkflows,
    setAttachedWorkflows,
    addWorkflow,
    removeWorkflow,
    dueDate,
    setDueDate,
    recurring,
    setRecurring,
    reminder,
    setReminder,
    startDate,
    setStartDate,
    selectedDays,
    setSelectedDays,
  };
}


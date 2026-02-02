import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { DatePickerModal } from '@/shared/components/ui/DatePickerModal';
import { MoveTaskModal } from '@/shared/components/ui/MoveTaskModal';
import { RichTextEditor } from '@/shared/components/ui/RichTextEditor';
import { useProjectStore } from '@/core/stores/projectStore';
import { RenderIcon } from '@/shared/components/ui/IconLibrary';
import {
  X,
  Users,
  Tag,
  CheckSquare,
  Clock,
  Paperclip,
  Trash2,
  Plus,
  Calendar as CalendarIcon,
  ChevronDown,
  Edit,
  Zap,
  Search,
  Upload,
  CreditCard,
  MoreHorizontal,
  FolderOpen,
  LayoutGrid,
  Copy,
  FileText,
  ExternalLink,
  Edit2,
  ArrowRightLeft,
  Check,
  Repeat,
  Bell,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { ChecklistItemComponent, ChecklistNameEditor } from './TaskDetailModal/components/ChecklistComponents';
import { TaskActionsPanel } from './TaskDetailModal/components/TaskActionsPanel';
import { TaskActivityPanel } from './TaskDetailModal/components/TaskActivityPanel';
import { TaskAttachmentsPanel } from './TaskDetailModal/components/TaskAttachmentsPanel';
import { TaskLabelList } from './TaskDetailModal/components/TaskLabelList';
import { TaskMetadataBar } from './TaskDetailModal/components/TaskMetadataBar';
import { TaskSidebarActions } from './TaskDetailModal/components/TaskSidebarActions';
import { TaskWorkflowsPanel } from './TaskDetailModal/components/TaskWorkflowsPanel';
import { WorkflowSelectionModal } from './TaskDetailModal/components/WorkflowSelectionModal';
import { LabelsModal } from './TaskDetailModal/components/LabelsModal';
import { useTaskMetadata } from './TaskDetailModal/hooks/useTaskMetadata';
import { useTaskAttachments } from './TaskDetailModal/hooks/useTaskAttachments';
import { useTaskComments } from './TaskDetailModal/hooks/useTaskComments';
import type { Attachment, Checklist, ChecklistItem, Comment, Label, Member, TaskDetailModalProps, Workflow } from './TaskDetailModal/types/taskDetail.types';

// Utility function for safe date formatting
const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '';
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

const availableWorkflows: Workflow[] = [
  { id: '1', workflowId: 'WF-101', name: 'Image Creation', category: 'Creative', description: 'Generate AI images from text prompts' },
  { id: '2', workflowId: 'WF-102', name: 'Deep Search', category: 'Research', description: 'Advanced web search and analysis' },
  { id: '3', workflowId: 'WF-103', name: 'Content Writer', category: 'Writing', description: 'AI-powered content generation' },
  { id: '4', workflowId: 'WF-104', name: 'Code Generator', category: 'Development', description: 'Generate code snippets and functions' },
  { id: '5', workflowId: 'WF-105', name: 'Data Analysis', category: 'Analytics', description: 'Analyze and visualize data' },
  { id: '6', workflowId: 'WF-106', name: 'Email Generator', category: 'Communication', description: 'Create professional emails' },
  { id: '7', workflowId: 'WF-107', name: 'Social Media Post', category: 'Marketing', description: 'Generate social media content' },
  { id: '8', workflowId: 'WF-108', name: 'SEO Optimizer', category: 'Marketing', description: 'Optimize content for SEO' },
];

const availableMembers: Member[] = [
  { id: '1', name: 'John Doe', avatar: 'JD', email: 'john@flowversal.com' },
  { id: '2', name: 'Sarah Smith', avatar: 'SS', email: 'sarah@flowversal.com' },
  { id: '3', name: 'Mike Johnson', avatar: 'MJ', email: 'mike@flowversal.com' },
  { id: '4', name: 'Emily Brown', avatar: 'EB', email: 'emily@flowversal.com' },
  { id: '5', name: 'David Wilson', avatar: 'DW', email: 'david@flowversal.com' },
];

export function TaskDetailModal({ task, onClose, onUpdate, onDelete, onOpenWorkflow, preAttachedWorkflow }: TaskDetailModalProps) {
  const { theme } = useTheme();
  const { projects, boards, tasks } = useProjectStore();
  
  const taskIdDisplay = task.taskId || `TSK-${task.id.slice(0, 6).toUpperCase()}`;
  const [taskName, setTaskName] = useState(task.name || '');
  const [isEditingName, setIsEditingName] = useState(!task.name || task.name === '');
  const [description, setDescription] = useState(task.description || '');
  const [selectedProjectId, setSelectedProjectId] = useState(task.projectId || '');
  const [selectedBoardId, setSelectedBoardId] = useState(task.boardId || '');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const checklistRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // Get current project and board
  const currentProject = projects.find(p => p.id === selectedProjectId);
  const currentBoard = boards.find(b => b.id === selectedBoardId);
  const projectBoards = boards.filter(b => b.projectId === selectedProjectId);
  
  // UI State
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showMembersDropdown, setShowMembersDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showLabelsMenu, setShowLabelsMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showMirrorModal, setShowMirrorModal] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [workflowSearch, setWorkflowSearch] = useState('');
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [taskLink, setTaskLink] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoize normalized task data to avoid unnecessary recalculations
  const normalizedTaskData = useMemo(() => {
    try {
      // Normalize dueDate - convert string to Date if needed
      let normalizedDueDate: Date | undefined = undefined;
      if (task.dueDate) {
        if (task.dueDate instanceof Date) {
          normalizedDueDate = task.dueDate;
        } else if (typeof task.dueDate === 'string') {
          const date = new Date(task.dueDate);
          if (!isNaN(date.getTime())) {
            normalizedDueDate = date;
          }
        }
      }

      // Normalize startDate
      let normalizedStartDate: Date | undefined = undefined;
      if (task.startDate) {
        if (task.startDate instanceof Date) {
          normalizedStartDate = task.startDate;
        } else if (typeof task.startDate === 'string') {
          const date = new Date(task.startDate);
          if (!isNaN(date.getTime())) {
            normalizedStartDate = date;
          }
        }
      }

      // Normalize labels - handle both string arrays and object arrays
      const labelColorMap: Record<string, string> = {
        Red: 'bg-red-500',
        Orange: 'bg-orange-500',
        Yellow: 'bg-yellow-500',
        Green: 'bg-emerald-500',
        Blue: 'bg-blue-500',
        Indigo: 'bg-indigo-500',
        Purple: 'bg-purple-500',
        Pink: 'bg-pink-500',
        Teal: 'bg-teal-500'
      };

      let normalizedLabels: { id: string; name: string; color: string }[] = [];
      if (task.labels && Array.isArray(task.labels)) {
        normalizedLabels = task.labels.map((label: any, index: number) => {
          if (typeof label === 'string') {
            return {
              id: `label-${index}-${task.id}`,
              name: label,
              color: labelColorMap[label] || 'bg-blue-500'
            };
          } else if (label && typeof label === 'object') {
            return {
              id: label.id || `label-${index}-${task.id}`,
              name: label.name || label.id || 'Label',
              color: label.color || labelColorMap[label.name] || 'bg-blue-500'
            };
          }
          return null;
        }).filter((label: any) => label !== null) as { id: string; name: string; color: string }[];
      }

      // Normalize members from assignedTo
      let normalizedMembers: Member[] = [];
      if (task.members && Array.isArray(task.members)) {
        normalizedMembers = task.members;
      } else if (task.assignedTo && Array.isArray(task.assignedTo)) {
        normalizedMembers = task.assignedTo.map((assignee: any) => ({
          id: assignee.id || assignee.name,
          name: assignee.name || 'Unknown',
          avatar: assignee.avatar || (assignee.name ? assignee.name.charAt(0).toUpperCase() : 'U'),
          email: assignee.email || undefined
        }));
      }
      if (normalizedMembers.length === 0) {
        normalizedMembers = [{ id: 'automation', name: 'Automation', avatar: 'A', email: 'automation@system' }];
      }

      // Normalize attached workflows
      let normalizedWorkflows: Workflow[] = [];
      if (task.hasWorkflow && task.attachedWorkflows && Array.isArray(task.attachedWorkflows)) {
        normalizedWorkflows = task.attachedWorkflows;
      } else if (task.hasWorkflow && preAttachedWorkflow) {
        normalizedWorkflows = [{
          id: Date.now().toString(),
          workflowId: preAttachedWorkflow.workflowId || 'WF-100',
          name: preAttachedWorkflow.name || 'Default Workflow',
          category: preAttachedWorkflow.category || 'General',
          description: preAttachedWorkflow.description || 'Default workflow for this task'
        }];
      }

      return {
        dueDate: normalizedDueDate,
        startDate: normalizedStartDate,
        labels: normalizedLabels,
        members: normalizedMembers,
        workflows: normalizedWorkflows,
        priority: task.priority || 'Medium',
        checklists: task.checklists || [],
        comments: task.comments || [],
        attachments: task.attachments || [],
        recurring: task.recurring || 'Never',
        reminder: task.reminder || 'None',
        selectedDays: (task as any).selectedDays || []
      };
    } catch (error) {
      console.error('[TaskDetailModal] Error normalizing task data:', error);
      // Return safe defaults to prevent white screen
      return {
        dueDate: undefined,
        startDate: undefined,
        labels: [],
        members: [{ id: 'automation', name: 'Automation', avatar: 'A', email: 'automation@system' }],
        workflows: [],
        priority: 'Medium',
        checklists: [],
        comments: [],
        attachments: [],
        recurring: 'Never',
        reminder: 'None',
        selectedDays: []
      };
    }
  }, [task, preAttachedWorkflow]);

  // Initialize state from task prop when task changes
  const metadata = useTaskMetadata({ task, normalized: normalizedTaskData });
  const {
    selectedStatus,
    setSelectedStatus,
    selectedPriority,
    setSelectedPriority,
    statusOptions,
    priorityOptions,
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
    setSelectedDays
  } = metadata;

  const attachmentsState = useTaskAttachments(normalizedTaskData.attachments);
  const {
    attachments,
    setAttachments,
    editingAttachment,
    editAttachmentName,
    editAttachmentUrl,
    setEditAttachmentName,
    setEditAttachmentUrl,
    setEditingAttachment,
    startEditAttachment,
    saveEditAttachment,
    removeAttachment
  } = attachmentsState;

  const commentsState = useTaskComments(normalizedTaskData.comments);
  const {
    comments,
    newComment,
    setNewComment,
    addComment,
    deleteComment,
    updateComment,
    setComments
  } = commentsState;

  const isNewTask = task.id.startsWith('new-');

  useEffect(() => {
    // Initialize task name
    setTaskName(task.name || '');
    setIsEditingName(!task.name || task.name === '');
    
    // Initialize description
    setDescription(task.description || '');
    
    // Initialize status
    setSelectedStatus(task.status || 'Todo'); // Use normalized status
    
    // Initialize priority from normalized data
    setSelectedPriority(normalizedTaskData.priority);
    
    // Initialize project and board IDs
    setSelectedProjectId(task.projectId || '');
    setSelectedBoardId(task.boardId || '');
    
    // Initialize dueDate from normalized data
    setDueDate(normalizedTaskData.dueDate);
    
    // Initialize labels from normalized data
    setLabels(normalizedTaskData.labels);
    
    // Initialize members from normalized data
    setMembers(normalizedTaskData.members);
    
    // Initialize attached workflows from normalized data
    setAttachedWorkflows(normalizedTaskData.workflows);

    // Initialize checklists, comments, and attachments
    setChecklists(normalizedTaskData.checklists);
    setComments(normalizedTaskData.comments);
    setAttachments(normalizedTaskData.attachments);

    // Initialize recurring, reminder, startDate, and selectedDays
    setRecurring(task.recurring || 'Never');
    setReminder(task.reminder || 'None');
    setStartDate(normalizedTaskData.startDate);
    setSelectedDays(normalizedTaskData.selectedDays || []);
  }, [task, normalizedTaskData]);

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgPanel = theme === 'dark' ? 'bg-[#252540]' : 'bg-gray-100';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  const labelColors = [
    { name: 'Red', color: 'bg-red-500' },
    { name: 'Orange', color: 'bg-orange-500' },
    { name: 'Yellow', color: 'bg-yellow-500' },
    { name: 'Green', color: 'bg-green-500' },
    { name: 'Blue', color: 'bg-blue-500' },
    { name: 'Purple', color: 'bg-purple-500' },
    { name: 'Pink', color: 'bg-pink-500' },
  ];

  const addLabel = useCallback((name: string, color: string) => {
    const newLabel = {
      id: Date.now().toString(),
      name,
      color
    };
    addLabelToSet(newLabel);
    setShowLabelsMenu(false);
  }, []);


  const addChecklist = () => {
    const newChecklist: Checklist = {
      id: Date.now().toString(),
      name: 'Checklist',
      items: [],
      isEditingName: true  // Start in edit mode so user can rename immediately
    };
    setChecklists([...checklists, newChecklist]);
    setShowAddMenu(false);
    
    // Scroll to the new checklist after a short delay
    setTimeout(() => {
      const checklistElement = checklistRefs.current[newChecklist.id];
      if (checklistElement) {
        checklistElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const updateChecklistName = (checklistId: string, name: string) => {
    setChecklists(checklists.map(cl =>
      cl.id === checklistId ? { ...cl, name, isEditingName: false } : cl
    ));
  };

  const setChecklistNameEditing = (checklistId: string, isEditing: boolean) => {
    setChecklists(checklists.map(cl =>
      cl.id === checklistId ? { ...cl, isEditingName: isEditing } : cl
    ));
  };

  const addChecklistItem = (checklistId: string, text: string) => {
    setChecklists(checklists.map(cl => {
      if (cl.id === checklistId) {
        return {
          ...cl,
          items: [...cl.items, { id: Date.now().toString(), text, completed: false }]
        };
      }
      return cl;
    }));
  };

  const updateChecklistItem = (checklistId: string, itemId: string, text: string) => {
    setChecklists(checklists.map(cl => {
      if (cl.id === checklistId) {
        return {
          ...cl,
          items: cl.items.map(item => 
            item.id === itemId ? { ...item, text } : item
          )
        };
      }
      return cl;
    }));
  };

  const toggleChecklistItem = (checklistId: string, itemId: string) => {
    setChecklists(checklists.map(cl => {
      if (cl.id === checklistId) {
        return {
          ...cl,
          items: cl.items.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
          )
        };
      }
      return cl;
    }));
  };

  const deleteChecklistItem = (checklistId: string, itemId: string) => {
    setChecklists(checklists.map(cl => {
      if (cl.id === checklistId) {
        return {
          ...cl,
          items: cl.items.filter(item => item.id !== itemId)
        };
      }
      return cl;
    }));
  };

  const deleteChecklist = (checklistId: string) => {
    setChecklists(checklists.filter(cl => cl.id !== checklistId));
  };

  const getChecklistProgress = (checklist: Checklist) => {
    const completed = checklist.items.filter(item => item.completed).length;
    const total = checklist.items.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(task.id);
    onClose();
  };

  const handleSave = useCallback(() => {
    try {
    // Validate task name is not empty
    if (!taskName || taskName.trim() === '') {
      // Focus on the task name input
      setIsEditingName(true);
      return;
    }
    
      // Prepare update payload with proper data normalization
      const updatePayload = {
      name: taskName.trim(),
        description: description || '',
      status: selectedStatus,
      priority: selectedPriority,
        dueDate: dueDate && dueDate instanceof Date && !isNaN(dueDate.getTime()) ? dueDate.toISOString() : undefined,
        assignedTo: members, // Use correct field name
        labels: labels.map(label => ({
          id: label.id,
          name: label.name,
          color: label.color
        })),
      checklists,
      comments,
      workflows: attachedWorkflows,
      attachments,
      recurring,
      reminder,
        selectedDays: recurring === 'Weekly' ? selectedDays : [],
        startDate: startDate && startDate instanceof Date && !isNaN(startDate.getTime()) ? startDate.toISOString() : undefined,
      hasWorkflow: attachedWorkflows.length > 0,
      projectId: selectedProjectId,
      boardId: selectedBoardId
      };

      onUpdate(task.id, updatePayload);
    onClose();
    } catch (error) {
      console.error('[TaskDetailModal] Error saving task:', error);
      // You could add a toast notification here
    }
  }, [taskName, description, selectedStatus, selectedPriority, dueDate, members, labels, checklists, comments, attachedWorkflows, attachments, recurring, reminder, selectedDays, startDate, selectedProjectId, selectedBoardId, task.id, onUpdate, onClose]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const projectName = currentProject?.name || 'project';
      const boardName = currentBoard?.name || 'board';
      const url = `${window.location.origin}/${encodeURIComponent(projectName)}/${encodeURIComponent(boardName)}/${encodeURIComponent(taskIdDisplay)}`;
      setTaskLink(url);
    }
  }, [taskIdDisplay, currentProject?.name, currentBoard?.name]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files as FileList).forEach((file: File) => {
        const attachment: Attachment = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: 'file',
          url: URL.createObjectURL(file),
          size: `${(file.size / 1024).toFixed(1)} KB`
        };
        setAttachments(prev => [...prev, attachment]);
      });
      setShowAttachmentMenu(false);
    }
  };

  const addAttachmentLink = () => {
    if (linkUrl.trim()) {
      const attachment: Attachment = {
        id: Date.now().toString(),
        name: linkName.trim() || linkUrl,
        type: 'link',
        url: linkUrl
      };
      setAttachments([...attachments, attachment]);
      setLinkName('');
      setLinkUrl('');
      setShowAttachmentMenu(false);
    }
  };

  const copyToClipboard = (text: string) => {
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          showCopiedFeedback(text);
        })
        .catch(() => {
          // Fallback to old method
          fallbackCopyToClipboard(text);
        });
    } else {
      // Use fallback for older browsers or when clipboard API is blocked
      fallbackCopyToClipboard(text);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showCopiedFeedback(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
    document.body.removeChild(textArea);
  };

  const showCopiedFeedback = (text: string) => {
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleDuplicateTask = () => {
    setShowCopyModal(true);
    setShowMoreMenu(false);
  };

  const handleCopyTask = () => {
    setShowCopyModal(true);
    setShowMoreMenu(false);
  };

  const handleMirrorTask = () => {
    setShowMirrorModal(true);
    setShowMoreMenu(false);
  };

  const handleMoveTask = (projectId: string, boardId: string, status: string) => {
    onUpdate(task.id, {
      name: taskName,
      description,
      status: status,
      priority: selectedPriority,
      dueDate,
      members,
      labels,
      checklists,
      comments,
      workflows: attachedWorkflows,
      attachments,
      recurring,
      reminder,
      hasWorkflow: attachedWorkflows.length > 0,
      projectId,
      boardId
    });
    setShowMoveModal(false);
  };

  const handleCopyAction = (projectId: string, boardId: string, status: string) => {
    // First save the current task
    handleSave();
    
    // Create a copy of the task with the new status
    const copiedTask = {
      name: `${taskName} (Copy)`,
      status: status,
      description,
      priority: selectedPriority,
      dueDate,
      members,
      labels,
      checklists,
      comments: [],
      workflows: attachedWorkflows,
      attachments,
      recurring,
      reminder,
      hasWorkflow: attachedWorkflows.length > 0,
      taskId: `TSK-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      boardName: task.boardName || 'Sprint Planning',
      projectId,
      boardId
    };
    
    // Create new task
    onUpdate(`copy-${Date.now()}`, copiedTask);
    setShowCopyModal(false);
  };

  const handleDuplicateAction = (projectId: string, boardId: string, status: string) => {
    // First save the current task
    handleSave();
    
    // Duplicate the task with the new status (mirror - exact copy)
    const duplicatedTask = {
      name: taskName,
      status: status,
      description,
      priority: selectedPriority,
      dueDate,
      members,
      labels,
      checklists,
      comments,
      workflows: attachedWorkflows,
      attachments,
      recurring,
      reminder,
      hasWorkflow: attachedWorkflows.length > 0,
      taskId: `TSK-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      boardName: task.boardName || 'Sprint Planning',
      projectId,
      boardId
    };
    
    // Create new task
    onUpdate(`duplicate-${Date.now()}`, duplicatedTask);
    setShowMirrorModal(false);
  };

  const filteredWorkflows = availableWorkflows.filter(w =>
    w.name.toLowerCase().includes(workflowSearch.toLowerCase()) ||
    w.category.toLowerCase().includes(workflowSearch.toLowerCase()) ||
    w.description.toLowerCase().includes(workflowSearch.toLowerCase()) ||
    w.workflowId.toLowerCase().includes(workflowSearch.toLowerCase())
  );

  const filteredMembers = availableMembers.filter(m =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    (m.email && m.email.toLowerCase().includes(memberSearch.toLowerCase()))
  );

  // Close all dropdowns when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    // Close all dropdowns when clicking anywhere in the content area
    // unless the click is on a dropdown itself
    const target = e.target as HTMLElement;
    const isDropdownClick = target.closest('[data-dropdown]') || target.closest('button');
    
    if (!isDropdownClick) {
      setShowMoreMenu(false);
      setShowStatusMenu(false);
      setShowAddMenu(false);
      setShowLocationDropdown(false);
    }
  };

  try {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 flex ${isFullscreen ? 'items-stretch justify-center p-0 sm:p-0' : 'items-center justify-center p-2 sm:p-4'} z-50`}
        onClick={handleBackdropClick}
      >
        <div 
          className={`${bgCard} ${isFullscreen ? 'w-full h-full max-w-none max-h-none rounded-none' : 'rounded-xl w-full max-w-5xl max-h-[95vh]'} overflow-hidden flex flex-col border ${borderColor}`}
          onClick={handleContentClick}
        >
          {/* Header */}
          <div className={`p-3 sm:p-6 border-b ${borderColor} flex items-start justify-between`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <CheckSquare className={`w-5 h-5 sm:w-6 sm:h-6 ${textSecondary} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  {isEditingName ? (
                    <div className="flex-1">
                      <input
                        type="text"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        onBlur={() => {
                          if (taskName && taskName.trim()) {
                            setIsEditingName(false);
                          }
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            if (taskName && taskName.trim()) {
                              setIsEditingName(false);
                            }
                          }
                        }}
                        className={`text-xl sm:text-2xl ${textPrimary} bg-transparent border-b ${!taskName || !taskName.trim() ? 'border-red-500' : 'border-blue-500'} outline-none w-full`}
                        placeholder="Enter task name (required)"
                        autoFocus
                      />
                      {!taskName || !taskName.trim() ? (
                        <p className="text-red-500 text-xs mt-1">Task name is required</p>
                      ) : null}
                    </div>
                  ) : (
                    <h1
                      onClick={() => setIsEditingName(true)}
                      className={`text-xl sm:text-2xl ${textPrimary} cursor-text truncate`}
                    >
                      {taskName}
                    </h1>
                  )}
                  <div className={`${textSecondary} text-xs mt-1 flex flex-wrap items-center gap-2`}>
                    <button
                      onClick={() => copyToClipboard(taskIdDisplay)}
                      className={`flex items-center gap-1 ${hoverBg} px-2 py-0.5 rounded transition-colors`}
                      title="Copy Task ID"
                    >
                      <span>{taskIdDisplay}</span>
                      {copiedText === taskIdDisplay ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <span className={textSecondary}>•</span>
                    {taskLink && (
                      <>
                        <button
                          onClick={() => copyToClipboard(taskLink)}
                          className={`flex items-center gap-1 ${hoverBg} px-2 py-0.5 rounded transition-colors`}
                          title="Copy task link"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Copy link</span>
                          {copiedText === taskLink && <Check className="w-3 h-3 text-green-500" />}
                        </button>
                        <a
                          href={taskLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-1 ${hoverBg} px-2 py-0.5 rounded transition-colors ${textPrimary}`}
                          title="Open task link"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open</span>
                        </a>
                        <span className={textSecondary}>•</span>
                      </>
                    )}
                    
                    {/* Project > Board > Status Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                        className={`flex items-center gap-1 ${hoverBg} px-2 py-0.5 rounded transition-colors`}
                        title="Change location"
                      >
                        <span>{currentProject?.name || 'Select Project'}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span>{currentBoard?.name || 'Select Board'}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span>{selectedStatus}</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      
                      {showLocationDropdown && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowLocationDropdown(false)} />
                          <div className={`absolute top-full left-0 mt-2 ${bgCard} border ${borderColor} rounded-lg shadow-xl z-50 w-80 p-3 space-y-3`}>
                            {/* Project Selection */}
                            <div>
                              <label className={`block text-xs ${textSecondary} mb-1.5`}>Project</label>
                              <div className="space-y-1">
                                {projects.map((project) => (
                                  <button
                                    key={project.id}
                                    onClick={() => {
                                      setSelectedProjectId(project.id);
                                      setSelectedBoardId(''); // Reset board when project changes
                                    }}
                                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded ${
                                      selectedProjectId === project.id ? 'bg-blue-500/10' : hoverBg
                                    } text-left text-xs`}
                                  >
                                    <div 
                                      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                                      style={{ backgroundColor: project.iconColor + '20' }}
                                    >
                                      <RenderIcon 
                                        name={project.icon} 
                                        className="w-3 h-3"
                                        style={{ color: project.iconColor }}
                                      />
                                    </div>
                                    <span className={textPrimary}>{project.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            {/* Board Selection */}
                            {selectedProjectId && projectBoards.length > 0 && (
                              <div>
                                <label className={`block text-xs ${textSecondary} mb-1.5`}>Board</label>
                                <div className="space-y-1">
                                  {projectBoards.map((board) => (
                                    <button
                                      key={board.id}
                                      onClick={() => {
                                        setSelectedBoardId(board.id);
                                        // Keep current status as boards don't have predefined columns
                                      }}
                                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded ${
                                        selectedBoardId === board.id ? 'bg-blue-500/10' : hoverBg
                                      } text-left text-xs`}
                                    >
                                      <div 
                                        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: board.iconColor + '20' }}
                                      >
                                        <RenderIcon 
                                          name={board.icon} 
                                          className="w-3 h-3"
                                          style={{ color: board.iconColor }}
                                        />
                                      </div>
                                      <span className={textPrimary}>{board.name}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Status Selection */}
                            {selectedBoardId && statusOptions.length > 0 && (
                              <div>
                                <label className={`block text-xs ${textSecondary} mb-1.5`}>Status</label>
                                <div className="space-y-1">
                                  {statusOptions.map((status) => (
                                    <button
                                      key={status.name}
                                      onClick={() => {
                                        setSelectedStatus(status.name);
                                        setShowLocationDropdown(false);
                                      }}
                                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded ${
                                        selectedStatus === status.name ? 'bg-blue-500/10' : hoverBg
                                      } text-left text-xs`}
                                    >
                                      <div className={`w-3 h-3 rounded ${status.color}`}></div>
                                      <span className={textPrimary}>{status.name}</span>
                                      {selectedStatus === status.name && (
                                        <Check className="w-3 h-3 ml-auto text-blue-500" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`p-2 rounded-lg ${hoverBg}`}
                title={isFullscreen ? 'Exit full screen' : 'Full screen'}
              >
                {isFullscreen ? (
                  <Minimize2 className={`w-4 h-4 sm:w-5 sm:h-5 ${textSecondary}`} />
                ) : (
                  <Maximize2 className={`w-4 h-4 sm:w-5 sm:h-5 ${textSecondary}`} />
                )}
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className={`p-2 rounded-lg ${hoverBg}`}
                >
                  <MoreHorizontal className={`w-4 h-4 sm:w-5 sm:h-5 ${textSecondary}`} />
                </button>
                
                {showMoreMenu && (
                  <div 
                    data-dropdown="true"
                    className={`absolute top-full right-0 mt-2 w-48 ${bgPanel} rounded-lg border ${borderColor} shadow-xl z-20`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setShowMoveModal(true);
                        setShowMoreMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 ${hoverBg} transition-colors text-left`}
                    >
                      <ArrowRightLeft className={`w-4 h-4 ${textPrimary}`} />
                      <span className={`${textPrimary} text-sm`}>Move</span>
                    </button>
                    <button
                      onClick={handleCopyTask}
                      className={`w-full flex items-center gap-3 px-4 py-2 ${hoverBg} transition-colors text-left`}
                    >
                      <Copy className={`w-4 h-4 ${textPrimary}`} />
                      <span className={`${textPrimary} text-sm`}>Copy</span>
                    </button>
                    <button
                      onClick={handleMirrorTask}
                      className={`w-full flex items-center gap-3 px-4 py-2 ${hoverBg} transition-colors text-left`}
                    >
                      <FileText className={`w-4 h-4 ${textPrimary}`} />
                      <span className={`${textPrimary} text-sm`}>Mirror</span>
                    </button>
                    <div className={`border-t ${borderColor} my-1`}></div>
                    <button
                      onClick={handleDelete}
                      className={`w-full flex items-center gap-3 px-4 py-2 ${hoverBg} transition-colors text-left text-red-500`}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                )}
              </div>
              <button onClick={onClose} className={`p-2 rounded-lg ${hoverBg}`}>
                <X className={`w-4 h-4 sm:w-5 sm:h-5 ${textSecondary}`} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 p-3 sm:p-6">
              {/* Main Content */}
              <div className="flex-1 space-y-4 sm:space-y-6 min-w-0">
                {/* Action Buttons - Mobile */}
                <div className="lg:hidden">
                  <div className="relative">
                    <button
                      onClick={() => setShowAddMenu(!showAddMenu)}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${bgPanel} ${hoverBg} ${textPrimary}`}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm">Add</span>
                    </button>

                    {showAddMenu && (
                      <div data-dropdown="true" className={`absolute top-full left-0 right-0 mt-2 ${bgPanel} rounded-lg border ${borderColor} shadow-xl z-20 max-h-80 overflow-y-auto`}>
                        <div className={`p-2 border-b ${borderColor} ${textSecondary} text-xs`}>
                          Add to card
                        </div>
                        
                        <button
                          onClick={() => {
                            setShowLabelsMenu(true);
                            setShowAddMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 ${hoverBg} transition-colors`}
                        >
                          <Tag className={`w-4 h-4 ${textPrimary}`} />
                          <span className={`${textPrimary} text-sm`}>Labels</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowDatePicker(true);
                            setShowAddMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 ${hoverBg} transition-colors`}
                        >
                          <Clock className={`w-4 h-4 ${textPrimary}`} />
                          <span className={`${textPrimary} text-sm`}>Dates</span>
                        </button>

                        <button
                          onClick={addChecklist}
                          className={`w-full flex items-center gap-3 px-4 py-3 ${hoverBg} transition-colors`}
                        >
                          <CheckSquare className={`w-4 h-4 ${textPrimary}`} />
                          <span className={`${textPrimary} text-sm`}>Checklist</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowMembersDropdown(true);
                            setShowAddMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 ${hoverBg} transition-colors`}
                        >
                          <Users className={`w-4 h-4 ${textPrimary}`} />
                          <span className={`${textPrimary} text-sm`}>Members</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowAttachmentMenu(true);
                            setShowAddMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 ${hoverBg} transition-colors`}
                        >
                          <Paperclip className={`w-4 h-4 ${textPrimary}`} />
                          <span className={`${textPrimary} text-sm`}>Attachment</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowWorkflowModal(true);
                            setShowAddMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 ${hoverBg} transition-colors`}
                        >
                          <Zap className={`w-4 h-4 ${textPrimary}`} />
                          <span className={`${textPrimary} text-sm`}>Workflow</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <TaskMetadataBar
                  members={members}
                  showMembersDropdown={showMembersDropdown}
                  toggleMembersDropdown={() => setShowMembersDropdown(!showMembersDropdown)}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  borderColor={borderColor}
                  bgPanel={bgPanel}
                  hoverBg={hoverBg}
                  statusOptions={statusOptions}
                  selectedStatus={selectedStatus}
                  showStatusMenu={showStatusMenu}
                  toggleStatusMenu={() => setShowStatusMenu(!showStatusMenu)}
                  onSelectStatus={(status) => {
                    setSelectedStatus(status);
                    setShowStatusMenu(false);
                  }}
                  priorityOptions={priorityOptions}
                  selectedPriority={selectedPriority}
                  showPriorityMenu={showPriorityMenu}
                  togglePriorityMenu={() => setShowPriorityMenu(!showPriorityMenu)}
                  onSelectPriority={(priority) => {
                    setSelectedPriority(priority);
                    setShowPriorityMenu(false);
                  }}
                  dueDate={dueDate}
                  toggleDatePicker={() => setShowDatePicker(true)}
                  recurring={recurring}
                  reminder={reminder}
                  labels={labels}
                  removeLabel={removeLabel}
                  openLabelsModal={() => setShowLabelsMenu(true)}
                  showAddLabelButton={!isNewTask}
                />

                <TaskWorkflowsPanel
                  workflows={attachedWorkflows}
                  copiedText={copiedText}
                  removeWorkflow={removeWorkflow}
                  onOpenWorkflow={onOpenWorkflow}
                  copyToClipboard={copyToClipboard}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  hoverBg={hoverBg}
                  bgPanel={bgPanel}
                  borderColor={borderColor}
                />

                <TaskAttachmentsPanel
                  attachments={attachments}
                  editingAttachment={editingAttachment}
                  editAttachmentName={editAttachmentName}
                  editAttachmentUrl={editAttachmentUrl}
                  setEditAttachmentName={setEditAttachmentName}
                  setEditAttachmentUrl={setEditAttachmentUrl}
                  setEditingAttachment={setEditingAttachment}
                  startEditAttachment={startEditAttachment}
                  saveEditAttachment={saveEditAttachment}
                  removeAttachment={removeAttachment}
                  showAttachmentMenu={showAttachmentMenu}
                  setShowAttachmentMenu={setShowAttachmentMenu}
                  fileInputRef={fileInputRef}
                  handleFileUpload={handleFileUpload}
                  addAttachmentLink={addAttachmentLink}
                  linkName={linkName}
                  setLinkName={setLinkName}
                  linkUrl={linkUrl}
                  setLinkUrl={setLinkUrl}
                  bgCard={bgCard}
                  bgPanel={bgPanel}
                  bgMain={bgMain}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  borderColor={borderColor}
                  hoverBg={hoverBg}
                />

                {/* Description */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Edit className={`w-4 h-4 sm:w-5 sm:h-5 ${textSecondary}`} />
                    <h3 className={`${textPrimary} text-sm sm:text-base`}>Description</h3>
                  </div>
                  <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    placeholder="Add a more detailed description..."
                  />
                </div>

                {/* Checklists */}
                {checklists.map(checklist => {
                  const progress = getChecklistProgress(checklist);
                  return (
                    <div
                      key={checklist.id}
                      ref={(el) => (checklistRefs.current[checklist.id] = el)}
                      className={`p-4 rounded-lg border ${borderColor}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          <CheckSquare className={`w-4 h-4 sm:w-5 sm:h-5 ${textSecondary}`} />
                          <ChecklistNameEditor
                            checklistId={checklist.id}
                            name={checklist.name}
                            isEditing={checklist.isEditingName || false}
                            onUpdate={updateChecklistName}
                            onToggleEdit={setChecklistNameEditing}
                            textPrimary={textPrimary}
                          />
                        </div>
                        <button
                          onClick={() => deleteChecklist(checklist.id)}
                          className={`p-1.5 rounded ${hoverBg}`}
                          title="Delete checklist"
                        >
                          <Trash2 className={`w-4 h-4 ${textSecondary}`} />
                        </button>
                      </div>

                      {checklist.items.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`flex-1 h-2 rounded-full ${bgPanel} overflow-hidden`}>
                              <div
                                className="h-full bg-blue-500 transition-all"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <span className={`${textSecondary} text-xs sm:text-sm`}>{progress}%</span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 mb-3">
                        {checklist.items.map((item, index) => (
                          <div key={item.id}>
                          <ChecklistItemComponent
                            item={item}
                            onToggle={() => toggleChecklistItem(checklist.id, item.id)}
                            onUpdate={(text) => updateChecklistItem(checklist.id, item.id, text)}
                            onDelete={() => deleteChecklistItem(checklist.id, item.id)}
                            textPrimary={textPrimary}
                            textSecondary={textSecondary}
                            hoverBg={hoverBg}
                          />
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => addChecklistItem(checklist.id, 'New item')}
                        className={`text-xs sm:text-sm ${textSecondary} ${hoverBg} px-3 py-2 rounded flex items-center gap-2`}
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        Add an item
                      </button>
                    </div>
                  );
                })}

                <TaskActivityPanel
                  comments={comments}
                  addComment={addComment}
                  deleteComment={deleteComment}
                  updateComment={updateComment}
                  newComment={newComment}
                  setNewComment={setNewComment}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  bgPanel={bgPanel}
                  bgMain={bgMain}
                  borderColor={borderColor}
                />
              </div>

              <TaskSidebarActions
                onMembers={() => setShowMembersDropdown(!showMembersDropdown)}
                onLabels={() => setShowLabelsMenu(!showLabelsMenu)}
                onDates={() => setShowDatePicker(true)}
                onChecklist={addChecklist}
                onAttachment={() => setShowAttachmentMenu(!showAttachmentMenu)}
                onWorkflow={() => setShowWorkflowModal(true)}
                bgPanel={bgPanel}
                hoverBg={hoverBg}
                textPrimary={textPrimary}
              />
            </div>
          </div>

          {/* Footer */}
          <div className={`p-3 sm:p-4 border-t ${borderColor} flex justify-end gap-2 sm:gap-3`}>
            <button
              onClick={onClose}
              className={`px-3 sm:px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} ${hoverBg} text-sm`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all text-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div 
            className={`${bgCard} rounded-xl w-full max-w-sm border ${borderColor} p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`${textPrimary} text-lg mb-4`}>Delete Task?</h3>
            <p className={`${textSecondary} text-sm mb-6`}>
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`flex-1 px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} ${hoverBg}`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members Dropdown */}
      {showMembersDropdown && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowMembersDropdown(false);
            }
          }}
        >
          <div 
            className={`${bgCard} rounded-xl w-full max-w-md border ${borderColor}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-4 border-b ${borderColor}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`${textPrimary}`}>Add Members</h3>
                <button onClick={() => setShowMembersDropdown(false)} className={`p-1 rounded ${hoverBg}`}>
                  <X className={`w-4 h-4 ${textSecondary}`} />
                </button>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${borderColor} ${bgMain}`}>
                <Search className={`w-4 h-4 ${textSecondary}`} />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className={`flex-1 bg-transparent outline-none ${textPrimary} text-sm`}
                />
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredMembers.map(member => {
                const isAdded = members.find(m => m.id === member.id);
                return (
                  <button
                    key={member.id}
                    onClick={() => addMember(member)}
                    disabled={!!isAdded}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${hoverBg} transition-colors ${isAdded ? 'opacity-50' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                      {member.avatar}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`${textPrimary} text-sm`}>{member.name}</p>
                      <p className={`${textSecondary} text-xs`}>{member.email}</p>
                    </div>
                    {isAdded && (
                      <CheckSquare className="w-4 h-4 text-green-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Labels Menu */}
      {showLabelsMenu && (
        <LabelsModal
          isOpen={showLabelsMenu}
          onClose={() => setShowLabelsMenu(false)}
          onAddLabel={addLabel}
          existingLabels={labels}
          theme={theme}
        />
      )}

      <WorkflowSelectionModal
        isOpen={showWorkflowModal}
        onClose={() => setShowWorkflowModal(false)}
        workflowSearch={workflowSearch}
        setWorkflowSearch={setWorkflowSearch}
        filteredWorkflows={filteredWorkflows}
        attachedWorkflows={attachedWorkflows}
        addWorkflow={addWorkflow}
        removeWorkflow={removeWorkflow}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        bgCard={bgCard}
        bgPanel={bgPanel}
        bgMain={bgMain}
        borderColor={borderColor}
        hoverBg={hoverBg}
      />

      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        currentDate={dueDate}
        currentStartDate={startDate}
        currentRecurring={recurring}
        currentReminder={reminder}
        currentSelectedDays={selectedDays}
        onSave={(date, recurringValue, reminderValue, startDateValue, selectedDaysValue) => {
          setDueDate(date);
          setRecurring(recurringValue);
          setReminder(reminderValue);
          setStartDate(startDateValue);
          setSelectedDays(selectedDaysValue || []);
        }}
        onRemove={() => {
          setDueDate(undefined);
          setRecurring('Never');
          setReminder('None');
          setStartDate(undefined);
          setSelectedDays([]);
        }}
      />

      <MoveTaskModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        currentStatus={selectedStatus}
        currentProjectId={task.projectId}
        currentBoardId={task.boardId}
        onMove={handleMoveTask}
        mode="move"
      />

      <MoveTaskModal
        isOpen={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        currentStatus={selectedStatus}
        currentProjectId={task.projectId}
        currentBoardId={task.boardId}
        onMove={handleCopyAction}
        mode="copy"
      />

      <MoveTaskModal
        isOpen={showMirrorModal}
        onClose={() => setShowMirrorModal(false)}
        currentStatus={selectedStatus}
        currentProjectId={task.projectId}
        currentBoardId={task.boardId}
        onMove={handleDuplicateAction}
        mode="duplicate"
      />

      {/* Toast Notification for Copied Text */}
      {copiedText && (
        <div className="fixed bottom-4 right-4 z-[100] animate-in slide-in-from-bottom-2 fade-in">
          <div className={`${bgCard} border ${borderColor} rounded-lg px-4 py-3 shadow-xl flex items-center gap-3`}>
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`${textPrimary} text-sm`}>Copied to clipboard</p>
              <p className={`${textSecondary} text-xs`}>{copiedText}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
  } catch (error) {
    console.error('[TaskDetailModal] Render error:', error);
    // Return a safe fallback UI to prevent white screen
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">!</span>
            </div>
            <h3 className="text-red-800 font-medium">Task Error</h3>
          </div>
          <p className="text-red-700 text-sm mb-4">
            There was an error loading this task. This might be due to corrupted data.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Reload Page
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-red-300 text-red-700 rounded hover:bg-red-50 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}

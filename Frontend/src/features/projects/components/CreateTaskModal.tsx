/**
 * Create Task Modal Component
 * Modal for creating new tasks with project and board selection
 */

import React, { useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useProjectStore } from '../store';
import { X, Calendar, Tag, AlertCircle } from 'lucide-react';

interface CreateTaskModalProps {
  show: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  defaultBoardId?: string;
}

export function CreateTaskModal({
  show,
  onClose,
  defaultProjectId,
  defaultBoardId,
}: CreateTaskModalProps) {
  const { theme } = useTheme();
  const { projects, addTask } = useProjectStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId || '');
  const [selectedBoardId, setSelectedBoardId] = useState(defaultBoardId || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');

  // Theme colors
  const bgModal = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  // Get boards for selected project
  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const availableBoards = selectedProject?.boards || [];

  // Auto-select first board when project changes
  React.useEffect(() => {
    if (selectedProjectId && availableBoards.length > 0 && !selectedBoardId) {
      setSelectedBoardId(availableBoards[0].id);
    }
  }, [selectedProjectId, availableBoards, selectedBoardId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !selectedProjectId || !selectedBoardId) {
      return;
    }

    try {
    const taskTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

      await addTask(selectedProjectId, selectedBoardId, {
      title: title.trim(),
      description: description.trim(),
      status: 'todo',
      priority,
      tags: taskTags,
      dueDate: dueDate || undefined,
    });

    // Reset form and close
    setTitle('');
    setDescription('');
    setSelectedProjectId(defaultProjectId || '');
    setSelectedBoardId(defaultBoardId || '');
    setPriority('medium');
    setDueDate('');
    setTags('');
    onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
      // You could show an error message to the user here
    }
  };

  const handleClose = () => {
    // Reset form
    setTitle('');
    setDescription('');
    setSelectedProjectId(defaultProjectId || '');
    setSelectedBoardId(defaultBoardId || '');
    setPriority('medium');
    setDueDate('');
    setTags('');
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${bgModal} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${borderColor}`}>
          <h2 className={`text-2xl ${textPrimary}`}>Create New Task</h2>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'} transition-colors`}
          >
            <X className={`w-5 h-5 ${textSecondary}`} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Task Title */}
          <div>
            <label className={`block text-sm ${textPrimary} mb-2`}>
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className={`w-full px-4 py-2.5 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} placeholder:${textSecondary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
          </div>

          {/* Project Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm ${textPrimary} mb-2`}>
                Project <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setSelectedBoardId(''); // Reset board selection
                }}
                className={`w-full px-4 py-2.5 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              >
                <option value="">Select project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.icon} {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Board Selection */}
            <div>
              <label className={`block text-sm ${textPrimary} mb-2`}>
                Board <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBoardId}
                onChange={(e) => setSelectedBoardId(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
                disabled={!selectedProjectId || availableBoards.length === 0}
              >
                <option value="">Select board...</option>
                {availableBoards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm ${textPrimary} mb-2`}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task..."
              rows={4}
              className={`w-full px-4 py-2.5 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} placeholder:${textSecondary} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
            />
          </div>

          {/* Priority and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm ${textPrimary} mb-2 flex items-center gap-2`}>
                <AlertCircle className="w-4 h-4" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className={`w-full px-4 py-2.5 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm ${textPrimary} mb-2 flex items-center gap-2`}>
                <Calendar className="w-4 h-4" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={`block text-sm ${textPrimary} mb-2 flex items-center gap-2`}>
              <Tag className="w-4 h-4" />
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags separated by commas..."
              className={`w-full px-4 py-2.5 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} placeholder:${textSecondary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <p className={`text-xs ${textSecondary} mt-1`}>
              Separate multiple tags with commas (e.g., design, frontend, urgent)
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t ${borderColor}">
            <button
              type="button"
              onClick={handleClose}
              className={`px-6 py-2.5 rounded-lg border ${borderColor} ${textPrimary} hover:bg-white/5 transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !selectedProjectId || !selectedBoardId}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

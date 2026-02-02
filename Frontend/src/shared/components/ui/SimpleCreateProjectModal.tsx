/**
 * Simple Create Project Modal - Compact Design
 */

import { useState, useEffect } from 'react';
import { X, Sparkles, LayoutGrid, ChevronRight } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { IconLibrary, RenderIcon } from './IconLibrary';

interface SimpleCreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: { name: string; description: string; icon: string; iconColor: string }) => void;
}

const colorOptions = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', 
  '#F59E0B', '#10B981', '#06B6D4', '#6366F1'
];

export function SimpleCreateProjectModal({ isOpen, onClose, onSave }: SimpleCreateProjectModalProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Briefcase',
    iconColor: '#3B82F6',
  });
  const [showIconLibrary, setShowIconLibrary] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        icon: 'Briefcase',
        iconColor: '#3B82F6',
      });
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!formData.name.trim()) return;
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`${bgMain} rounded-xl border ${borderColor} w-full max-w-md shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 border-b ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00C6FF]" />
            <h2 className={`text-lg ${textPrimary}`}>Create New Project</h2>
          </div>
          <button onClick={onClose} className={`p-1 rounded ${hoverBg}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Project Name */}
          <div>
            <label className={`block text-sm ${textSecondary} mb-1.5`}>
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter project name..."
              className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-[#00C6FF]`}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm ${textSecondary} mb-1.5`}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description..."
              rows={2}
              className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-[#00C6FF] resize-none`}
            />
          </div>

          {/* Icon Picker */}
          <div>
            <label className={`block text-sm ${textSecondary} mb-1.5`}>Choose Icon</label>
            
            {/* Current Selected Icon Display */}
            <div className={`${bgCard} rounded-lg border ${borderColor} p-3 mb-2`}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: formData.iconColor + '20' }}
                >
                  <RenderIcon 
                    name={formData.icon} 
                    className="w-5 h-5"
                    style={{ color: formData.iconColor }}
                  />
                </div>
                <div className="flex-1">
                  <p className={`text-xs ${textSecondary}`}>Selected: {formData.icon}</p>
                </div>
              </div>
            </div>

            {/* Browse Icon Library Button */}
            <button
              onClick={() => setShowIconLibrary(true)}
              className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} ${hoverBg} text-sm flex items-center justify-center gap-2 transition-all hover:border-[#00C6FF]/50`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Browse 1000+ Icons</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Color Picker */}
          <div>
            <label className={`block text-sm ${textSecondary} mb-1.5`}>Choose Color</label>
            <div className="flex gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  onClick={() => setFormData({ ...formData, iconColor: color })}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    formData.iconColor === color
                      ? 'ring-2 ring-offset-2 ring-white scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {formData.iconColor === color && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-white"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className={`${bgCard} rounded-lg border ${borderColor} p-3 flex items-center gap-3`}>
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: formData.iconColor + '20' }}
            >
              <RenderIcon 
                name={formData.icon} 
                className="w-6 h-6"
                style={{ color: formData.iconColor }}
              />
            </div>
            <div className="flex-1">
              <p className={`text-sm ${textPrimary}`}>{formData.name || 'Project Name'}</p>
              <p className={`text-xs ${textSecondary}`}>{formData.description || 'Description'}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`border-t ${borderColor} p-4 flex items-center justify-end gap-2`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg border ${borderColor} ${textPrimary} ${hoverBg} text-sm`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.name.trim()}
            className={`px-6 py-2 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white text-sm ${
              !formData.name.trim()
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-lg hover:scale-105'
            } transition-all`}
          >
            Create
          </button>
        </div>
      </div>

      {/* Icon Library Modal */}
      {showIconLibrary && (
        <IconLibrary
          selectedIcon={formData.icon}
          onSelectIcon={(icon) => {
            setFormData({ ...formData, icon });
            setShowIconLibrary(false);
          }}
          onClose={() => setShowIconLibrary(false)}
          theme={theme}
        />
      )}
    </div>
  );
}
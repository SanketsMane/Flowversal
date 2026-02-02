/**
 * Create Project Modal with Icon Picker
 * Allows creating new projects with custom icons
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { IconLibrary, RenderIcon } from './IconLibrary';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: { name: string; description: string; icon: string; iconColor: string }) => void;
}

const colorOptions = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F59E0B', // Orange
  '#10B981', // Green
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
];

const defaultIcons = ['Briefcase', 'Folder', 'Target', 'Zap', 'Flag', 'Star', 'Rocket', 'Package'];

export function CreateProjectModal({ isOpen, onClose, onSave }: CreateProjectModalProps) {
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
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div
          className={`${bgMain} rounded-xl border ${borderColor} w-full max-w-md`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`border-b ${borderColor} p-6 flex items-center justify-between`}>
            <h2 className={`text-2xl ${textPrimary}`}>Create New Project</h2>
            <button onClick={onClose} className={`p-2 rounded-lg ${hoverBg} ${textSecondary}`}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Project Name */}
            <div>
              <label className={`block text-sm ${textSecondary} mb-2`}>Project Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter project name..."
                className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} placeholder:${textSecondary} focus:outline-none focus:ring-2 focus:ring-[#00C6FF]`}
              />
            </div>

            {/* Project Description */}
            <div>
              <label className={`block text-sm ${textSecondary} mb-2`}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this project..."
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} placeholder:${textSecondary} focus:outline-none focus:ring-2 focus:ring-[#00C6FF] resize-none`}
              />
            </div>

            {/* Icon Selection */}
            <div>
              <label className={`block text-sm ${textSecondary} mb-2`}>Icon</label>
              
              {/* Quick Select Icons */}
              <div className="grid grid-cols-8 gap-2 mb-3">
                {defaultIcons.map((iconName) => (
                  <button
                    key={iconName}
                    onClick={() => setFormData({ ...formData, icon: iconName })}
                    className={`p-3 rounded-lg border transition-all ${
                      formData.icon === iconName
                        ? 'border-[#00C6FF] bg-[#00C6FF]/10'
                        : `${borderColor} ${bgCard} ${hoverBg}`
                    }`}
                  >
                    <RenderIcon 
                      name={iconName} 
                      className="w-5 h-5 mx-auto"
                      style={{ color: formData.icon === iconName ? formData.iconColor : undefined }}
                    />
                  </button>
                ))}
              </div>

              {/* Browse All Icons Button */}
              <button
                onClick={() => setShowIconLibrary(true)}
                className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} ${hoverBg} text-sm flex items-center justify-center gap-2 transition-all`}
              >
                Browse 270+ Icons from Library
              </button>

              {/* Selected Icon Preview */}
              <div className={`mt-4 p-4 rounded-lg ${bgCard} border ${borderColor} flex items-center gap-3`}>
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: formData.iconColor + '20' }}
                >
                  <RenderIcon 
                    name={formData.icon} 
                    className="w-7 h-7"
                    style={{ color: formData.iconColor }}
                  />
                </div>
                <div>
                  <p className={`text-sm ${textPrimary}`}>{formData.icon}</p>
                  <p className={`text-xs ${textSecondary}`}>Selected icon</p>
                </div>
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className={`block text-sm ${textSecondary} mb-2`}>Color</label>
              <div className="grid grid-cols-8 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, iconColor: color })}
                    className={`w-full h-10 rounded-lg border-2 transition-all ${
                      formData.iconColor === color
                        ? 'border-white scale-110'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`border-t ${borderColor} p-6 flex items-center justify-end gap-3`}>
            <button
              onClick={onClose}
              className={`px-6 py-3 rounded-lg border ${borderColor} ${textPrimary} ${hoverBg}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.name.trim()}
              className={`px-6 py-3 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white ${
                !formData.name.trim()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-lg hover:shadow-[#00C6FF]/50'
              } transition-all`}
            >
              Create Project
            </button>
          </div>
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
    </>
  );
}
/**
 * Edit Board Modal
 * Allows editing board name, icon, and icon color
 */

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useProjectStore, Board } from '@/core/stores/projectStore';
import { SimpleIconPicker, RenderIconByName } from './SimpleIconPicker';

interface EditBoardModalProps {
  boardId: string;
  onClose: () => void;
}

export function EditBoardModal({ boardId, onClose }: EditBoardModalProps) {
  const { theme } = useTheme();
  const { boards, updateBoard } = useProjectStore();
  
  const board = boards.find(b => b.id === boardId);
  
  const [formData, setFormData] = useState({
    name: board?.name || '',
    description: board?.description || '',
    icon: board?.icon || 'LayoutGrid',
    iconColor: board?.iconColor || '#00C6FF'
  });

  const [showIconPicker, setShowIconPicker] = useState(false);

  // Update form when board changes
  useEffect(() => {
    if (board) {
      setFormData({
        name: board.name,
        description: board.description || '',
        icon: board.icon,
        iconColor: board.iconColor
      });
    }
  }, [board]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      console.log('[EditBoardModal] Saving board:', boardId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        iconColor: formData.iconColor
      });
      updateBoard(boardId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        iconColor: formData.iconColor
      });
      onClose();
    }
  };

  if (!board) return null;

  // Theme colors
  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`${bgCard} rounded-xl w-full max-w-2xl shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`border-b ${borderColor} p-6 flex items-center justify-between`}>
          <h2 className={`text-2xl ${textPrimary}`}>Edit Board</h2>
          <button onClick={onClose} className={`p-2 rounded-lg ${hoverBg} ${textSecondary}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Board Name */}
            <div>
              <label className={`block text-sm ${textSecondary} mb-2`}>Board Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter board name..."
                className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} placeholder:${textSecondary} focus:outline-none focus:ring-2 focus:ring-[#00C6FF]`}
                required
                autoFocus
              />
            </div>

            {/* Board Description */}
            <div>
              <label className={`block text-sm ${textSecondary} mb-2`}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter board description..."
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} placeholder:${textSecondary} focus:outline-none focus:ring-2 focus:ring-[#00C6FF] resize-none`}
              />
            </div>

            {/* Icon Selection */}
            <div>
              <label className={`block text-sm ${textSecondary} mb-2`}>Board Icon</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} ${hoverBg} flex items-center gap-3`}
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: formData.iconColor + '20' }}
                  >
                    <RenderIconByName 
                      name={formData.icon}
                      className="w-6 h-6"
                      style={{ color: formData.iconColor }}
                    />
                  </div>
                  <span className="flex-1 text-left">Click to change icon and color</span>
                </button>

                {/* Icon Picker Dropdown */}
                {showIconPicker && (
                  <div className={`absolute top-full left-0 mt-2 z-10 w-full ${bgCard} rounded-lg border ${borderColor} p-4 shadow-xl`}>
                    <SimpleIconPicker
                      selectedIcon={formData.icon}
                      onSelectIcon={(icon) => {
                        setFormData({ ...formData, icon });
                        setShowIconPicker(false);
                      }}
                    />
                    
                    {/* Color Picker */}
                    <div className="mt-4">
                      <label className={`block text-sm ${textSecondary} mb-2`}>Icon Color</label>
                      <div className="flex gap-2 flex-wrap">
                        {['#00C6FF', '#9D50BB', '#FF6B9D', '#FFA500', '#00FF87', '#FF4444', '#FFD700', '#8B5CF6'].map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData({ ...formData, iconColor: color })}
                            className={`w-8 h-8 rounded-lg border-2 transition-all ${
                              formData.iconColor === color ? 'border-white scale-110' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`border-t ${borderColor} p-6 flex gap-3 justify-end`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2.5 rounded-lg border ${borderColor} ${textPrimary} ${hoverBg}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim()}
              className={`px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white flex items-center gap-2 ${
                !formData.name.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
              }`}
            >
              <Check className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

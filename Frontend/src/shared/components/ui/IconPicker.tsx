/**
 * Icon Picker Component
 * Allows users to select icons for projects, boards, categories, and workflows
 */

import { useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { Search, X } from 'lucide-react';

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (icon: string) => void;
  onClose: () => void;
}

// Comprehensive icon library with emojis
const iconCategories = {
  'Popular': ['📋', '📁', '🚀', '✨', '💡', '🎯', '📊', '💼', '🔥', '⭐', '🎨', '📈'],
  'Business': ['💼', '📊', '📈', '💰', '💳', '🏢', '📝', '📌', '📅', '📞', '✉️', '💻'],
  'Development': ['💻', '⚙️', '🔧', '🛠️', '🐛', '🔐', '🌐', '📱', '🖥️', '⌨️', '🖱️', '💾'],
  'Design': ['🎨', '🖌️', '✏️', '📐', '🎭', '🖼️', '🌈', '💫', '✨', '🎪', '🎬', '📷'],
  'Marketing': ['📣', '📢', '💌', '🎁', '🏆', '📊', '📈', '💡', '🎯', '🔔', '📲', '💬'],
  'People': ['👤', '👥', '🤝', '👨‍💼', '👩‍💼', '🙋', '💪', '🧑‍🤝‍🧑', '👏', '🤜', '🤛', '👋'],
  'Objects': ['📦', '📫', '📪', '📬', '📭', '🗂️', '🗃️', '🗄️', '🗑️', '📇', '🗒️', '📋'],
  'Nature': ['🌍', '🌎', '🌏', '🌐', '🌳', '🌲', '🌴', '🌱', '🌿', '🍀', '🌾', '🌵'],
  'Food': ['🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🥙', '🍿', '🥗', '🍱', '☕'],
  'Activities': ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🎱', '🎮', '🎯', '🎲', '🎳', '🎪'],
  'Transport': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '✈️', '🚀', '🛸'],
  'Symbols': ['❤️', '⭐', '🌟', '💫', '✨', '🔥', '💥', '🎉', '🎊', '🎈', '🔔', '⚡'],
  'Arrows': ['➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '🔄', '🔃'],
  'Weather': ['☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '💨'],
  'Time': ['⏰', '⏱️', '⏲️', '⌛', '⏳', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖'],
};

export function IconPicker({ selectedIcon, onSelectIcon, onClose }: IconPickerProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Popular');

  const bgModal = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-[#252540]' : 'hover:bg-gray-100';

  // Filter icons based on search
  const filteredIcons = searchQuery
    ? Object.values(iconCategories)
        .flat()
        .filter((icon) => icon.includes(searchQuery))
    : iconCategories[selectedCategory as keyof typeof iconCategories] || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${bgModal} rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border ${borderColor}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
          <h2 className={`text-2xl ${textPrimary}`}>Select Icon</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${hoverBg} transition-colors`}
          >
            <X className={`w-5 h-5 ${textSecondary}`} />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 pb-0">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${bgCard} border ${borderColor}`}>
            <Search className={`w-5 h-5 ${textSecondary}`} />
            <input
              type="text"
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 bg-transparent outline-none ${textPrimary}`}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X className={`w-4 h-4 ${textSecondary}`} />
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        {!searchQuery && (
          <div className="px-6 py-4 border-b ${borderColor} overflow-x-auto">
            <div className="flex gap-2">
              {Object.keys(iconCategories).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white'
                      : `${bgCard} ${textSecondary} ${hoverBg}`
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredIcons.length > 0 ? (
            <div className="grid grid-cols-8 gap-2">
              {filteredIcons.map((icon, index) => (
                <button
                  key={`${icon}-${index}`}
                  onClick={() => {
                    onSelectIcon(icon);
                    onClose();
                  }}
                  className={`aspect-square p-3 rounded-lg text-2xl flex items-center justify-center transition-all ${
                    selectedIcon === icon
                      ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] ring-2 ring-blue-500'
                      : `${bgCard} ${hoverBg} border ${borderColor}`
                  }`}
                  title={icon}
                >
                  {icon}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className={`${textSecondary} mb-2`}>No icons found</p>
              <p className={`text-sm ${textSecondary}`}>Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between p-6 border-t ${borderColor}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center text-2xl`}>
              {selectedIcon || '📋'}
            </div>
            <div>
              <p className={`text-sm ${textSecondary}`}>Selected Icon</p>
              <p className={`${textPrimary}`}>{selectedIcon || 'None'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

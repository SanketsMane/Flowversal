import { X } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';

interface FrequencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFrequency?: number;
  currentDays?: number;
  onSave: (frequency: number, days: number) => void;
}

export function FrequencyModal({ isOpen, onClose, currentFrequency = 1, currentDays = 1, onSave }: FrequencyModalProps) {
  const { theme } = useTheme();
  const [frequency, setFrequency] = useState(currentFrequency);
  const [days, setDays] = useState(currentDays);

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const inputBg = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';

  const handleSave = () => {
    if (frequency > 0 && days > 0) {
      onSave(frequency, days);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4" onClick={onClose}>
      <div className={`${bgCard} rounded-xl border ${borderColor} w-full max-w-md shadow-2xl`} onClick={(e) => e.stopPropagation()}>
        <div className={`px-6 py-4 border-b ${borderColor} flex items-center justify-between`}>
          <h3 className={textColor}>Set Frequency</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-4">
          <div>
            <label className={`block ${textSecondary} text-sm mb-2`}>
              Frequency (Number of times)
            </label>
            <input
              type="number"
              min="1"
              value={frequency}
              onChange={(e) => setFrequency(Math.max(1, parseInt(e.target.value) || 1))}
              className={`w-full px-4 py-2 ${inputBg} border ${borderColor} rounded-lg ${textColor} focus:outline-none focus:border-[#00C6FF]/50`}
              placeholder="Enter frequency"
            />
            <p className={`${textSecondary} text-xs mt-1`}>How many times the task repeats</p>
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm mb-2`}>
              Days (Time period)
            </label>
            <input
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
              className={`w-full px-4 py-2 ${inputBg} border ${borderColor} rounded-lg ${textColor} focus:outline-none focus:border-[#00C6FF]/50`}
              placeholder="Enter days"
            />
            <p className={`${textSecondary} text-xs mt-1`}>Within how many days</p>
          </div>

          <div className={`${inputBg} border ${borderColor} rounded-lg p-4`}>
            <p className={`${textSecondary} text-sm`}>
              Example: <span className={textColor}>{frequency} time{frequency > 1 ? 's' : ''} in {days} day{days > 1 ? 's' : ''}</span>
            </p>
            <p className={`${textSecondary} text-xs mt-1`}>
              {frequency === 1 && days === 1 && '• Once a day'}
              {frequency === 2 && days === 7 && '• Twice a week'}
              {frequency === 1 && days === 7 && '• Once a week'}
              {frequency === 3 && days === 7 && '• Three times a week'}
              {frequency === 1 && days === 30 && '• Once a month'}
            </p>
          </div>
        </div>

        <div className={`px-6 py-4 border-t ${borderColor} flex items-center justify-end gap-3`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 ${inputBg} border ${borderColor} rounded-lg ${textColor} hover:bg-white/5 transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white rounded-lg hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

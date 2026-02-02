/**
 * Keyboard Shortcuts Help Modal
 * Displays all available keyboard shortcuts
 */

import { X, Command } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const bgOverlay = theme === 'dark' ? 'bg-black/80' : 'bg-black/50';
  const bgModal = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-[#E0E0FF]' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgSection = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const cmdKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    {
      category: 'General',
      items: [
        { keys: [cmdKey, 'Z'], description: 'Undo last action' },
        { keys: [cmdKey, 'Shift', 'Z'], description: 'Redo last action' },
        { keys: [cmdKey, 'Y'], description: 'Redo last action (alternative)' },
        { keys: [cmdKey, 'K'], description: 'Open "Add to Workflow" popup' },
        { keys: ['?'], description: 'Show keyboard shortcuts' },
        { keys: ['Esc'], description: 'Close modals/dialogs' },
      ],
    },
    {
      category: 'Canvas Navigation',
      items: [
        { keys: [cmdKey, '+'], description: 'Zoom in' },
        { keys: [cmdKey, '-'], description: 'Zoom out' },
        { keys: [cmdKey, '0'], description: 'Reset zoom and position' },
        { keys: ['Space', 'Drag'], description: 'Pan canvas (hold space)' },
      ],
    },
    {
      category: 'Node Operations',
      items: [
        { keys: ['Delete'], description: 'Delete selected node' },
        { keys: [cmdKey, 'D'], description: 'Duplicate selected node' },
        { keys: [cmdKey, 'A'], description: 'Select all nodes' },
        { keys: [cmdKey, 'C'], description: 'Copy selected node' },
        { keys: [cmdKey, 'V'], description: 'Paste node' },
      ],
    },
  ];

  return (
    <div
      className={`fixed inset-0 ${bgOverlay} backdrop-blur-sm z-[10000] flex items-center justify-center p-4`}
      onClick={onClose}
    >
      <div
        className={`${bgModal} rounded-xl border ${borderColor} shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center">
              <Command className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${textColor}`}>Keyboard Shortcuts</h2>
              <p className={`text-sm ${textSecondary}`}>Speed up your workflow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`${textSecondary} hover:${textColor} transition-colors p-2 rounded-lg hover:bg-white/5`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
          <div className="space-y-6">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className={`text-sm font-semibold ${textColor} mb-3 uppercase tracking-wide`}>
                  {section.category}
                </h3>
                <div className={`${bgSection} rounded-lg overflow-hidden`}>
                  {section.items.map((shortcut, index) => (
                    <div
                      key={index}
                      className={`px-4 py-3 flex items-center justify-between ${
                        index !== section.items.length - 1 ? `border-b ${borderColor}` : ''
                      }`}
                    >
                      <span className={`text-sm ${textSecondary}`}>{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            <kbd
                              className={`px-2 py-1 ${bgModal} border ${borderColor} rounded text-xs ${textColor} font-medium min-w-[32px] text-center`}
                            >
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className={`text-xs ${textSecondary}`}>+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${borderColor} ${bgSection}`}>
          <p className={`text-sm ${textSecondary} text-center`}>
            Press <kbd className={`px-2 py-1 ${bgModal} border ${borderColor} rounded text-xs ${textColor}`}>?</kbd> anytime to view this help
          </p>
        </div>
      </div>
    </div>
  );
}
import { ArrowRightLeft, Copy, Trash2 } from 'lucide-react';

interface TaskActionsPanelProps {
  onMove: () => void;
  onCopy: () => void;
  onDelete: () => void;
  bgPanel: string;
  hoverBg: string;
  textPrimary: string;
  textSecondary: string;
}

export function TaskActionsPanel({ onMove, onCopy, onDelete, bgPanel, hoverBg, textPrimary, textSecondary }: TaskActionsPanelProps) {
  return (
    <div>
      <h4 className={`${textSecondary} text-sm mb-3 mt-6`}>Actions</h4>
      <button
        onClick={onMove}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${bgPanel} ${hoverBg} ${textPrimary} mb-2`}
      >
        <ArrowRightLeft className="w-4 h-4" />
        <span className="text-sm">Move</span>
      </button>
      <button
        onClick={onCopy}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${bgPanel} ${hoverBg} ${textPrimary} mb-2`}
      >
        <Copy className="w-4 h-4" />
        <span className="text-sm">Copy</span>
      </button>
      <button
        onClick={onDelete}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${bgPanel} ${hoverBg} text-red-500`}
      >
        <Trash2 className="w-4 h-4" />
        <span className="text-sm">Delete</span>
      </button>
    </div>
  );
}


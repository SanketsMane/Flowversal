import { X } from 'lucide-react';
import type { Label } from '../types/taskDetail.types';

interface TaskLabelListProps {
  labels: Label[];
  textPrimary: string;
  hoverBg: string;
  removeLabel: (id: string) => void;
}

export function TaskLabelList({ labels, textPrimary, hoverBg, removeLabel }: TaskLabelListProps) {
  if (labels.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {labels.map(label => (
        <div
          key={label.id}
          className={`${label.color} text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 group`}
        >
          {label.name}
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeLabel(label.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            title={`Remove ${label.name}`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}


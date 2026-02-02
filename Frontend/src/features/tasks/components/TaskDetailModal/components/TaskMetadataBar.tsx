import { CheckSquare, Clock, Paperclip, Tag, Users, X } from 'lucide-react';
import type { Label, Member } from '../types/taskDetail.types';

interface TaskMetadataBarProps {
  members: Member[];
  showMembersDropdown: boolean;
  toggleMembersDropdown: () => void;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
  bgPanel: string;
  hoverBg: string;
  statusOptions: { name: string; color: string }[];
  selectedStatus: string;
  showStatusMenu: boolean;
  toggleStatusMenu: () => void;
  onSelectStatus: (status: string) => void;
  priorityOptions: { name: string; color: string }[];
  selectedPriority: string;
  showPriorityMenu: boolean;
  togglePriorityMenu: () => void;
  onSelectPriority: (priority: string) => void;
  dueDate?: Date;
  toggleDatePicker: () => void;
  recurring: string;
  reminder: string;
  labels: Label[];
  removeLabel: (id: string) => void;
  openLabelsModal: () => void;
  showAddLabelButton?: boolean;
}

export function TaskMetadataBar({
  members,
  showMembersDropdown,
  toggleMembersDropdown,
  textPrimary,
  textSecondary,
  borderColor,
  bgPanel,
  hoverBg,
  statusOptions,
  selectedStatus,
  showStatusMenu,
  toggleStatusMenu,
  onSelectStatus,
  priorityOptions,
  selectedPriority,
  showPriorityMenu,
  togglePriorityMenu,
  onSelectPriority,
  dueDate,
  toggleDatePicker,
  recurring,
  reminder,
  labels,
  removeLabel,
  openLabelsModal,
  showAddLabelButton = true
}: TaskMetadataBarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {members.length > 0 && (
        <button
          onClick={toggleMembersDropdown}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${borderColor} ${bgPanel} ${hoverBg} transition-colors`}
        >
          <Users className={`w-4 h-4 ${textSecondary}`} />
          <div className="flex items-center gap-1">
            {members.slice(0, 3).map(member => (
              <div
                key={member.id}
                className={`w-6 h-6 rounded-full ${member.id === 'automation' ? 'bg-gray-500' : 'bg-blue-500'} flex items-center justify-center text-white text-xs -ml-1 first:ml-0 border-2 ${borderColor}`}
                title={member.name}
              >
                {member.avatar}
              </div>
            ))}
            {members.length > 3 && (
              <span className={`${textSecondary} text-xs ml-1`}>+{members.length - 3}</span>
            )}
          </div>
        </button>
      )}

      <div className="relative">
        <button
          onClick={toggleStatusMenu}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${borderColor} ${bgPanel} ${hoverBg}`}
        >
          <div className={`w-3 h-3 rounded ${statusOptions.find(s => s.name === selectedStatus)?.color}`}></div>
          <span className={`${textPrimary} text-sm`}>{selectedStatus}</span>
        </button>

        {showStatusMenu && (
          <div data-dropdown="true" className={`absolute top-full left-0 mt-2 w-48 ${bgPanel} rounded-lg border ${borderColor} shadow-xl z-10`}>
            {statusOptions.map(status => (
              <button
                key={status.name}
                onClick={() => {
                  onSelectStatus(status.name);
                  toggleStatusMenu();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 ${hoverBg} transition-colors`}
              >
                <div className={`w-3 h-3 rounded ${status.color}`}></div>
                <span className={`${textPrimary} text-sm`}>{status.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button
          onClick={togglePriorityMenu}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${borderColor} ${bgPanel} ${hoverBg}`}
        >
          <span className={`${priorityOptions.find(p => p.name === selectedPriority)?.color} text-sm`}>
            {selectedPriority}
          </span>
        </button>

        {showPriorityMenu && (
          <div data-dropdown="true" className={`absolute top-full left-0 mt-2 w-48 ${bgPanel} rounded-lg border ${borderColor} shadow-xl z-10`}>
            {priorityOptions.map(priority => (
              <button
                key={priority.name}
                onClick={() => {
                  onSelectPriority(priority.name);
                  togglePriorityMenu();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 ${hoverBg} transition-colors`}
              >
                <span className={`${priority.color} text-sm`}>{priority.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {dueDate && (
        <button
          onClick={toggleDatePicker}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${borderColor} ${bgPanel} ${hoverBg}`}
        >
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {recurring !== 'Never' && <CheckSquare className="w-3 h-3" />}
            {reminder !== 'None' && <Paperclip className="w-3 h-3" />}
          </div>
          <span className={`${textPrimary} text-sm`}>{dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </button>
      )}

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
      {labels.length === 0 && showAddLabelButton && (
        <button
          onClick={openLabelsModal}
          className={`px-3 py-1 rounded-full border ${borderColor} ${hoverBg} text-xs ${textPrimary}`}
        >
          + Add Label
        </button>
      )}
    </div>
  );
}


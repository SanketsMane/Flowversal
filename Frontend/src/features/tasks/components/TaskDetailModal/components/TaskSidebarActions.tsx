import { CheckSquare, Clock, Paperclip, Tag, Users, Zap } from 'lucide-react';

interface TaskSidebarActionsProps {
  onMembers: () => void;
  onLabels: () => void;
  onDates: () => void;
  onChecklist: () => void;
  onAttachment: () => void;
  onWorkflow: () => void;
  bgPanel: string;
  hoverBg: string;
  textPrimary: string;
}

export function TaskSidebarActions({
  onMembers,
  onLabels,
  onDates,
  onChecklist,
  onAttachment,
  onWorkflow,
  bgPanel,
  hoverBg,
  textPrimary
}: TaskSidebarActionsProps) {
  return (
    <div className="hidden lg:block w-48 flex-shrink-0">
      <h4 className={`${textPrimary} text-sm mb-3`}>Add to card</h4>
      <div className="space-y-2">
        <button
          onClick={onMembers}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${bgPanel} ${hoverBg} ${textPrimary}`}
        >
          <Users className="w-4 h-4" />
          <span className="text-sm">Members</span>
        </button>
        <button
          onClick={onLabels}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${bgPanel} ${hoverBg} ${textPrimary}`}
        >
          <Tag className="w-4 h-4" />
          <span className="text-sm">Labels</span>
        </button>
        <button
          onClick={onDates}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${bgPanel} ${hoverBg} ${textPrimary}`}
        >
          <Clock className="w-4 h-4" />
          <span className="text-sm">Dates</span>
        </button>
        <button
          onClick={onChecklist}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${bgPanel} ${hoverBg} ${textPrimary}`}
        >
          <CheckSquare className="w-4 h-4" />
          <span className="text-sm">Checklist</span>
        </button>
        <button
          onClick={onAttachment}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${bgPanel} ${hoverBg} ${textPrimary}`}
        >
          <Paperclip className="w-4 h-4" />
          <span className="text-sm">Attachment</span>
        </button>
        <button
          onClick={onWorkflow}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${bgPanel} ${hoverBg} ${textPrimary}`}
        >
          <Zap className="w-4 h-4" />
          <span className="text-sm">Workflow</span>
        </button>
      </div>
    </div>
  );
}


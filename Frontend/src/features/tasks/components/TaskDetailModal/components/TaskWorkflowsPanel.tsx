import { Check, Copy, X, Zap } from 'lucide-react';
import type { Workflow } from '../types/taskDetail.types';

interface TaskWorkflowsPanelProps {
  workflows: Workflow[];
  onOpenWorkflow?: (workflowId: string) => void;
  removeWorkflow: (workflowId: string) => void;
  copyToClipboard: (value: string) => void;
  copiedText: string | null;
  textPrimary: string;
  textSecondary: string;
  hoverBg: string;
  bgPanel: string;
  borderColor: string;
}

export function TaskWorkflowsPanel({
  workflows,
  onOpenWorkflow,
  removeWorkflow,
  copyToClipboard,
  copiedText,
  textPrimary,
  textSecondary,
  hoverBg,
  bgPanel,
  borderColor
}: TaskWorkflowsPanelProps) {
  if (workflows.length === 0) return null;

  return (
    <div>
      <h3 className={`${textSecondary} text-xs sm:text-sm mb-2`}>Attached Workflows</h3>
      <div className="space-y-2">
        {workflows.map(workflow => (
          <div
            key={workflow.id}
            onClick={() => onOpenWorkflow && onOpenWorkflow(workflow.workflowId)}
            className={`flex items-center justify-between p-3 rounded-lg border ${borderColor} ${bgPanel} cursor-pointer ${hoverBg} transition-colors`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Zap className={`w-4 h-4 text-[#00C6FF] flex-shrink-0`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className={`${textPrimary} text-sm truncate`}>{workflow.name}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(workflow.workflowId);
                    }}
                    className={`${textSecondary} text-xs ${hoverBg} px-2 py-0.5 rounded flex items-center gap-1 transition-colors`}
                    title="Copy Workflow ID"
                  >
                    {workflow.workflowId}
                    {copiedText === workflow.workflowId ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <p className={`${textSecondary} text-xs truncate`}>{workflow.category}</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeWorkflow(workflow.id);
              }}
              className={`p-1 rounded ${hoverBg} flex-shrink-0`}
              aria-label="Remove workflow"
            >
              <X className={`w-4 h-4 ${textSecondary}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


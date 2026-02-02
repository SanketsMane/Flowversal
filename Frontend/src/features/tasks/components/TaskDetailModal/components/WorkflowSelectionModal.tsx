import { CheckSquare, Search, X, Zap } from 'lucide-react';
import type { Workflow } from '../types/taskDetail.types';

interface WorkflowSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowSearch: string;
  setWorkflowSearch: (value: string) => void;
  filteredWorkflows: Workflow[];
  attachedWorkflows: Workflow[];
  addWorkflow: (workflow: Workflow) => void;
  removeWorkflow: (workflowId: string) => void;
  textPrimary: string;
  textSecondary: string;
  bgCard: string;
  bgPanel: string;
  bgMain: string;
  borderColor: string;
  hoverBg: string;
}

export function WorkflowSelectionModal({
  isOpen,
  onClose,
  workflowSearch,
  setWorkflowSearch,
  filteredWorkflows,
  attachedWorkflows,
  addWorkflow,
  removeWorkflow,
  textPrimary,
  textSecondary,
  bgCard,
  bgPanel,
  bgMain,
  borderColor,
  hoverBg
}: WorkflowSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-2 sm:p-4" 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className={`${bgCard} rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border ${borderColor}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`p-4 sm:p-6 border-b ${borderColor}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg sm:text-xl ${textPrimary}`}>Add Workflow from AI Apps</h2>
            <button onClick={onClose} className={`p-2 rounded-lg ${hoverBg}`}>
              <X className={`w-5 h-5 ${textSecondary}`} />
            </button>
          </div>

          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${borderColor} ${bgMain}`}>
            <Search className={`w-4 h-4 ${textSecondary}`} />
            <input
              type="text"
              placeholder="Search workflows by name, category, or ID..."
              value={workflowSearch}
              onChange={(e) => setWorkflowSearch(e.target.value)}
              className={`flex-1 bg-transparent outline-none ${textPrimary} text-sm`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-3">
            {filteredWorkflows.map(workflow => {
              const isAttached = attachedWorkflows.find(w => w.id === workflow.id);
              return (
                <div
                  key={workflow.id}
                  className={`${bgPanel} rounded-lg p-4 border ${borderColor} ${hoverBg} transition-all cursor-pointer ${
                    isAttached ? 'ring-2 ring-[#00C6FF]' : ''
                  }`}
                  onClick={() => {
                    if (isAttached) {
                      removeWorkflow(workflow.id);
                    } else {
                      addWorkflow(workflow);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`${textPrimary} text-sm sm:text-base`}>{workflow.name}</h3>
                          <span className={`${textSecondary} text-xs ${bgCard} px-2 py-0.5 rounded`}>
                            {workflow.workflowId}
                          </span>
                        </div>
                        {isAttached && (
                          <div className="w-5 h-5 rounded-full bg-[#00C6FF] flex items-center justify-center flex-shrink-0">
                            <CheckSquare className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className={`${textSecondary} text-xs sm:text-sm mb-2`}>{workflow.description}</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${bgCard} ${textSecondary}`}>
                        {workflow.category}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`p-4 border-t ${borderColor} flex justify-end gap-3`}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}


/**
 * Workflow Tags Component
 * Displays tags based on workflow content
 */

import { FileText, Sparkles } from 'lucide-react';

interface WorkflowTagsProps {
  hasForm: boolean;
  hasAI: boolean;
}

export function WorkflowTags({ hasForm, hasAI }: WorkflowTagsProps) {
  return (
    <div className="flex items-center gap-2">
      {hasForm && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
          <FileText className="w-3.5 h-3.5 text-green-400" />
          <span className="text-xs font-medium text-green-400">Form Submission</span>
        </div>
      )}
      {hasAI && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-medium text-purple-400">AI Automation</span>
        </div>
      )}
      {!hasForm && !hasAI && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-medium text-blue-400">Automation</span>
        </div>
      )}
    </div>
  );
}

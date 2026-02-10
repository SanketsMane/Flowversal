/**
 * Run Workflow Button Component
 * Executes workflow with visual animations on canvas
 */
import { useTheme } from '@/core/theme/ThemeContext';
import { Button } from '@/shared/components/ui/button';
import { Play, StopCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useWorkflowExecution } from '../../hooks/useWorkflowExecution';
import { useUIStore } from '../../stores/uiStore';
import { useWorkflowStore } from '../../stores/workflowStore';
interface RunWorkflowButtonProps {
  workflowId?: string; // If workflow is saved (optional, will try to get from route)
  variant?: 'default' | 'outline';
  iconOnly?: boolean; // New prop for icon-only mode
}
export function RunWorkflowButton({ workflowId: propWorkflowId, variant = 'default', iconOnly = false }: RunWorkflowButtonProps) {
  const { executeWorkflow, cancelExecution, isExecuting } = useWorkflowExecution();
  const workflowState = useWorkflowStore();
  const uiStore = useUIStore();
  const { theme } = useTheme();
  // Try to get workflowId from route params if not provided as prop
  const routeParams = useParams<{ id?: string; workflowId?: string }>();
  const workflowId = propWorkflowId || routeParams.id || routeParams.workflowId;
  const handleRun = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4eca190d-c843-4d4a-a868-56d71e69b49f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RunWorkflowButton.tsx:25',message:'handleRun called',data:{propWorkflowId,routeWorkflowId:routeParams.id||routeParams.workflowId,finalWorkflowId:workflowId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    // Execute workflow (works with or without workflowId - unsaved workflows are supported)
    const result = await executeWorkflow(workflowId);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4eca190d-c843-4d4a-a868-56d71e69b49f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RunWorkflowButton.tsx:33',message:'executeWorkflow completed',data:{success:result?.success,executionId:result?.executionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
  };
  const handleCancel = () => {
    cancelExecution();
  };
  const hasWorkflow = 
    workflowState.triggers.length > 0 || 
    workflowState.containers.some(c => c.nodes.length > 0);
  // Theme colors for icon-only mode
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const buttonBg = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-200';
  // Show cancel button while executing
  if (isExecuting) {
    if (iconOnly) {
      return (
        <button
          onClick={handleCancel}
          className={`p-2 rounded-lg border ${borderColor} ${buttonBg} ${hoverBg} transition-all`}
          title="Cancel Execution"
        >
          <StopCircle className="w-5 h-5 text-red-400" />
        </button>
      );
    }
    return (
      <Button
        onClick={handleCancel}
        variant="outline"
        className="gap-2 border-red-500/50 text-red-400 hover:bg-red-500/10"
      >
        <StopCircle className="w-4 h-4" />
        Cancel
      </Button>
    );
  }
  // Regular run button
  if (iconOnly) {
    return (
      <button
        onClick={handleRun}
        disabled={!hasWorkflow}
        className={`p-2 rounded-lg border ${borderColor} bg-gradient-to-r from-[#10B981] to-[#059669] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Run Workflow"
      >
        <Play className="w-5 h-5 text-white" />
      </button>
    );
  }
  return (
    <Button
      onClick={handleRun}
      disabled={!hasWorkflow}
      variant={variant}
      className={variant === 'default' ? 'gap-2 bg-gradient-to-r from-[#10B981] to-[#059669] hover:opacity-90' : 'gap-2'}
    >
      <Play className="w-4 h-4" />
      Run
    </Button>
  );
}
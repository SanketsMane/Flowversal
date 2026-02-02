/**
 * Dynamic Workflow Preview Modal
 * Comprehensive preview with form rendering, AI visualization, execution, and results
 */

import { getAuthHeaders } from '@/core/api/api.config';
import { runWorkflow } from '@/core/api/services/workflow.service';
import { useWorkflowExecutionStore } from '@/core/stores/workflowExecutionStore';
import { CheckCircle, Copy, Download, Loader2, Play, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../../../components/ThemeContext';
import { useWorkflowStore } from '../../stores';
import { AIVisualization } from './preview/AIVisualization';
import { OutputDisplay } from './preview/OutputDisplay';
import { WorkflowForm } from './preview/WorkflowForm';
import { WorkflowTags } from './preview/WorkflowTags';

interface WorkflowPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExecutionState = 'idle' | 'running' | 'success' | 'error';

export function WorkflowPreviewModal({ isOpen, onClose }: WorkflowPreviewModalProps) {
  const { theme } = useTheme();
  const { workflowName, triggers, containers, formFields } = useWorkflowStore();
  const executionStore = useWorkflowExecutionStore();
  
  const [executionState, setExecutionState] = useState<ExecutionState>('idle');
  const [outputData, setOutputData] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const bgModal = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  // Check if workflow has form
  const hasForm = formFields.length > 0;
  
  // Check if workflow has AI nodes
  const hasAINodes = containers.some(c => 
    c.nodes.some(n => n.type === 'openai_chat' || n.type === 'anthropic_chat')
  );

  // Execute workflow
  const handleExecute = async () => {
    setExecutionState('running');
    setOutputData(null);

    try {
      const workflowId =
        window.localStorage.getItem('currentWorkflowId') ||
        (triggers[0] as any)?.workflowId ||
        (containers[0] as any)?.workflowId ||
        null;

      if (!workflowId) {
        setExecutionState('error');
        setOutputData({ error: 'Save the workflow to execute it.' });
        return;
      }

      const headers = await getAuthHeaders();
      const accessToken = headers['Authorization']?.replace('Bearer ', '') || '';

      const exec = await runWorkflow({
        workflowId,
        input: formData,
        triggeredBy: 'manual',
        accessToken,
      });

      if (!exec.success || !exec.data?.id) {
        setExecutionState('error');
        setOutputData({ error: exec.error || 'Failed to start workflow execution' });
        return;
      }

      const executionId = exec.data.id;
      executionStore.upsertExecution({
        id: executionId,
        workflowId,
        status: 'running',
        startedAt: Date.now(),
      });

      setOutputData(exec.data);
      setExecutionState('success');
    } catch (error) {
      setExecutionState('error');
      setOutputData({ error: 'Workflow execution failed' });
    }
  };

  // Generate mock output
  const generateMockOutput = () => {
    if (hasAINodes) {
      return {
        type: 'ai_response',
        content: `Based on your input, I have successfully processed the workflow:\n\n✅ Form Data Submitted:\n• AI Model: "GPT-4"\n• Tone: "Professional"\n• Your Input: "${formData.input || 'sgf'}"\n\n✅ All validation passed\n✅ Workflow nodes executed successfully\n\nData stored and available as variables.`,
        metadata: {
          model: 'GPT-4',
          tone: 'Professional',
          processingTime: '2.3s'
        }
      };
    }

    return {
      type: 'text',
      content: 'Workflow executed successfully! All steps completed without errors.'
    };
  };

  // Reset execution
  const handleReset = () => {
    setExecutionState('idle');
    setOutputData(null);
    setFormData({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`${bgModal} rounded-2xl border ${borderColor} shadow-2xl w-full max-w-6xl h-[90vh] 
                    flex flex-col relative z-10 overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${bgCard} border-b ${borderColor} px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-4 flex-1">
            <div>
              <h2 className={`${textPrimary} text-xl font-semibold`}>{workflowName || 'Workflow Preview'}</h2>
              <p className={`${textSecondary} text-sm mt-1`}>Test and execute your workflow</p>
            </div>
            
            {/* Tags */}
            <WorkflowTags hasForm={hasForm} hasAI={hasAINodes} />
          </div>

          {/* Manual Execute Button */}
          <div className="flex items-center gap-3">
            {executionState !== 'idle' && (
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg border border-[#00C6FF]/30 text-[#00C6FF] hover:bg-[#00C6FF]/10 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
            
            <button
              onClick={handleExecute}
              disabled={executionState === 'running'}
              className={`px-6 py-2.5 rounded-lg font-medium text-white transition-all flex items-center gap-2 ${
                executionState === 'running'
                  ? 'bg-yellow-500/50 cursor-not-allowed'
                  : executionState === 'success'
                  ? 'bg-green-500 hover:bg-green-600'
                  : executionState === 'error'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] hover:opacity-90'
              }`}
              style={executionState === 'idle' ? {} : undefined}
            >
              {executionState === 'running' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Executing...
                </>
              ) : executionState === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Executed
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Execute Workflow
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className={`p-2 ${textSecondary} hover:${textPrimary} transition-colors`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Side - Input */}
          <div className={`w-1/2 border-r ${borderColor} flex flex-col`}>
            <div className={`px-6 py-4 border-b ${borderColor}`}>
              <h3 className={`${textPrimary} font-medium`}>Input</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {hasForm ? (
                <WorkflowForm 
                  fields={formFields}
                  formData={formData}
                  onFormDataChange={setFormData}
                  executionState={executionState}
                />
              ) : (
                <AIVisualization 
                  isExecuting={executionState === 'running'}
                  triggers={triggers}
                  containers={containers}
                />
              )}
            </div>
          </div>

          {/* Right Side - Output */}
          <div className="w-1/2 flex flex-col">
            <div className={`px-6 py-4 border-b ${borderColor} flex items-center justify-between`}>
              <h3 className={`${textPrimary} font-medium`}>Output</h3>
              {outputData && executionState === 'success' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(outputData, null, 2))}
                    className={`p-2 ${textSecondary} hover:text-[#00C6FF] transition-colors`}
                    title="Copy"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    className={`p-2 ${textSecondary} hover:text-[#00C6FF] transition-colors`}
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <OutputDisplay 
                outputData={outputData}
                executionState={executionState}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

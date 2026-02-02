/**
 * Multi-Step Form Component
 * Handles multiple forms with step progress indicator
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { FormField, WorkflowNode } from '../../../types';
import { WorkflowForm } from './WorkflowForm';
import { useState } from 'react';
import { Check, ChevronRight, Play, Loader2, CheckCircle } from 'lucide-react';

interface MultiStepFormProps {
  formNodes: Array<{ node: WorkflowNode; containerId: string; fields: FormField[] }>;
  formData: Record<string, any>;
  onFormDataChange: (data: Record<string, any>) => void;
  executionState: 'idle' | 'running' | 'success' | 'error';
  onExecute: () => void;
}

export function MultiStepForm({ formNodes, formData, onFormDataChange, executionState, onExecute }: MultiStepFormProps) {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';

  const totalSteps = formNodes.length;
  const currentFormNode = formNodes[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const isDisabled = executionState === 'running' || executionState === 'success';

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className={`${textSecondary} text-sm`}>
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className={`${textSecondary} text-sm`}>
            {Math.round(((currentStep + 1) / totalSteps) * 100)}%
          </span>
        </div>
        
        {/* Progress Bar with Steps */}
        <div className="relative">
          <div className={`h-2 ${bgCard} border ${borderColor} rounded-full overflow-hidden`}>
            <div 
              className="h-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
          
          {/* Step Numbers */}
          <div className="flex justify-between mt-3">
            {formNodes.map((_, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <div 
                  key={index}
                  className="flex flex-col items-center"
                  style={{ width: `${100 / totalSteps}%` }}
                >
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      isCompleted 
                        ? 'bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] text-white'
                        : isCurrent
                        ? 'bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] text-white ring-4 ring-[#00C6FF]/20'
                        : `${bgCard} border ${borderColor} ${textMuted}`
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`text-xs mt-1 ${isCurrent ? textPrimary : textMuted}`}>
                    Form {index + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Form */}
      <div className="flex-1 overflow-y-auto mb-4">
        <div className={`${bgCard} border ${borderColor} rounded-xl p-6`}>
          <h3 className={`${textPrimary} font-medium mb-4`}>
            {currentFormNode.node.label || `Form ${currentStep + 1}`}
          </h3>
          <WorkflowForm 
            fields={currentFormNode.fields}
            formData={formData}
            onFormDataChange={onFormDataChange}
            executionState={executionState}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      {executionState !== 'success' && (
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#2A2A3E]">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0 || isDisabled}
            className={`px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} hover:${textPrimary} 
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Previous
          </button>
          
          <div className="flex items-center gap-3">
            {!isLastStep && (
              <button
                onClick={handleNext}
                disabled={isDisabled}
                className={`px-4 py-2 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white 
                           hover:opacity-90 transition-opacity flex items-center gap-2
                           disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            
            {isLastStep && (
              <button
                onClick={onExecute}
                disabled={executionState === 'running'}
                className={`px-6 py-2.5 rounded-lg font-medium text-white transition-all flex items-center gap-2 ${
                  executionState === 'running'
                    ? 'bg-yellow-500/50 cursor-not-allowed'
                    : executionState === 'success'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] hover:opacity-90'
                }`}
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
                    Execute
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
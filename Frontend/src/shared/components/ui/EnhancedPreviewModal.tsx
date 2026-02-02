import { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, Upload, Zap, Sparkles, Play, 
  CheckCircle2, ClipboardCopy, FileDown, RotateCcw
} from 'lucide-react';

interface EnhancedPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formTitle: string;
  formDescription: string;
  containers: any[];
  triggers: any[];
  theme: string;
}

export function EnhancedPreviewModal({
  isOpen,
  onClose,
  formTitle,
  formDescription,
  containers,
  triggers,
  theme
}: EnhancedPreviewModalProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<'success' | 'error' | null>(null);
  const [outputText, setOutputText] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Initialize formData with default values from all elements
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Count triggers, fields, nodes
  const triggerCount = triggers.length;
  const fieldCount = containers.reduce((acc, c) => acc + (c.elements?.length || 0), 0);
  const nodeCount = containers.reduce((acc, c) => acc + (c.nodes?.length || 0), 0);

  // Check what exists
  const hasFormFields = fieldCount > 0;
  const hasTriggers = triggerCount > 0;
  const isMultiStep = containers.length > 1;
  const isFinalStep = currentStepIndex === containers.length - 1;

  // Initialize default values when modal opens or containers change
  useEffect(() => {
    if (isOpen) {
      const initialData: Record<string, any> = {};
      containers.forEach(container => {
        container.elements?.forEach((element: any) => {
          if (element && element.id) {
            // Set default values based on field type
            if (element.defaultValue) {
              if (element.type === 'toggle') {
                initialData[element.id] = element.defaultValue === 'true' || element.toggleDefault === true;
              } else if (element.type === 'checklist') {
                // Convert comma-separated string to array
                const values = element.defaultValue.split(',').map((v: string) => v.trim()).filter(Boolean);
                initialData[element.id] = values;
              } else if (element.type === 'date-picker' || element.type === 'date') {
                initialData[element.id] = element.defaultDate || element.defaultValue;
              } else if (element.type === 'time') {
                // Convert from 12-hour format back to 24-hour for input
                const timeValue = element.defaultTime || element.defaultValue;
                if (timeValue && (timeValue.includes('AM') || timeValue.includes('PM'))) {
                  // Parse 12-hour format
                  const match = timeValue.match(/(\d+):(\d+)\s*(AM|PM)/i);
                  if (match) {
                    let [_, hourStr, minute, meridiem] = match;
                    let hour = parseInt(hourStr);
                    if (meridiem.toUpperCase() === 'PM' && hour !== 12) hour += 12;
                    if (meridiem.toUpperCase() === 'AM' && hour === 12) hour = 0;
                    initialData[element.id] = `${hour.toString().padStart(2, '0')}:${minute}`;
                  } else {
                    initialData[element.id] = timeValue;
                  }
                } else {
                  initialData[element.id] = timeValue;
                }
              } else if (element.type === 'radio' || element.type === 'dropdown') {
                initialData[element.id] = element.defaultValue;
              } else if (element.type === 'file' || element.type === 'image' || element.type === 'uploaded') {
                initialData[element.id] = element.defaultValue; // URL
              } else {
                initialData[element.id] = element.defaultValue;
              }
            }
            
            // Handle URL field with linkName
            if (element.type === 'url' && element.linkName) {
              initialData[`${element.id}_name`] = element.linkName;
            }
          }
        });
      });
      setFormData(initialData);
      setShowOutput(false);
      setExecutionStatus(null);
    }
  }, [isOpen, containers]);

  const handleRunWorkflow = () => {
    setIsExecuting(true);
    setShowOutput(true);
    
    setTimeout(() => {
      setIsExecuting(false);
      const isSuccess = Math.random() > 0.2;
      setExecutionStatus(isSuccess ? 'success' : 'error');
      
      if (isSuccess) {
        // Generate Word-like formatted output
        const submittedDataItems = Object.entries(formData)
          .map(([key, value]) => `  • ${key}: ${JSON.stringify(value)}`)
          .join('\n');
        
        setOutputText(`Workflow Execution Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Status: Successfully Completed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Submitted Data
──────────────────────────────────────────────

${submittedDataItems}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AI Analysis Summary
──────────────────────────────────────────────

Based on your input, I have successfully processed the workflow and generated the following results:

  1. ✓ Data validation completed
  2. ✓ AI analysis performed on submitted information
  3. ✓ Workflow nodes executed successfully
  4. ✓ All automation steps completed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next Steps
──────────────────────────────────────────────

The task has been created and assigned to the appropriate team members. You will receive a notification once the next steps are completed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Execution Details
──────────────────────────────────────────────

  • Timestamp: ${new Date().toLocaleString()}
  • Triggers Activated: ${triggerCount}
  • Fields Processed: ${fieldCount}
  • Nodes Executed: ${nodeCount}
  • Status: Success
  • Duration: 2.3 seconds

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      } else {
        setOutputText(`Workflow Execution Error
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Status: Execution Failed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Error Details
──────────────────────────────────────────────

An error occurred during workflow execution. Please check your input and try again.

  • Error Code: WF_ERR_500
  • Timestamp: ${new Date().toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      }
    }, 2000);
  };

  const handleManualRun = () => {
    handleRunWorkflow();
  };

  const handleRunStep = () => {
    // For multi-step, move to next step or run workflow if final
    if (isFinalStep) {
      handleRunWorkflow();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setShowOutput(false);
    setExecutionStatus(null);
    setOutputText('');
    setCurrentStepIndex(0);
    setIsExecuting(false);
    // Reset to default values
    const initialData: Record<string, any> = {};
    containers.forEach(container => {
      container.elements?.forEach((element: any) => {
        if (element && element.id && element.defaultValue) {
          if (element.type === 'toggle') {
            initialData[element.id] = element.defaultValue === 'true' || element.toggleDefault === true;
          } else if (element.type === 'checklist') {
            initialData[element.id] = element.defaultValue.split(',').map((v: string) => v.trim()).filter(Boolean);
          } else {
            initialData[element.id] = element.defaultValue;
          }
        }
      });
    });
    setFormData(initialData);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
  };

  const downloadOutput = () => {
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-result-${Date.now()}.txt`;
    a.click();
  };

  const bgColor = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const panelBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const iconColor = theme === 'dark' ? 'text-white' : 'text-gray-900';

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const renderFormElement = (element: any) => {
    if (element.hidden) return null;

    const elementKey = element.id;

    return (
      <div key={element.id} className="space-y-2">
        <label className={`${textPrimary} text-sm flex items-center gap-1`}>
          {element.label}
          {element.required && <span className="text-red-500">*</span>}
        </label>
        {element.description && (
          <p className={`${textSecondary} text-xs`}>{element.description}</p>
        )}

        {/* Text, Email, Number inputs */}
        {['text', 'email', 'number'].includes(element.type) && (
          <input
            type={element.type}
            placeholder={element.placeholder}
            value={formData[elementKey] || ''}
            onChange={(e) => updateFormData(elementKey, e.target.value)}
            className={`w-full px-3 py-2 border ${borderColor} rounded ${bgInput} text-sm ${textPrimary}`}
          />
        )}

        {/* Textarea and Notes */}
        {['textarea', 'notes'].includes(element.type) && (
          <textarea
            placeholder={element.placeholder}
            value={formData[elementKey] || ''}
            onChange={(e) => updateFormData(elementKey, e.target.value)}
            className={`w-full px-3 py-2 border ${borderColor} rounded ${bgInput} text-sm ${textPrimary}`}
            rows={3}
          />
        )}

        {/* Rich Text Editor */}
        {element.type === 'rich-text' && (
          <div className={`w-full min-h-[120px] border ${borderColor} rounded ${bgInput} p-3`}>
            <textarea
              placeholder="Enter rich text content..."
              value={formData[elementKey] || ''}
              onChange={(e) => updateFormData(elementKey, e.target.value)}
              className={`w-full min-h-[100px] bg-transparent border-none outline-none resize-none ${textPrimary} text-sm`}
            />
          </div>
        )}

        {/* Dropdown */}
        {element.type === 'dropdown' && element.options && (
          <select
            value={formData[elementKey] || ''}
            onChange={(e) => updateFormData(elementKey, e.target.value)}
            className={`w-full px-3 py-2 border ${borderColor} rounded ${bgInput} text-sm ${textPrimary}`}
          >
            <option value="">Select an option</option>
            {element.options.map((opt: string, idx: number) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        )}

        {/* Radio Buttons */}
        {element.type === 'radio' && element.options && (
          <div className="space-y-2">
            {element.options.map((opt: string, idx: number) => (
              <label key={idx} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={elementKey}
                  checked={formData[elementKey] === opt}
                  onChange={() => updateFormData(elementKey, opt)}
                  className="cursor-pointer text-[#00C6FF] focus:ring-[#00C6FF]"
                />
                <span className={`${textPrimary} text-sm`}>{opt}</span>
              </label>
            ))}
          </div>
        )}

        {/* Checklist */}
        {element.type === 'checklist' && element.options && (
          <div className="space-y-2">
            {element.options.map((opt: string, idx: number) => (
              <label key={idx} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(formData[elementKey] || []).includes(opt)}
                  onChange={(e) => {
                    const current = formData[elementKey] || [];
                    if (e.target.checked) {
                      updateFormData(elementKey, [...current, opt]);
                    } else {
                      updateFormData(elementKey, current.filter((v: string) => v !== opt));
                    }
                  }}
                  className="rounded cursor-pointer text-[#00C6FF] focus:ring-[#00C6FF]"
                />
                <span className={`${textPrimary} text-sm`}>{opt}</span>
              </label>
            ))}
          </div>
        )}

        {/* Toggle Switch */}
        {element.type === 'toggle' && (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData[elementKey] || false}
              onChange={(e) => updateFormData(elementKey, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#00C6FF]"></div>
            <span className={`ms-3 text-sm ${textPrimary}`}>
              {formData[elementKey] ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        )}

        {/* Date Picker */}
        {(element.type === 'date-picker' || element.type === 'date') && (
          <div className="relative">
            <input
              type="date"
              value={formData[elementKey] || ''}
              onChange={(e) => updateFormData(elementKey, e.target.value)}
              className={`w-full px-3 py-2 border ${borderColor} rounded ${bgInput} text-sm ${textPrimary} cursor-pointer`}
            />
            <Calendar className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${iconColor}`} />
          </div>
        )}

        {/* Time Picker */}
        {element.type === 'time' && (
          <div className="relative">
            <input
              type="time"
              value={formData[elementKey] || ''}
              onChange={(e) => updateFormData(elementKey, e.target.value)}
              className={`w-full px-3 py-2 border ${borderColor} rounded ${bgInput} text-sm ${textPrimary} cursor-pointer`}
            />
            <Clock className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${iconColor}`} />
          </div>
        )}

        {/* URL Field */}
        {element.type === 'url' && (
          <div className="space-y-2">
            {element.linkName && (
              <input
                type="text"
                placeholder="Link name"
                value={formData[`${elementKey}_name`] || ''}
                onChange={(e) => updateFormData(`${elementKey}_name`, e.target.value)}
                className={`w-full px-3 py-2 border ${borderColor} rounded ${bgInput} text-sm ${textPrimary}`}
              />
            )}
            <input
              type="url"
              placeholder={element.placeholder || "Enter URL"}
              value={formData[elementKey] || ''}
              onChange={(e) => updateFormData(elementKey, e.target.value)}
              className={`w-full px-3 py-2 border ${borderColor} rounded ${bgInput} text-sm ${textPrimary}`}
            />
          </div>
        )}

        {/* File/Image Upload */}
        {(element.type === 'uploaded' || element.type === 'image' || element.type === 'file') && (
          <div>
            {formData[elementKey] ? (
              <div className={`w-full p-3 border ${borderColor} rounded ${bgInput} flex items-center justify-between`}>
                <span className={`${textPrimary} text-sm truncate flex-1`}>{formData[elementKey]}</span>
                <button
                  onClick={() => updateFormData(elementKey, '')}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className={`w-full h-24 border-2 border-dashed ${borderColor} rounded flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all`}>
                <div className="text-center">
                  <Upload className={`w-6 h-6 mx-auto mb-2 ${textSecondary}`} />
                  <span className={`${textSecondary} text-sm`}>Click to upload</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className={`${panelBg} rounded-xl shadow-2xl max-w-[1400px] w-full max-h-[90vh] overflow-hidden flex flex-col border ${borderColor}`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${borderColor}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h2 className={`${textPrimary} text-xl mb-1`}>
                {formTitle.length > 120 ? formTitle.substring(0, 120) + '...' : formTitle}
              </h2>
              {formDescription && (
                <p className={`${textSecondary} text-sm`}>
                  {formDescription.length > 180 ? formDescription.substring(0, 180) + '...' : formDescription}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Manual Run Button - Show only if triggers exist */}
              {hasTriggers && (
                <button
                  onClick={handleManualRun}
                  disabled={isExecuting}
                  className={`px-4 py-2 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 ${
                    isExecuting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Play className="w-4 h-4" />
                  {isExecuting ? 'Running...' : 'Manual Run'}
                </button>
              )}
              
              <button
                onClick={onClose}
                className={`p-2 hover:bg-red-500/10 hover:text-red-500 rounded transition-all ${iconColor}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-3">
            {triggerCount > 0 && (
              <div className={`px-3 py-1 rounded-full text-xs ${bgInput} border ${borderColor} ${textSecondary} flex items-center gap-1`}>
                <Zap className="w-3 h-3 text-[#00C6FF]" />
                {triggerCount} {triggerCount === 1 ? 'Trigger' : 'Triggers'}
              </div>
            )}
            {fieldCount > 0 && (
              <div className={`px-3 py-1 rounded-full text-xs ${bgInput} border ${borderColor} ${textSecondary} flex items-center gap-1`}>
                <span className="text-[#9D50BB]">📝</span>
                {fieldCount} {fieldCount === 1 ? 'Field' : 'Fields'}
              </div>
            )}
            {nodeCount > 0 && (
              <div className={`px-3 py-1 rounded-full text-xs ${bgInput} border ${borderColor} ${textSecondary} flex items-center gap-1`}>
                <Sparkles className="w-3 h-3 text-[#10B981]" />
                {nodeCount} {nodeCount === 1 ? 'Node' : 'Nodes'}
              </div>
            )}
          </div>

          {/* Progress Bar for Multi-step */}
          {isMultiStep && (
            <div className="mt-4">
              <div className="flex items-center justify-center gap-1">
                {containers.filter(container => container && container.id).map((container, idx) => (
                  <div key={container.id} className="flex items-center">
                    {idx > 0 && (
                      <div className={`h-1 w-8 ${idx <= currentStepIndex ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB]' : 'bg-gray-300 dark:bg-gray-700'}`} />
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                      idx < currentStepIndex
                        ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white'
                        : idx === currentStepIndex
                        ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white ring-4 ring-[#00C6FF]/30'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {idx < currentStepIndex ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={`flex-1 overflow-hidden flex ${bgColor}`}>
          {/* Left: Form Area - 50% */}
          <div className="w-1/2 border-r border-gray-300 dark:border-gray-700 overflow-y-auto">
            {hasFormFields ? (
              <div className={`max-w-2xl mx-auto p-8`}>
                {/* Form Card */}
                <div className={`${panelBg} rounded-lg shadow-lg border ${borderColor} p-8`}>
                  {/* Current Step Header */}
                  {containers[currentStepIndex] && (
                    <div className="mb-6">
                      <h3 className={`${textPrimary} text-2xl mb-2`}>
                        {containers[currentStepIndex].title}
                      </h3>
                      <p className={`${textSecondary} text-sm`}>
                        {containers[currentStepIndex].subtitle}
                      </p>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="space-y-5">
                    {containers[currentStepIndex]?.elements?.map((element: any) => 
                      renderFormElement(element)
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200 dark:border-gray-700">
                    {currentStepIndex > 0 && (
                      <button
                        onClick={() => setCurrentStepIndex(prev => prev - 1)}
                        className={`px-6 py-2.5 border ${borderColor} rounded-lg ${textPrimary} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                      >
                        Previous
                      </button>
                    )}
                    {isMultiStep ? (
                      <button
                        onClick={handleRunStep}
                        disabled={isExecuting}
                        className={`ml-auto px-6 py-2.5 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 ${
                          isExecuting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Play className="w-4 h-4" />
                        {isExecuting ? 'Running...' : isFinalStep ? 'Run Workflow' : 'Next'}
                      </button>
                    ) : (
                      <button
                        onClick={handleRunWorkflow}
                        disabled={isExecuting}
                        className={`ml-auto px-6 py-2.5 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 ${
                          isExecuting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Play className="w-4 h-4" />
                        {isExecuting ? 'Running...' : 'Run Workflow'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`flex items-center justify-center h-full ${textSecondary}`}>
                <div className="text-center">
                  <p>No form fields configured</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Output Area - 50% */}
          <div className="w-1/2 overflow-y-auto p-6">
            {!showOutput ? (
              <div className={`flex items-center justify-center h-full ${textSecondary}`}>
                <div className="text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Output will appear here</p>
                  <p className="text-sm mt-2">Fill out the form and click "Run Workflow"</p>
                </div>
              </div>
            ) : (
              <div className={`h-full flex flex-col`}>
                {/* Output Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className={`${textPrimary} text-lg`}>Workflow Output</h3>
                    {executionStatus && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        executionStatus === 'success' 
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                          : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {executionStatus === 'success' ? '✓ Success' : '✗ Error'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyToClipboard}
                      className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${textSecondary}`}
                      title="Copy to clipboard"
                    >
                      <ClipboardCopy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={downloadOutput}
                      className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${textSecondary}`}
                      title="Download output"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleReset}
                      className={`px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 border border-[#00C6FF]/30 hover:border-[#00C6FF]/50 transition-all flex items-center gap-2 ${textPrimary} shadow-lg shadow-[#00C6FF]/20`}
                      title="Rerun workflow"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="text-sm">Rerun</span>
                    </button>
                  </div>
                </div>
                
                {/* Word-style formatted output */}
                <div className={`flex-1 p-6 rounded-lg ${bgInput} ${textPrimary} overflow-y-auto border ${borderColor} font-mono text-sm leading-relaxed`}>
                  <pre className="whitespace-pre-wrap">{outputText}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

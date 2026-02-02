/**
 * Unified Setup Modal Component
 * Reusable modal for all nodes, triggers, and tools
 * Features: INPUT panel, Parameters/Settings/Docs tabs, OUTPUT panel
 */

import { getAuthHeaders } from '@/core/api/api.config';
import { runWorkflow } from '@/core/api/services/workflow.service';
import { useWorkflowExecutionStore } from '@/core/stores/workflowExecutionStore';
import { useTheme } from '@/core/theme/ThemeContext';
import { Filter, Play, X } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { Trigger, WorkflowNode } from '../../types';
import { InputPanel } from './panels/InputPanel';
import { OutputPanel } from './panels/OutputPanel';
import { SettingsTab } from './tabs/SettingsTab';

interface UnifiedSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WorkflowNode | Trigger;
  itemType: 'node' | 'trigger' | 'tool';
  onSave: (config: any) => void;
  containerId?: string;
  // Content for Parameters tab - different for each node type
  parametersContent: ReactNode;
  // Previous nodes for INPUT panel
  previousNodes?: Array<{
    id: string;
    label: string;
    icon: ReactNode;
    outputs: any;
  }>;
}

type InputOutputTab = 'schema' | 'table' | 'json';
type ConfigTab = 'parameters' | 'settings' | 'docs';

export function UnifiedSetupModal({
  isOpen,
  onClose,
  item,
  itemType,
  onSave,
  containerId,
  parametersContent,
  previousNodes = []
}: UnifiedSetupModalProps) {
  const { theme } = useTheme();
  const [inputTab, setInputTab] = useState<InputOutputTab>('schema');
  const [outputTab, setOutputTab] = useState<InputOutputTab>('schema');
  const [configTab, setConfigTab] = useState<ConfigTab>('parameters');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [executionData, setExecutionData] = useState<any>(null);
  const executionStore = useWorkflowExecutionStore();
  const uiStore = useUIStore();

  // Settings state (common across all nodes/triggers)
  const [settings, setSettings] = useState({
    alwaysOutputData: item.config?.settings?.alwaysOutputData || false,
    executeOnce: item.config?.settings?.executeOnce || false,
    retryOnFail: item.config?.settings?.retryOnFail || false,
    onError: item.config?.settings?.onError || 'Stop Workflow',
    notes: item.config?.settings?.notes || '',
    displayNoteInFlow: item.config?.settings?.displayNoteInFlow || false,
    maxTries: item.config?.settings?.maxTries || 3,
    waitBetweenTries: item.config?.settings?.waitBetweenTries || 1000,
  });

  const bgPrimary = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgSecondary = theme === 'dark' ? 'bg-[#13131F]' : 'bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirm) return;
    }
    onClose();
  };

  const handleExecute = async () => {
    const workflowId =
      (item as any)?.workflowId ||
      (item as any)?.config?.workflowId ||
      window.localStorage.getItem('currentWorkflowId') ||
      null;

    if (!workflowId) {
      uiStore.showNotification('Please save the workflow before executing.', 'error');
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const accessToken = headers['Authorization']?.replace('Bearer ', '') || '';

      const exec = await runWorkflow({
        workflowId,
        input: settings,
        triggeredBy: 'manual',
        accessToken,
      });

      if (!exec.success || !exec.data?.id) {
        uiStore.showNotification(exec.error || 'Failed to start execution', 'error');
        return;
      }

      const executionId = exec.data.id;
      executionStore.upsertExecution({
        id: executionId,
        workflowId,
        status: 'running',
        startedAt: Date.now(),
      });

      setExecutionData(exec.data);
      uiStore.showNotification('Execution started', 'success');
    } catch (error: any) {
      console.error('Execution failed:', error);
      uiStore.showNotification('Execution failed', 'error');
    }
  };

  const handleSaveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    setHasUnsavedChanges(true);
    // Save to node/trigger config
    onSave({
      ...item.config,
      settings: newSettings
    });
  };

  if (!isOpen) return null;

  const executeButtonText = itemType === 'trigger' ? 'Execute trigger' : itemType === 'tool' ? 'Execute tool' : 'Execute step';

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal Container */}
      <div className={`relative ${bgPrimary} rounded-lg shadow-2xl border ${borderColor} flex flex-col w-[95vw] h-[90vh] max-w-[1600px]`}>
        
        {/* Header */}
        <div className={`${bgCard} border-b ${borderColor} px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className={`flex items-center gap-2 px-3 py-1.5 ${textSecondary} hover:${textPrimary} transition-colors`}
            >
              <span className="text-lg">←</span>
              <span>Back to canvas</span>
            </button>
            <div className={`h-6 w-px ${bgSecondary}`} />
            <h2 className={`${textPrimary} font-medium`}>{item.label} - Configure</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter */}
            <button className={`flex items-center gap-2 px-3 py-1.5 ${bgSecondary} rounded hover:bg-[#2A2A3E] transition-colors ${textSecondary}`}>
              <Filter className="w-4 h-4" />
              Filter
            </button>

            {/* Execute Button */}
            <button 
              onClick={handleExecute}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Play className="w-4 h-4" />
              <span>{executeButtonText}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className={`p-2 ${bgSecondary} hover:bg-red-500/20 rounded transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* LEFT PANEL - INPUT */}
          <InputPanel
            inputTab={inputTab}
            setInputTab={setInputTab}
            previousNodes={previousNodes}
            theme={theme}
            currentItem={{
              id: item.id,
              label: item.label,
              type: item.type
            }}
          />

          {/* CENTER PANEL - Configuration Tabs */}
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Center Top Tabs */}
            <div className={`${bgCard} border-b ${borderColor}`}>
              <div className="flex items-center gap-6 px-6">
                <button
                  onClick={() => setConfigTab('parameters')}
                  className={`px-4 py-4 border-b-2 transition-colors ${
                    configTab === 'parameters'
                      ? 'border-[#00C6FF] text-[#00C6FF]'
                      : `border-transparent ${textSecondary} hover:${textPrimary}`
                  }`}
                >
                  Parameters
                </button>
                <button
                  onClick={() => setConfigTab('settings')}
                  className={`px-4 py-4 border-b-2 transition-colors ${
                    configTab === 'settings'
                      ? 'border-[#00C6FF] text-[#00C6FF]'
                      : `border-transparent ${textSecondary} hover:${textPrimary}`
                  }`}
                >
                  Settings
                </button>
                <button
                  onClick={() => setConfigTab('docs')}
                  className={`px-4 py-4 border-b-2 transition-colors ${
                    configTab === 'docs'
                      ? 'border-[#00C6FF] text-[#00C6FF]'
                      : `border-transparent ${textSecondary} hover:${textPrimary}`
                  }`}
                >
                  📘 Docs
                </button>
              </div>
            </div>

            {/* Center Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {configTab === 'parameters' && (
                <div>{parametersContent}</div>
              )}

              {configTab === 'settings' && (
                <SettingsTab
                  settings={settings}
                  onSettingsChange={handleSaveSettings}
                  theme={theme}
                />
              )}

              {configTab === 'docs' && (
                <div className={`${textSecondary} text-sm p-6 text-center`}>
                  <p className="mb-2">Documentation for {item.label}</p>
                  <p className="text-xs">Documentation content will be available soon</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL - OUTPUT */}
          <OutputPanel
            outputTab={outputTab}
            setOutputTab={setOutputTab}
            executionData={executionData}
            onExecute={handleExecute}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
}
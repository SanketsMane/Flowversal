/**
 * Node Setup Modal Component
 * Generic modal for configuring nodes (AI, API, Database, etc.)
 * Based on Figma screenshot design with INPUT (left) and OUTPUT (right) panels
 */

import React, { useState } from 'react';
import { X, Filter, FileText, Table, Braces, Settings as SettingsIcon, BookOpen, Play, MoreVertical, ChevronDown, ChevronRight, Clock, Mail, Zap, Box, Plus } from 'lucide-react';
import { useTheme } from '../../../../components/ThemeContext';
import { WorkflowNode } from '../../types';
import { HTTPRequestParameters } from './HTTPRequestParameters';
import { ConfigureConditionsModal } from './ConfigureConditionsModal';
import { ConditionConfiguration } from './ConditionConfiguration';
import { FormBuilderTab } from './FormBuilderTab';
import { FormBuilderParameters } from './FormBuilderParameters';

interface NodeSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: WorkflowNode;
  onSave: (config: any) => void;
  containerId: string;
}

type InputOutputTab = 'schema' | 'table' | 'json';
type ConfigTab = 'parameters' | 'form-builder' | 'settings';

export function NodeSetupModal({ isOpen, onClose, node, onSave, containerId }: NodeSetupModalProps) {
  const { theme } = useTheme();
  const [inputTab, setInputTab] = useState<InputOutputTab>('schema');
  const [outputTab, setOutputTab] = useState<InputOutputTab>('schema');
  const [configTab, setConfigTab] = useState<ConfigTab>('parameters');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [executionData, setExecutionData] = useState<any>(null);
  
  // Settings state
  const [alwaysOutputData, setAlwaysOutputData] = useState(false);
  const [executeOnce, setExecuteOnce] = useState(false);
  const [retryOnFail, setRetryOnFail] = useState(false);
  const [onError, setOnError] = useState('Stop Workflow');
  const [notes, setNotes] = useState('');
  const [displayNoteInFlow, setDisplayNoteInFlow] = useState(false);
  const [maxTries, setMaxTries] = useState(3);
  const [waitBetweenTries, setWaitBetweenTries] = useState(1000);

  // HTTP Request specific state
  const [httpMethod, setHttpMethod] = useState('GET');
  const [httpUrl, setHttpUrl] = useState('');
  const [authentication, setAuthentication] = useState('None');
  const [sendQueryParams, setSendQueryParams] = useState(false);
  const [sendHeaders, setSendHeaders] = useState(false);
  const [sendBody, setSendBody] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [methodMode, setMethodMode] = useState<'fixed' | 'expression'>('fixed');
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);

  // Conditions state
  const [showConditionsModal, setShowConditionsModal] = useState(false);
  const [conditions, setConditions] = useState<any[]>(() => {
    // Initialize with one condition if it's an IF or SWITCH node
    if (node.label === 'If' || node.label === 'Switch') {
      return [{
        id: Date.now().toString(),
        value1: '',
        value1Type: 'String',
        operator: 'is_equal_to',
        value2: '',
        value2Type: 'String',
      }];
    }
    return [];
  });
  const [conditionGroups, setConditionGroups] = useState<any[][]>([]);
  const [convertTypes, setConvertTypes] = useState(false);

  // Form Builder state (for form nodes)
  const [formFields, setFormFields] = useState<any[]>(node.config?.formFields || []);

  const bgPrimary = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgSecondary = theme === 'dark' ? 'bg-[#13131F]' : 'bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirm) return;
    }
    onClose();
  };

  const handleExecute = () => {
    // Mock execution - in real implementation, this would execute the node
    setExecutionData({
      timestamp: new Date().toISOString(),
      year: 2025,
      month: 'November',
      dayOfMonth: 16,
      hour: 18,
      minute: 54,
      second: 28,
      timezone: 'Asia/Calcutta (UTC+05:30)',
      readableDate: 'November 16th 2025, 6:54:28 pm',
      readableTime: '6:54:28 pm',
      dayOfWeek: 'Sunday'
    });
  };

  if (!isOpen) return null;

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
            <h2 className={`${textPrimary} font-medium`}>{node.label} - Configure</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter */}
            <button className={`flex items-center gap-2 px-3 py-1.5 ${bgSecondary} rounded hover:bg-[#2A2A3E] transition-colors ${textSecondary}`}>
              <Filter className="w-4 h-4" />
              Filter
            </button>

            {/* Execute Step Button */}
            <button 
              onClick={handleExecute}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Play className="w-4 h-4" />
              <span>Execute step</span>
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
          <div className={`w-[320px] ${bgCard} border-r ${borderColor} flex flex-col overflow-hidden`}>
            
            {/* INPUT Header */}
            <div className={`${bgSecondary} px-4 py-3 border-b ${borderColor}`}>
              <h3 className={`${textPrimary} font-medium`}>INPUT</h3>
            </div>

            {/* INPUT Sub Tabs - Schema/Table/JSON */}
            <div className={`${bgCard} px-3 py-2 border-b ${borderColor}`}>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setInputTab('schema')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
                    inputTab === 'schema'
                      ? `${bgSecondary} ${textPrimary}`
                      : `${textSecondary} hover:${bgSecondary}`
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Schema
                </button>
                <button
                  onClick={() => setInputTab('table')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
                    inputTab === 'table'
                      ? `${bgSecondary} ${textPrimary}`
                      : `${textSecondary} hover:${bgSecondary}`
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  Table
                </button>
                <button
                  onClick={() => setInputTab('json')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
                    inputTab === 'json'
                      ? `${bgSecondary} ${textPrimary}`
                      : `${textSecondary} hover:${bgSecondary}`
                  }`}
                >
                  <Braces className="w-3.5 h-3.5" />
                  JSON
                </button>
              </div>
            </div>

            {/* INPUT Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Variables and Context Section */}
              <div className="p-3 border-b border-[#2A2A3E]">
                <h4 className={`${textSecondary} text-xs mb-2`}>Variables and context</h4>
                <p className={`${textMuted} text-xs`}>
                  Create variables that can be used across workflows <span className="text-[#00C6FF] cursor-pointer">here</span>
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {inputTab === 'schema' && (
                  <>
                    {/* Previous Nodes - Schedule Trigger */}
                    <PreviousNodeSection 
                      nodeName="Schedule Trigger"
                      icon={<Clock className="w-4 h-4" />}
                      itemCount={1}
                      fields={[
                        { name: 'timestamp', value: '2025-11-16T18:54:29.287+05:30', type: 'T' },
                        { name: 'Readable date', value: 'November 16th 2025, 6:54:29 pm', type: 'T' },
                        { name: 'Readable time', value: '6:54:29 pm', type: 'T' },
                        { name: 'Day of week', value: 'Sunday', type: 'T' },
                        { name: 'Year', value: '2025', type: 'T' },
                        { name: 'Month', value: 'November', type: 'T' },
                        { name: 'Day of month', value: '16', type: 'T' },
                        { name: 'Hour', value: '18', type: 'T' },
                        { name: 'Minute', value: '54', type: 'T' },
                        { name: 'Second', value: '29', type: 'T' },
                        { name: 'Timezone', value: 'Asia/Calcutta (UTC+05:30)', type: 'T' },
                      ]}
                    />

                    {/* Send a message node (example) */}
                    <PreviousNodeSection 
                      nodeName="Send a message"
                      icon={<Mail className="w-4 h-4" />}
                      itemCount={0}
                      preview="Preview"
                      fields={[]}
                    />

                    {/* Variables and Context */}
                    <VariablesContextSection />
                  </>
                )}

                {inputTab === 'table' && (
                  <div className={`${textSecondary} text-center py-8 text-sm`}>
                    <p>Table view of data</p>
                    <p className="text-xs mt-2 ${textMuted}">Data will be displayed in table format</p>
                  </div>
                )}

                {inputTab === 'json' && (
                  <div className={`${bgSecondary} rounded p-3 font-mono text-xs`}>
                    <pre className={`${textSecondary} overflow-auto`}>
{`{
  "$now": "2025-11-16T18:33:20.384+05:30",
  "$today": "2025-11-16T00:00:00.000+05:30",
  "$execution": {
    "id": "[filled at execution time]",
    "mode": "test",
    "resumeUrl": ""
  },
  "$workflow": {
    "id": "[workflow id]",
    "name": "[workflow name]"
  }
}`}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CENTER PANEL - Main Configuration */}
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Center Top Tabs - Parameters/Settings */}
            <div className={`${bgCard} border-b ${borderColor} px-6`}>
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setConfigTab('parameters')}
                  className={`px-4 py-3 border-b-2 transition-colors ${
                    configTab === 'parameters'
                      ? 'border-[#00C6FF] text-[#00C6FF]'
                      : `border-transparent ${textSecondary} hover:${textPrimary}`
                  }`}
                >
                  Parameters
                </button>
                
                {/* Form Builder tab - only for Form nodes */}
                {node.type === 'form' && (
                  <button
                    onClick={() => setConfigTab('form-builder')}
                    className={`px-4 py-3 border-b-2 transition-colors ${
                      configTab === 'form-builder'
                        ? 'border-[#00C6FF] text-[#00C6FF]'
                        : `border-transparent ${textSecondary} hover:${textPrimary}`
                    }`}
                  >
                    Form Builder
                  </button>
                )}
                
                <button
                  onClick={() => setConfigTab('settings')}
                  className={`px-4 py-3 border-b-2 transition-colors ${
                    configTab === 'settings'
                      ? 'border-[#00C6FF] text-[#00C6FF]'
                      : `border-transparent ${textSecondary} hover:${textPrimary}`
                  }`}
                >
                  Settings
                </button>
                <div className="ml-auto flex items-center gap-2 py-3">
                  <BookOpen className="w-4 h-4 text-[#00C6FF]" />
                  <span className="text-sm text-[#00C6FF] cursor-pointer">Docs</span>
                </div>
              </div>
            </div>

            {/* Center Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {configTab === 'parameters' && (
                <div className="space-y-6 max-w-3xl">
                  {/* Form Builder for Form nodes */}
                  {node.type === 'form' && (
                    <FormBuilderParameters
                      node={node}
                      onSave={onSave}
                    />
                  )}

                  {/* IF/SWITCH Node Setup - New Cleaner Design */}
                  {(node.label === 'If' || node.label === 'Switch') && (
                    <ConditionConfiguration
                      conditions={conditions}
                      setConditions={setConditions}
                      convertTypes={convertTypes}
                      setConvertTypes={setConvertTypes}
                      theme={theme}
                    />
                  )}

                  {/* HTTP Request Parameters */}
                  {node.label === 'HTTP Request' && (
                    <HTTPRequestParameters
                      httpMethod={httpMethod}
                      setHttpMethod={setHttpMethod}
                      httpUrl={httpUrl}
                      setHttpUrl={setHttpUrl}
                      authentication={authentication}
                      setAuthentication={setAuthentication}
                      sendQueryParams={sendQueryParams}
                      setSendQueryParams={setSendQueryParams}
                      sendHeaders={sendHeaders}
                      setSendHeaders={setSendHeaders}
                      sendBody={sendBody}
                      setSendBody={setSendBody}
                      selectedOptions={selectedOptions}
                      setSelectedOptions={setSelectedOptions}
                      methodMode={methodMode}
                      setMethodMode={setMethodMode}
                      showMethodDropdown={showMethodDropdown}
                      setShowMethodDropdown={setShowMethodDropdown}
                      showOptionsDropdown={showOptionsDropdown}
                      setShowOptionsDropdown={setShowOptionsDropdown}
                    />
                  )}
                  
                  {/* Generic Parameters for other nodes */}
                  {node.label !== 'HTTP Request' && node.label !== 'If' && node.label !== 'Switch' && node.type !== 'form' && (
                    <div className={`${textSecondary} text-center py-12`}>
                      <p>Parameters configuration for {node.label}</p>
                      <p className="text-sm mt-2">(Specific to each node type)</p>
                    </div>
                  )}
                </div>
              )}

              {configTab === 'form-builder' && node.type === 'form' && (
                <FormBuilderTab
                  node={node}
                  onSave={onSave}
                  containerId={containerId}
                />
              )}

              {configTab === 'settings' && (
                <div className="space-y-6 max-w-2xl">
                  {/* Always Output Data */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className={`${textPrimary} text-sm`}>Always Output Data</label>
                      <button
                        onClick={() => setAlwaysOutputData(!alwaysOutputData)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          alwaysOutputData ? 'bg-[#00C6FF]' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            alwaysOutputData ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Execute Once */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className={`${textPrimary} text-sm`}>Execute Once</label>
                      <button
                        onClick={() => setExecuteOnce(!executeOnce)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          executeOnce ? 'bg-[#00C6FF]' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            executeOnce ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Retry On Fail */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className={`${textPrimary} text-sm`}>Retry On Fail</label>
                      <button
                        onClick={() => setRetryOnFail(!retryOnFail)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          retryOnFail ? 'bg-[#00C6FF]' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            retryOnFail ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    {/* Conditional fields when Retry On Fail is enabled */}
                    {retryOnFail && (
                      <div className="pl-4 space-y-4 mt-4">
                        {/* Max Tries */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className={`${textPrimary} text-sm`}>Max. Tries</label>
                            <button className={`text-xs px-2 py-1 ${bgSecondary} rounded ${textSecondary} hover:${textPrimary} transition-colors`}>
                              Parameter: ""
                            </button>
                          </div>
                          <input
                            type="number"
                            value={maxTries}
                            onChange={(e) => setMaxTries(parseInt(e.target.value) || 0)}
                            className={`w-full px-3 py-2 ${bgSecondary} border ${borderColor} rounded-lg ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF] transition-colors`}
                          />
                        </div>

                        {/* Wait Between Tries */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className={`${textPrimary} text-sm`}>Wait Between Tries (ms)</label>
                            <button className={`text-xs px-2 py-1 ${bgSecondary} rounded ${textSecondary} hover:${textPrimary} transition-colors`}>
                              Parameter: ""
                            </button>
                          </div>
                          <input
                            type="number"
                            value={waitBetweenTries}
                            onChange={(e) => setWaitBetweenTries(parseInt(e.target.value) || 0)}
                            className={`w-full px-3 py-2 ${bgSecondary} border ${borderColor} rounded-lg ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF] transition-colors`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* On Error */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className={`${textPrimary} text-sm`}>On Error</label>
                      <button className={`p-1 hover:bg-[#2A2A3E] rounded transition-colors`}>
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="relative">
                      <select
                        value={onError}
                        onChange={(e) => setOnError(e.target.value)}
                        className={`w-full px-3 py-2 ${bgSecondary} border ${borderColor} rounded-lg ${textPrimary} text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#00C6FF] transition-colors`}
                      >
                        <option value="Stop Workflow">Stop Workflow</option>
                        <option value="Continue On Fail">Continue On Fail</option>
                        <option value="Retry">Retry</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className={`${textPrimary} text-sm`}>Notes</label>
                      <button className={`text-xs px-2 py-1 ${bgSecondary} rounded ${textSecondary} hover:${textPrimary} transition-colors`}>
                        Parameter: ""
                      </button>
                    </div>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this node..."
                      rows={6}
                      className={`w-full px-3 py-2 ${bgSecondary} border ${borderColor} rounded-lg ${textPrimary} text-sm placeholder:${textMuted} focus:outline-none focus:border-[#00C6FF] transition-colors resize-none`}
                    />
                  </div>

                  {/* Display Note in Flow */}
                  <div className="flex items-center justify-between">
                    <label className={`${textPrimary} text-sm`}>Display Note in Flow?</label>
                    <button
                      onClick={() => setDisplayNoteInFlow(!displayNoteInFlow)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        displayNoteInFlow ? 'bg-[#00C6FF]' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          displayNoteInFlow ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Divider */}
                  <div className={`border-t ${borderColor} my-6`} />

                  {/* Node-specific Settings Placeholder */}
                  <div className={`${textSecondary} text-center py-8 text-sm`}>
                    <p>Additional node-specific settings will appear here</p>
                    <p className="text-xs mt-2">(e.g., timeout, retry count, etc.)</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL - OUTPUT */}
          <div className={`w-[340px] ${bgCard} border-l ${borderColor} flex flex-col overflow-hidden`}>
            
            {/* OUTPUT Header */}
            <div className={`${bgSecondary} px-4 py-3 border-b ${borderColor}`}>
              <div className="flex items-center justify-between">
                <h3 className={`${textPrimary} font-medium`}>OUTPUT</h3>
                {executionData && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className={`${textMuted} text-xs`}>Keep (1 item)</span>
                  </div>
                )}
              </div>
              {executionData && (
                <div className="flex items-center gap-2 mt-1">
                  <span className={`${textMuted} text-xs`}>Discarded</span>
                </div>
              )}
            </div>

            {/* OUTPUT Sub Tabs - Schema/Table/JSON */}
            <div className={`${bgCard} px-3 py-2 border-b ${borderColor}`}>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setOutputTab('schema')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
                    outputTab === 'schema'
                      ? `${bgSecondary} ${textPrimary}`
                      : `${textSecondary} hover:${bgSecondary}`
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Schema
                </button>
                <button
                  onClick={() => setOutputTab('table')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
                    outputTab === 'table'
                      ? `${bgSecondary} ${textPrimary}`
                      : `${textSecondary} hover:${bgSecondary}`
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  Table
                </button>
                <button
                  onClick={() => setOutputTab('json')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
                    outputTab === 'json'
                      ? `${bgSecondary} ${textPrimary}`
                      : `${textSecondary} hover:${bgSecondary}`
                  }`}
                >
                  <Braces className="w-3.5 h-3.5" />
                  JSON
                </button>
              </div>
            </div>

            {/* OUTPUT Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {!executionData ? (
                <div className="space-y-4">
                  {/* Settings info messages */}
                  {(alwaysOutputData || executeOnce || retryOnFail) && (
                    <div className="space-y-3 pb-4 border-b border-[#2A2A3E]">
                      {alwaysOutputData && (
                        <div className="flex items-start gap-2">
                          <div className={`w-5 h-5 rounded flex items-center justify-center ${bgSecondary} flex-shrink-0 mt-0.5`}>
                            <svg className="w-3 h-3 text-[#00C6FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className={`${textSecondary} text-xs leading-relaxed`}>
                            This node will output an empty item if nothing would normally be returned
                          </p>
                        </div>
                      )}
                      
                      {executeOnce && (
                        <div className="flex items-start gap-2">
                          <div className={`w-5 h-5 rounded flex items-center justify-center ${bgSecondary} flex-shrink-0 mt-0.5`}>
                            <span className={`${textPrimary} text-xs`}>1</span>
                          </div>
                          <p className={`${textSecondary} text-xs leading-relaxed`}>
                            This node will execute only once, no matter how many input items there are
                          </p>
                        </div>
                      )}
                      
                      {retryOnFail && (
                        <div className="flex items-start gap-2">
                          <div className={`w-5 h-5 rounded flex items-center justify-center ${bgSecondary} flex-shrink-0 mt-0.5`}>
                            <svg className="w-3 h-3 text-[#00C6FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </div>
                          <p className={`${textSecondary} text-xs leading-relaxed`}>
                            This node will automatically retry if it fails
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className={`${textSecondary} text-center py-8`}>
                    <p>Execute this node to view data</p>
                    <p className="text-sm mt-2">or <span className="text-[#00C6FF] cursor-pointer">set mock data</span></p>
                  </div>
                </div>
              ) : (
                <>
                  {outputTab === 'schema' && (
                    <div className="space-y-2">
                      {Object.entries(executionData).map(([key, value]) => (
                        <div key={key} className={`flex items-start gap-2 py-1.5 px-2 rounded hover:bg-[#13131F] transition-colors cursor-pointer`}>
                          <span className={`${textMuted} text-xs font-mono`}>T</span>
                          <div className="flex-1">
                            <div className={`${textPrimary} text-xs font-medium`}>{key}</div>
                            <div className={`${textSecondary} text-xs font-mono mt-0.5`}>
                              {typeof value === 'string' ? value : JSON.stringify(value)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {outputTab === 'table' && (
                    <div className={`${bgSecondary} rounded overflow-hidden`}>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className={`${bgCard} border-b ${borderColor}`}>
                            <th className={`${textPrimary} px-3 py-2 text-left`}>Field</th>
                            <th className={`${textPrimary} px-3 py-2 text-left`}>Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(executionData).map(([key, value]) => (
                            <tr key={key} className={`border-b ${borderColor} hover:bg-[#1A1A2E] transition-colors`}>
                              <td className={`${textSecondary} px-3 py-2 font-mono`}>{key}</td>
                              <td className={`${textSecondary} px-3 py-2 font-mono`}>
                                {typeof value === 'string' ? value : JSON.stringify(value)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {outputTab === 'json' && (
                    <div className={`${bgSecondary} rounded p-3 font-mono text-xs`}>
                      <pre className={`${textSecondary} overflow-auto`}>
                        {JSON.stringify(executionData, null, 2)}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Configure Conditions Modal */}
      <ConfigureConditionsModal
        isOpen={showConditionsModal}
        onClose={() => setShowConditionsModal(false)}
        currentConditions={conditions}
        onSave={setConditions}
        theme={theme}
      />
    </div>
  );
}

// Previous Node Section Component
function PreviousNodeSection({ nodeName, icon, itemCount, fields, preview }: { nodeName: string; icon: React.ReactNode; itemCount: number; fields: { name: string; value: string; type: 'T' | 'P' }[]; preview?: string }) {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';
  const bgHover = theme === 'dark' ? 'hover:bg-[#1A1A2E]' : 'hover:bg-gray-100';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';

  const handleDragStart = (e: React.DragEvent, field: { name: string; value: string; type: 'T' | 'P' }) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify({
      fieldName: field.name,
      fieldValue: field.value,
      fieldType: field.type,
      nodeName: nodeName
    }));
    
    // Set drag image for better UX
    const dragElement = e.currentTarget.cloneNode(true) as HTMLElement;
    dragElement.style.position = 'absolute';
    dragElement.style.top = '-1000px';
    dragElement.style.opacity = '0.8';
    document.body.appendChild(dragElement);
    e.dataTransfer.setDragImage(dragElement, 0, 0);
    setTimeout(() => document.body.removeChild(dragElement), 0);
  };

  return (
    <div className="space-y-1">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center gap-2 px-2 py-1.5 ${bgHover} rounded transition-colors`}
      >
        <ChevronDown className={`w-4 h-4 ${textMuted} transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
        <div className="text-[#00C6FF]">
          {icon}
        </div>
        <span className={`${textPrimary} text-sm flex-1 text-left`}>{nodeName}</span>
        {preview && (
          <span className={`${textMuted} text-xs`}>{preview}</span>
        )}
        {itemCount > 0 && (
          <span className={`${textMuted} text-xs`}>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="space-y-1 pl-2">
          {fields.length > 0 ? (
            <>
              {/* Filter Row */}
              <div className="flex items-center gap-2 px-2 py-1">
                <ChevronDown className={`w-3 h-3 ${textMuted}`} />
                <Filter className={`w-3 h-3 ${textMuted}`} />
                <span className={`${textSecondary} text-xs`}>Filter</span>
                <span className={`ml-auto ${textMuted} text-xs`}>{fields.length} item{fields.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Fields */}
              <div className="space-y-0.5">
                {fields.map((field, index) => (
                  <div 
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, field)}
                    className={`flex items-center gap-2 px-3 py-1.5 ${bgHover} rounded transition-all cursor-grab active:cursor-grabbing group hover:border hover:border-[#00C6FF] hover:shadow-lg hover:shadow-[#00C6FF]/20`}
                    title="Drag to use this variable"
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center ${bgCard} flex-shrink-0`}>
                      <span className={`${textMuted} text-[10px] font-bold`}>{field.type}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`${textPrimary} text-xs truncate`}>{field.name}</div>
                      <div className={`${textMuted} text-[10px] truncate`}>{field.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={`px-3 py-2 text-xs ${textMuted} italic`}>
              Execute previous nodes to view input data
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Variables and Context Section Component
function VariablesContextSection() {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';
  const bgHover = theme === 'dark' ? 'hover:bg-[#1A1A2E]' : 'hover:bg-gray-100';

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center gap-2 px-2 py-1.5 ${bgHover} rounded text-sm ${textPrimary} transition-colors`}
      >
        <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
        <span className="font-mono">Variables and Context</span>
      </button>
      {isExpanded && (
        <div className="ml-4 mt-1 space-y-1">
          <VariableSection title="$now" items={['2025-11-16T18:33:20.384+05:30']} />
          <VariableSection title="$today" items={['2025-11-16T00:00:00.000+05:30']} />
          <VariableSection title="$vars" items={[]} emptyText="Create variables" />
          <VariableSection 
            title="$execution" 
            items={['id', 'mode', 'resumeUrl']} 
          />
          <VariableSection 
            title="$workflow" 
            items={['id', 'name']} 
          />
        </div>
      )}
    </div>
  );
}

// Variable Section Component
function VariableSection({ title, items, emptyText }: { title: string; items: string[]; emptyText?: string }) {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';
  const bgHover = theme === 'dark' ? 'hover:bg-[#1A1A2E]' : 'hover:bg-gray-100';

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center gap-2 px-2 py-1.5 ${bgHover} rounded text-sm ${textPrimary} transition-colors`}
      >
        <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
        <span className="font-mono">{title}</span>
      </button>
      {isExpanded && (
        <div className="ml-4 mt-1 space-y-1">
          {items.length > 0 ? (
            items.map((item, index) => (
              <div key={index} className={`px-2 py-1 text-xs ${textSecondary} font-mono cursor-pointer ${bgHover} rounded`}>
                {item}
              </div>
            ))
          ) : (
            <div className={`px-2 py-1 text-xs ${textMuted} italic`}>{emptyText || 'No items'}</div>
          )}
        </div>
      )}
    </div>
  );
}
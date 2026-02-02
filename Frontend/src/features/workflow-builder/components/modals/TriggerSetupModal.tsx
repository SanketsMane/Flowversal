/**
 * Trigger Setup Modal
 * Generic configuration modal for all trigger types
 * Same structure as NodeSetupModal
 */

import React, { useState } from 'react';
import { X, Play, BookOpen, FileText, Table, Braces } from 'lucide-react';
import { useTheme } from '../../../../components/ThemeContext';
import { Trigger } from '../../types';

interface TriggerSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: Trigger;
  onSave: (config: any) => void;
}

type InputOutputTab = 'schema' | 'table' | 'json';
type ConfigTab = 'parameters' | 'settings';

export function TriggerSetupModal({ isOpen, onClose, trigger, onSave }: TriggerSetupModalProps) {
  const { theme } = useTheme();
  const [inputTab, setInputTab] = useState<InputOutputTab>('schema');
  const [outputTab, setOutputTab] = useState<InputOutputTab>('schema');
  const [configTab, setConfigTab] = useState<ConfigTab>('parameters');
  const [config, setConfig] = useState(trigger.config || {});
  const [executionData, setExecutionData] = useState<any>(null);

  const bgModal = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const bgSecondary = theme === 'dark' ? 'bg-[#13131F]' : 'bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';

  const handleExecute = () => {
    // Mock trigger execution
    setExecutionData({
      executedAt: new Date().toISOString(),
      triggerType: trigger.type,
      status: 'success',
      output: {
        message: `Trigger "${trigger.label}" executed successfully`,
        data: { sample: 'data' }
      }
    });
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`${bgModal} rounded-2xl border ${borderColor} shadow-2xl w-full max-w-[1600px] h-[90vh] 
                    flex flex-col relative z-10 overflow-hidden`}
      >
        {/* Header */}
        <div className={`${bgCard} border-b ${borderColor} px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={`flex items-center gap-2 px-3 py-1.5 ${textSecondary} hover:${textPrimary} transition-colors`}
            >
              <span className="text-lg">←</span>
              <span>Back to canvas</span>
            </button>
            <div className={`h-6 w-px ${bgSecondary}`} />
            <div>
              <h2 className={`${textPrimary} font-medium`}>{trigger.label} - Configure</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Execute Button */}
            <button 
              onClick={handleExecute}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Play className="w-4 h-4" />
              <span>Execute trigger</span>
            </button>
            <button
              onClick={onClose}
              className={`${textSecondary} hover:text-white transition-colors p-2`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT PANEL - INPUT */}
          <div className={`w-[320px] ${bgCard} border-r ${borderColor} flex flex-col overflow-hidden`}>
            
            {/* INPUT Header */}
            <div className={`${bgSecondary} px-4 py-3 border-b ${borderColor}`}>
              <h3 className={`${textPrimary} font-medium`}>INPUT</h3>
            </div>

            {/* INPUT Sub Tabs */}
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
            <div className="flex-1 overflow-y-auto p-4">
              <div className={`${textSecondary} text-center py-8 text-sm`}>
                <p>Trigger configuration</p>
                <p className="text-xs mt-2 ${textMuted}">Configure trigger parameters</p>
              </div>
            </div>
          </div>

          {/* CENTER PANEL - Configuration */}
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Center Top Tabs */}
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

            {/* Center Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {configTab === 'parameters' && (
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Schedule Trigger Configuration */}
                  {trigger.type === 'schedule' && (
                    <>
                      {/* Info Banner */}
                      <div className={`${bgSecondary} rounded-lg p-4 border-l-4 border-[#00C6FF]`}>
                        <p className={`${textSecondary} text-sm`}>
                          Configure when and how often this trigger activates. The trigger will execute automatically based on your schedule.
                        </p>
                      </div>

                      {/* Trigger Rules Section */}
                      <div>
                        <h3 className={`${textPrimary} font-medium mb-4`}>Trigger Rules</h3>
                        
                        {/* Interval Selection */}
                        <div className="space-y-3">
                          <div>
                            <label className={`${textSecondary} text-sm block mb-2`}>
                              Run trigger every
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="number"
                                min="1"
                                value={config.interval || 1}
                                onChange={(e) => setConfig({ ...config, interval: parseInt(e.target.value) || 1 })}
                                className={`px-3 py-2 ${bgSecondary} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:border-[#00C6FF] transition-colors`}
                                placeholder="1"
                              />
                              <select
                                value={config.intervalUnit || 'minutes'}
                                onChange={(e) => setConfig({ ...config, intervalUnit: e.target.value })}
                                className={`px-3 py-2 ${bgSecondary} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:border-[#00C6FF] transition-colors`}
                              >
                                <option value="seconds">Seconds</option>
                                <option value="minutes">Minutes</option>
                                <option value="hours">Hours</option>
                                <option value="days">Days</option>
                                <option value="weeks">Weeks</option>
                                <option value="months">Months</option>
                                <option value="cron">Custom (Cron)</option>
                              </select>
                            </div>
                          </div>

                          {/* Cron Expression (if Custom selected) */}
                          {config.intervalUnit === 'cron' && (
                            <div>
                              <label className={`${textSecondary} text-sm block mb-2`}>
                                Cron Expression
                              </label>
                              <input
                                type="text"
                                value={config.cronExpression || ''}
                                onChange={(e) => setConfig({ ...config, cronExpression: e.target.value })}
                                className={`w-full px-3 py-2 ${bgSecondary} border ${borderColor} rounded-lg ${textPrimary} font-mono focus:outline-none focus:border-[#00C6FF] transition-colors`}
                                placeholder="0 0 * * *"
                              />
                              <p className={`${textMuted} text-xs mt-1`}>
                                Example: "0 0 * * *" runs daily at midnight
                              </p>
                            </div>
                          )}

                          {/* Start Time (for time-based intervals) */}
                          {config.intervalUnit !== 'cron' && ['hours', 'days', 'weeks', 'months'].includes(config.intervalUnit) && (
                            <div>
                              <label className={`${textSecondary} text-sm block mb-2`}>
                                Start time
                              </label>
                              <input
                                type="time"
                                value={config.startTime || '00:00'}
                                onChange={(e) => setConfig({ ...config, startTime: e.target.value })}
                                className={`w-full px-3 py-2 ${bgSecondary} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:border-[#00C6FF] transition-colors`}
                              />
                            </div>
                          )}

                          {/* Start Date */}
                          <div>
                            <label className={`${textSecondary} text-sm block mb-2`}>
                              Start date (optional)
                            </label>
                            <input
                              type="date"
                              value={config.startDate || ''}
                              onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                              className={`w-full px-3 py-2 ${bgSecondary} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:border-[#00C6FF] transition-colors`}
                            />
                          </div>

                          {/* End Date */}
                          <div>
                            <label className={`${textSecondary} text-sm block mb-2`}>
                              End date (optional)
                            </label>
                            <input
                              type="date"
                              value={config.endDate || ''}
                              onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                              className={`w-full px-3 py-2 ${bgSecondary} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:border-[#00C6FF] transition-colors`}
                            />
                          </div>

                          {/* Fixed/Expression Toggle */}
                          <div>
                            <label className={`${textSecondary} text-sm block mb-2`}>
                              Mode
                            </label>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setConfig({ ...config, mode: 'fixed' })}
                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                                  config.mode === 'fixed' || !config.mode
                                    ? 'border-[#00C6FF] bg-[#00C6FF]/10 text-[#00C6FF]'
                                    : `${borderColor} ${textSecondary} hover:border-[#00C6FF]/30`
                                }`}
                              >
                                Fixed
                              </button>
                              <button
                                onClick={() => setConfig({ ...config, mode: 'expression' })}
                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                                  config.mode === 'expression'
                                    ? 'border-[#9D50BB] bg-[#9D50BB]/10 text-[#9D50BB]'
                                    : `${borderColor} ${textSecondary} hover:border-[#9D50BB]/30`
                                }`}
                              >
                                Expression
                              </button>
                            </div>
                            <p className={`${textMuted} text-xs mt-2`}>
                              {config.mode === 'expression' 
                                ? 'Use dynamic expressions with variables' 
                                : 'Use fixed values'}
                            </p>
                          </div>

                          {/* Schedule Preview */}
                          <div className={`${bgSecondary} rounded-lg p-4 mt-4`}>
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#00C6FF]/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-[#00C6FF]">📅</span>
                              </div>
                              <div className="flex-1">
                                <h4 className={`${textPrimary} text-sm font-medium mb-1`}>
                                  Schedule Preview
                                </h4>
                                <p className={`${textSecondary} text-xs`}>
                                  {config.intervalUnit === 'cron' && config.cronExpression
                                    ? `Cron: ${config.cronExpression}`
                                    : `Runs every ${config.interval || 1} ${config.intervalUnit || 'minutes'}${
                                        config.startTime ? ` at ${config.startTime}` : ''
                                      }`
                                  }
                                </p>
                                {config.startDate && (
                                  <p className={`${textMuted} text-xs mt-1`}>
                                    Starting: {new Date(config.startDate).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Other trigger types */}
                  {trigger.type !== 'schedule' && (
                    <div className={`${textSecondary} text-center py-12`}>
                      <p>Trigger parameters will be shown here</p>
                      <p className="text-sm mt-2">Configure when and how this trigger activates</p>
                    </div>
                  )}
                </div>
              )}

              {configTab === 'settings' && (
                <div className="max-w-3xl mx-auto">
                  <div className={`${textSecondary} text-center py-12`}>
                    <p>Trigger settings will be shown here</p>
                    <p className="text-sm mt-2">Additional configuration options</p>
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
            </div>

            {/* OUTPUT Sub Tabs */}
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
                <div className={`${textSecondary} text-center py-12`}>
                  <p>Execute this trigger to view data</p>
                  <p className="text-sm mt-2">or <span className="text-[#00C6FF] cursor-pointer">set mock data</span></p>
                </div>
              ) : (
                <>
                  {outputTab === 'schema' && (
                    <div className="space-y-2">
                      {Object.entries(executionData.output || {}).map(([key, value]) => (
                        <div key={key} className={`flex items-start gap-2 py-1.5 px-2 rounded hover:bg-[#13131F] transition-colors cursor-pointer`}>
                          <span className={`${textMuted} text-xs font-mono`}>T</span>
                          <div className="flex-1">
                            <div className={`${textPrimary} text-xs font-medium`}>{key}</div>
                            <div className={`${textSecondary} text-xs font-mono mt-0.5`}>
                              {JSON.stringify(value)}
                            </div>
                          </div>
                        </div>
                      ))}
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

        {/* Footer */}
        <div className={`${bgCard} border-t ${borderColor} px-6 py-4 flex items-center justify-end gap-3`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${textSecondary} hover:bg-white/5 transition-all`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white 
                       hover:opacity-90 transition-all font-medium"
          >
            Save Trigger
          </button>
        </div>
      </div>
    </div>
  );
}
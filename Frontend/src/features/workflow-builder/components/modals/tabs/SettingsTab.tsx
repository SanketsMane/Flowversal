/**
 * Settings Tab Component
 * Common settings for all nodes, triggers, and tools
 */

import React from 'react';
import { MoreVertical, ChevronDown } from 'lucide-react';

interface SettingsTabProps {
  settings: {
    alwaysOutputData: boolean;
    executeOnce: boolean;
    retryOnFail: boolean;
    onError: string;
    notes: string;
    displayNoteInFlow: boolean;
    maxTries: number;
    waitBetweenTries: number;
  };
  onSettingsChange: (settings: SettingsTabProps['settings']) => void;
  theme: string;
}

export function SettingsTab({ settings, onSettingsChange, theme }: SettingsTabProps) {
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgInput = theme === 'dark' ? 'bg-[#13131F]' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';

  const handleToggle = (key: keyof typeof settings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key]
    });
  };

  const handleChange = (key: keyof typeof settings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Always Output Data */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`${textPrimary} font-medium mb-1`}>Always Output Data</h3>
          <p className={`${textSecondary} text-sm`}>Always return data even if the node fails</p>
        </div>
        <button
          onClick={() => handleToggle('alwaysOutputData')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.alwaysOutputData ? 'bg-[#00C6FF]' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.alwaysOutputData ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Execute Once */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`${textPrimary} font-medium mb-1`}>Execute Once</h3>
          <p className={`${textSecondary} text-sm`}>Execute this node only once per workflow run</p>
        </div>
        <button
          onClick={() => handleToggle('executeOnce')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.executeOnce ? 'bg-[#00C6FF]' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.executeOnce ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Retry On Fail */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`${textPrimary} font-medium mb-1`}>Retry On Fail</h3>
          <p className={`${textSecondary} text-sm`}>Automatically retry if this node fails</p>
        </div>
        <button
          onClick={() => handleToggle('retryOnFail')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.retryOnFail ? 'bg-[#00C6FF]' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.retryOnFail ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Retry Settings - Only show if Retry On Fail is enabled */}
      {settings.retryOnFail && (
        <div className={`${bgInput} border ${borderColor} rounded-lg p-4 space-y-4`}>
          <div>
            <label className={`${textSecondary} text-sm mb-2 block`}>Max Tries</label>
            <input
              type="number"
              value={settings.maxTries}
              onChange={(e) => handleChange('maxTries', parseInt(e.target.value))}
              min={1}
              max={10}
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} focus:outline-none focus:border-[#00C6FF]`}
            />
          </div>
          <div>
            <label className={`${textSecondary} text-sm mb-2 block`}>Wait Between Tries (ms)</label>
            <input
              type="number"
              value={settings.waitBetweenTries}
              onChange={(e) => handleChange('waitBetweenTries', parseInt(e.target.value))}
              min={0}
              step={100}
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} focus:outline-none focus:border-[#00C6FF]`}
            />
          </div>
        </div>
      )}

      {/* On Error */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`${textPrimary} font-medium`}>On Error</h3>
          <button className={`p-1 ${textSecondary} hover:${textPrimary}`}>
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
        <div className="relative">
          <select
            value={settings.onError}
            onChange={(e) => handleChange('onError', e.target.value)}
            className={`w-full px-4 py-2.5 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} 
                       appearance-none focus:outline-none focus:border-[#00C6FF] cursor-pointer`}
          >
            <option value="Stop Workflow">Stop Workflow</option>
            <option value="Continue">Continue</option>
            <option value="Go to Error Output">Go to Error Output</option>
          </select>
          <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary} pointer-events-none`} />
        </div>
      </div>

      {/* Notes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`${textPrimary} font-medium`}>Notes</h3>
          <span className={`${textMuted} text-xs`}>Parameter: **</span>
        </div>
        <textarea
          value={settings.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Add notes about this node..."
          rows={4}
          className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} 
                     placeholder:${textSecondary} focus:outline-none focus:border-[#00C6FF] resize-none`}
        />
      </div>

      {/* Display Note in Flow */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`${textPrimary} font-medium mb-1`}>Display Note in Flow?</h3>
          <p className={`${textSecondary} text-sm`}>Show the note on the workflow canvas</p>
        </div>
        <button
          onClick={() => handleToggle('displayNoteInFlow')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.displayNoteInFlow ? 'bg-[#00C6FF]' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.displayNoteInFlow ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

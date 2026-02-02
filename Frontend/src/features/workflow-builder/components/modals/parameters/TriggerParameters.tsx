/**
 * Trigger Parameters Component
 * Renders different parameter UIs based on trigger type
 */

import React, { useState } from 'react';
import { Plus, X, Calendar, Clock } from 'lucide-react';
import { Trigger } from '../../../types';
import { DroppableInput } from '../DroppableInput';

interface TriggerParametersProps {
  trigger: Trigger;
  onSave: (config: any) => void;
  theme: string;
}

export function TriggerParameters({ trigger, onSave, theme }: TriggerParametersProps) {
  const [config, setConfig] = useState(trigger.config || {});
  
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgInput = theme === 'dark' ? 'bg-[#13131F]' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  const handleChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onSave(newConfig);
  };

  // Schedule Trigger - Enhanced with smart UI
  if (trigger.type === 'schedule') {
    const interval = config.interval || 'daily';
    const selectedDays = config.selectedDays || [];
    const dayOfMonth = config.dayOfMonth || 1;
    const selectedMonths = config.selectedMonths || [];
    const monthlyType = config.monthlyType || 'specific'; // 'specific' or 'ordinal'
    const ordinal = config.ordinal || 'first'; // 'first', 'second', 'third', 'fourth', 'last'
    const ordinalDay = config.ordinalDay || 0; // 0 = Sunday, 1 = Monday, etc.

    const weekDays = [
      { short: 'Sun', full: 'Sunday', value: 0 },
      { short: 'Mon', full: 'Monday', value: 1 },
      { short: 'Tue', full: 'Tuesday', value: 2 },
      { short: 'Wed', full: 'Wednesday', value: 3 },
      { short: 'Thu', full: 'Thursday', value: 4 },
      { short: 'Fri', full: 'Friday', value: 5 },
      { short: 'Sat', full: 'Saturday', value: 6 },
    ];

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const ordinals = [
      { value: 'first', label: '1st' },
      { value: 'second', label: '2nd' },
      { value: 'third', label: '3rd' },
      { value: 'fourth', label: '4th' },
      { value: 'last', label: 'Last' },
    ];

    const toggleDay = (day: number) => {
      const newDays = selectedDays.includes(day)
        ? selectedDays.filter((d: number) => d !== day)
        : [...selectedDays, day];
      handleChange('selectedDays', newDays);
    };

    const toggleMonth = (monthIndex: number) => {
      const newMonths = selectedMonths.includes(monthIndex)
        ? selectedMonths.filter((m: number) => m !== monthIndex)
        : [...selectedMonths, monthIndex];
      handleChange('selectedMonths', newMonths);
    };

    return (
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h3 className={`${textPrimary} text-lg font-medium`}>Trigger Times</h3>
          <p className={`${textSecondary} text-sm mt-1`}>
            Define when this workflow should execute
          </p>
        </div>

        {/* Interval & Time Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block ${textSecondary} text-sm mb-2`}>Interval</label>
            <select 
              value={interval}
              onChange={(e) => handleChange('interval', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} focus:outline-none focus:border-[#00C6FF] appearance-none cursor-pointer`}
            >
              <option value="minutely">Every Minute</option>
              <option value="every_5_minutes">Every 5 Minutes</option>
              <option value="every_15_minutes">Every 15 Minutes</option>
              <option value="every_30_minutes">Every 30 Minutes</option>
              <option value="hourly">Every Hour</option>
              <option value="every_6_hours">Every 6 Hours</option>
              <option value="every_12_hours">Every 12 Hours</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className={`block ${textSecondary} text-sm mb-2`}>Time</label>
            <div className="relative">
              <input
                type="time"
                value={config.time || '00:00'}
                onChange={(e) => handleChange('time', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} focus:outline-none focus:border-[#00C6FF]`}
              />
              <Clock className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary} pointer-events-none`} />
            </div>
          </div>
        </div>

        {/* Weekly - Day Selector */}
        {interval === 'weekly' && (
          <div className={`${bgInput} border ${borderColor} rounded-lg p-5`}>
            <label className={`block ${textPrimary} font-medium mb-3`}>Select Days</label>
            <div className="flex gap-2">
              {weekDays.map((day) => (
                <button
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all ${
                    selectedDays.includes(day.value)
                      ? 'border-[#00C6FF] bg-[#00C6FF]/20 text-[#00C6FF]'
                      : `border-${borderColor} ${bgCard} ${textSecondary} hover:border-[#00C6FF]/50`
                  }`}
                  title={day.full}
                >
                  <div className="text-xs font-medium">{day.short}</div>
                </button>
              ))}
            </div>
            {selectedDays.length === 0 && (
              <p className={`${textSecondary} text-xs mt-2`}>
                Please select at least one day
              </p>
            )}
          </div>
        )}

        {/* Monthly - Advanced Selector */}
        {interval === 'monthly' && (
          <div className={`${bgInput} border ${borderColor} rounded-lg p-5 space-y-4`}>
            <div>
              <label className={`block ${textPrimary} font-medium mb-3`}>Monthly Schedule Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleChange('monthlyType', 'specific')}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                    monthlyType === 'specific'
                      ? 'border-[#00C6FF] bg-[#00C6FF]/20 text-[#00C6FF]'
                      : `border-${borderColor} ${bgCard} ${textSecondary} hover:border-[#00C6FF]/50`
                  }`}
                >
                  Specific Day
                </button>
                <button
                  onClick={() => handleChange('monthlyType', 'ordinal')}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                    monthlyType === 'ordinal'
                      ? 'border-[#00C6FF] bg-[#00C6FF]/20 text-[#00C6FF]'
                      : `border-${borderColor} ${bgCard} ${textSecondary} hover:border-[#00C6FF]/50`
                  }`}
                >
                  Day of Week
                </button>
              </div>
            </div>

            {/* Specific Day of Month */}
            {monthlyType === 'specific' && (
              <div>
                <label className={`block ${textSecondary} text-sm mb-3`}>Day of Month</label>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      onClick={() => handleChange('dayOfMonth', day)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all ${
                        dayOfMonth === day
                          ? 'border-[#00C6FF] bg-[#00C6FF]/20 text-[#00C6FF]'
                          : `border-${borderColor} ${bgCard} ${textSecondary} hover:border-[#00C6FF]/50`
                      }`}
                    >
                      <div className="text-xs font-medium">{day}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ordinal Day of Week (1st Monday, 2nd Tuesday, etc.) */}
            {monthlyType === 'ordinal' && (
              <div className="space-y-4">
                <div>
                  <label className={`block ${textSecondary} text-sm mb-3`}>Select Occurrence</label>
                  <div className="flex gap-2">
                    {ordinals.map((ord) => (
                      <button
                        key={ord.value}
                        onClick={() => handleChange('ordinal', ord.value)}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                          ordinal === ord.value
                            ? 'border-[#00C6FF] bg-[#00C6FF]/20 text-[#00C6FF]'
                            : `border-${borderColor} ${bgCard} ${textSecondary} hover:border-[#00C6FF]/50`
                        }`}
                      >
                        {ord.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block ${textSecondary} text-sm mb-3`}>Select Day of Week</label>
                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day) => (
                      <button
                        key={day.value}
                        onClick={() => handleChange('ordinalDay', day.value)}
                        className={`px-3 py-2 rounded-lg border-2 transition-all ${
                          ordinalDay === day.value
                            ? 'border-[#00C6FF] bg-[#00C6FF]/20 text-[#00C6FF]'
                            : `border-${borderColor} ${bgCard} ${textSecondary} hover:border-[#00C6FF]/50`
                        }`}
                        title={day.full}
                      >
                        <div className="text-xs font-medium">{day.short}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className={`${bgCard} border ${borderColor} rounded-lg p-3`}>
                  <p className={`${textSecondary} text-xs mb-1`}>Preview:</p>
                  <p className={`${textPrimary} text-sm font-medium`}>
                    {ordinals.find(o => o.value === ordinal)?.label} {weekDays.find(d => d.value === ordinalDay)?.full} of every month
                  </p>
                </div>
              </div>
            )}

            {/* Optional: Select Specific Months */}
            <div className="pt-3 border-t border-[#2A2A3E]">
              <label className={`block ${textSecondary} text-sm mb-2`}>
                Run in specific months <span className="text-xs opacity-70">(Optional - leave all unchecked for every month)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {months.map((month, index) => (
                  <button
                    key={index}
                    onClick={() => toggleMonth(index)}
                    className={`px-3 py-2 rounded-lg border transition-all text-xs ${
                      selectedMonths.includes(index)
                        ? 'border-[#00C6FF] bg-[#00C6FF]/20 text-[#00C6FF]'
                        : `border-${borderColor} ${bgCard} ${textSecondary} hover:border-[#00C6FF]/50`
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Yearly - Month and Day Selector */}
        {interval === 'yearly' && (
          <div className={`${bgInput} border ${borderColor} rounded-lg p-5 space-y-4`}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block ${textSecondary} text-sm mb-2`}>Month</label>
                <select 
                  value={config.yearlyMonth || 0}
                  onChange={(e) => handleChange('yearlyMonth', parseInt(e.target.value))}
                  className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]`}
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block ${textSecondary} text-sm mb-2`}>Day</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={config.yearlyDay || 1}
                  onChange={(e) => handleChange('yearlyDay', parseInt(e.target.value))}
                  className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Start Date and End Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block ${textSecondary} text-sm mb-2`}>
              Start Date <span className="text-xs opacity-70">(Optional)</span>
            </label>
            <input
              type="date"
              value={config.startDate || ''}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} focus:outline-none focus:border-[#00C6FF]`}
            />
          </div>
          <div>
            <label className={`block ${textSecondary} text-sm mb-2`}>
              End Date <span className="text-xs opacity-70">(Optional)</span>
            </label>
            <input
              type="date"
              value={config.endDate || ''}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} focus:outline-none focus:border-[#00C6FF]`}
            />
          </div>
        </div>

        {/* Timezone */}
        <div>
          <label className={`block ${textSecondary} text-sm mb-2`}>Timezone</label>
          <select 
            value={config.timezone || 'UTC'}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} focus:outline-none focus:border-[#00C6FF] appearance-none cursor-pointer`}
          >
            <option value="UTC">UTC (Coordinated Universal Time)</option>
            <option value="America/New_York">America/New York (EST/EDT)</option>
            <option value="America/Chicago">America/Chicago (CST/CDT)</option>
            <option value="America/Denver">America/Denver (MST/MDT)</option>
            <option value="America/Los_Angeles">America/Los Angeles (PST/PDT)</option>
            <option value="Europe/London">Europe/London (GMT/BST)</option>
            <option value="Europe/Paris">Europe/Paris (CET/CEST)</option>
            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
            <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
            <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
            <option value="Australia/Sydney">Australia/Sydney (AEDT/AEST)</option>
          </select>
        </div>
      </div>
    );
  }

  // Webhook Trigger
  if (trigger.type === 'webhook') {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <label className={`block ${textSecondary} text-sm mb-2`}>Webhook URL</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value="https://api.flowversal.com/webhook/abc123"
              readOnly
              className={`flex-1 px-4 py-2 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} focus:outline-none`}
            />
            <button className="px-4 py-2 bg-[#00C6FF] text-white rounded-lg hover:opacity-90">
              Copy
            </button>
          </div>
        </div>

        <div>
          <label className={`block ${textSecondary} text-sm mb-2`}>HTTP Method</label>
          <div className="flex gap-2">
            {['GET', 'POST', 'PUT', 'DELETE'].map((method) => (
              <button
                key={method}
                onClick={() => handleChange('method', method)}
                className={`px-4 py-2 rounded-lg border ${borderColor} ${
                  config.method === method
                    ? 'bg-[#00C6FF] text-white border-[#00C6FF]'
                    : `${bgCard} ${textSecondary}`
                } transition-colors`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={`block ${textSecondary} text-sm mb-2`}>Authentication</label>
          <select 
            value={config.auth || 'none'}
            onChange={(e) => handleChange('auth', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} focus:outline-none focus:border-[#00C6FF]`}
          >
            <option value="none">None</option>
            <option value="api_key">API Key</option>
            <option value="bearer">Bearer Token</option>
            <option value="basic">Basic Auth</option>
          </select>
        </div>
      </div>
    );
  }

  // Form Submission Trigger
  if (trigger.type === 'form_submission') {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <label className={`block ${textSecondary} text-sm mb-2`}>Select Form</label>
          <select 
            value={config.formId || ''}
            onChange={(e) => handleChange('formId', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} focus:outline-none focus:border-[#00C6FF]`}
          >
            <option value="">Select a form...</option>
            <option value="form1">Contact Form</option>
            <option value="form2">Survey Form</option>
            <option value="form3">Registration Form</option>
          </select>
        </div>

        <div>
          <label className={`${textSecondary} text-sm flex items-center gap-2`}>
            <input 
              type="checkbox"
              checked={config.validateOnSubmit || false}
              onChange={(e) => handleChange('validateOnSubmit', e.target.checked)}
              className="w-4 h-4"
            />
            Validate form data on submission
          </label>
        </div>
      </div>
    );
  }

  // Default trigger parameters
  return (
    <div className="space-y-6 max-w-3xl">
      <div className={`${textSecondary} text-sm p-6 text-center`}>
        <p className="mb-2">Configure parameters for {trigger.label}</p>
        <p className="text-xs">Parameters will be available based on the trigger type</p>
      </div>
    </div>
  );
}
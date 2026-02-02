import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, MoreVertical, ChevronDown } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';

interface HTTPRequestParametersProps {
  httpMethod: string;
  setHttpMethod: (method: string) => void;
  httpUrl: string;
  setHttpUrl: (url: string) => void;
  authentication: string;
  setAuthentication: (auth: string) => void;
  sendQueryParams: boolean;
  setSendQueryParams: (send: boolean) => void;
  sendHeaders: boolean;
  setSendHeaders: (send: boolean) => void;
  sendBody: boolean;
  setSendBody: (send: boolean) => void;
  selectedOptions: string[];
  setSelectedOptions: (options: string[]) => void;
  methodMode: 'fixed' | 'expression';
  setMethodMode: (mode: 'fixed' | 'expression') => void;
  showMethodDropdown: boolean;
  setShowMethodDropdown: (show: boolean) => void;
  showOptionsDropdown: boolean;
  setShowOptionsDropdown: (show: boolean) => void;
}

const httpMethods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT'];
const optionsList = [
  'Batching',
  'Ignore SSL Issues (Insecure)',
  'Lowercase Headers',
  'Redirects',
  'Response',
  'Pagination',
  'Proxy',
  'Timeout'
];

export function HTTPRequestParameters({
  httpMethod,
  setHttpMethod,
  httpUrl,
  setHttpUrl,
  authentication,
  setAuthentication,
  sendQueryParams,
  setSendQueryParams,
  sendHeaders,
  setSendHeaders,
  sendBody,
  setSendBody,
  selectedOptions,
  setSelectedOptions,
  methodMode,
  setMethodMode,
  showMethodDropdown,
  setShowMethodDropdown,
  showOptionsDropdown,
  setShowOptionsDropdown
}: HTTPRequestParametersProps) {
  const { theme } = useTheme();
  const bgPrimary = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgSecondary = theme === 'dark' ? 'bg-[#13131F]' : 'bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';

  const methodDropdownRef = useRef<HTMLDivElement>(null);
  const optionsDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (methodDropdownRef.current && !methodDropdownRef.current.contains(event.target as Node)) {
        setShowMethodDropdown(false);
      }
      if (optionsDropdownRef.current && !optionsDropdownRef.current.contains(event.target as Node)) {
        setShowOptionsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowMethodDropdown, setShowOptionsDropdown]);

  const handleAddOption = (option: string) => {
    if (!selectedOptions.includes(option)) {
      setSelectedOptions([...selectedOptions, option]);
    }
    setShowOptionsDropdown(false);
  };

  const handleFieldDrop = (e: React.DragEvent, setValue: (value: string) => void, currentValue: string) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const variableRef = `{{${data.nodeName ? data.nodeName + '.' : ''}${data.fieldName}}}`;
      setValue(currentValue + variableRef);
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Import cURL Button */}
      <div className="flex justify-end">
        <button className={`px-4 py-2 ${bgCard} border ${borderColor} rounded-lg ${textPrimary} text-sm ${theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-100'} transition-colors`}>
          Import cURL
        </button>
      </div>

      {/* Method */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className={`${textPrimary} text-sm`}>Method</label>
            <HelpCircle className={`w-4 h-4 ${textMuted}`} />
          </div>
          <div className="flex items-center gap-2">
            <MoreVertical className={`w-4 h-4 ${textMuted} cursor-pointer`} />
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMethodMode('fixed')}
                className={`px-3 py-1 text-xs rounded-l transition-colors ${
                  methodMode === 'fixed'
                    ? `${bgSecondary} ${textPrimary} border ${borderColor}`
                    : `${textMuted} hover:${textPrimary}`
                }`}
              >
                Fixed
              </button>
              <button
                onClick={() => setMethodMode('expression')}
                className={`px-3 py-1 text-xs rounded-r transition-colors ${
                  methodMode === 'expression'
                    ? `${bgSecondary} ${textPrimary} border ${borderColor}`
                    : `${textMuted} hover:${textPrimary}`
                }`}
              >
                Expression
              </button>
            </div>
          </div>
        </div>
        
        <div className="relative" ref={methodDropdownRef}>
          {methodMode === 'fixed' ? (
            <>
              <button
                onClick={() => setShowMethodDropdown(!showMethodDropdown)}
                className={`w-full px-3 py-2 ${bgCard} border-2 border-[#00C6FF] rounded-lg ${textPrimary} text-sm text-left focus:outline-none transition-colors flex items-center justify-between`}
              >
                {httpMethod}
                <ChevronDown className={`w-4 h-4 ${textMuted}`} />
              </button>
              
              {showMethodDropdown && (
                <div className={`absolute z-10 w-full mt-1 ${bgCard} border ${borderColor} rounded-lg shadow-xl overflow-hidden`}>
                  {httpMethods.map((method) => (
                    <button
                      key={method}
                      onClick={() => {
                        setHttpMethod(method);
                        setShowMethodDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        httpMethod === method
                          ? theme === 'dark' 
                            ? 'text-[#FF6B6B] bg-[#2A2A3E]'
                            : 'text-[#FF6B6B] bg-gray-100'
                          : theme === 'dark'
                            ? `${textPrimary} hover:bg-[#2A2A3E]`
                            : `${textPrimary} hover:bg-gray-50`
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <input
              type="text"
              value={httpMethod}
              onChange={(e) => setHttpMethod(e.target.value)}
              onDrop={(e) => handleFieldDrop(e, setHttpMethod, httpMethod)}
              onDragOver={(e) => e.preventDefault()}
              placeholder="Enter method or drag variable"
              className={`w-full px-3 py-2 ${bgCard} border-2 border-[#00C6FF] rounded-lg ${textPrimary} text-sm placeholder:${textMuted} focus:outline-none focus:border-[#9D50BB] transition-colors`}
            />
          )}
        </div>
      </div>

      {/* URL */}
      <div className="space-y-2">
        <label className={`${textPrimary} text-sm`}>URL</label>
        <input
          type="text"
          value={httpUrl}
          onChange={(e) => setHttpUrl(e.target.value)}
          onDrop={(e) => handleFieldDrop(e, setHttpUrl, httpUrl)}
          onDragOver={(e) => e.preventDefault()}
          placeholder="http://example.com/index.html"
          className={`w-full px-3 py-2 ${bgCard} border ${borderColor} rounded-lg ${textPrimary} text-sm placeholder:${textMuted} focus:outline-none focus:border-[#00C6FF] transition-colors`}
        />
      </div>

      {/* Authentication */}
      <div className="space-y-2">
        <label className={`${textPrimary} text-sm`}>Authentication</label>
        <div className="relative">
          <select
            value={authentication}
            onChange={(e) => setAuthentication(e.target.value)}
            className={`w-full px-3 py-2 ${bgCard} border ${borderColor} rounded-lg ${textPrimary} text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#00C6FF] transition-colors`}
          >
            <option value="None">None</option>
            <option value="Basic Auth">Basic Auth</option>
            <option value="Bearer Token">Bearer Token</option>
            <option value="OAuth2">OAuth2</option>
            <option value="API Key">API Key</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Send Query Parameters */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className={`${textPrimary} text-sm`}>Send Query Parameters</label>
          <button
            onClick={() => setSendQueryParams(!sendQueryParams)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              sendQueryParams ? 'bg-[#00C6FF]' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                sendQueryParams ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Send Headers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className={`${textPrimary} text-sm`}>Send Headers</label>
          <button
            onClick={() => setSendHeaders(!sendHeaders)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              sendHeaders ? 'bg-[#00C6FF]' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                sendHeaders ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Send Body */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className={`${textPrimary} text-sm`}>Send Body</label>
          <button
            onClick={() => setSendBody(!sendBody)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              sendBody ? 'bg-[#00C6FF]' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                sendBody ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <label className={`${textPrimary} text-sm`}>Options</label>
        
        {selectedOptions.length === 0 && (
          <p className={`${textMuted} text-sm`}>No properties</p>
        )}

        {/* Display selected options */}
        {selectedOptions.map((option, index) => (
          <div key={index} className={`flex items-center justify-between px-3 py-2 ${bgSecondary} border ${borderColor} rounded-lg`}>
            <span className={`${textPrimary} text-sm`}>{option}</span>
            <button
              onClick={() => setSelectedOptions(selectedOptions.filter(o => o !== option))}
              className={`text-red-500 hover:text-red-400 text-sm`}
            >
              ×
            </button>
          </div>
        ))}

        {/* Add option dropdown */}
        <div className="relative" ref={optionsDropdownRef}>
          <button
            onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
            className={`w-full px-3 py-2 ${bgCard} border ${borderColor} rounded-lg ${textPrimary} text-sm text-left focus:outline-none transition-colors flex items-center justify-between ${theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-100'}`}
          >
            Add option
            <ChevronDown className={`w-4 h-4 ${textMuted} transform transition-transform ${showOptionsDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showOptionsDropdown && (
            <div className={`absolute z-10 w-full mt-1 ${bgCard} border ${borderColor} rounded-lg shadow-xl overflow-hidden max-h-64 overflow-y-auto`}>
              {optionsList.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAddOption(option)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                    selectedOptions.includes(option)
                      ? theme === 'dark'
                        ? `${textMuted} cursor-not-allowed bg-[#13131F]`
                        : 'text-gray-400 cursor-not-allowed bg-gray-100'
                      : theme === 'dark'
                        ? `${textPrimary} hover:bg-[#2A2A3E]`
                        : `${textPrimary} hover:bg-gray-50`
                  }`}
                  disabled={selectedOptions.includes(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info message */}
      <div className={`p-3 ${bgSecondary} border-l-4 border-yellow-500 rounded`}>
        <p className={`${textSecondary} text-xs`}>
          You can view the raw requests this node makes in your browser's developer console
        </p>
      </div>
    </div>
  );
}

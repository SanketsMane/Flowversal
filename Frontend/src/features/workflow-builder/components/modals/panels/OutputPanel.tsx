/**
 * Output Panel Component
 * Shows output data from node/trigger execution
 */

import React, { useState } from 'react';
import { FileText, Table, Braces, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { useDrag } from 'react-dnd';

interface OutputPanelProps {
  outputTab: 'schema' | 'table' | 'json';
  setOutputTab: (tab: 'schema' | 'table' | 'json') => void;
  executionData: any;
  onExecute: () => void;
  theme: string;
}

export function OutputPanel({ outputTab, setOutputTab, executionData, onExecute, theme }: OutputPanelProps) {
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgSecondary = theme === 'dark' ? 'bg-[#13131F]' : 'bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className={`w-[320px] ${bgCard} border-l ${borderColor} flex flex-col overflow-hidden`}>
      
      {/* OUTPUT Header */}
      <div className={`${bgSecondary} px-4 py-3 border-b ${borderColor} flex items-center justify-between`}>
        <h3 className={`${textPrimary} font-medium`}>OUTPUT</h3>
        {executionData && (
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
            Keep (1 item)
          </span>
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
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className={`${textPrimary} font-medium mb-2`}>Execute this node to view data</div>
            <div className={`${textSecondary} text-sm mb-4`}>or</div>
            <button
              onClick={onExecute}
              className="text-[#00C6FF] text-sm hover:underline"
            >
              set mock data
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {outputTab === 'schema' && (
              <OutputSchemaView data={executionData} theme={theme} />
            )}

            {outputTab === 'table' && (
              <OutputTableView data={executionData} theme={theme} />
            )}

            {outputTab === 'json' && (
              <OutputJsonView data={executionData} theme={theme} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Draggable Output Variable Component
interface DraggableOutputVariableProps {
  variablePath: string;
  displayName: string;
  value: any;
  theme: string;
}

function DraggableOutputVariable({ variablePath, displayName, value, theme }: DraggableOutputVariableProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'VARIABLE',
    item: { variablePath, displayName, value },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const bgSecondary = theme === 'dark' ? 'bg-[#13131F]' : 'bg-gray-100';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <div
      ref={drag}
      className={`group flex items-start gap-2 p-2 rounded hover:${bgSecondary} transition-colors cursor-move ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      title="Drag to use this variable"
    >
      <GripVertical className={`w-3 h-3 ${textMuted} mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className={`${textMuted} text-[10px] mt-0.5`}>T</div>
      <div className="flex-1 min-w-0">
        <div className={`${textPrimary} text-xs font-medium truncate`}>{displayName}</div>
        <div className={`${textSecondary} text-[10px] truncate`}>
          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </div>
      </div>
      <div className={`${textMuted} text-[10px] opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white px-1.5 py-0.5 rounded whitespace-nowrap`}>
        {`{{${variablePath}}}`}
      </div>
    </div>
  );
}

// Output Schema View
interface OutputSchemaViewProps {
  data: any;
  theme: string;
}

function OutputSchemaView({ data, theme }: OutputSchemaViewProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgSecondary = theme === 'dark' ? 'bg-[#13131F]' : 'bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';

  const fields = Object.entries(data);

  return (
    <div className={`${bgCard} border ${borderColor} rounded-lg p-2`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center gap-2 p-2 rounded hover:${bgSecondary} transition-colors`}
      >
        {isExpanded ? (
          <ChevronDown className={`w-4 h-4 ${textSecondary}`} />
        ) : (
          <ChevronRight className={`w-4 h-4 ${textSecondary}`} />
        )}
        <span className={`${textPrimary} text-xs flex-1 text-left font-medium`}>Output Fields</span>
        <span className={`${textMuted} text-xs`}>{fields.length} items</span>
      </button>

      {isExpanded && (
        <div className="ml-6 space-y-1 mt-1">
          {fields.map(([key, value]: [string, any], index) => (
            <DraggableOutputVariable
              key={index}
              variablePath={`output.${key}`}
              displayName={key}
              value={value}
              theme={theme}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Output Table View
interface OutputTableViewProps {
  data: any;
  theme: string;
}

function OutputTableView({ data, theme }: OutputTableViewProps) {
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  return (
    <div className={`${bgCard} border ${borderColor} rounded-lg overflow-hidden`}>
      <div className="px-3 py-2 bg-[#13131F] border-b border-[#2A2A3E]">
        <h4 className={`${textPrimary} text-xs font-medium`}>Output Data</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#2A2A3E]">
              <th className={`${textSecondary} text-left px-3 py-2 font-medium`}>Field</th>
              <th className={`${textSecondary} text-left px-3 py-2 font-medium`}>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([key, value]: [string, any], index) => (
              <tr key={index} className="border-b border-[#2A2A3E] last:border-0">
                <td className={`${textSecondary} px-3 py-2`}>{key}</td>
                <td className={`${textPrimary} px-3 py-2 font-mono text-[10px]`}>
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Output JSON View
interface OutputJsonViewProps {
  data: any;
  theme: string;
}

function OutputJsonView({ data, theme }: OutputJsonViewProps) {
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgSecondary = theme === 'dark' ? 'bg-[#13131F]' : 'bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${bgCard} border ${borderColor} rounded-lg overflow-hidden`}>
      <div className="px-3 py-2 bg-[#13131F] border-b border-[#2A2A3E] flex items-center justify-between">
        <h4 className={`${textPrimary} text-xs font-medium`}>JSON Data</h4>
        <button
          onClick={handleCopy}
          className="text-xs text-[#00C6FF] hover:text-[#00C6FF]/80 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className={`${textPrimary} text-[10px] font-mono p-3 overflow-x-auto max-h-[500px] overflow-y-auto ${bgSecondary}`}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
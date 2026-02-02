/**
 * Input Panel Component
 * Shows variables and context from previous nodes + current item metadata
 */

import React, { useState, ReactNode } from 'react';
import { FileText, Table, Braces, ChevronDown, ChevronRight, Filter, Info, GripVertical } from 'lucide-react';
import { useDrag } from 'react-dnd';

interface InputPanelProps {
  inputTab: 'schema' | 'table' | 'json';
  setInputTab: (tab: 'schema' | 'table' | 'json') => void;
  previousNodes: Array<{
    id: string;
    label: string;
    icon: ReactNode;
    outputs: any;
  }>;
  theme: string;
  // Current item info
  currentItem?: {
    id: string;
    label: string;
    type: string;
  };
}

export function InputPanel({ inputTab, setInputTab, previousNodes, theme, currentItem }: InputPanelProps) {
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgSecondary = theme === 'dark' ? 'bg-[#13131F]' : 'bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';

  // Collect all data for table/json views
  const allData: any = {};
  
  if (currentItem) {
    allData['Current Item'] = {
      id: currentItem.id,
      label: currentItem.label,
      type: currentItem.type,
    };
  }

  previousNodes.forEach((node) => {
    if (node.outputs) {
      allData[node.label] = node.outputs;
    }
  });

  return (
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
            {inputTab === 'schema' && 'Drag variables to parameter fields'}
            {inputTab === 'table' && 'View data in table format'}
            {inputTab === 'json' && 'View data in JSON format'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {inputTab === 'schema' && (
            <div className="space-y-2">
              {/* Current Item Metadata */}
              {currentItem && (
                <CurrentItemSection
                  item={currentItem}
                  theme={theme}
                />
              )}

              {/* Previous Nodes */}
              {previousNodes.length === 0 ? (
                <div className={`${textMuted} text-xs text-center py-8`}>
                  No previous nodes/triggers
                </div>
              ) : (
                previousNodes.map((node) => (
                  <PreviousNodeSection
                    key={node.id}
                    nodeName={node.label}
                    nodeId={node.id}
                    icon={node.icon}
                    outputs={node.outputs}
                    theme={theme}
                  />
                ))
              )}
            </div>
          )}

          {inputTab === 'table' && (
            <TableView data={allData} theme={theme} />
          )}

          {inputTab === 'json' && (
            <JsonView data={allData} theme={theme} />
          )}
        </div>
      </div>
    </div>
  );
}

// Draggable Variable Component
interface DraggableVariableProps {
  variablePath: string;
  displayName: string;
  value: any;
  theme: string;
}

function DraggableVariable({ variablePath, displayName, value, theme }: DraggableVariableProps) {
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

  return (
    <div
      ref={drag}
      className={`group flex items-start gap-2 p-1.5 rounded hover:${bgSecondary} transition-colors cursor-move ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      title="Drag to use this variable"
    >
      <GripVertical className={`w-3 h-3 ${textMuted} mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className={`${textMuted} text-[10px] mt-0.5`}>T</div>
      <div className="flex-1 min-w-0">
        <div className={`${textSecondary} text-xs truncate`}>{displayName}</div>
        <div className={`${textMuted} text-[10px] truncate font-mono`}>
          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </div>
      </div>
      <div className={`${textMuted} text-[10px] opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white px-1.5 py-0.5 rounded whitespace-nowrap`}>
        {`{{${variablePath}}}`}
      </div>
    </div>
  );
}

// Table View Component
interface TableViewProps {
  data: any;
  theme: string;
}

function TableView({ data, theme }: TableViewProps) {
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';

  if (Object.keys(data).length === 0) {
    return (
      <div className={`${textMuted} text-xs text-center py-8`}>
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]: [string, any]) => (
        <div key={key} className={`${bgCard} border ${borderColor} rounded-lg overflow-hidden`}>
          <div className="px-3 py-2 bg-[#13131F] border-b border-[#2A2A3E]">
            <h4 className={`${textPrimary} text-xs font-medium`}>{key}</h4>
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
                {typeof value === 'object' && value !== null ? (
                  Object.entries(value).map(([field, val]: [string, any], index) => (
                    <tr key={index} className="border-b border-[#2A2A3E] last:border-0">
                      <td className={`${textSecondary} px-3 py-2`}>{field}</td>
                      <td className={`${textPrimary} px-3 py-2 font-mono text-[10px]`}>
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className={`${textSecondary} px-3 py-2`}>value</td>
                    <td className={`${textPrimary} px-3 py-2 font-mono`}>{String(value)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// JSON View Component
interface JsonViewProps {
  data: any;
  theme: string;
}

function JsonView({ data, theme }: JsonViewProps) {
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (Object.keys(data).length === 0) {
    return (
      <div className={`${textMuted} text-xs text-center py-8`}>
        No data available
      </div>
    );
  }

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
      <pre className={`${textPrimary} text-[10px] font-mono p-3 overflow-x-auto max-h-[500px] overflow-y-auto`}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

// Current Item Section - Shows metadata about current node/trigger
interface CurrentItemSectionProps {
  item: {
    id: string;
    label: string;
    type: string;
  };
  theme: string;
}

function CurrentItemSection({ item, theme }: CurrentItemSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const bgSecondary = theme === 'dark' ? 'bg-[#13131F]' : 'bg-gray-100';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';

  const metadata = [
    { name: 'id', value: item.id, path: 'current.id' },
    { name: 'label', value: item.label, path: 'current.label' },
    { name: 'type', value: item.type, path: 'current.type' },
  ];

  return (
    <div className={`${bgCard} border ${borderColor} rounded-lg p-2 mb-3`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center gap-2 p-2 rounded hover:${bgSecondary} transition-colors`}
      >
        {isExpanded ? (
          <ChevronDown className={`w-4 h-4 ${textSecondary}`} />
        ) : (
          <ChevronRight className={`w-4 h-4 ${textSecondary}`} />
        )}
        <Info className={`w-4 h-4 text-[#00C6FF]`} />
        <span className={`${textPrimary} text-xs flex-1 text-left font-medium`}>Current Item</span>
        <span className={`${textMuted} text-xs`}>{metadata.length} items</span>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="ml-6 space-y-1 mt-1">
          {metadata.map((field, index) => (
            <DraggableVariable
              key={index}
              variablePath={field.path}
              displayName={field.name}
              value={field.value}
              theme={theme}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Previous Node Section Component
interface PreviousNodeSectionProps {
  nodeName: string;
  nodeId: string;
  icon: ReactNode;
  outputs: any;
  theme: string;
}

function PreviousNodeSection({ nodeName, nodeId, icon, outputs, theme }: PreviousNodeSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const bgSecondary = theme === 'dark' ? 'bg-[#13131F]' : 'bg-gray-100';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';

  const outputFields = outputs ? Object.entries(outputs) : [];
  const itemCount = outputFields.length;

  return (
    <div>
      {/* Node Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center gap-2 p-2 rounded hover:${bgSecondary} transition-colors`}
      >
        {isExpanded ? (
          <ChevronDown className={`w-4 h-4 ${textSecondary}`} />
        ) : (
          <ChevronRight className={`w-4 h-4 ${textSecondary}`} />
        )}
        <div className={textSecondary}>{icon}</div>
        <span className={`${textPrimary} text-xs flex-1 text-left`}>{nodeName}</span>
        <span className={`${textMuted} text-xs`}>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="ml-6 space-y-1">
          {/* Filter Section */}
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className={`w-full flex items-center gap-2 p-1.5 rounded hover:${bgSecondary} transition-colors`}
          >
            {isFilterExpanded ? (
              <ChevronDown className={`w-3.5 h-3.5 ${textSecondary}`} />
            ) : (
              <ChevronRight className={`w-3.5 h-3.5 ${textSecondary}`} />
            )}
            <Filter className={`w-3.5 h-3.5 ${textSecondary}`} />
            <span className={`${textSecondary} text-xs flex-1 text-left`}>Filter</span>
            <span className={`${textMuted} text-xs`}>{itemCount} items</span>
          </button>

          {/* Fields */}
          {isFilterExpanded && (
            <div className="ml-5 space-y-1">
              {outputFields.map(([key, value]: [string, any], index) => (
                <DraggableVariable
                  key={index}
                  variablePath={`${nodeId}.${key}`}
                  displayName={key}
                  value={value}
                  theme={theme}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
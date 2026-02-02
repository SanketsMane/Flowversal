/**
 * Node Parameters Component
 * Renders different parameter UIs based on node type
 */

import React, { useState } from 'react';
import { WorkflowNode } from '../../../types';
import { HTTPRequestParameters } from '../HTTPRequestParameters';
import { ConditionConfiguration } from '../ConditionConfiguration';
import { FormBuilderTab } from '../FormBuilderTab';
import { FormBuilderParameters } from '../FormBuilderParameters';

interface NodeParametersProps {
  node: WorkflowNode;
  onSave: (config: any) => void;
  containerId: string;
  theme: string;
}

export function NodeParameters({ node, onSave, containerId, theme }: NodeParametersProps) {
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  // State for conditions (IF/Switch nodes)
  const [conditions, setConditions] = useState(() => {
    // Initialize with one condition if it's an IF or SWITCH node
    if (node.label === 'If' || node.label === 'Switch') {
      return node.config?.conditions || [{
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
  const [convertTypes, setConvertTypes] = useState(node.config?.convertTypes || false);

  // Update node config when conditions change
  const handleConditionsChange = (newConditions: any[]) => {
    setConditions(newConditions);
    onSave({
      ...node.config,
      conditions: newConditions,
      convertTypes
    });
  };

  const handleConvertTypesChange = (value: boolean) => {
    setConvertTypes(value);
    onSave({
      ...node.config,
      conditions,
      convertTypes: value
    });
  };

  // Form Node - Show Form Builder
  if (node.type === 'form') {
    return (
      <FormBuilderTab
        node={node}
        onSave={onSave}
        containerId={containerId}
      />
    );
  }

  // HTTP Request Node
  if (node.type === 'http_request') {
    return (
      <HTTPRequestParameters
        node={node}
        onSave={onSave}
      />
    );
  }

  // If/Switch Node - Condition Configuration
  if (node.label === 'If' || node.label === 'Switch') {
    return (
      <ConditionConfiguration
        conditions={conditions}
        setConditions={handleConditionsChange}
        convertTypes={convertTypes}
        setConvertTypes={handleConvertTypesChange}
        theme={theme}
      />
    );
  }

  // AI Nodes (OpenAI, Anthropic, etc.)
  if (node.type === 'openai_chat' || node.type === 'anthropic_chat') {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <label className={`block ${textSecondary} text-sm mb-2`}>Model</label>
          <input
            type="text"
            placeholder="gpt-4"
            className="w-full px-4 py-2 rounded-lg border border-[#2A2A3E] bg-[#1A1A2E] text-white focus:outline-none focus:border-[#00C6FF]"
          />
        </div>
        <div>
          <label className={`block ${textSecondary} text-sm mb-2`}>Prompt</label>
          <textarea
            rows={6}
            placeholder="Enter your prompt..."
            className="w-full px-4 py-2 rounded-lg border border-[#2A2A3E] bg-[#1A1A2E] text-white focus:outline-none focus:border-[#00C6FF] resize-none"
          />
        </div>
        <div>
          <label className={`block ${textSecondary} text-sm mb-2`}>Temperature</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="2"
            placeholder="0.7"
            className="w-full px-4 py-2 rounded-lg border border-[#2A2A3E] bg-[#1A1A2E] text-white focus:outline-none focus:border-[#00C6FF]"
          />
        </div>
      </div>
    );
  }

  // Database Nodes
  if (node.type === 'database_query') {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <label className={`block ${textSecondary} text-sm mb-2`}>Connection</label>
          <select className="w-full px-4 py-2 rounded-lg border border-[#2A2A3E] bg-[#1A1A2E] text-white focus:outline-none focus:border-[#00C6FF]">
            <option>Select connection...</option>
          </select>
        </div>
        <div>
          <label className={`block ${textSecondary} text-sm mb-2`}>Query</label>
          <textarea
            rows={8}
            placeholder="SELECT * FROM table WHERE..."
            className="w-full px-4 py-2 rounded-lg border border-[#2A2A3E] bg-[#1A1A2E] text-white focus:outline-none focus:border-[#00C6FF] resize-none font-mono"
          />
        </div>
      </div>
    );
  }

  // Default parameters for other nodes
  return (
    <div className="space-y-6 max-w-3xl">
      <div className={`${textSecondary} text-sm p-6 text-center`}>
        <p className="mb-2">Configure parameters for {node.label}</p>
        <p className="text-xs">Parameters will be available based on the node type</p>
      </div>
    </div>
  );
}
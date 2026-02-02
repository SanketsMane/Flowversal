/**
 * AI Agent Parameters Component
 * Configuration UI for AI Agent workflow nodes
 */

import React from 'react';
import { useTheme } from '../../../../../components/ThemeContext';
import { Brain, Zap, MessageSquare, Search, FileSearch, Bot, Sparkles, Settings, Info } from 'lucide-react';

interface AIAgentParametersProps {
  nodeType: string;
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export function AIAgentParameters({ nodeType, config, onChange }: AIAgentParametersProps) {
  const { theme } = useTheme();

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const inputBg = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';

  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const modelOptions = [
    { value: 'ChatGPT Model', label: 'ChatGPT (GPT-4)' },
    { value: 'Gemini Model', label: 'Google Gemini' },
    { value: 'Deepseek Model', label: 'Deepseek' },
    { value: 'Hybrid Model', label: 'Hybrid Model' }
  ];

  // Render different configuration based on node type
  const renderConfiguration = () => {
    switch (nodeType) {
      case 'ai-chat-agent':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-[#00C6FF]" />
              <h3 className={`font-medium ${textPrimary}`}>AI Chat Agent Configuration</h3>
            </div>

            {/* Model Selection */}
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                AI Model
              </label>
              <select
                value={config.model || 'ChatGPT Model'}
                onChange={(e) => updateConfig('model', e.target.value)}
                className={`w-full px-3 py-2 ${inputBg} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:border-[#00C6FF] transition-colors`}
              >
                {modelOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* System Prompt */}
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                System Prompt
              </label>
              <textarea
                value={config.systemPrompt || ''}
                onChange={(e) => updateConfig('systemPrompt', e.target.value)}
                placeholder="Define the AI's role and behavior..."
                rows={3}
                className={`w-full px-3 py-2 ${inputBg} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:border-[#00C6FF] transition-colors resize-none`}
              />
            </div>

            {/* Temperature */}
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                Temperature: {config.temperature || 0.7}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.temperature || 0.7}
                onChange={(e) => updateConfig('temperature', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>

            {/* Max Tokens */}
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                Max Tokens
              </label>
              <input
                type="number"
                value={config.maxTokens || 2000}
                onChange={(e) => updateConfig('maxTokens', parseInt(e.target.value))}
                className={`w-full px-3 py-2 ${inputBg} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:border-[#00C6FF] transition-colors`}
              />
            </div>

            {/* Memory Toggle */}
            <div className="flex items-center justify-between">
              <label className={`text-sm ${textSecondary}`}>
                Enable Conversation Memory
              </label>
              <input
                type="checkbox"
                checked={config.memory !== false}
                onChange={(e) => updateConfig('memory', e.target.checked)}
                className="w-4 h-4"
              />
            </div>
          </div>
        );

      case 'workflow-generator':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-[#9D50BB]" />
              <h3 className={`font-medium ${textPrimary}`}>Workflow Generator Configuration</h3>
            </div>

            {/* Model Selection */}
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                AI Model
              </label>
              <select
                value={config.model || 'ChatGPT Model'}
                onChange={(e) => updateConfig('model', e.target.value)}
                className={`w-full px-3 py-2 ${inputBg} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:border-[#00C6FF] transition-colors`}
              >
                {modelOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Auto Create */}
            <div className="flex items-center justify-between">
              <div>
                <label className={`text-sm ${textPrimary}`}>
                  Auto-Create Workflow
                </label>
                <p className={`text-xs ${textSecondary} mt-1`}>
                  Automatically create the workflow when generated
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.autoCreate || false}
                onChange={(e) => updateConfig('autoCreate', e.target.checked)}
                className="w-4 h-4"
              />
            </div>

            {/* Validate */}
            <div className="flex items-center justify-between">
              <div>
                <label className={`text-sm ${textPrimary}`}>
                  Validate Workflow
                </label>
                <p className={`text-xs ${textSecondary} mt-1`}>
                  Validate the generated workflow before creation
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.validate !== false}
                onChange={(e) => updateConfig('validate', e.target.checked)}
                className="w-4 h-4"
              />
            </div>
          </div>
        );

      case 'ai-agent-executor':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-[#0072FF]" />
              <h3 className={`font-medium ${textPrimary}`}>AI Agent Executor Configuration</h3>
            </div>

            {/* Model Selection */}
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                AI Model
              </label>
              <select
                value={config.model || 'ChatGPT Model'}
                onChange={(e) => updateConfig('model', e.target.value)}
                className={`w-full px-3 py-2 ${inputBg} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:border-[#00C6FF] transition-colors`}
              >
                {modelOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Available Tools */}
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                Available Tools (comma-separated)
              </label>
              <input
                type="text"
                value={Array.isArray(config.tools) ? config.tools.join(', ') : ''}
                onChange={(e) => updateConfig('tools', e.target.value.split(',').map(t => t.trim()))}
                placeholder="search, calculate, analyze"
                className={`w-full px-3 py-2 ${inputBg} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:border-[#00C6FF] transition-colors`}
              />
            </div>

            {/* Max Steps */}
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                Max Steps
              </label>
              <input
                type="number"
                value={config.maxSteps || 5}
                onChange={(e) => updateConfig('maxSteps', parseInt(e.target.value))}
                min="1"
                max="20"
                className={`w-full px-3 py-2 ${inputBg} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:border-[#00C6FF] transition-colors`}
              />
            </div>

            {/* Show Reasoning */}
            <div className="flex items-center justify-between">
              <label className={`text-sm ${textSecondary}`}>
                Show Reasoning Process
              </label>
              <input
                type="checkbox"
                checked={config.showReasoning !== false}
                onChange={(e) => updateConfig('showReasoning', e.target.checked)}
                className="w-4 h-4"
              />
            </div>
          </div>
        );

      case 'rag-search':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-[#00D9FF]" />
              <h3 className={`font-medium ${textPrimary}`}>RAG Search Configuration</h3>
            </div>

            {/* Collection */}
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                Collection
              </label>
              <input
                type="text"
                value={config.collection || 'workflows'}
                onChange={(e) => updateConfig('collection', e.target.value)}
                placeholder="workflows"
                className={`w-full px-3 py-2 ${inputBg} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:border-[#00C6FF] transition-colors`}
              />
            </div>

            {/* Result Limit */}
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                Result Limit
              </label>
              <input
                type="number"
                value={config.limit || 5}
                onChange={(e) => updateConfig('limit', parseInt(e.target.value))}
                min="1"
                max="50"
                className={`w-full px-3 py-2 ${inputBg} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:border-[#00C6FF] transition-colors`}
              />
            </div>

            {/* Min Relevance */}
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                Minimum Relevance: {config.minRelevance || 0.7}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.minRelevance || 0.7}
                onChange={(e) => updateConfig('minRelevance', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Include Embeddings */}
            <div className="flex items-center justify-between">
              <label className={`text-sm ${textSecondary}`}>
                Include Embeddings in Output
              </label>
              <input
                type="checkbox"
                checked={config.includeEmbeddings || false}
                onChange={(e) => updateConfig('includeEmbeddings', e.target.checked)}
                className="w-4 h-4"
              />
            </div>
          </div>
        );

      case 'semantic-analyzer':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileSearch className="w-5 h-5 text-[#7C3AED]" />
              <h3 className={`font-medium ${textPrimary}`}>Semantic Analyzer Configuration</h3>
            </div>

            {/* Analysis Type */}
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                Analysis Type
              </label>
              <select
                value={config.analysisType || 'all'}
                onChange={(e) => updateConfig('analysisType', e.target.value)}
                className={`w-full px-3 py-2 ${inputBg} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:border-[#00C6FF] transition-colors`}
              >
                <option value="all">All Analysis</option>
                <option value="sentiment">Sentiment Only</option>
                <option value="entities">Entities Only</option>
                <option value="intent">Intent Only</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                Language
              </label>
              <input
                type="text"
                value={config.language || 'en'}
                onChange={(e) => updateConfig('language', e.target.value)}
                placeholder="en"
                className={`w-full px-3 py-2 ${inputBg} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:border-[#00C6FF] transition-colors`}
              />
            </div>

            {/* Analysis Options */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-sm ${textSecondary}`}>
                  Include Entities
                </label>
                <input
                  type="checkbox"
                  checked={config.includeEntities !== false}
                  onChange={(e) => updateConfig('includeEntities', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className={`text-sm ${textSecondary}`}>
                  Include Sentiment
                </label>
                <input
                  type="checkbox"
                  checked={config.includeSentiment !== false}
                  onChange={(e) => updateConfig('includeSentiment', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
            </div>
          </div>
        );

      case 'ai-decision-maker':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-[#F59E0B]" />
              <h3 className={`font-medium ${textPrimary}`}>AI Decision Maker Configuration</h3>
            </div>

            {/* Model Selection */}
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                AI Model
              </label>
              <select
                value={config.model || 'ChatGPT Model'}
                onChange={(e) => updateConfig('model', e.target.value)}
                className={`w-full px-3 py-2 ${inputBg} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:border-[#00C6FF] transition-colors`}
              >
                {modelOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Decision Criteria */}
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                Decision Criteria
              </label>
              <textarea
                value={config.decisionCriteria || ''}
                onChange={(e) => updateConfig('decisionCriteria', e.target.value)}
                placeholder="Describe what factors should influence the decision..."
                rows={3}
                className={`w-full px-3 py-2 ${inputBg} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:border-[#00C6FF] transition-colors resize-none`}
              />
            </div>

            {/* Output Format */}
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                Output Format
              </label>
              <select
                value={config.outputFormat || 'string'}
                onChange={(e) => updateConfig('outputFormat', e.target.value)}
                className={`w-full px-3 py-2 ${inputBg} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:border-[#00C6FF] transition-colors`}
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="object">Object</option>
              </select>
            </div>

            {/* Confidence Threshold */}
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                Minimum Confidence: {config.confidence || 0.8}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.confidence || 0.8}
                onChange={(e) => updateConfig('confidence', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        );

      case 'smart-data-transformer':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#10B981]" />
              <h3 className={`font-medium ${textPrimary}`}>Smart Data Transformer Configuration</h3>
            </div>

            {/* Model Selection */}
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                AI Model
              </label>
              <select
                value={config.model || 'ChatGPT Model'}
                onChange={(e) => updateConfig('model', e.target.value)}
                className={`w-full px-3 py-2 ${inputBg} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:border-[#00C6FF] transition-colors`}
              >
                {modelOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Output Format */}
            <div>
              <label className={`block text-sm mb-2 ${textSecondary}`}>
                Output Format
              </label>
              <select
                value={config.outputFormat || 'json'}
                onChange={(e) => updateConfig('outputFormat', e.target.value)}
                className={`w-full px-3 py-2 ${inputBg} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:border-[#00C6FF] transition-colors`}
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xml">XML</option>
                <option value="text">Plain Text</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>

            {/* Preserve Structure */}
            <div className="flex items-center justify-between">
              <div>
                <label className={`text-sm ${textPrimary}`}>
                  Preserve Data Structure
                </label>
                <p className={`text-xs ${textSecondary} mt-1`}>
                  Maintain the original data structure when possible
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.preserveStructure !== false}
                onChange={(e) => updateConfig('preserveStructure', e.target.checked)}
                className="w-4 h-4"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className={`p-4 ${bgCard} border ${borderColor} rounded-lg`}>
            <div className="flex items-center gap-2 text-[#00C6FF]">
              <Info className="w-4 h-4" />
              <p className={`text-sm ${textSecondary}`}>
                No additional configuration required for this AI agent.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {renderConfiguration()}

      {/* Info Banner */}
      <div className={`p-3 ${inputBg} border border-[#00C6FF]/20 rounded-lg`}>
        <div className="flex items-start gap-2">
          <Settings className="w-4 h-4 text-[#00C6FF] mt-0.5" />
          <div>
            <p className={`text-xs ${textSecondary}`}>
              This AI agent requires an OpenAI API key to be configured in your environment variables.
              Add <code className="text-[#00C6FF]">OPENAI_API_KEY</code> to your Supabase secrets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

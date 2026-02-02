/**
 * Project Settings Component
 * Allows users to configure project settings, API keys, and integrations
 * Available for ALL projects (template-based and manually created)
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useProjectStore, ProjectConfiguration } from '@/core/stores/projectStore';
import { X, Settings, Eye, EyeOff, Save, Key, Building2, Mail, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectSettingsProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectSettings: React.FC<ProjectSettingsProps> = ({ projectId, isOpen, onClose }) => {
  const { theme } = useTheme();
  const { projects, updateProjectConfiguration, getProjectConfiguration } = useProjectStore();
  
  const project = projects.find(p => p.id === projectId);
  const existingConfig = getProjectConfiguration(projectId);
  
  const [companyName, setCompanyName] = useState(existingConfig?.companyName || '');
  const [email, setEmail] = useState(existingConfig?.email || '');
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(existingConfig?.apiKeys || {});
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'general' | 'integrations'>('general');

  // Common API integrations
  const commonIntegrations = [
    { key: 'stripe', label: 'Stripe API Key', placeholder: 'sk_live_...', description: 'For payment processing' },
    { key: 'sendgrid', label: 'SendGrid API Key', placeholder: 'SG.xxx...', description: 'For email sending' },
    { key: 'slack', label: 'Slack Webhook URL', placeholder: 'https://hooks.slack.com/...', description: 'For Slack notifications' },
    { key: 'openai', label: 'OpenAI API Key', placeholder: 'sk-...', description: 'For AI features' },
    { key: 'salesforce', label: 'Salesforce API Key', placeholder: 'xxx...', description: 'For CRM integration' },
    { key: 'hubspot', label: 'HubSpot API Key', placeholder: 'xxx...', description: 'For CRM integration' },
    { key: 'zendesk', label: 'Zendesk API Key', placeholder: 'xxx...', description: 'For support tickets' },
    { key: 'intercom', label: 'Intercom API Key', placeholder: 'xxx...', description: 'For customer support' },
    { key: 'google', label: 'Google API Key', placeholder: 'xxx...', description: 'For Google services' },
    { key: 'twitter', label: 'Twitter API Key', placeholder: 'xxx...', description: 'For Twitter integration' },
    { key: 'linkedin', label: 'LinkedIn API Key', placeholder: 'xxx...', description: 'For LinkedIn integration' },
    { key: 'docusign', label: 'DocuSign API Key', placeholder: 'xxx...', description: 'For document signing' },
  ];

  // Theme colors
  const bgModal = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgPage = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const inputBg = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const inputBorder = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-300';

  useEffect(() => {
    // Update state when config changes
    const config = getProjectConfiguration(projectId);
    if (config) {
      setCompanyName(config.companyName || '');
      setEmail(config.email || '');
      setApiKeys(config.apiKeys || {});
    }
  }, [projectId, getProjectConfiguration]);

  const handleSave = () => {
    const config: ProjectConfiguration = {
      companyName,
      email,
      apiKeys,
      templateId: existingConfig?.templateId,
      customFields: existingConfig?.customFields,
    };

    updateProjectConfiguration(projectId, config);
    
    toast.success('Settings saved successfully!', {
      description: 'Your project configuration has been updated.',
    });
    
    onClose();
  };

  const toggleShowApiKey = (key: string) => {
    setShowApiKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateApiKey = (key: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className={`relative ${bgModal} rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className={`px-6 py-5 border-b ${borderColor} bg-gradient-to-r from-[#00C6FF]/10 to-[#9D50BB]/10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl ${textPrimary}`}>Project Settings</h2>
                <p className={`text-sm ${textSecondary}`}>{project.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`${textMuted} hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'general'
                  ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white'
                  : theme === 'dark'
                  ? 'bg-[#2A2A3E] text-[#CFCFE8] hover:bg-[#3A3A4E]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span className="text-sm">General</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'integrations'
                  ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white'
                  : theme === 'dark'
                  ? 'bg-[#2A2A3E] text-[#CFCFE8] hover:bg-[#3A3A4E]'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                <span className="text-sm">Integrations & API Keys</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Template info if exists */}
              {existingConfig?.templateId && (
                <div className={`${bgPage} border ${borderColor} rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#00C6FF]" />
                    <h3 className={`${textPrimary}`}>Created from Template</h3>
                  </div>
                  <p className={`text-sm ${textSecondary}`}>
                    This project was created from the <span className="font-medium">{existingConfig.templateId}</span> template.
                  </p>
                </div>
              )}

              {/* Company Name */}
              <div>
                <label className={`block text-sm ${textPrimary} mb-2`}>
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Corp"
                  className={`w-full ${inputBg} border ${inputBorder} ${textPrimary} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00C6FF]`}
                />
                <p className={`text-xs ${textMuted} mt-1`}>
                  Used in templates and notifications
                </p>
              </div>

              {/* Email */}
              <div>
                <label className={`block text-sm ${textPrimary} mb-2`}>
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={`w-full ${inputBg} border ${inputBorder} ${textPrimary} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00C6FF]`}
                />
                <p className={`text-xs ${textMuted} mt-1`}>
                  Primary contact email for this project
                </p>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-4">
              <p className={`${textSecondary} mb-4`}>
                Configure API keys for third-party integrations. These will be used by workflows and automations in this project.
              </p>
              
              {commonIntegrations.map(integration => (
                <div key={integration.key} className={`${bgPage} border ${borderColor} rounded-xl p-4`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className={`text-sm ${textPrimary} mb-1`}>{integration.label}</h4>
                      <p className={`text-xs ${textMuted}`}>{integration.description}</p>
                    </div>
                  </div>
                  <div className="relative mt-3">
                    <input
                      type={showApiKeys[integration.key] ? 'text' : 'password'}
                      value={apiKeys[integration.key] || ''}
                      onChange={(e) => updateApiKey(integration.key, e.target.value)}
                      placeholder={integration.placeholder}
                      className={`w-full ${inputBg} border ${inputBorder} ${textPrimary} rounded-lg px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-[#00C6FF]`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowApiKey(integration.key)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted} hover:${textPrimary} transition-colors`}
                    >
                      {showApiKeys[integration.key] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${borderColor} flex items-center justify-between`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${textSecondary} hover:${textPrimary} transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

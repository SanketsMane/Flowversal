/**
 * Board Setup Wizard Component
 * Reusable wizard for configuring any board
 * Each board can have its own unique configuration and API keys
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useProjectStore, BoardConfiguration } from '@/core/stores/projectStore';
import { X, ArrowRight, ArrowLeft, Check, Key, Settings, Eye, EyeOff, Building2, Mail, Save } from 'lucide-react';
import { toast } from 'sonner';

interface BoardSetupWizardProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
  isInitialSetup?: boolean; // True if this is the first time setup
}

export const BoardSetupWizard: React.FC<BoardSetupWizardProps> = ({
  boardId,
  isOpen,
  onClose,
  isInitialSetup = false,
}) => {
  const { theme } = useTheme();
  const { boards, updateBoardConfiguration, getBoardConfiguration } = useProjectStore();
  
  const board = boards.find(b => b.id === boardId);
  const existingConfig = getBoardConfiguration(boardId);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [companyName, setCompanyName] = useState(existingConfig?.companyName || '');
  const [email, setEmail] = useState(existingConfig?.email || '');
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(existingConfig?.apiKeys || {});
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  // Common API integrations
  const commonIntegrations = [
    { key: 'stripe', label: 'Stripe API Key', placeholder: 'sk_live_...', description: 'For payment processing', optional: true },
    { key: 'sendgrid', label: 'SendGrid API Key', placeholder: 'SG.xxx...', description: 'For email sending', optional: true },
    { key: 'slack', label: 'Slack Webhook URL', placeholder: 'https://hooks.slack.com/...', description: 'For Slack notifications', optional: true },
    { key: 'openai', label: 'OpenAI API Key', placeholder: 'sk-...', description: 'For AI features', optional: true },
    { key: 'salesforce', label: 'Salesforce API Key', placeholder: 'xxx...', description: 'For CRM integration', optional: true },
    { key: 'hubspot', label: 'HubSpot API Key', placeholder: 'xxx...', description: 'For CRM integration', optional: true },
    { key: 'zendesk', label: 'Zendesk API Key', placeholder: 'xxx...', description: 'For support tickets', optional: true },
    { key: 'intercom', label: 'Intercom API Key', placeholder: 'xxx...', description: 'For customer support', optional: true },
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
    const config = getBoardConfiguration(boardId);
    if (config) {
      setCompanyName(config.companyName || '');
      setEmail(config.email || '');
      setApiKeys(config.apiKeys || {});
    }
  }, [boardId, getBoardConfiguration]);

  const steps = [
    { id: 'basic', title: 'Basic Information', icon: Building2 },
    { id: 'integrations', title: 'API Integrations', icon: Key },
    { id: 'review', title: 'Review & Save', icon: Check },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const config: BoardConfiguration = {
      companyName,
      email,
      apiKeys,
      templateId: existingConfig?.templateId,
      customFields: existingConfig?.customFields,
    };

    updateBoardConfiguration(boardId, config);
    
    toast.success('Board setup completed!', {
      description: isInitialSetup 
        ? 'Your board has been configured successfully.' 
        : 'Board settings have been updated.',
    });
    
    onClose();
  };

  const toggleShowApiKey = (key: string) => {
    setShowApiKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateApiKey = (key: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-6">
            <div>
              <h3 className={`text-xl ${textPrimary} mb-4`}>Let's set up your board</h3>
              <p className={`${textSecondary} mb-6`}>
                Configure this board with its own settings and integrations. Each board can have unique configurations.
              </p>
            </div>

            {/* Company Name */}
            <div>
              <label className={`block text-sm ${textPrimary} mb-2`}>
                <Building2 className="w-4 h-4 inline mr-2" />
                Company Name (Optional)
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corp"
                className={`w-full ${inputBg} border ${inputBorder} ${textPrimary} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00C6FF]`}
              />
              <p className={`text-xs ${textMuted} mt-1`}>
                Used in templates and notifications for this board
              </p>
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm ${textPrimary} mb-2`}>
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className={`w-full ${inputBg} border ${inputBorder} ${textPrimary} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00C6FF]`}
              />
              <p className={`text-xs ${textMuted} mt-1`}>
                Primary contact email for this board
              </p>
            </div>
          </div>
        );

      case 1: // API Integrations
        return (
          <div className="space-y-6">
            <div>
              <h3 className={`text-xl ${textPrimary} mb-4`}>Configure API Integrations</h3>
              <p className={`${textSecondary} mb-6`}>
                Add API keys for third-party services specific to this board. All fields are optional.
              </p>
            </div>

            <div className="space-y-4">
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
          </div>
        );

      case 2: // Review
        return (
          <div className="space-y-6">
            <div>
              <h3 className={`text-xl ${textPrimary} mb-4`}>Review Your Configuration</h3>
              <p className={`${textSecondary} mb-6`}>
                Review your settings before completing the setup.
              </p>
            </div>

            {/* Basic Info */}
            <div className={`${bgPage} border ${borderColor} rounded-xl p-4`}>
              <h4 className={`text-sm ${textPrimary} mb-3`}>Basic Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`text-sm ${textMuted}`}>Company Name:</span>
                  <span className={`text-sm ${textPrimary}`}>{companyName || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${textMuted}`}>Email:</span>
                  <span className={`text-sm ${textPrimary}`}>{email || 'Not set'}</span>
                </div>
              </div>
            </div>

            {/* API Keys */}
            <div className={`${bgPage} border ${borderColor} rounded-xl p-4`}>
              <h4 className={`text-sm ${textPrimary} mb-3`}>API Integrations</h4>
              <div className="space-y-2">
                {commonIntegrations.map(integration => (
                  <div key={integration.key} className="flex justify-between">
                    <span className={`text-sm ${textMuted}`}>{integration.label}:</span>
                    <span className={`text-sm ${textPrimary}`}>
                      {apiKeys[integration.key] ? '✓ Configured' : 'Not set'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen || !board) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className={`relative ${bgModal} rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className={`px-6 py-5 border-b ${borderColor} bg-gradient-to-r from-[#00C6FF]/10 to-[#9D50BB]/10`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`text-2xl ${textPrimary}`}>
                {isInitialSetup ? 'Board Setup' : 'Update Board Setup'}
              </h2>
              <p className={`text-sm ${textSecondary} mt-1`}>{board.name}</p>
            </div>
            <button
              onClick={onClose}
              className={`${textMuted} hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <React.Fragment key={step.id}>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white'
                        : isCompleted
                        ? theme === 'dark'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-green-100 text-green-700'
                        : theme === 'dark'
                        ? 'bg-[#2A2A3E] text-[#CFCFE8]'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className={`w-4 h-4 ${textMuted}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${borderColor} flex items-center justify-between`}>
          <button
            onClick={currentStep === 0 ? onClose : handleBack}
            className={`px-4 py-2 rounded-lg ${textSecondary} hover:${textPrimary} transition-colors flex items-center gap-2`}
          >
            {currentStep === 0 ? (
              <>
                <X className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4" />
                Back
              </>
            )}
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Save className="w-4 h-4" />
                Complete Setup
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

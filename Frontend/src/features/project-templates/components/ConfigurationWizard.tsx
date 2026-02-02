/**
 * Configuration Wizard Component
 * Multi-step wizard for configuring template before creation
 */

import React, { useState } from 'react';
import { ProjectTemplate, TemplateConfigurationData, ApiKeyConfig } from '../types/projectTemplate.types';
import { validateApiKeys, getTemplateStats } from '../utils/projectTemplateManager';
import { useTheme } from '@/core/theme/ThemeContext';
import { X, ArrowRight, ArrowLeft, Check, AlertCircle, Key, Settings, Eye, EyeOff } from 'lucide-react';
import { RenderIconByName } from '@/shared/components/ui/SimpleIconPicker';

interface ConfigurationWizardProps {
  template: ProjectTemplate;
  onComplete: (config: TemplateConfigurationData) => void;
  onCancel: () => void;
}

export const ConfigurationWizard: React.FC<ConfigurationWizardProps> = ({
  template,
  onComplete,
  onCancel,
}) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [configuration, setConfiguration] = useState({
    companyName: '',
    email: '',
    slackWebhook: '',
    customFields: {},
  });
  const [errors, setErrors] = useState<string[]>([]);

  const stats = getTemplateStats(template);

  // Theme colors
  const bgModal = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgPage = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const inputBg = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const inputBorder = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-300';

  const steps = [
    { id: 'overview', title: 'Overview', icon: Eye },
    { id: 'api-keys', title: 'API Keys', icon: Key },
    { id: 'configuration', title: 'Configuration', icon: Settings },
    { id: 'review', title: 'Review', icon: Check },
  ];

  const handleNext = async () => {
    setErrors([]);

    // Validate API keys step
    if (currentStep === 1) {
      const validation = await validateApiKeys(template, apiKeys);
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete wizard
      onComplete({
        templateId: template.id,
        companyName: configuration.companyName,
        email: configuration.email,
        apiKeys,
        configuration,
        customFields: configuration.customFields,
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors([]);
    }
  };

  const toggleShowApiKey = (key: string) => {
    setShowApiKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Overview
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 flex items-center justify-center flex-shrink-0">
                <RenderIconByName name={template.icon} className="w-12 h-12 text-[#00C6FF]" />
              </div>
              <div className="flex-1">
                <h3 className={`text-2xl ${textPrimary} mb-2`}>{template.name}</h3>
                <p className={`${textSecondary} mb-4`}>{template.description}</p>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className={`${bgPage} border ${borderColor} rounded-lg p-4`}>
                    <div className={`text-2xl ${textPrimary} mb-1`}>{stats.totalBoards}</div>
                    <div className={`text-sm ${textMuted}`}>Boards</div>
                  </div>
                  <div className={`${bgPage} border ${borderColor} rounded-lg p-4`}>
                    <div className={`text-2xl ${textPrimary} mb-1`}>{stats.totalTasks}</div>
                    <div className={`text-sm ${textMuted}`}>Tasks</div>
                  </div>
                  <div className={`${bgPage} border ${borderColor} rounded-lg p-4`}>
                    <div className={`text-2xl ${textPrimary} mb-1`}>{stats.totalWorkflows}</div>
                    <div className={`text-sm ${textMuted}`}>Workflows</div>
                  </div>
                  <div className={`${bgPage} border ${borderColor} rounded-lg p-4`}>
                    <div className={`text-2xl ${textPrimary} mb-1`}>{template.estimatedSetupTime}</div>
                    <div className={`text-sm ${textMuted}`}>Setup Time</div>
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className={`${textPrimary} mb-3`}>Key Benefits:</h4>
                  <ul className="space-y-2">
                    {template.benefits.slice(0, 4).map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className={`text-sm ${textSecondary}`}>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // API Keys
        return (
          <div className="space-y-6">
            <div>
              <h3 className={`text-xl ${textPrimary} mb-2`}>Configure API Keys</h3>
              <p className={`${textSecondary} mb-6`}>
                Enter your API keys to enable integrations. Required keys are marked with an asterisk (*).
              </p>
            </div>

            {template.requiredApiKeys.length === 0 ? (
              <div className={`${bgPage} border ${borderColor} rounded-lg p-6 text-center`}>
                <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className={`${textSecondary}`}>No API keys required for this template!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {template.requiredApiKeys.map((keyConfig: ApiKeyConfig) => (
                  <div key={keyConfig.key}>
                    <label className={`block text-sm ${textPrimary} mb-2`}>
                      {keyConfig.label}
                      {keyConfig.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <p className={`text-xs ${textMuted} mb-2`}>{keyConfig.description}</p>
                    <div className="relative">
                      <input
                        type={showApiKeys[keyConfig.key] ? 'text' : 'password'}
                        value={apiKeys[keyConfig.key] || ''}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, [keyConfig.key]: e.target.value }))}
                        placeholder={keyConfig.placeholder}
                        className={`w-full ${inputBg} border ${inputBorder} ${textPrimary} rounded-lg px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-[#00C6FF]`}
                      />
                      <button
                        onClick={() => toggleShowApiKey(keyConfig.key)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted} hover:text-[#00C6FF]`}
                      >
                        {showApiKeys[keyConfig.key] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                {errors.map((error, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-red-500">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{error}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 2: // Configuration
        return (
          <div className="space-y-6">
            <div>
              <h3 className={`text-xl ${textPrimary} mb-2`}>Customize Your Project</h3>
              <p className={`${textSecondary} mb-6`}>
                Personalize the template with your information (optional).
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm ${textPrimary} mb-2`}>Company Name</label>
                <input
                  type="text"
                  value={configuration.companyName}
                  onChange={(e) => setConfiguration(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Acme Corp"
                  className={`w-full ${inputBg} border ${inputBorder} ${textPrimary} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00C6FF]`}
                />
              </div>

              <div>
                <label className={`block text-sm ${textPrimary} mb-2`}>Email Address</label>
                <input
                  type="email"
                  value={configuration.email}
                  onChange={(e) => setConfiguration(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="you@company.com"
                  className={`w-full ${inputBg} border ${inputBorder} ${textPrimary} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00C6FF]`}
                />
              </div>
            </div>
          </div>
        );

      case 3: // Review
        return (
          <div className="space-y-6">
            <div>
              <h3 className={`text-xl ${textPrimary} mb-2`}>Review & Create</h3>
              <p className={`${textSecondary} mb-6`}>
                Review your configuration and create your project.
              </p>
            </div>

            {/* Template Info */}
            <div className={`${bgPage} border ${borderColor} rounded-lg p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 flex items-center justify-center flex-shrink-0">
                  <RenderIconByName name={template.icon} className="w-6 h-6 text-[#00C6FF]" />
                </div>
                <div>
                  <h4 className={`text-lg ${textPrimary}`}>{template.name}</h4>
                  <p className={`text-sm ${textMuted}`}>{template.category}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`text-sm ${textSecondary}`}>Boards:</span>
                  <span className={`text-sm ${textPrimary}`}>{stats.totalBoards}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${textSecondary}`}>Tasks:</span>
                  <span className={`text-sm ${textPrimary}`}>{stats.totalTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${textSecondary}`}>Workflows:</span>
                  <span className={`text-sm ${textPrimary}`}>{stats.totalWorkflows}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${textSecondary}`}>API Keys Configured:</span>
                  <span className={`text-sm ${textPrimary}`}>
                    {Object.keys(apiKeys).filter(k => apiKeys[k]).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Ready message */}
            <div className="bg-gradient-to-r from-[#00C6FF]/10 to-[#9D50BB]/10 border border-[#00C6FF]/50 rounded-lg p-6">
              <Check className="w-12 h-12 text-[#00C6FF] mx-auto mb-3" />
              <p className={`text-center ${textPrimary} mb-2`}>
                You're all set!
              </p>
              <p className={`text-center text-sm ${textSecondary}`}>
                Click "Create Project" to start using your template.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10001] flex items-center justify-center p-4">
      <div className={`${bgModal} rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className={`px-8 py-6 border-b ${borderColor} flex items-center justify-between`}>
          <h2 className={`text-2xl ${textPrimary}`}>Set Up Project Template</h2>
          <button
            onClick={onCancel}
            className={`${textMuted} hover:text-red-500 transition-colors`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Stepper */}
        <div className={`px-8 py-4 border-b ${borderColor}`}>
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white'
                          : theme === 'dark'
                          ? 'bg-[#2A2A3E] text-gray-400'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <span
                      className={`text-xs ${
                        isActive ? textPrimary : textMuted
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-gray-700 mx-2 mb-6" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className={`px-8 py-4 border-t ${borderColor} flex items-center justify-between`}>
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-colors ${
              currentStep === 0
                ? 'opacity-50 cursor-not-allowed'
                : theme === 'dark'
                ? 'bg-[#2A2A3E] text-white hover:bg-[#3A3A4E]'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            {currentStep === steps.length - 1 ? 'Create Project' : 'Next'}
            {currentStep < steps.length - 1 && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Setup Guide Component
 * Interactive guide for setting up Google OAuth and other features
 */

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  Circle, 
  ExternalLink, 
  Copy, 
  Check,
  AlertCircle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useTheme } from '@/core/theme/ThemeContext';
import { projectId } from '@/shared/utils/supabase/info';

interface SetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SetupGuide({ isOpen, onClose }: SetupGuideProps) {
  const { theme } = useTheme();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  const redirectUri = `https://${projectId}.supabase.co/auth/v1/callback`;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const steps = [
    {
      title: 'Create Google OAuth Credentials',
      status: 'pending',
      substeps: [
        {
          text: 'Go to Google Cloud Console',
          link: 'https://console.cloud.google.com/',
        },
        {
          text: 'Navigate to APIs & Services → Credentials',
        },
        {
          text: 'Click "Create Credentials" → "OAuth client ID"',
        },
        {
          text: 'Configure OAuth consent screen if prompted',
        },
      ],
    },
    {
      title: 'Configure OAuth Consent Screen',
      status: 'pending',
      substeps: [
        {
          text: 'Choose "External" user type',
        },
        {
          text: 'Fill in App Information:',
          details: [
            'App name: Flowversal',
            'User support email: info@flowversal.com',
            'Developer contact: info@flowversal.com',
          ],
        },
        {
          text: 'Add scopes: userinfo.email, userinfo.profile',
        },
        {
          text: 'Save and Continue',
        },
      ],
    },
    {
      title: 'Create OAuth Client ID',
      status: 'pending',
      substeps: [
        {
          text: 'Application type: Web application',
        },
        {
          text: 'Name: Flowversal',
        },
        {
          text: 'Add Authorized Redirect URI:',
          copyable: redirectUri,
          important: true,
        },
        {
          text: 'Copy Client ID and Client Secret',
          important: true,
        },
      ],
    },
    {
      title: 'Configure Supabase',
      status: 'pending',
      substeps: [
        {
          text: 'Go to Supabase Dashboard',
          link: 'https://app.supabase.com/',
        },
        {
          text: 'Navigate to Authentication → Providers',
        },
        {
          text: 'Enable Google provider',
        },
        {
          text: 'Paste Client ID and Client Secret from Google',
          important: true,
        },
        {
          text: 'Save configuration',
        },
      ],
    },
    {
      title: 'Test the Integration',
      status: 'pending',
      substeps: [
        {
          text: 'Click "Continue with Google" on login page',
        },
        {
          text: 'Authorize the app',
        },
        {
          text: 'Verify successful login',
        },
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative ${bgCard} rounded-2xl border ${borderColor} w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl`}>
        {/* Header */}
        <div className={`border-b ${borderColor} p-6 flex items-center justify-between`}>
          <div>
            <h2 className={`text-2xl mb-1 ${textPrimary}`}>
              Google OAuth Setup Guide
            </h2>
            <p className={`text-sm ${textSecondary}`}>
              Follow these steps to enable Google authentication
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-white/5 transition-colors ${textSecondary} hover:text-white`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {/* Important Info Card */}
          <Card className="bg-blue-500/10 border-blue-500/20 p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-400 mb-1">
                  Google OAuth Not Configured
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                  To enable "Continue with Google" login, you need to configure Google OAuth in your Supabase project. This is a one-time setup that takes about 15 minutes.
                </p>
                <div className="bg-blue-500/10 p-3 rounded border border-blue-500/20">
                  <h4 className="text-xs font-semibold text-blue-400 mb-1">Your Supabase Project ID</h4>
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-blue-300 bg-blue-500/10 px-2 py-1 rounded">
                      {projectId}
                    </code>
                    <button
                      onClick={() => handleCopy(projectId, 'projectId')}
                      className="p-1 hover:bg-blue-500/20 rounded transition-colors"
                    >
                      {copiedField === 'projectId' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-blue-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <Card key={index} className={`border ${borderColor} overflow-hidden`}>
                <button
                  onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">{index + 1}</span>
                    </div>
                    <h3 className={`font-semibold ${textPrimary}`}>{step.title}</h3>
                  </div>
                  {expandedStep === index ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {expandedStep === index && (
                  <div className={`border-t ${borderColor} p-4 space-y-3`}>
                    {step.substeps.map((substep, subIndex) => (
                      <div key={subIndex} className="flex items-start gap-2">
                        <Circle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className={`text-sm ${substep.important ? 'font-semibold text-orange-400' : textSecondary}`}>
                            {substep.text}
                          </p>
                          
                          {substep.link && (
                            <a
                              href={substep.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mt-1"
                            >
                              Open Link
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          {substep.details && (
                            <ul className="mt-2 ml-4 space-y-1">
                              {substep.details.map((detail, detailIndex) => (
                                <li key={detailIndex} className={`text-xs ${textSecondary}`}>
                                  • {detail}
                                </li>
                              ))}
                            </ul>
                          )}

                          {substep.copyable && (
                            <div className="mt-2 flex items-center gap-2">
                              <code className="text-xs bg-white/5 px-3 py-2 rounded border border-white/10 flex-1 break-all">
                                {substep.copyable}
                              </code>
                              <button
                                onClick={() => handleCopy(substep.copyable!, 'redirectUri')}
                                className="p-2 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                              >
                                {copiedField === 'redirectUri' ? (
                                  <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4 text-blue-400" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Help Section */}
          <Card className="bg-violet-500/10 border-violet-500/20 p-4 mt-6">
            <h3 className="text-sm font-semibold text-violet-400 mb-2">
              Need Help?
            </h3>
            <div className="space-y-1 text-xs text-gray-400">
              <p>• Check the full guide: <code className="text-violet-300">/docs/GOOGLE_OAUTH_SETUP.md</code></p>
              <p>• Supabase Docs: <a href="https://supabase.com/docs/guides/auth/social-login/auth-google" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google OAuth Guide</a></p>
              <p>• Contact: info@flowversal.com</p>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className={`border-t ${borderColor} p-6 flex justify-end gap-3`}>
          <Button
            variant="outline"
            onClick={onClose}
            className={`border-2 border-white/30 ${textPrimary} hover:bg-white/10 hover:border-white/50 bg-transparent`}
          >
            Close
          </Button>
          <Button
            onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
            className="bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 hover:opacity-90 text-white border-0"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Google Console
          </Button>
        </div>
      </div>
    </div>
  );
}
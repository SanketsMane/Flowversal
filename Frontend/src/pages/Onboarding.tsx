import { API_ENDPOINTS } from '@/core/api/api.config';
import { useAuth } from '@/core/auth/AuthContext';
import { useTheme } from '@/core/theme/ThemeContext';
import api from '@/shared/lib/api-client';
import {
    Check,
    FileText,
    Globe,
    LayoutGrid,
    Linkedin,
    Megaphone,
    MessageSquare,
    Search,
    Share2,
    Users,
    Youtube,
    Zap
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useState } from 'react';

interface OnboardingData {
  referralSource: string;
  automationExperience: string;
  organizationSize: string;
  organizationName: string;
  techStack: string[];
  automationGoal: string;
}

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    referralSource: '',
    automationExperience: '',
    organizationSize: '',
    organizationName: '',
    techStack: [],
    automationGoal: ''
  });

  const totalSteps = 5;

  // ⚠️ DEVELOPMENT WARNING: Display security bypass notice
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('⚠️  ONBOARDING: Using temporary auth bypass in development');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('Backend is accepting requests without proper authentication.');
      console.log('This is a TEMPORARY fix and MUST be removed before production!');
      console.log('See App/Backend/TEMPORARY_FIXES.md for details.');
      console.log('═══════════════════════════════════════════════════════════════');
    }
  }, []);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log('[Onboarding] Submitting data:', data);
      
      const response = await api.post(API_ENDPOINTS.users.onboarding, {
        referralSource: data.referralSource,
        automationExperience: data.automationExperience,
        organizationSize: data.organizationSize,
        organizationName: data.organizationName,
        techStack: data.techStack,
        automationGoal: data.automationGoal,
        onboardingCompleted: true
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to save onboarding data');
      }

      console.log('[Onboarding] ✅ Onboarding completed successfully!');
        
      // Update the local session to mark onboarding as completed
      try {
        const sessionStr = localStorage.getItem('flowversal_auth_session');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          if (session.user) {
            session.user.onboardingCompleted = true;
            localStorage.setItem('flowversal_auth_session', JSON.stringify(session));
          }
        }
      } catch (error) {
        console.error('[Onboarding] ❌ Failed to update local session:', error);
      }
      
      console.log('[Onboarding] 🔄 Reloading page to show main app...');
      alert('🎉 Welcome to Flowversal! Your account is now set up.');
      onComplete();

    } catch (error: any) {
      console.error('Onboarding error:', error);
      alert(`Error saving onboarding data: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const updateData = (key: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const toggleTechStack = (app: string) => {
    setData(prev => {
      const exists = prev.techStack.includes(app);
      if (exists) {
        return { ...prev, techStack: prev.techStack.filter(a => a !== app) };
      } else {
        return { ...prev, techStack: [...prev.techStack, app] };
      }
    });
  };

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const cardBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';

  // Step 1 Options
  const discoveryOptions = [
    { label: 'Search engines (Google, Bing, etc.)', icon: Search, value: 'search' },
    { label: 'Recommended by AI', icon: MessageSquare, value: 'ai_recommendation' },
    { label: 'Recommendation (friend, colleague)', icon: Users, value: 'friend' },
    { label: 'Another app (e.g. HubSpot Marketplace)', icon: LayoutGrid, value: 'marketplace' },
    { label: 'Ads', icon: Megaphone, value: 'ads' },
    { label: 'YouTube', icon: Youtube, value: 'youtube' },
    { label: 'LinkedIn', icon: Linkedin, value: 'linkedin' },
    { label: 'Online community', icon: Globe, value: 'community' },
    { label: 'Other', icon: Share2, value: 'other' },
  ];

  // Step 2 Options
  const experienceOptions = [
    { label: 'I have no experience with automation', value: 'none' },
    { label: 'I have used other integration or automation platforms', value: 'intermediate' },
    { label: 'I have built custom integrations myself', value: 'expert' },
  ];

  // Step 3 Options (Org Size)
  const sizeOptions = ['Only Me', '2 - 10', '11 - 50', '51 - 100', '101 - 200', '201 - 500', '501 - 1000', '1001 - 5000', '5001 - 10000', '10000+'];

  // Step 4 Options (Tech Stack) - Using generic icons/names
  const techStackOptions = [
    { name: 'Flowversal AI Agents', icon: Zap },
    { name: 'Google Sheets', icon: LayoutGrid },
    { name: 'Gmail', icon: MessageSquare },
    { name: 'Microsoft 365 Email', icon: MessageSquare },
    { name: 'Slack', icon: MessageSquare },
    { name: 'Telegram', icon: MessageSquare },
    { name: 'Whatsapp Business Cloud', icon: MessageSquare },
    { name: 'Airtable', icon: LayoutGrid },
    { name: 'Notion', icon: FileText },
    { name: 'Wordpress', icon: Globe },
    { name: 'OpenAI (ChatGPT)', icon: MessageSquare },
    { name: 'Google Gemini AI', icon: MessageSquare },
    { name: 'Anthropic Claude', icon: MessageSquare },
    { name: 'Perplexity AI', icon: MessageSquare },
    { name: 'Deepseek AI', icon: MessageSquare },
    { name: 'Instagram for Business', icon: Share2 },
    { name: 'YouTube', icon: Youtube },
    { name: 'Facebook Pages', icon: Share2 },
  ];

  const ProgressBar = () => (
    <div className="flex gap-2 mb-12 justify-center w-full max-w-3xl mx-auto px-4">
      {[...Array(totalSteps)].map((_, i) => (
        <div 
          key={i} 
          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
            i < step ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB]' : 
            i === step - 1 ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] opacity-50' : 
            theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen ${bgMain} flex flex-col items-center pt-20 px-4 transition-colors duration-300`}>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className={`${textPrimary} text-3xl font-bold mb-2`}>Welcome</h1>
        <div className="flex items-center justify-center gap-2">
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00C6FF] to-[#9D50BB]">
            Flowversal
          </div>
        </div>
      </div>

      <ProgressBar />

      <div className="w-full max-w-3xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <h2 className={`${textSecondary} text-xs font-bold uppercase tracking-wider mb-2`}>DISCOVERY</h2>
              <h3 className={`${textPrimary} text-xl font-semibold mb-6`}>How did you hear about Flowversal? *</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {discoveryOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateData('referralSource', option.value)}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                      data.referralSource === option.value
                        ? 'border-[#00C6FF] bg-[#00C6FF]/5'
                        : `${cardBg} ${borderColor} hover:border-[#00C6FF]/50`
                    }`}
                  >
                    <div className={`${textSecondary}`}>
                      <option.icon size={20} />
                    </div>
                    <span className={`${textPrimary} text-sm font-medium`}>{option.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <h2 className={`${textSecondary} text-xs font-bold uppercase tracking-wider mb-2`}>EXPERIENCE</h2>
              <h3 className={`${textPrimary} text-xl font-semibold mb-6`}>How would you describe your experience with automating workflows? *</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {experienceOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateData('automationExperience', option.value)}
                    className={`flex flex-col items-start p-6 rounded-lg border h-32 justify-between transition-all text-left ${
                      data.automationExperience === option.value
                        ? 'border-[#00C6FF] bg-[#00C6FF]/5'
                        : `${cardBg} ${borderColor} hover:border-[#00C6FF]/50`
                    }`}
                  >
                    <span className={`${textPrimary} font-medium`}>{option.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <h2 className={`${textSecondary} text-xs font-bold uppercase tracking-wider mb-2`}>COMPANY DETAILS</h2>
              <h3 className={`${textPrimary} text-xl font-semibold mb-6`}>Tell us about your organization *</h3>
              
              <div className="space-y-8">
                <div>
                  <label className={`block ${textPrimary} text-sm font-medium mb-3`}>What size is your organization?</label>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((size) => (
                      <button
                        key={size}
                        onClick={() => updateData('organizationSize', size)}
                        className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                          data.organizationSize === size
                            ? 'border-[#00C6FF] bg-[#00C6FF]/5 text-[#00C6FF]'
                            : `${cardBg} ${borderColor} ${textSecondary} hover:border-[#00C6FF]/50 hover:text-[#00C6FF]`
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block ${textPrimary} text-sm font-medium mb-3`}>Organization Name</label>
                  <input
                    type="text"
                    value={data.organizationName}
                    onChange={(e) => updateData('organizationName', e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className={`w-full max-w-md p-3 rounded-lg border ${borderColor} ${cardBg} ${textPrimary} focus:outline-none focus:border-[#00C6FF] transition-all`}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <h2 className={`${textSecondary} text-xs font-bold uppercase tracking-wider mb-2`}>YOUR TECH STACK</h2>
              <h3 className={`${textPrimary} text-xl font-semibold mb-6`}>Which of these popular apps are you planning to use in your automations?</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {techStackOptions.map((app) => {
                  const isSelected = data.techStack.includes(app.name);
                  return (
                    <button
                      key={app.name}
                      onClick={() => toggleTechStack(app.name)}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-[#00C6FF] bg-[#00C6FF]/5'
                          : `${cardBg} ${borderColor} hover:border-[#00C6FF]/50`
                      }`}
                    >
                      <div className={`${isSelected ? 'text-[#00C6FF]' : textSecondary}`}>
                        <app.icon size={20} />
                      </div>
                      <span className={`${textPrimary} text-sm font-medium`}>{app.name}</span>
                      {isSelected && (
                        <div className="ml-auto text-[#00C6FF]">
                          <Check size={16} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-6">
                <label className={`block ${textSecondary} text-sm mb-2`}>Other apps you are planning to use:</label>
                <input
                  type="text"
                  placeholder="Typeform, Mailchimp, etc."
                  className={`w-full p-3 rounded-lg border ${borderColor} ${cardBg} ${textPrimary} focus:outline-none focus:border-[#00C6FF] transition-all`}
                />
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <h2 className={`${textSecondary} text-xs font-bold uppercase tracking-wider mb-2`}>YOUR GOAL</h2>
              <h3 className={`${textPrimary} text-xl font-semibold mb-6`}>What do you want to automate with Flowversal?</h3>
              
              <textarea
                value={data.automationGoal}
                onChange={(e) => updateData('automationGoal', e.target.value)}
                placeholder="Example: I want to use AI to automatically generate social media posts..."
                className={`w-full h-40 p-4 rounded-lg border ${borderColor} ${cardBg} ${textPrimary} focus:outline-none focus:border-[#00C6FF] transition-all resize-none`}
              />
              
              <p className={`mt-4 ${textSecondary} text-sm`}>
                Please provide detailed information about your specific use case, which will help us recommend the most relevant resources for you.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-12 mb-20">
          {step > 1 && (
            <button
              onClick={handleBack}
              className={`px-6 py-2.5 rounded-lg border ${borderColor} ${textPrimary} font-medium hover:bg-white/5 transition-colors`}
            >
              Back
            </button>
          )}
          
          <div className={step === 1 ? 'ml-auto' : ''}>
            <button
              onClick={handleNext}
              disabled={
                (step === 1 && !data.referralSource) ||
                (step === 2 && !data.automationExperience) ||
                (step === 3 && (!data.organizationSize || !data.organizationName)) ||
                (step === 5 && !data.automationGoal) ||
                loading
              }
              className={`px-8 py-2.5 rounded-lg font-medium transition-all ${
                loading ? 'opacity-70 cursor-wait' : ''
              } ${
                ((step === 1 && !data.referralSource) ||
                (step === 2 && !data.automationExperience) ||
                (step === 3 && (!data.organizationSize || !data.organizationName)) ||
                (step === 5 && !data.automationGoal))
                  ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                  : 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/30'
              }`}
            >
              {loading ? 'Saving...' : step === totalSteps ? 'Get started' : 'Continue'}
            </button>
          </div>
        </div>
        
        <div className="text-center pb-8">
          <button 
            onClick={() => logout()}
            className={`${textSecondary} text-sm hover:${textPrimary} transition-colors`}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

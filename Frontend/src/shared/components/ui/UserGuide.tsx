import { X, Lightbulb, Workflow, FolderKanban, Zap, Users, Check } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserGuide({ isOpen, onClose }: UserGuideProps) {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const inputBg = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';

  const steps = [
    {
      title: 'Welcome to Flowversal',
      icon: Lightbulb,
      description: 'Your AI-powered automation platform',
      content: [
        'Automate complex workflows with AI agents',
        'Manage projects and collaborate with teams',
        'Create custom workflows without coding',
        'Integrate with your favorite tools',
      ],
    },
    {
      title: 'Create Your First Workflow',
      icon: Workflow,
      description: 'Build powerful automations in minutes',
      content: [
        'Click "Create" or "AI Apps" in the sidebar',
        'Choose from 50+ pre-built templates',
        'Add AI agents to process your data',
        'Configure triggers and actions',
        'Test and publish your workflow',
      ],
    },
    {
      title: 'Organize with Projects',
      icon: FolderKanban,
      description: 'Keep your work structured',
      content: [
        'Create projects to group related workflows',
        'Assign tasks to team members',
        'Track progress with kanban boards',
        'Set deadlines and priorities',
        'Monitor project analytics',
      ],
    },
    {
      title: 'Deploy AI Agents',
      icon: Zap,
      description: 'Supercharge your workflows',
      content: [
        'Add multiple AI agents per workflow',
        'Use GPT-4, Claude, or custom models',
        'Process text, images, and documents',
        'Chain agents for complex operations',
        'Monitor agent performance',
      ],
    },
    {
      title: 'Collaborate with Teams',
      icon: Users,
      description: 'Work together seamlessly',
      content: [
        'Invite team members to your workspace',
        'Share workflows and projects',
        'Comment and discuss in real-time',
        'Set permissions and roles',
        'Track team activity',
      ],
    },
  ];

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className={`${bgCard} rounded-2xl w-full max-w-2xl border ${borderColor} shadow-2xl overflow-hidden`}>
        {/* Header */}
        <div className={`${bgMain} border-b ${borderColor} px-6 py-4 flex items-center justify-between`}>
          <div>
            <h2 className={`text-2xl ${textPrimary} mb-1`}>User Guide</h2>
            <p className={textSecondary}>Get started with Flowversal</p>
          </div>
          <button
            onClick={onClose}
            className={`w-10 h-10 rounded-lg ${inputBg} border ${borderColor} flex items-center justify-center hover:border-[#00C6FF]/50 transition-all`}
          >
            <X className={`w-5 h-5 ${textSecondary}`} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className={`${inputBg} px-6 py-4 border-b ${borderColor}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${textSecondary}`}>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className={`text-sm ${textSecondary}`}>
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className={`h-2 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-200'} rounded-full overflow-hidden`}>
            <div
              className="h-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Icon and Title */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00C6FF]/20 to-[#9D50BB]/20 border border-[#00C6FF]/30 flex items-center justify-center flex-shrink-0">
              <Icon className="w-8 h-8 text-[#00C6FF]" />
            </div>
            <div>
              <h3 className={`text-2xl mb-1 ${textPrimary}`}>{currentStepData.title}</h3>
              <p className={textSecondary}>{currentStepData.description}</p>
            </div>
          </div>

          {/* Content List */}
          <div className="space-y-4 mb-8">
            {currentStepData.content.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00C6FF]/20 to-[#9D50BB]/20 border border-[#00C6FF]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-[#00C6FF]" />
                </div>
                <p className={textPrimary}>{item}</p>
              </div>
            ))}
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] w-8'
                    : index < currentStep
                    ? 'bg-[#00C6FF]/50'
                    : theme === 'dark'
                    ? 'bg-white/20'
                    : 'bg-gray-300'
                }`}
              ></button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className={`px-6 py-3 rounded-lg border-2 ${borderColor} ${textPrimary} hover:border-[#00C6FF]/50 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="text-center">Previous</span>
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={onClose}
                className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-[#00C6FF] via-[#0072FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all flex items-center justify-center hover:scale-105"
              >
                <span className="text-center">Get Started</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-[#00C6FF] via-[#0072FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all flex items-center justify-center hover:scale-105"
              >
                <span className="text-center">Next</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

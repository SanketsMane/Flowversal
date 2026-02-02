/**
 * Features Page
 * Detailed product capabilities showcase
 */

import React from 'react';
import {
  Workflow,
  Bot,
  Database,
  Zap,
  Code,
  FileText,
  BarChart3,
  Shield,
  Cloud,
  GitBranch,
  Layers,
  Settings,
  Users,
  Lock,
  Gauge,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { MarketingRoute } from '../MarketingApp';
import { useTheme } from '@/core/theme/ThemeContext';

interface FeaturesPageProps {
  onNavigate: (route: MarketingRoute) => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onNavigate }) => {
  const { theme } = useTheme();

  const mainFeatures = [
    {
      icon: Workflow,
      title: 'Visual Workflow Builder',
      description: 'Build complex automations with our intuitive drag-and-drop interface.',
      features: [
        'Drag-and-drop node editor',
        'Real-time canvas preview',
        'Infinite canvas with zoom & pan',
        'Auto-connecting smart lines',
        'Undo/redo support',
      ],
      image: '🎨',
    },
    {
      icon: Bot,
      title: 'AI Integration',
      description: 'Connect to leading AI models and leverage intelligent automation.',
      features: [
        'GPT-4 & GPT-3.5 integration',
        'Claude (Anthropic) support',
        'Custom AI prompts',
        'Variable injection in prompts',
        'Streaming responses',
      ],
      image: '🤖',
    },
    {
      icon: FileText,
      title: 'Advanced Form Builder',
      description: 'Create dynamic forms with 14+ field types and validation.',
      features: [
        '14+ field types',
        'Conditional field logic',
        'Custom validation rules',
        'File uploads',
        'Multi-step forms',
      ],
      image: '📝',
    },
    {
      icon: GitBranch,
      title: 'Conditional Logic',
      description: 'Build smart workflows with if/else branches and complex conditions.',
      features: [
        'If/else branching',
        'Multiple conditions (AND/OR)',
        'Custom operators',
        'Nested conditions',
        'Visual branch preview',
      ],
      image: '🌳',
    },
    {
      icon: Database,
      title: 'Data Processing',
      description: 'Transform, filter, and manipulate data seamlessly.',
      features: [
        'JSON parsing & transformation',
        'Array operations',
        'Text manipulation',
        'Math calculations',
        'Data validation',
      ],
      image: '💾',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Monitoring',
      description: 'Track workflow performance with detailed insights.',
      features: [
        'Real-time execution logs',
        'Performance metrics',
        'Error tracking',
        'Usage analytics',
        'Export reports',
      ],
      image: '📊',
    },
  ];

  const technicalFeatures = [
    {
      icon: Code,
      title: 'API & Webhooks',
      description: 'Connect to any external service with HTTP requests and webhooks.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption, SSO, and compliance certifications.',
    },
    {
      icon: Cloud,
      title: 'Cloud Infrastructure',
      description: '99.9% uptime SLA with auto-scaling and redundancy.',
    },
    {
      icon: Layers,
      title: 'Version Control',
      description: 'Track changes with workflow versioning and rollback.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Real-time collaboration with role-based permissions.',
    },
    {
      icon: Gauge,
      title: 'High Performance',
      description: 'Process millions of workflow runs with sub-second latency.',
    },
  ];

  const integrations = [
    'OpenAI (GPT-4)',
    'Anthropic (Claude)',
    'Slack',
    'Discord',
    'Email (SMTP)',
    'Webhooks',
    'HTTP/REST APIs',
    'Google Sheets',
    'Airtable',
    'Notion',
    'Stripe',
    'SendGrid',
  ];

  return (
    <div className="pt-24 pb-20">
      {/* Header */}
      <section className="px-4 mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className={`mb-4 border ${
            theme === 'dark'
              ? 'bg-white/10 text-white border-white/20'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            Features
          </Badge>
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Everything You Need to Build
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Powerful Workflows
            </span>
          </h1>
          <p className={`text-xl mb-8 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            From simple automations to complex AI workflows, Flowversal has all the tools you need.
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = '/app?signup=true'}
            className="bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 hover:opacity-90 text-white border-0 cursor-pointer"
          >
            Start Building Free
          </Button>
        </div>
      </section>

      {/* Main Features */}
      <section className="px-4 mb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className={`p-8 hover:shadow-lg transition-all group border ${
                    theme === 'dark'
                      ? 'bg-[#1A1A2E] border-white/10 hover:border-white/20'
                      : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-cyan-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{feature.title}</h3>
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {feature.features.map((item, i) => (
                      <li key={i} className={`flex items-center gap-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className={`px-4 mb-20 py-20 ${
        theme === 'dark' 
          ? 'bg-gradient-to-b from-transparent via-blue-500/5 to-transparent' 
          : 'bg-gradient-to-b from-transparent via-blue-50 to-transparent'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Enterprise-Grade Infrastructure
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Built for scale, security, and reliability
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className={`p-6 transition-all group text-center border ${
                    theme === 'dark'
                      ? 'bg-[#1A1A2E] border-white/10 hover:border-white/20'
                      : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <Icon className="w-10 h-10 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className={`text-lg font-semibold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{feature.title}</h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="px-4 mb-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className={`mb-4 border ${
              theme === 'dark'
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              Integrations
            </Badge>
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Connect Everything
            </h2>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Integrate with your favorite tools and services
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {integrations.map((integration, index) => (
              <Card
                key={index}
                className={`p-4 transition-all text-center border ${
                  theme === 'dark'
                    ? 'bg-[#1A1A2E] border-white/10 hover:border-white/20'
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                <span className={`font-medium text-sm ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{integration}</span>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className={`mb-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Don't see your tool? Use our HTTP node to connect any API.
            </p>
            <Button
              variant="outline"
              className={`cursor-pointer border-2 ${
                theme === 'dark'
                  ? 'border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-transparent'
                  : 'border-gray-300 text-gray-900 hover:bg-gray-100 hover:border-gray-400 bg-transparent'
              }`}
            >
              View All Integrations
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4">
        <div className={`max-w-4xl mx-auto text-center rounded-2xl border p-12 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-cyan-500/10 border-white/10'
            : 'bg-gradient-to-r from-blue-50 via-violet-50 to-cyan-50 border-gray-200'
        }`}>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Get Started?
          </h2>
          <p className={`text-lg mb-8 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Start building powerful workflows today with our free plan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => window.location.href = '/app?signup=true'}
              className="bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 hover:opacity-90 text-white border-0 cursor-pointer"
            >
              Start Building Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigate('pricing')}
              className={`cursor-pointer text-lg px-8 py-6 border-2 ${
                theme === 'dark'
                  ? 'border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-transparent'
                  : 'border-gray-300 text-gray-900 hover:bg-gray-100 hover:border-gray-400 bg-transparent'
              }`}
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
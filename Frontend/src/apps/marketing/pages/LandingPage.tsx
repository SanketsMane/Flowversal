/**
 * Landing Page
 * Main marketing homepage with hero, features, testimonials, and CTAs
 */

import React from 'react';
import {
  Zap,
  Workflow,
  Sparkles,
  Shield,
  Gauge,
  Users,
  CheckCircle2,
  ArrowRight,
  Play,
  Code,
  Database,
  Bot,
  FileText,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { MarketingRoute } from '../MarketingApp';
import { useTheme } from '@/core/theme/ThemeContext';

interface LandingPageProps {
  onNavigate: (route: MarketingRoute) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { theme } = useTheme();

  const features = [
    {
      icon: Workflow,
      title: 'Visual Workflow Builder',
      description: 'Build complex automations with an intuitive drag-and-drop interface. No coding required.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Bot,
      title: 'AI-Powered Automation',
      description: 'Leverage GPT-4, Claude, and other AI models to automate intelligent tasks.',
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      icon: Database,
      title: 'Data Processing',
      description: 'Transform, filter, and analyze data seamlessly across your workflows.',
      gradient: 'from-cyan-500 to-teal-500',
    },
    {
      icon: Code,
      title: 'Custom Integrations',
      description: 'Connect to any API or service with custom HTTP requests and webhooks.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: FileText,
      title: 'Form Builder',
      description: 'Create dynamic forms with 14+ field types and conditional logic.',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: TrendingUp,
      title: 'Real-time Analytics',
      description: 'Monitor workflow performance with detailed execution logs and metrics.',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  const useCases = [
    {
      icon: MessageSquare,
      title: 'Customer Support',
      description: 'Automate ticket routing, responses, and escalation workflows.',
      color: 'text-blue-400',
    },
    {
      icon: FileText,
      title: 'Content Generation',
      description: 'Generate blog posts, social media content, and marketing copy with AI.',
      color: 'text-violet-400',
    },
    {
      icon: Database,
      title: 'Data Processing',
      description: 'Extract, transform, and load data from multiple sources automatically.',
      color: 'text-cyan-400',
    },
    {
      icon: Users,
      title: 'Lead Management',
      description: 'Qualify, score, and nurture leads with intelligent automation.',
      color: 'text-green-400',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Workflows Created' },
    { value: '99.9%', label: 'Uptime' },
    { value: '10M+', label: 'Tasks Automated' },
    { value: '5K+', label: 'Happy Users' },
  ];

  const testimonials = [
    {
      quote: 'Flowversal transformed how we handle customer support. Our response time dropped by 80%.',
      author: 'Sarah Chen',
      role: 'Head of Operations',
      company: 'TechCorp',
      avatar: 'SC',
    },
    {
      quote: 'The visual workflow builder is incredibly intuitive. We automated our entire onboarding process in days.',
      author: 'Michael Rodriguez',
      role: 'Product Manager',
      company: 'StartupXYZ',
      avatar: 'MR',
    },
    {
      quote: 'Best automation platform we\'ve used. The AI capabilities are game-changing for content creation.',
      author: 'Emily Watson',
      role: 'Marketing Director',
      company: 'GrowthLabs',
      avatar: 'EW',
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <Badge className={`mb-6 border ${
              theme === 'dark'
                ? 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}>
              <Sparkles className="w-3 h-3 mr-1" />
              AI Automation + Project Management
            </Badge>
            
            {/* Headline */}
            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Automate Your{' '}
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Projects
              </span>
              ,<br />
              Not Just Your Tasks
            </h1>
            
            {/* Subheadline */}
            <p className={`text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Build AI-powered workflows and seamlessly integrate them into your projects. Turn repetitive tasks into smart automation while keeping your team in control with built-in project management.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                size="lg"
                onClick={() => window.location.href = '/app?signup=true'}
                className="cursor-pointer bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 hover:opacity-90 text-white border-0 text-lg px-8 py-6"
              >
                Start Building Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('features')}
                className={`cursor-pointer text-lg px-8 py-6 ${
                  theme === 'dark'
                    ? 'border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-transparent'
                    : 'border-2 border-gray-300 text-gray-900 hover:bg-gray-100 hover:border-gray-400 bg-transparent'
                }`}
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
            
            {/* Trust Badges */}
            <p className={`text-sm mb-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Trusted by teams at leading companies
            </p>
            <div className="flex items-center justify-center gap-8 flex-wrap opacity-50">
              {['Google', 'Microsoft', 'Amazon', 'Stripe', 'Salesforce'].map((company) => (
                <span key={company} className={`font-medium ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>{company}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-12 px-4 border-y ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-cyan-500/10 border-white/10'
          : 'bg-gradient-to-r from-blue-50 via-violet-50 to-cyan-50 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - Workflow + Project Management */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className={`mb-4 border ${
              theme === 'dark'
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              Why Flowversal?
            </Badge>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Automation Meets
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Project Management
              </span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              The only platform that combines workflow automation with built-in project management—no need for multiple tools.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className={`rounded-xl p-8 border transition-all ${
              theme === 'dark'
                ? 'bg-[#1A1A2E] border-white/10 hover:border-white/20'
                : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
            }`}>
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6">
                <Workflow className="w-7 h-7 text-white" />
              </div>
              <h3 className={`text-2xl font-semibold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Workflows as Tasks</h3>
              <p className={`mb-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Turn automation workflows into project tasks. Assign them to team members, set deadlines, and track progress—all in one place.
              </p>
              <ul className={`space-y-2 text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Drag & drop workflows into projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Track execution status like any task</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Mix automated & manual tasks</span>
                </li>
              </ul>
            </div>

            {/* Benefit 2 */}
            <div className={`rounded-xl p-8 border transition-all ${
              theme === 'dark'
                ? 'bg-[#1A1A2E] border-white/10 hover:border-white/20'
                : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
            }`}>
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className={`text-2xl font-semibold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Human-in-the-Loop</h3>
              <p className={`mb-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Perfect for semi-automation. Add approval steps, review checkpoints, and human intervention when needed—your team stays in control.
              </p>
              <ul className={`space-y-2 text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Approval workflows built-in</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Pause for human review</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Collaborative decision-making</span>
                </li>
              </ul>
            </div>

            {/* Benefit 3 */}
            <div className={`rounded-xl p-8 border transition-all ${
              theme === 'dark'
                ? 'bg-[#1A1A2E] border-white/10 hover:border-white/20'
                : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
            }`}>
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className={`text-2xl font-semibold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Enterprise Efficiency</h3>
              <p className={`mb-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Reduce manual work by up to 70%. Set up workflows once, use them across departments. Built-in analytics show real ROI.
              </p>
              <ul className={`space-y-2 text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Reusable workflow templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Cross-department collaboration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Real-time performance metrics</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className={`mt-12 text-center rounded-xl p-8 border ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-blue-500/10 to-violet-500/10 border-blue-500/20'
              : 'bg-gradient-to-r from-blue-50 to-violet-50 border-blue-200'
          }`}>
            <h3 className={`text-2xl font-bold mb-3 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Ready to transform your team's workflow?
            </h3>
            <p className={`mb-6 max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Companies using Flowversal save an average of 15 hours per week per team member. Start your free trial and see the difference.
            </p>
            <Button
              size="lg"
              onClick={() => onNavigate('pricing')}
              className="cursor-pointer bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 hover:opacity-90 text-white border-0 text-lg px-8 py-4"
            >
              View Pricing & Plans
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className={`mb-4 border ${
              theme === 'dark'
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              Testimonials
            </Badge>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Loved by Thousands of Teams
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              See what our customers have to say about Flowversal.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className={`p-6 border transition-all ${
                  theme === 'dark'
                    ? 'bg-[#1A1A2E] border-white/10 hover:border-white/20'
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-cyan-500 flex items-center justify-center text-white font-semibold shrink-0">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className={`font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{testimonial.author}</div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>{testimonial.role}</div>
                    <div className={`text-xs ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    }`}>{testimonial.company}</div>
                  </div>
                </div>
                <p className={`italic ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>\"{testimonial.quote}\"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 px-4 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-cyan-500/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-cyan-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Automate Your Workflows?
          </h2>
          <p className={`text-xl mb-8 max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Join thousands of teams already saving time with Flowversal. Start building for free today.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => window.location.href = '/app?signup=true'}
              className="cursor-pointer bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 hover:opacity-90 text-white border-0 text-lg px-8 py-6"
            >
              Start Building Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigate('pricing')}
              className={`cursor-pointer text-lg px-8 py-6 ${
                theme === 'dark'
                  ? 'border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-transparent'
                  : 'border-2 border-gray-300 text-gray-900 hover:bg-gray-100 hover:border-gray-400 bg-transparent'
              }`}
            >
              View Pricing
            </Button>
          </div>
          
          <p className={`mt-6 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No credit card required • Free forever plan • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
};
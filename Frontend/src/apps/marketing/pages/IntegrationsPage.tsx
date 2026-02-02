/**
 * Integrations Page
 * Available integrations and API connections
 */

import React from 'react';
import { Search, ArrowRight, Zap, Database, Mail, MessageSquare, FileText, Cloud, Code, Lock } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { MarketingRoute } from '../MarketingApp';
import { useTheme } from '@/core/theme/ThemeContext';

interface IntegrationsPageProps {
  onNavigate: (route: MarketingRoute) => void;
}

export const IntegrationsPage: React.FC<IntegrationsPageProps> = ({ onNavigate }) => {
  const { theme } = useTheme();

  const categories = [
    { name: 'All', count: '150+' },
    { name: 'AI & ML', count: 25 },
    { name: 'Communication', count: 18 },
    { name: 'CRM', count: 12 },
    { name: 'Data & Analytics', count: 20 },
    { name: 'Productivity', count: 30 },
    { name: 'Developer Tools', count: 22 },
  ];

  const integrations = [
    {
      name: 'OpenAI',
      description: 'Connect to GPT-4, DALL-E, and other AI models',
      icon: Zap,
      category: 'AI & ML',
      color: 'from-green-500 to-emerald-500',
      popular: true,
    },
    {
      name: 'Google Suite',
      description: 'Gmail, Drive, Sheets, and more',
      icon: Mail,
      category: 'Productivity',
      color: 'from-red-500 to-orange-500',
      popular: true,
    },
    {
      name: 'Slack',
      description: 'Send messages and automate workflows',
      icon: MessageSquare,
      category: 'Communication',
      color: 'from-purple-500 to-pink-500',
      popular: true,
    },
    {
      name: 'PostgreSQL',
      description: 'Connect to your database',
      icon: Database,
      category: 'Data & Analytics',
      color: 'from-blue-500 to-cyan-500',
      popular: false,
    },
    {
      name: 'Notion',
      description: 'Read and write to your workspace',
      icon: FileText,
      category: 'Productivity',
      color: 'from-gray-500 to-gray-700',
      popular: true,
    },
    {
      name: 'AWS',
      description: 'S3, Lambda, and other AWS services',
      icon: Cloud,
      category: 'Developer Tools',
      color: 'from-orange-500 to-yellow-500',
      popular: false,
    },
    {
      name: 'Custom API',
      description: 'Connect to any REST or GraphQL API',
      icon: Code,
      category: 'Developer Tools',
      color: 'from-violet-500 to-purple-500',
      popular: false,
    },
    {
      name: 'Webhooks',
      description: 'Receive and send HTTP webhooks',
      icon: Lock,
      category: 'Developer Tools',
      color: 'from-teal-500 to-cyan-500',
      popular: false,
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className={`mb-6 border ${
              theme === 'dark'
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              150+ Integrations
            </Badge>
            
            <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Connect{' '}
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Everything
              </span>
            </h1>
            
            <p className={`text-lg sm:text-xl mb-8 leading-relaxed ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Integrate with all your favorite tools and services. Build powerful automations that connect your entire tech stack.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search integrations..."
                className={`w-full border rounded-lg pl-12 pr-4 py-4 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors ${
                  theme === 'dark'
                    ? 'bg-[#1A1A2E] border-white/10 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-4 py-2 border rounded-lg text-sm transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white'
                    : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700 hover:text-gray-900'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>

          {/* Integrations Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {integrations.map((integration, index) => {
              const Icon = integration.icon;
              return (
                <Card
                  key={index}
                  className={`p-6 transition-all group relative border ${
                    theme === 'dark'
                      ? 'bg-[#1A1A2E] border-white/10 hover:border-white/20'
                      : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  {integration.popular && (
                    <Badge className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-violet-500 text-white border-0 text-xs">
                      Popular
                    </Badge>
                  )}
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${integration.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{integration.name}</h3>
                  <p className={`text-sm mb-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{integration.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    }`}>{integration.category}</span>
                    <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className={`text-center rounded-2xl border p-12 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-cyan-500/10 border-white/10'
              : 'bg-gradient-to-r from-blue-50 via-violet-50 to-cyan-50 border-gray-200'
          }`}>
            <h2 className={`text-3xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Can't Find Your Integration?</h2>
            <p className={`mb-6 max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Use our HTTP node to connect to any REST or GraphQL API. Or request a new integration and we'll build it for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => onNavigate('contact')}
                className="bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 hover:opacity-90 text-white border-0 cursor-pointer"
              >
                Request Integration
              </Button>
              <Button
                variant="outline"
                className={`cursor-pointer border-2 ${
                  theme === 'dark'
                    ? 'border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-transparent'
                    : 'border-gray-300 text-gray-900 hover:bg-gray-100 hover:border-gray-400 bg-transparent'
                }`}
              >
                View API Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
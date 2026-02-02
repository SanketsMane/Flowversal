/**
 * Help Center Page
 */

import React from 'react';
import { Search, Book, Video, MessageCircle, FileText, HelpCircle } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { MarketingRoute } from '../MarketingApp';
import { useTheme } from '@/core/theme/ThemeContext';

interface HelpCenterPageProps {
  onNavigate: (route: MarketingRoute) => void;
}

export const HelpCenterPage: React.FC<HelpCenterPageProps> = ({ onNavigate }) => {
  const { theme } = useTheme();

  const categories = [
    { icon: Book, title: 'Getting Started', articles: 12, color: 'from-blue-500 to-cyan-500' },
    { icon: FileText, title: 'Workflow Builder', articles: 24, color: 'from-violet-500 to-purple-500' },
    { icon: Video, title: 'Video Tutorials', articles: 8, color: 'from-pink-500 to-rose-500' },
    { icon: MessageCircle, title: 'Integrations', articles: 35, color: 'from-green-500 to-emerald-500' },
    { icon: HelpCircle, title: 'FAQ', articles: 18, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="overflow-hidden">
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className={`mb-6 border ${
              theme === 'dark'
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              Help Center
            </Badge>
            <h1 className={`text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              How Can We{' '}
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Help You?
              </span>
            </h1>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help..."
                className={`w-full border rounded-lg pl-12 pr-4 py-4 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 ${
                  theme === 'dark'
                    ? 'bg-[#1A1A2E] border-white/10 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card key={index} className={`p-6 transition-all group border ${
                  theme === 'dark'
                    ? 'bg-[#1A1A2E] border-white/10 hover:border-white/20'
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                }`}>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{category.title}</h3>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{category.articles} articles</p>
                </Card>
              );
            })}
          </div>

          <div className={`text-center rounded-2xl border p-12 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-blue-500/10 to-violet-500/10 border-white/10'
              : 'bg-gradient-to-r from-blue-50 to-violet-50 border-gray-200'
          }`}>
            <h2 className={`text-3xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Still Need Help?</h2>
            <p className={`mb-6 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Our support team is here to assist you</p>
            <Button
              onClick={() => onNavigate('contact')}
              className="bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 hover:opacity-90 text-white border-0 cursor-pointer"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
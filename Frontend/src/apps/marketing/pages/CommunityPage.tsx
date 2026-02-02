/**
 * Community Page
 */

import React from 'react';
import { Users, MessageSquare, Github, Twitter, Linkedin, Calendar } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { MarketingRoute } from '../MarketingApp';
import { useTheme } from '@/core/theme/ThemeContext';

interface CommunityPageProps {
  onNavigate: (route: MarketingRoute) => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ onNavigate }) => {
  const { theme } = useTheme();

  const stats = [
    { value: '10K+', label: 'Community Members' },
    { value: '500+', label: 'Active Developers' },
    { value: '1K+', label: 'Workflows Shared' },
    { value: '24/7', label: 'Support' },
  ];

  const channels = [
    { icon: MessageSquare, name: 'Discord', members: '8,500+', color: 'from-indigo-500 to-purple-500' },
    { icon: Github, name: 'GitHub', members: '2,300+', color: 'from-gray-600 to-gray-800' },
    { icon: Twitter, name: 'Twitter', members: '5,100+', color: 'from-blue-400 to-blue-600' },
    { icon: Linkedin, name: 'LinkedIn', members: '3,200+', color: 'from-blue-600 to-blue-800' },
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
              <Users className="w-3 h-3 mr-1" />
              Join the Community
            </Badge>
            <h1 className={`text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Connect with{' '}
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Automation Experts
              </span>
            </h1>
            <p className={`text-xl ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Join thousands of developers and automation enthusiasts
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {channels.map((channel, index) => {
              const Icon = channel.icon;
              return (
                <Card key={index} className={`p-8 transition-all group border ${
                  theme === 'dark'
                    ? 'bg-[#1A1A2E] border-white/10 hover:border-white/20'
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                }`}>
                  <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${channel.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className={`text-2xl font-semibold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{channel.name}</h3>
                  <p className={`mb-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{channel.members} members</p>
                  <Button
                    variant="outline"
                    className={`cursor-pointer border-2 ${
                      theme === 'dark'
                        ? 'border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-transparent'
                        : 'border-gray-300 text-gray-900 hover:bg-gray-100 hover:border-gray-400 bg-transparent'
                    }`}
                  >
                    Join Now
                  </Button>
                </Card>
              );
            })}
          </div>

          <div className={`text-center rounded-2xl border p-12 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-blue-500/10 to-violet-500/10 border-white/10'
              : 'bg-gradient-to-r from-blue-50 to-violet-50 border-gray-200'
          }`}>
            <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h2 className={`text-3xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Community Events</h2>
            <p className={`mb-6 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Join our weekly webinars and monthly meetups
            </p>
            <Button
              className="bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 hover:opacity-90 text-white border-0 cursor-pointer"
            >
              View Events
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
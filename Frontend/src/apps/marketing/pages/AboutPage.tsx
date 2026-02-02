/**
 * About Page
 * Company story, mission, and team
 */

import React from 'react';
import { Zap, Target, Users, Heart, Globe, Rocket, Shield } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { MarketingRoute } from '../MarketingApp';
import { useTheme } from '@/core/theme/ThemeContext';

interface AboutPageProps {
  onNavigate: (route: MarketingRoute) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { theme } = useTheme();

  const values = [
    {
      icon: Target,
      title: 'Customer First',
      description: 'Every decision we make starts with our customers. Their success is our success.',
    },
    {
      icon: Rocket,
      title: 'Innovation',
      description: 'We constantly push boundaries to create cutting-edge automation solutions.',
    },
    {
      icon: Heart,
      title: 'Simplicity',
      description: 'We believe powerful tools should be simple to use. Complexity is our job, not yours.',
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Great things are built together. We foster teamwork, transparency, and open communication.',
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Your data and privacy are paramount. We maintain the highest security standards.',
    },
    {
      icon: Globe,
      title: 'Accessibility',
      description: 'Automation should be accessible to everyone, regardless of technical background.',
    },
  ];

  const team = [
    {
      name: 'Alex Chen',
      role: 'CEO & Co-Founder',
      bio: 'Former Engineering Lead at Google. Passionate about democratizing AI.',
      avatar: 'AC',
    },
    {
      name: 'Sarah Miller',
      role: 'CTO & Co-Founder',
      bio: '15+ years building scalable systems. Ex-AWS Solutions Architect.',
      avatar: 'SM',
    },
    {
      name: 'Marcus Johnson',
      role: 'Head of Product',
      bio: 'Product designer turned PM. Obsessed with user experience.',
      avatar: 'MJ',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Engineering',
      bio: 'Full-stack wizard. Built systems used by millions at Stripe.',
      avatar: 'ER',
    },
  ];

  const stats = [
    { value: '2021', label: 'Founded' },
    { value: '50+', label: 'Team Members' },
    { value: '5K+', label: 'Customers' },
    { value: '$10M', label: 'Funding Raised' },
  ];

  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <section className="px-4 mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className={`mb-4 border ${
            theme === 'dark'
              ? 'bg-white/10 text-white border-white/20'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            About Us
          </Badge>
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            We're Building the Future of
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Intelligent Automation
            </span>
          </h1>
          <p className={`text-xl leading-relaxed ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Flowversal was born from a simple belief: powerful automation tools should be accessible to everyone, not just engineers. We're on a mission to democratize AI and workflow automation, empowering teams to build the future they envision.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 mb-20">
        <div className="max-w-5xl mx-auto">
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 rounded-2xl border p-8 sm:p-12 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-cyan-500/10 border-white/10'
              : 'bg-gradient-to-r from-blue-50 via-violet-50 to-cyan-50 border-gray-200'
          }`}>
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

      {/* Story */}
      <section className="px-4 mb-20">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-6 text-center ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Our Story</h2>
            <div className={`space-y-4 text-lg leading-relaxed ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <p>
                In 2021, our founders Alex and Sarah were frustrated. As engineers at leading tech companies, they saw how powerful automation could be—but it was locked away behind complex code and expensive enterprise tools.
              </p>
              <p>
                They envisioned a world where anyone could build sophisticated workflows without needing to write code. Where small teams could leverage the same AI capabilities as Fortune 500 companies. Where automation was simple, visual, and delightful.
              </p>
              <p>
                That vision became Flowversal. Today, we're proud to serve thousands of teams worldwide, from solo entrepreneurs to enterprise organizations, all building incredible automations with our platform.
              </p>
              <p>
                But we're just getting started. Join us as we continue building the future of intelligent automation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={`px-4 mb-20 py-20 ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-transparent via-blue-500/5 to-transparent'
          : 'bg-gradient-to-b from-transparent via-blue-50 to-transparent'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Our Values</h2>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  className={`p-6 transition-all group border ${
                    theme === 'dark'
                      ? 'bg-[#1A1A2E] border-white/10 hover:border-white/20'
                      : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <Icon className="w-10 h-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className={`text-xl font-semibold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{value.title}</h3>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{value.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-4 mb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className={`mb-4 border ${
              theme === 'dark'
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              Team
            </Badge>
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Meet the Team</h2>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              The people behind Flowversal
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card
                key={index}
                className={`p-6 transition-all text-center group border ${
                  theme === 'dark'
                    ? 'bg-[#1A1A2E] border-white/10 hover:border-white/20'
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                  {member.avatar}
                </div>
                <h3 className={`text-lg font-semibold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{member.name}</h3>
                <p className="text-sm text-blue-400 mb-3">{member.role}</p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>{member.bio}</p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className={`mb-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Want to join our team? We're hiring!
            </p>
            <Button
              variant="outline"
              className={`cursor-pointer border-2 ${
                theme === 'dark'
                  ? 'border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-transparent'
                  : 'border-gray-300 text-gray-900 hover:bg-gray-100 hover:border-gray-400 bg-transparent'
              }`}
              onClick={() => window.location.href = 'mailto:careers@flowversal.com'}
            >
              View Open Positions
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
            Join the Revolution
          </h2>
          <p className={`text-lg mb-8 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Start building powerful workflows today and be part of the automation future.
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = '/app?signup=true'}
            className="bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 hover:opacity-90 text-white border-0 cursor-pointer"
          >
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  );
};
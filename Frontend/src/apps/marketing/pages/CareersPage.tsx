/**
 * Careers Page
 * Job openings and company culture
 */

import React from 'react';
import { Briefcase, MapPin, Clock, ArrowRight, Users, Heart, Rocket, Coffee } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { MarketingRoute } from '../MarketingApp';
import { useTheme } from '@/core/theme/ThemeContext';

interface CareersPageProps {
  onNavigate: (route: MarketingRoute) => void;
}

export const CareersPage: React.FC<CareersPageProps> = ({ onNavigate }) => {
  const { theme } = useTheme();

  const jobs = [
    {
      title: 'Senior Full-Stack Engineer',
      department: 'Engineering',
      location: 'Remote / India',
      type: 'Full-time',
      description: 'Build the future of workflow automation with React, Node.js, and AI',
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      description: 'Create beautiful and intuitive user experiences for our platform',
    },
    {
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Hybrid / India',
      type: 'Full-time',
      description: 'Scale our infrastructure and ensure reliability across the stack',
    },
    {
      title: 'Customer Success Manager',
      department: 'Customer Success',
      location: 'Remote',
      type: 'Full-time',
      description: 'Help our customers succeed and grow their automation workflows',
    },
  ];

  const benefits = [
    { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive health insurance for you and your family' },
    { icon: Rocket, title: 'Career Growth', description: 'Learning budget and mentorship programs' },
    { icon: Coffee, title: 'Work-Life Balance', description: 'Flexible hours and unlimited PTO' },
    { icon: Users, title: 'Amazing Team', description: 'Work with talented people from around the world' },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className={`mb-6 border ${
              theme === 'dark'
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              <Briefcase className="w-3 h-3 mr-1" />
              We're Hiring!
            </Badge>
            <h1 className={`text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Join the{' '}
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Flowversal Team
              </span>
            </h1>
            <p className={`text-xl ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Help us build the future of AI-powered automation
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className={`p-6 text-center border ${
                  theme === 'dark'
                    ? 'bg-[#1A1A2E] border-white/10'
                    : 'bg-white border-gray-200 shadow-sm'
                }`}>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center mb-4 mx-auto">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`font-semibold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{benefit.title}</h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{benefit.description}</p>
                </Card>
              );
            })}
          </div>

          {/* Open Positions */}
          <div className="mb-16">
            <h2 className={`text-3xl font-bold mb-8 text-center ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Open Positions</h2>
            <div className="space-y-4 max-w-4xl mx-auto">
              {jobs.map((job, index) => (
                <Card key={index} className={`p-6 transition-all group border ${
                  theme === 'dark'
                    ? 'bg-[#1A1A2E] border-white/10 hover:border-white/20'
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-xl font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{job.title}</h3>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20">
                          {job.department}
                        </Badge>
                      </div>
                      <p className={`mb-3 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>{job.description}</p>
                      <div className={`flex flex-wrap gap-4 text-sm ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {job.type}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => window.location.href = 'mailto:careers@flowversal.com?subject=Application: ' + job.title}
                      className="bg-gradient-to-r from-blue-500 to-violet-500 hover:opacity-90 text-white border-0 cursor-pointer"
                    >
                      Apply Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className={`text-center rounded-2xl border p-12 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-blue-500/10 to-violet-500/10 border-white/10'
              : 'bg-gradient-to-r from-blue-50 to-violet-50 border-gray-200'
          }`}>
            <h2 className={`text-3xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Don't See the Right Role?</h2>
            <p className={`mb-6 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              We're always looking for talented people. Send us your resume!
            </p>
            <Button
              onClick={() => window.location.href = 'mailto:careers@flowversal.com'}
              className="bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 hover:opacity-90 text-white border-0 cursor-pointer"
            >
              Send Your Resume
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
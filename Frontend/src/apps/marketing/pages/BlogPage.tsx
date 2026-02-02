/**
 * Blog Page
 */

import React from 'react';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { MarketingRoute } from '../MarketingApp';
import { useTheme } from '@/core/theme/ThemeContext';

interface BlogPageProps {
  onNavigate: (route: MarketingRoute) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onNavigate }) => {
  const { theme } = useTheme();

  const posts = [
    {
      title: '10 Ways to Automate Your Business with AI',
      excerpt: 'Discover how AI automation can transform your business operations',
      author: 'Sarah Chen',
      date: 'Dec 15, 2024',
      category: 'Automation',
      readTime: '5 min read',
    },
    {
      title: 'Getting Started with Workflow Builder',
      excerpt: 'A comprehensive guide to building your first automation workflow',
      author: 'Michael Rodriguez',
      date: 'Dec 10, 2024',
      category: 'Tutorial',
      readTime: '8 min read',
    },
    {
      title: 'The Future of No-Code Automation',
      excerpt: 'How no-code platforms are democratizing automation',
      author: 'Emily Watson',
      date: 'Dec 5, 2024',
      category: 'Industry',
      readTime: '6 min read',
    },
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
              <BookOpen className="w-3 h-3 mr-1" />
              Our Blog
            </Badge>
            <h1 className={`text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Insights &{' '}
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Updates
              </span>
            </h1>
            <p className={`text-xl ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Learn about automation, AI, and productivity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <Card key={index} className={`p-6 transition-all group border ${
                theme === 'dark'
                  ? 'bg-[#1A1A2E] border-white/10 hover:border-white/20'
                  : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
              }`}>
                <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/20">
                  {post.category}
                </Badge>
                <h3 className={`text-xl font-semibold mb-3 group-hover:text-blue-400 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {post.title}
                </h3>
                <p className={`mb-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>{post.excerpt}</p>
                <div className={`flex items-center justify-between text-sm ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                </div>
                <div className={`mt-4 pt-4 border-t flex items-center justify-between ${
                  theme === 'dark' ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>{post.readTime}</span>
                  <button className="text-blue-400 flex items-center gap-1 hover:gap-2 transition-all cursor-pointer">
                    Read More <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
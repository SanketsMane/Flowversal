/**
 * Documentation App
 * Public documentation - no login required
 */

import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import {
  BookOpen,
  Search,
  Home,
  Zap,
  Users,
  Settings,
  Code,
  LifeBuoy,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

type DocSection = 'home' | 'getting-started' | 'workflows' | 'admin' | 'api' | 'support';

export function DocsApp() {
  const [currentSection, setCurrentSection] = useState<DocSection>('home');
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'getting-started', label: 'Getting Started', icon: Zap },
    { id: 'workflows', label: 'Workflows', icon: Sparkles },
    { id: 'admin', label: 'Admin Panel', icon: Settings },
    { id: 'api', label: 'API Reference', icon: Code },
    { id: 'support', label: 'Support', icon: LifeBuoy },
  ];

  const renderHome = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-4">Welcome to Flowversal Documentation</h1>
        <p className="text-xl text-gray-400">
          Learn how to use Flowversal to automate your workflows with AI-powered automation
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-[#1A1A2E] border-white/10 p-6 hover:bg-[#2A2A3E] cursor-pointer transition-all group"
          onClick={() => setCurrentSection('getting-started')}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Getting Started</h3>
          </div>
          <p className="text-gray-400 mb-3">Quick start guide to get you up and running</p>
          <div className="flex items-center text-blue-400 group-hover:text-blue-300">
            <span className="text-sm">Read more</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Card>

        <Card className="bg-[#1A1A2E] border-white/10 p-6 hover:bg-[#2A2A3E] cursor-pointer transition-all group"
          onClick={() => setCurrentSection('workflows')}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-violet-500/20">
              <Sparkles className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Workflows</h3>
          </div>
          <p className="text-gray-400 mb-3">Learn how to create and manage workflows</p>
          <div className="flex items-center text-violet-400 group-hover:text-violet-300">
            <span className="text-sm">Read more</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Card>

        <Card className="bg-[#1A1A2E] border-white/10 p-6 hover:bg-[#2A2A3E] cursor-pointer transition-all group"
          onClick={() => setCurrentSection('admin')}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-green-500/20">
              <Settings className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Admin Panel</h3>
          </div>
          <p className="text-gray-400 mb-3">Manage users, pricing, and system settings</p>
          <div className="flex items-center text-green-400 group-hover:text-green-300">
            <span className="text-sm">Read more</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Card>
      </div>

      {/* Popular Articles */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Popular Articles</h2>
        <div className="space-y-3">
          {[
            'How to create your first workflow',
            'Understanding workflow triggers',
            'Managing subscription pricing',
            'Workflow approval system',
            'Project statistics and metrics',
          ].map((article, idx) => (
            <div key={idx} className="flex items-center gap-3 p-4 rounded-lg bg-[#1A1A2E] border border-white/10 hover:bg-[#2A2A3E] cursor-pointer transition-all">
              <ChevronRight className="w-5 h-5 text-gray-400" />
              <span className="text-white">{article}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentSection) {
      case 'home':
        return renderHome();
      case 'getting-started':
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white">Getting Started</h1>
            <Card className="bg-[#1A1A2E] border-white/10 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Welcome to Flowversal!</h2>
              <div className="space-y-4 text-gray-300">
                <p>Flowversal is an AI-powered automation platform that helps you create and manage workflows efficiently.</p>
                
                <h3 className="text-xl font-semibold text-white mt-6">Routes & Access</h3>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Marketing Page:</strong> <code className="text-blue-400">http://localhost:3000/</code>
                      <p className="text-sm text-gray-400">Public landing page with pricing and features</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Main App:</strong> <code className="text-blue-400">http://localhost:3000/app</code>
                      <p className="text-sm text-gray-400">Workflow builder and management (requires login)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Admin Panel:</strong> <code className="text-blue-400">http://localhost:3000/admin</code>
                      <p className="text-sm text-gray-400">Admin dashboard (requires admin role)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Documentation:</strong> <code className="text-blue-400">http://localhost:3000/docs</code>
                      <p className="text-sm text-gray-400">This documentation (public access)</p>
                    </div>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6">Demo Credentials</h3>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-white font-semibold mb-2">Admin Access:</p>
                  <code className="text-blue-400">Email: demo@demo.com</code><br/>
                  <code className="text-blue-400">Password: demo@123</code>
                </div>
              </div>
            </Card>
          </div>
        );
      case 'workflows':
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white">Workflows</h1>
            <Card className="bg-[#1A1A2E] border-white/10 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Creating Workflows</h2>
              <div className="space-y-4 text-gray-300">
                <p>Workflows are automated processes that help you accomplish tasks efficiently.</p>
                <h3 className="text-xl font-semibold text-white mt-6">Steps:</h3>
                <ol className="space-y-3 ml-6 list-decimal">
                  <li>Navigate to the main app at <code className="text-blue-400">/app</code></li>
                  <li>Click the "Create" button in the top navigation</li>
                  <li>Choose a template or start from scratch</li>
                  <li>Add triggers and actions</li>
                  <li>Test your workflow</li>
                  <li>Submit for approval (if required)</li>
                </ol>
              </div>
            </Card>
          </div>
        );
      case 'admin':
        return (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
            <Card className="bg-[#1A1A2E] border-white/10 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Admin Features</h2>
              <div className="space-y-4 text-gray-300">
                <p>The admin panel provides comprehensive control over the Flowversal platform.</p>
                
                <h3 className="text-xl font-semibold text-white mt-6">Available Pages:</h3>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 mt-0.5 text-violet-400 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Dashboard:</strong> Overview of key metrics
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 mt-0.5 text-violet-400 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Users:</strong> Manage user accounts and permissions
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 mt-0.5 text-violet-400 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Projects:</strong> View project statistics and task board metrics
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 mt-0.5 text-violet-400 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Workflow Approvals:</strong> Approve or reject workflows with messages
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 mt-0.5 text-violet-400 flex-shrink-0" />
                    <div>
                      <strong className="text-white">Subscriptions & Pricing:</strong> Edit pricing and features (reflects everywhere!)
                    </div>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6">Theme System:</h3>
                <p>Click the Sun/Moon icon in the sidebar to toggle between dark and light modes.</p>
              </div>
            </Card>
          </div>
        );
      default:
        return renderHome();
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E1F] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#2A2A3E] bg-[#1A1A2E] flex flex-col">
        <div className="p-6 border-b border-[#2A2A3E]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-white">Flowversal</h1>
              <p className="text-xs text-gray-400">Documentation</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentSection(item.id as DocSection)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#00C6FF]/10 to-[#9D50BB]/10 text-white border border-[#00C6FF]/20'
                    : 'text-gray-400 hover:bg-[#2A2A3E] hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#2A2A3E]">
          <a
            href="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:opacity-90 transition-opacity"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-[#1A1A2E] border-[#2A2A3E] text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

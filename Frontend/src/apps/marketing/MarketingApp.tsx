/**
 * Marketing Site App
 * Main router for public-facing marketing pages
 */

import React, { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { AboutPage } from './pages/AboutPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { CareersPage } from './pages/CareersPage';
import { ContactPage } from './pages/ContactPage';
import { BlogPage } from './pages/BlogPage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { CommunityPage } from './pages/CommunityPage';
import { MarketingNav } from './components/MarketingNav';
import { MarketingFooter } from './components/MarketingFooter';
import { useTheme } from '@/core/theme/ThemeContext';
import SplashCursor from '@/shared/components/ui/SplashCursor';

export type MarketingRoute = 'home' | 'pricing' | 'features' | 'about' | 'integrations' | 'careers' | 'contact' | 'blog' | 'help' | 'community';

export const MarketingApp: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<MarketingRoute>('home');
  const { theme } = useTheme();

  const renderPage = () => {
    switch (currentRoute) {
      case 'home':
        return <LandingPage onNavigate={setCurrentRoute} />;
      case 'pricing':
        return <PricingPage onNavigate={setCurrentRoute} />;
      case 'features':
        return <FeaturesPage onNavigate={setCurrentRoute} />;
      case 'about':
        return <AboutPage onNavigate={setCurrentRoute} />;
      case 'integrations':
        return <IntegrationsPage onNavigate={setCurrentRoute} />;
      case 'careers':
        return <CareersPage onNavigate={setCurrentRoute} />;
      case 'contact':
        return <ContactPage onNavigate={setCurrentRoute} />;
      case 'blog':
        return <BlogPage onNavigate={setCurrentRoute} />;
      case 'help':
        return <HelpCenterPage onNavigate={setCurrentRoute} />;
      case 'community':
        return <CommunityPage onNavigate={setCurrentRoute} />;
      default:
        return <LandingPage onNavigate={setCurrentRoute} />;
    }
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-[#0E0E1F] text-white' 
        : 'bg-white text-gray-900'
    }`}>
      {/* Rainbow Splash Cursor Effect - Behind everything with low z-index */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <SplashCursor />
      </div>
      
      {/* Navigation - Highest z-index, always on top */}
      <MarketingNav currentRoute={currentRoute} onNavigate={setCurrentRoute} />
      
      {/* Page Content - Add padding to account for fixed header */}
      <main className="relative z-10" style={{ paddingTop: '80px' }}>
        {renderPage()}
      </main>
      
      {/* Footer */}
      <div className="relative z-10">
        <MarketingFooter onNavigate={setCurrentRoute} />
      </div>
    </div>
  );
};
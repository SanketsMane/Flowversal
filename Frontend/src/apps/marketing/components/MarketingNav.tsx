/**
 * Marketing Navigation
 * Top navigation bar for marketing site
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { Button } from '@/shared/components/ui/button';
import flowversalLogoDark from 'figma:asset/6002bc04b2fb15d40304d81c459c74499954d9ad.png';
import flowversalLogoLight from 'figma:asset/a343b12e588be649c0fd15261a16aac9163083d0.png';
import { Menu, Moon, Sun, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { MarketingRoute } from '../MarketingApp';

interface MarketingNavProps {
  currentRoute: MarketingRoute;
  onNavigate: (route: MarketingRoute) => void;
}

export const MarketingNav: React.FC<MarketingNavProps> = ({ currentRoute, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { label: string; route: MarketingRoute }[] = [
    { label: 'Features', route: 'features' },
    { label: 'Pricing', route: 'pricing' },
    { label: 'About', route: 'about' },
  ];

  const handleSignIn = () => {
    // Navigate to app login
    window.location.href = '/app';
  };

  const handleGetStarted = () => {
    // Navigate to signup
    window.location.href = '/app?signup=true';
  };

  const { theme, toggleTheme } = useTheme();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-[#0E0E1F] border-b border-white/10'
          : 'bg-white border-b border-gray-200'
      } shadow-md`}
      style={{ pointerEvents: 'auto' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img 
              src={theme === 'dark' ? flowversalLogoDark : flowversalLogoLight} 
              alt="Flowversal" 
              className="h-8 sm:h-10" 
            />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                className={`text-sm font-medium transition-colors relative group cursor-pointer ${
                  currentRoute === item.route
                    ? 'text-blue-500'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-700 hover:text-black'
                }`}
              >
                {item.label}
                {currentRoute === item.route && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400" />
                )}
              </button>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-white/10 hover:bg-white/20'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
            <Button
              variant="ghost"
              onClick={handleSignIn}
              className={`cursor-pointer ${
                theme === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-white/10'
                  : 'text-gray-700 hover:text-black hover:bg-gray-100'
              }`}
            >
              Sign In
            </Button>
            {process.env.NODE_ENV === 'development' && (
              <Button
                variant="outline"
                onClick={() => {
                  // Demo login - navigate to app
                  window.location.href = '/app?demo=true';
                }}
                className="cursor-pointer border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                Demo Login
              </Button>
            )}
            <Button
              onClick={handleGetStarted}
              className="cursor-pointer bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 hover:opacity-90 text-white border-0"
            >
              Get Started Free
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors cursor-pointer ${
              theme === 'dark' 
                ? 'hover:bg-white/10' 
                : 'hover:bg-gray-200'
            }`}
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`md:hidden border-t backdrop-blur-lg ${
          theme === 'dark'
            ? 'border-white/10 bg-[#0E0E1F]/98'
            : 'border-gray-200 bg-white/98'
        }`}>
          <div className="px-4 py-4 space-y-3">
            {/* Theme Toggle in Mobile */}
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'hover:bg-white/5 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-5 h-5 text-yellow-400" />
                  <span>Switch to Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5 text-gray-700" />
                  <span>Switch to Dark Mode</span>
                </>
              )}
            </button>
            
            {navItems.map((item) => (
              <button
                key={item.route}
                onClick={() => {
                  onNavigate(item.route);
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                  currentRoute === item.route
                    ? 'bg-blue-500/20 text-blue-500'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className={`pt-3 border-t space-y-2 ${
              theme === 'dark' ? 'border-white/10' : 'border-gray-200'
            }`}>
              <Button
                variant="outline"
                onClick={handleSignIn}
                className={`w-full cursor-pointer ${
                  theme === 'dark'
                    ? 'border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-transparent'
                    : 'border-2 border-gray-300 text-gray-900 hover:bg-gray-100 hover:border-gray-400 bg-transparent'
                }`}
              >
                Sign In
              </Button>
              <Button
                onClick={handleGetStarted}
                className="w-full cursor-pointer bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 hover:opacity-90 text-white border-0"
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
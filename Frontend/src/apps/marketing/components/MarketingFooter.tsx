/**
 * Marketing Footer
 * Company info, links, and social media
 */

import React from 'react';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';
import { MarketingRoute } from '../MarketingApp';
import flowversalLogoDark from 'figma:asset/6002bc04b2fb15d40304d81c459c74499954d9ad.png';
import { useTheme } from '@/core/theme/ThemeContext';

interface MarketingFooterProps {
  onNavigate: (route: MarketingRoute) => void;
}

export const MarketingFooter: React.FC<MarketingFooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', route: 'features' as MarketingRoute },
        { label: 'Pricing', route: 'pricing' as MarketingRoute },
        { label: 'Workflow Templates', href: '/app' },
        { label: 'Integrations', route: 'integrations' as MarketingRoute },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', route: 'about' as MarketingRoute },
        { label: 'Careers', route: 'careers' as MarketingRoute },
        { label: 'Contact', route: 'contact' as MarketingRoute },
        { label: 'Blog', route: 'blog' as MarketingRoute },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '/docs' },
        { label: 'API Reference', href: '/docs/api' },
        { label: 'Help Center', route: 'help' as MarketingRoute },
        { label: 'Community', route: 'community' as MarketingRoute },
      ],
    },
    {
      title: 'Access',
      links: [
        { label: 'App Dashboard', href: '/app' },
        { label: 'Admin Panel', href: '/admin' },
        { label: 'Login', href: '/app' },
        { label: 'Sign Up', href: '/app?signup=true' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Mail, href: 'mailto:info@flowversal.com', label: 'Email' },
  ];

  const { theme } = useTheme();

  return (
    <footer className={`border-t ${
      theme === 'dark'
        ? 'bg-[#0A0A14] border-white/10 text-white'
        : 'bg-gray-50 border-gray-200 text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img 
                src={flowversalLogoDark} 
                alt="Flowversal" 
                className={`h-8 ${theme === 'light' ? 'filter brightness-0' : ''}`} 
              />
            </button>
            <p className={`text-sm mb-6 max-w-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Build powerful AI workflows and automations without code. Transform your business with intelligent automation.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors group cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-white/5 hover:bg-white/10'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    aria-label={social.label}
                  >
                    <Icon className={`w-4 h-4 transition-colors ${
                      theme === 'dark'
                        ? 'text-gray-400 group-hover:text-white'
                        : 'text-gray-600 group-hover:text-gray-900'
                    }`} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className={`font-semibold mb-4 text-sm ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.route ? (
                      <button
                        onClick={() => onNavigate(link.route)}
                        className={`text-sm transition-colors cursor-pointer ${
                          theme === 'dark'
                            ? 'text-gray-400 hover:text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        className={`text-sm transition-colors cursor-pointer ${
                          theme === 'dark'
                            ? 'text-gray-400 hover:text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className={`pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
          theme === 'dark' ? 'border-white/10' : 'border-gray-200'
        }`}>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            © {currentYear} Flowversal. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className={`text-xs ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Made with ❤️ by the Flowversal team
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
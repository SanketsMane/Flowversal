import { useTheme } from '@/core/theme/ThemeContext';
import { ChangePasswordModal } from '@/shared/components/ui/ChangePasswordModal';
import { MyDashboardModal } from '@/shared/components/ui/MyDashboardModal';
import { ReferralModal } from '@/shared/components/ui/ReferralModal';
import { UpdateProfileModal } from '@/shared/components/ui/UpdateProfileModal';
import flowversalLogoDark from 'figma:asset/6002bc04b2fb15d40304d81c459c74499954d9ad.png';
import flowversalLogoLight from 'figma:asset/a343b12e588be649c0fd15261a16aac9163083d0.png';
import { BarChart3, Bell, CreditCard, Gift, Menu, MessageSquare, Moon, Search, Settings, Shield, Sun, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface TopNavBarProps {
  onChatClick?: () => void;
  onSubscriptionClick?: () => void;
  onMobileMenuClick?: () => void;
}

export function TopNavBar({ onChatClick, onSubscriptionClick, onMobileMenuClick }: TopNavBarProps) {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showMyDashboard, setShowMyDashboard] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const bgColor = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200';
  const inputBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const placeholderColor = theme === 'dark' ? 'placeholder:text-[#CFCFE8]/50' : 'placeholder:text-gray-400';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const notifications: Array<{
    id: number;
    title: string;
    message: string;
    time: string;
    unread: boolean;
  }> = [];
  // TODO: Replace with real notifications from backend API

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 h-16 ${bgColor} border-b ${borderColor} z-50 transition-colors duration-300`}>
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          {/* Left: Mobile Menu + Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button 
              onClick={onMobileMenuClick}
              className={`lg:hidden w-10 h-10 rounded-xl ${inputBg} border ${borderColor} flex items-center justify-center hover:border-[#00C6FF]/50 transition-all`}
            >
              <Menu className={`w-5 h-5 ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`} />
            </button>
            
            {/* Logo */}
            <img 
              src={theme === 'dark' ? flowversalLogoDark : flowversalLogoLight} 
              alt="Flowversal" 
              className="h-6 lg:h-8" 
            />
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative group w-full">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-[#CFCFE8]/50' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search tools or workflows…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${inputBg} border ${borderColor} rounded-xl py-2.5 pl-12 pr-4 ${textColor} ${placeholderColor} focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[#00C6FF]/50 transition-all`}
              />
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Mobile Search Button */}
            <button 
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className={`md:hidden w-10 h-10 rounded-xl ${inputBg} border ${borderColor} flex items-center justify-center hover:border-[#00C6FF]/50 transition-all`}
            >
              <Search className={`w-5 h-5 ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`} />
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className={`w-10 h-10 rounded-xl ${inputBg} border ${borderColor} flex items-center justify-center hover:border-[#00C6FF]/50 transition-all`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-[#CFCFE8]" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Chat Button - Hidden on small mobile */}
            <button 
              onClick={onChatClick}
              className={`hidden sm:flex w-10 h-10 rounded-xl ${inputBg} border ${borderColor} items-center justify-center hover:border-[#00C6FF]/50 transition-all`}
            >
              <MessageSquare className={`w-5 h-5 ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`} />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`w-10 h-10 rounded-xl ${inputBg} border ${borderColor} flex items-center justify-center hover:border-[#00C6FF]/50 transition-all relative`}
              >
                <Bell className={`w-5 h-5 ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] rounded-full"></span>
              </button>

              {showNotifications && (
                <div className={`absolute top-full right-0 mt-2 w-[90vw] sm:w-96 ${bgCard} border ${borderColor} rounded-xl shadow-2xl z-50 max-h-[500px] overflow-hidden flex flex-col`}>
                  {/* Header */}
                  <div className={`px-4 py-3 border-b ${borderColor}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={textColor}>Notifications</h3>
                      <button className="text-xs text-[#00C6FF] hover:underline">Mark all as read</button>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b ${borderColor} ${hoverBg} transition-colors cursor-pointer ${
                          notification.unread ? 'bg-[#00C6FF]/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notification.unread ? 'bg-[#00C6FF]' : 'bg-transparent'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className={`${textColor} text-sm mb-1`}>{notification.title}</p>
                            <p className={`${textSecondary} text-xs mb-1`}>{notification.message}</p>
                            <p className={`${textSecondary} text-xs`}>{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className={`px-4 py-3 border-t ${borderColor} text-center`}>
                    <button className="text-sm text-[#00C6FF] hover:underline">View all notifications</button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00C6FF] via-[#0072FF] to-[#9D50BB] p-0.5 hover:scale-105 transition-transform"
              >
                <div className={`w-full h-full rounded-full ${inputBg} flex items-center justify-center`}>
                  <span className={`${textColor} text-sm`}>JD</span>
                </div>
              </button>

              {showProfileMenu && (
                <div className={`absolute top-full right-0 mt-2 w-56 ${bgCard} border ${borderColor} rounded-xl shadow-2xl z-50 overflow-hidden`}>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSubscriptionClick?.();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 ${hoverBg} transition-colors text-left`}
                  >
                    <CreditCard className={`w-4 h-4 ${textSecondary}`} />
                    <span className={textColor}>My Subscription</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowUpdateProfile(true);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 ${hoverBg} transition-colors text-left`}
                  >
                    <Settings className={`w-4 h-4 ${textSecondary}`} />
                    <span className={textColor}>Update Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowChangePassword(true);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 ${hoverBg} transition-colors text-left`}
                  >
                    <Shield className={`w-4 h-4 ${textSecondary}`} />
                    <span className={textColor}>Change Password</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowMyDashboard(true);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 ${hoverBg} transition-colors text-left`}
                  >
                    <BarChart3 className={`w-4 h-4 ${textSecondary}`} />
                    <span className={textColor}>My Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowReferral(true);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 ${hoverBg} transition-colors text-left`}
                  >
                    <Gift className={`w-4 h-4 ${textSecondary}`} />
                    <span className={textColor}>Referral Program</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden">
          <div className={`${bgColor} p-4`}>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-[#CFCFE8]/50' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search tools or workflows…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className={`w-full ${inputBg} border ${borderColor} rounded-xl py-3 pl-12 pr-4 ${textColor} ${placeholderColor} focus:outline-none focus:border-transparent focus:ring-2 focus:ring-[#00C6FF]/50 transition-all`}
                />
              </div>
              <button
                onClick={() => setShowMobileSearch(false)}
                className={`w-10 h-10 rounded-xl ${inputBg} border ${borderColor} flex items-center justify-center`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <UpdateProfileModal 
        isOpen={showUpdateProfile} 
        onClose={() => setShowUpdateProfile(false)} 
      />
      <ChangePasswordModal 
        isOpen={showChangePassword} 
        onClose={() => setShowChangePassword(false)} 
      />
      <MyDashboardModal 
        isOpen={showMyDashboard} 
        onClose={() => setShowMyDashboard(false)} 
      />
      <ReferralModal 
        isOpen={showReferral} 
        onClose={() => setShowReferral(false)} 
      />
      <MyDashboardModal 
        isOpen={showMyDashboard} 
        onClose={() => setShowMyDashboard(false)} 
      />
      <ReferralModal 
        isOpen={showReferral} 
        onClose={() => setShowReferral(false)} 
      />
    </>
  );
}
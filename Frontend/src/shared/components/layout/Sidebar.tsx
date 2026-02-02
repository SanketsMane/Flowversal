import { Brain, Heart, MessageSquare, Plus, FolderKanban, HardDrive, ChevronLeft, ChevronRight, LayoutDashboard, Grid3x3, Settings, LogOut, Crown } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';

interface SidebarProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
  onCategoryPanelToggle?: (isOpen: boolean) => void;
  onCollapseChange?: (isCollapsed: boolean) => void;
  onAppsClick?: () => void;
  onUpgradeClick?: () => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
  onCreateClick?: () => void;
}

export function Sidebar({ onNavigate, currentPage = 'home', onCategoryPanelToggle, onCollapseChange, onAppsClick, onUpgradeClick, onSettingsClick, onLogoutClick, onCreateClick }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true); // Minimized by default
  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);
  const { theme } = useTheme();

  const mainNavItems = [
    { icon: Plus, label: 'Create', active: false, highlighted: true, page: 'create' },
    { icon: LayoutDashboard, label: 'Dashboard', active: false, page: 'home' },
    { icon: Grid3x3, label: 'AI Apps', active: false, page: 'ai-apps', isApps: true, shouldCollapse: true },
    { icon: Brain, label: 'My Workflows', active: false, page: 'my-workflows' },
    { icon: Heart, label: 'Favorites', active: false, page: 'favorites' },
    { icon: MessageSquare, label: 'Chat', active: false, page: 'chat', shouldCollapse: true },
    { icon: FolderKanban, label: 'Projects', active: false, page: 'projects', shouldCollapse: true },
    { icon: HardDrive, label: 'Drive', active: false, page: 'drive', shouldCollapse: true },
  ];

  const handleCategoryClick = () => {
    // Collapse sidebar when navigating to AI Apps
    setIsCollapsed(true);
    onCollapseChange?.(true);
    // Close category panel
    setIsCategoryPanelOpen(false);
    onCategoryPanelToggle?.(false);
    // Navigate to AI Apps page
    onAppsClick?.();
  };

  const handleNavClick = (page: string, isApps?: boolean, shouldCollapse?: boolean) => {
    if (isApps) {
      handleCategoryClick();
      return;
    }
    
    // Handle Create button click
    if (page === 'create') {
      onCreateClick?.();
      return;
    }
    
    // Collapse sidebar if this item should trigger collapse
    if (shouldCollapse) {
      setIsCollapsed(true);
      onCollapseChange?.(true);
    }
    
    // Close category panel when navigating to other pages
    setIsCategoryPanelOpen(false);
    onCategoryPanelToggle?.(false);
    
    onNavigate?.(page);
  };

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapseChange?.(newCollapsedState);
    if (newCollapsedState) {
      setIsCategoryPanelOpen(false);
      onCategoryPanelToggle?.(false);
    }
  };

  const bgColor = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textColorHover = theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900';

  return (
    <div className={`fixed left-0 top-16 bottom-0 ${isCollapsed ? 'w-[140px]' : 'w-[220px]'} ${bgColor} border-r ${borderColor} flex flex-col transition-all duration-300 z-50`}>
      {/* Gradient accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#00C6FF] via-[#0072FF] to-[#9D50BB]"></div>

      {/* Collapse Toggle Button - Crystal Glass Style */}
      <button
        onClick={toggleCollapse}
        className={`absolute -right-2.5 top-1/2 -translate-y-1/2 z-50 w-5 h-10 rounded-full flex items-center justify-center transition-all duration-300 group ${
          theme === 'dark' 
            ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20' 
            : 'bg-black/5 hover:bg-black/10 border border-black/10 hover:border-black/20'
        } backdrop-blur-md shadow-sm hover:shadow-md`}
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className={`w-3 h-3 ${theme === 'dark' ? 'text-white/40' : 'text-black/40'} group-hover:text-[#00C6FF] transition-all duration-300`} />
        ) : (
          <ChevronLeft className={`w-3 h-3 ${theme === 'dark' ? 'text-white/40' : 'text-black/40'} group-hover:text-[#00C6FF] transition-all duration-300`} />
        )}
      </button>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-[140px]">
        {/* Main Navigation */}
        {mainNavItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleNavClick(item.page, item.isApps, item.shouldCollapse)}
            className={`w-full flex ${isCollapsed ? 'flex-col items-center justify-center px-2 py-2' : 'items-center gap-3 px-3 py-3'} rounded-lg transition-all group relative ${
              item.highlighted
                ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50'
                : (item.isApps && isCategoryPanelOpen) || currentPage === item.page
                ? `bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 ${theme === 'dark' ? 'text-white' : 'text-gray-900 font-medium'} border border-[#00C6FF]/50 shadow-[0_0_10px_rgba(0,198,255,0.3)]`
                : `${textColor} hover:bg-gradient-to-r hover:from-[#00C6FF]/10 hover:to-[#9D50BB]/10 ${textColorHover}`
            }`}
            title={isCollapsed ? item.label : ''}
          >
            <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'} ${
              item.highlighted ? '' : 
              ((item.isApps && isCategoryPanelOpen) || currentPage === item.page) && theme === 'light' ? 'text-[#0072FF]' :
              'group-hover:text-[#00C6FF]'
            }`} />
            {isCollapsed ? (
              <span className="text-[10.5px] mt-1 truncate w-full text-center leading-tight whitespace-nowrap px-0.5">{item.label}</span>
            ) : (
              <span className="whitespace-nowrap">{item.label}</span>
            )}
          </button>
        ))}
      </div>

      {/* Bottom Section - Fixed */}
      <div className={`border-t ${borderColor} ${bgColor} p-4 space-y-2`}>
        <button 
          onClick={onSettingsClick}
          className={`w-full flex ${isCollapsed ? 'flex-col items-center justify-center px-2 py-2' : 'items-center gap-3 px-3 py-3'} rounded-lg ${textColor} hover:bg-gradient-to-r hover:from-[#00C6FF]/10 hover:to-[#9D50BB]/10 ${textColorHover} transition-all group`}
          title={isCollapsed ? 'Settings' : ''}
        >
          <Settings className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'} group-hover:text-[#00C6FF]`} />
          {isCollapsed ? (
            <span className="text-[10.5px] mt-1 truncate w-full text-center leading-tight whitespace-nowrap">Settings</span>
          ) : (
            <span className="whitespace-nowrap">Settings</span>
          )}
        </button>
        <button 
          onClick={onUpgradeClick}
          className={`w-full flex ${isCollapsed ? 'flex-col items-center justify-center px-2 py-2' : 'items-center gap-3 px-3 py-3'} rounded-lg ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 border border-[#FFD700]/30 hover:from-[#FFD700]/30 hover:to-[#FFA500]/30'
              : 'bg-gradient-to-r from-[#10B981]/20 to-[#34D399]/20 border border-[#10B981]/30 hover:from-[#10B981]/30 hover:to-[#34D399]/30'
          } transition-all group`}
          title={isCollapsed ? 'Upgrade to Pro' : ''}
        >
          <Crown className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'} ${theme === 'dark' ? 'text-[#FFD700]' : 'text-[#10B981]'}`} />
          {isCollapsed ? (
            <span className={`text-[10.5px] mt-1 truncate w-full text-center leading-tight whitespace-nowrap ${theme === 'dark' ? 'text-[#FFD700]' : 'text-[#10B981]'}`}>Upgrade</span>
          ) : (
            <span className={`${theme === 'dark' ? 'text-[#FFD700]' : 'text-[#10B981]'} whitespace-nowrap`}>Upgrade to Pro</span>
          )}
        </button>
        <button 
          onClick={onLogoutClick}
          className={`w-full flex ${isCollapsed ? 'flex-col items-center justify-center px-2 py-2' : 'items-center gap-3 px-3 py-3'} rounded-lg ${textColor} hover:bg-gradient-to-r hover:from-[#00C6FF]/10 hover:to-[#9D50BB]/10 ${textColorHover} transition-all group`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'} group-hover:text-[#00C6FF]`} />
          {isCollapsed ? (
            <span className="text-[10.5px] mt-1 truncate w-full text-center leading-tight whitespace-nowrap">Logout</span>
          ) : (
            <span className="whitespace-nowrap">Logout</span>
          )}
        </button>
      </div>
    </div>
  );
}
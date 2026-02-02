import { X, Plus, LayoutDashboard, Grid3x3, Brain, Heart, MessageSquare, FolderKanban, HardDrive, Settings, LogOut, Crown } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
  onAppsClick: () => void;
  onUpgradeClick: () => void;
  onSettingsClick: () => void;
  onLogoutClick: () => void;
  onCreateClick: () => void;
}

export function MobileNav({
  isOpen,
  onClose,
  onNavigate,
  currentPage,
  onAppsClick,
  onUpgradeClick,
  onSettingsClick,
  onLogoutClick,
  onCreateClick,
}: MobileNavProps) {
  const { theme } = useTheme();

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  const mainNavItems = [
    { icon: Plus, label: 'Create', page: 'create', highlighted: true },
    { icon: LayoutDashboard, label: 'Dashboard', page: 'home' },
    { icon: Grid3x3, label: 'AI Apps', page: 'ai-apps', isApps: true },
    { icon: Brain, label: 'My Workflows', page: 'my-workflows' },
    { icon: Heart, label: 'Favorites', page: 'favorites' },
    { icon: MessageSquare, label: 'Chat', page: 'chat' },
    { icon: FolderKanban, label: 'Projects', page: 'projects' },
    { icon: HardDrive, label: 'Drive', page: 'drive' },
  ];

  const handleItemClick = (item: any) => {
    if (item.isApps) {
      onAppsClick();
    } else if (item.page === 'create') {
      onCreateClick();
    } else {
      onNavigate(item.page);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className={`fixed left-0 top-0 bottom-0 w-72 ${bgMain} border-r ${borderColor} z-50 lg:hidden overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b ${borderColor}">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00C6FF] via-[#0072FF] to-[#9D50BB] flex items-center justify-center">
              <span className="text-white text-lg">F</span>
            </div>
            <span className={`text-xl ${textPrimary}`}>Flowversal</span>
          </div>
          <button
            onClick={onClose}
            className={`w-10 h-10 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'} flex items-center justify-center hover:bg-white/10 transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1">
          {mainNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            
            if (item.highlighted) {
              return (
                <button
                  key={index}
                  onClick={() => handleItemClick(item)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 border border-[#00C6FF]/30 text-[#00C6FF]'
                    : `${textSecondary} hover:bg-gradient-to-r hover:from-[#00C6FF]/10 hover:to-[#9D50BB]/10`
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="p-3 mt-auto border-t ${borderColor} space-y-2">
          <button
            onClick={() => {
              onUpgradeClick();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 border border-[#FFD700]/30 hover:from-[#FFD700]/30 hover:to-[#FFA500]/30 transition-all"
          >
            <Crown className="w-5 h-5 text-[#FFD700]" />
            <span className="text-[#FFD700]">Upgrade to Pro</span>
          </button>
          
          <button
            onClick={() => {
              onSettingsClick();
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${textSecondary} hover:bg-gradient-to-r hover:from-[#00C6FF]/10 hover:to-[#9D50BB]/10 transition-all`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          
          <button
            onClick={() => {
              onLogoutClick();
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${textSecondary} hover:bg-gradient-to-r hover:from-[#00C6FF]/10 hover:to-[#9D50BB]/10 transition-all`}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * Admin Layout - Simple & Clean
 * Sidebar + Main Content Area
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Workflow, 
  Activity,
  LogOut,
  Sparkles,
  CreditCard,
  BarChart3,
  Server,
  FileText,
  Moon,
  Sun,
  FolderKanban,
  CheckCircle,
  DollarSign,
  UserCog, // Add icon for Admin Users
  Folder // Add icon for Categories
} from 'lucide-react';
import { useAdminAuthStore } from '@/core/stores/admin/adminAuthStore';
import { useThemeStore } from '@/core/stores/admin/themeStore';
import { AdminPage } from '../AdminApp';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
}

export function AdminLayout({ children, currentPage, onNavigate }: AdminLayoutProps) {
  const { adminName, adminEmail, logoutAdmin } = useAdminAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const menuItems: Array<{
    id: AdminPage;
    label: string;
    icon: React.ElementType;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'admin-users', label: 'Admin Users', icon: UserCog },
    { id: 'categories', label: 'Categories', icon: Folder },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'workflows', label: 'Workflows', icon: Workflow },
    { id: 'workflow-approvals', label: 'Workflow Approvals', icon: CheckCircle },
    { id: 'executions', label: 'Executions', icon: Activity },
    { id: 'subscriptions', label: 'Subscription', icon: CreditCard },
    { id: 'monitoring', label: 'Monitoring', icon: Server },
    { id: 'activity', label: 'Activity Log', icon: FileText },
  ];

  const handleLogout = () => {
    logoutAdmin();
    // No need to redirect - the AdminApp will show login page automatically
  };

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <aside className={`w-64 border-r flex flex-col ${
        theme === 'dark' 
          ? 'bg-[#1A1A2E] border-[#2A2A3E]' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Logo */}
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Flowversal</h1>
                <p className={`text-xs ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-500'}`}>Admin Panel</p>
              </div>
            </div>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all ${
                theme === 'dark'
                  ? 'bg-[#2A2A3E] text-yellow-400 hover:bg-[#3A3A4E]'
                  : 'bg-gray-100 text-blue-600 hover:bg-gray-200'
              }`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? theme === 'dark'
                      ? 'bg-gradient-to-r from-[#00C6FF]/10 to-[#9D50BB]/10 text-white border border-[#00C6FF]/20'
                      : 'bg-gradient-to-r from-blue-50 to-violet-50 text-blue-900 border border-blue-200'
                    : theme === 'dark'
                    ? 'text-[#CFCFE8] hover:bg-[#2A2A3E] hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center text-white font-semibold">
              {adminName?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{adminName}</p>
              <p className={`text-xs truncate ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-500'}`}>{adminEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
              theme === 'dark'
                ? 'bg-[#2A2A3E] text-[#CFCFE8] hover:bg-[#3A3A4E] hover:text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
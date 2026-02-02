/**
 * Admin Application - Main Entry Point
 * Connected to REAL data from core stores
 * Requires secure admin login - SEPARATE from main app auth
 */

import React, { useState } from 'react';
import { useAdminAuthStore } from '@/core/stores/admin/adminAuthStore';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminLogin } from './pages/AdminLogin';
import { DashboardPage } from './pages/Dashboard';
import { UsersPage } from './pages/Users';
import { WorkflowsPage } from './pages/Workflows';
import { ExecutionsPage } from './pages/Executions';
import { SubscriptionManagementV2 } from './pages/SubscriptionManagementV2';
import { SystemMonitoring } from './pages/SystemMonitoring';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ActivityLog } from './pages/ActivityLog';
import { ProjectsStats } from './pages/ProjectsStats';
import { WorkflowApprovals } from './pages/WorkflowApprovals';
import { AdminUsersPage } from './pages/AdminUsers';
import { CategoriesPage } from './pages/Categories';

export type AdminPage = 'dashboard' | 'analytics' | 'users' | 'workflows' | 'workflow-approvals' | 'projects' | 'executions' | 'subscriptions' | 'monitoring' | 'activity' | 'admin-users' | 'categories';

export function AdminApp() {
  const { isAdminLoggedIn } = useAdminAuthStore();
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');

  // Show login page if not authenticated as admin
  if (!isAdminLoggedIn) {
    return <AdminLogin />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'users':
        return <UsersPage />;
      case 'admin-users':
        return <AdminUsersPage />;
      case 'workflows':
        return <WorkflowsPage />;
      case 'executions':
        return <ExecutionsPage />;
      case 'subscriptions':
        return <SubscriptionManagementV2 />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'monitoring':
        return <SystemMonitoring />;
      case 'activity':
        return <ActivityLog />;
      case 'projects':
        return <ProjectsStats />;
      case 'workflow-approvals':
        return <WorkflowApprovals />;
      case 'categories':
        return <CategoriesPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </AdminLayout>
  );
}
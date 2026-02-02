/**
 * Activity Log / Audit Trail
 * Track all user actions and system events
 */

import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { useThemeStore } from '@/core/stores/admin/themeStore';
import {
  Search,
  Filter,
  Download,
  Eye,
  User,
  Workflow,
  Settings,
  Lock,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
} from 'lucide-react';

interface ActivityLogEntry {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  action: string;
  category: 'auth' | 'user' | 'workflow' | 'subscription' | 'system' | 'security';
  status: 'success' | 'failed' | 'warning';
  details: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
}

type FilterCategory = 'all' | 'auth' | 'user' | 'workflow' | 'subscription' | 'system' | 'security';
type FilterStatus = 'all' | 'success' | 'failed' | 'warning';

export const ActivityLog: React.FC = () => {
  const { theme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedEntry, setSelectedEntry] = useState<ActivityLogEntry | null>(null);

  const activities = getActivityLogs();

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || activity.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const exportLogs = () => {
    console.log('Exporting activity logs...');
    alert('Activity logs exported to CSV!');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth':
        return <Lock className="w-4 h-4" />;
      case 'user':
        return <User className="w-4 h-4" />;
      case 'workflow':
        return <Workflow className="w-4 h-4" />;
      case 'subscription':
        return <CreditCard className="w-4 h-4" />;
      case 'security':
        return <AlertTriangle className="w-4 h-4" />;
      case 'system':
        return <Settings className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'auth':
        return 'bg-blue-500/20 text-blue-400';
      case 'user':
        return 'bg-cyan-500/20 text-cyan-400';
      case 'workflow':
        return 'bg-violet-500/20 text-violet-400';
      case 'subscription':
        return 'bg-green-500/20 text-green-400';
      case 'security':
        return 'bg-red-500/20 text-red-400';
      case 'system':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Activity Log</h1>
          <p className={`mt-1 ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>
            Track all user actions and system events
          </p>
        </div>
        <Button
          onClick={exportLogs}
          className="bg-gradient-to-r from-[#00C6FF] to-[#9D50BB]"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card className={`p-6 ${theme === 'dark' ? 'bg-[#1A1A2E] border-white/10' : 'bg-white border-gray-200'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <Input
              placeholder="Search by user, email, or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${theme === 'dark' ? 'bg-[#0E0E1F] border-[#2A2A3E] text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'auth', 'user', 'workflow', 'subscription', 'security', 'system'] as FilterCategory[]).map((category) => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  filterCategory === category
                    ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white'
                    : theme === 'dark' 
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {(['all', 'success', 'failed', 'warning'] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white'
                    : theme === 'dark'
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Activity List */}
      <Card className={`p-6 ${theme === 'dark' ? 'bg-[#1A1A2E] border-white/10' : 'bg-white border-gray-200'}`}>
        <div className="space-y-3">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className={`rounded-lg p-4 border transition-all cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedEntry(activity)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${getCategoryColor(activity.category)}`}>
                      {getCategoryIcon(activity.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{activity.action}</h3>
                        <Badge className={getCategoryColor(activity.category)}>
                          {activity.category}
                        </Badge>
                        <Badge className={getStatusColor(activity.status)}>
                          {getStatusIcon(activity.status)}
                          <span className="ml-1">{activity.status}</span>
                        </Badge>
                      </div>
                      <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{activity.details}</p>
                      <div className={`flex items-center gap-4 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {activity.user.name} ({activity.user.email})
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.timestamp}
                        </span>
                        <span>IP: {activity.ipAddress}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={theme === 'dark' ? 'w-5 h-5 text-gray-400' : 'w-5 h-5 text-gray-500'} />
                </div>
              </div>
            ))
          ) : (
            <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No activities found matching your filters
            </div>
          )}
        </div>
      </Card>

      {/* Details Modal */}
      {selectedEntry && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedEntry(null)}
        >
          <Card
            className={`p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto ${
              theme === 'dark' 
                ? 'bg-[#1A1A2E] border-white/10' 
                : 'bg-white border-gray-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Activity Details</h2>
              <Button
                onClick={() => setSelectedEntry(null)}
                variant="outline"
                className={theme === 'dark' ? 'border-white/20' : 'border-gray-300'}
              >
                Close
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Action</label>
                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedEntry.action}</p>
              </div>

              <div>
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Details</label>
                <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedEntry.details}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedEntry.status)}
                    <Badge className={getStatusColor(selectedEntry.status)}>
                      {selectedEntry.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Category</label>
                  <div className="mt-1">
                    <Badge className={getCategoryColor(selectedEntry.category)}>
                      {selectedEntry.category}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>User</label>
                <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedEntry.user.name}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>{selectedEntry.user.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Timestamp</label>
                  <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedEntry.timestamp}</p>
                </div>
                <div>
                  <label className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>IP Address</label>
                  <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{selectedEntry.ipAddress}</p>
                </div>
              </div>

              <div>
                <label className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>User Agent</label>
                <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedEntry.userAgent}</p>
              </div>

              {selectedEntry.metadata && (
                <div>
                  <label className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Additional Metadata</label>
                  <pre className={`rounded-lg p-4 mt-2 text-xs overflow-auto ${
                    theme === 'dark' 
                      ? 'bg-black/30 text-gray-300' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {JSON.stringify(selectedEntry.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Mock data generator
function getActivityLogs(): ActivityLogEntry[] {
  const users = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
  ];

  const actions = [
    { action: 'User Login', category: 'auth' as const, status: 'success' as const, details: 'User logged in successfully' },
    { action: 'User Logout', category: 'auth' as const, status: 'success' as const, details: 'User logged out' },
    { action: 'Failed Login Attempt', category: 'security' as const, status: 'failed' as const, details: 'Invalid password provided' },
    { action: 'Password Changed', category: 'user' as const, status: 'success' as const, details: 'User changed their password' },
    { action: 'Workflow Created', category: 'workflow' as const, status: 'success' as const, details: 'Created new workflow "Customer Onboarding"' },
    { action: 'Workflow Executed', category: 'workflow' as const, status: 'success' as const, details: 'Executed workflow successfully' },
    { action: 'Workflow Execution Failed', category: 'workflow' as const, status: 'failed' as const, details: 'Workflow execution failed: API timeout' },
    { action: 'Subscription Upgraded', category: 'subscription' as const, status: 'success' as const, details: 'Upgraded from Free to Pro plan' },
    { action: 'Payment Failed', category: 'subscription' as const, status: 'failed' as const, details: 'Credit card declined' },
    { action: 'Database Backup', category: 'system' as const, status: 'success' as const, details: 'Automated backup completed' },
    { action: 'High Memory Usage', category: 'system' as const, status: 'warning' as const, details: 'Memory usage exceeded 80%' },
    { action: 'Suspicious Activity', category: 'security' as const, status: 'warning' as const, details: 'Multiple failed login attempts detected' },
  ];

  return Array.from({ length: 50 }, (_, i) => {
    const user = users[Math.floor(Math.random() * users.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const now = new Date();
    now.setMinutes(now.getMinutes() - i * 15);

    return {
      id: `log-${i}`,
      timestamp: now.toLocaleString(),
      user,
      action: action.action,
      category: action.category,
      status: action.status,
      details: action.details,
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      metadata: {
        requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
        duration: Math.floor(Math.random() * 1000),
        endpoint: '/api/example',
      },
    };
  });
}
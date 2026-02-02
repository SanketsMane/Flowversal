/**
 * Users Management Page
 * Real CRUD operations on actual users
 */

import React, { useState } from 'react';
import { Search, UserPlus, Ban, CheckCircle, Trash2, X, Eye } from 'lucide-react';
import { useUserStore, AppUser } from '@/core/stores/core/userStore';
import { usePricingStore } from '@/core/stores/admin/pricingStore';
import { useThemeStore } from '@/core/stores/admin/themeStore';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { Select } from '@/shared/components/ui/select';
import { useFlowversalAlert } from '@/shared/components/ui/FlowversalAlert';

export function UsersPage() {
  const { theme } = useThemeStore();
  const userStore = useUserStore();
  const { plans } = usePricingStore();
  const { AlertComponent, showError, showSuccess, showConfirm } = useFlowversalAlert();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | AppUser['status']>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  
  // Form state for adding new user
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    plan: 'free' as 'free' | 'pro' | 'enterprise',
  });

  // Theme-aware colors
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E] border-[#2A2A3E]' : 'bg-white border-gray-200';
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F] border-[#2A2A3E]' : 'bg-gray-50 border-gray-300';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgTable = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';

  const allUsers = userStore.users.filter(u => u.status !== 'deleted');
  
  // Filter users
  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      showError('Validation Error', 'Please fill in all required fields');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      showError('Invalid Email', 'Please enter a valid email address');
      return;
    }

    // Check if email already exists
    const emailExists = userStore.users.some(u => u.email === newUser.email);
    if (emailExists) {
      showError('Duplicate Email', 'A user with this email already exists');
      return;
    }

    userStore.addUser({
      name: newUser.name,
      email: newUser.email,
      role: 'user',
      status: 'active',
      lastLogin: Date.now(),
      subscription: {
        plan: newUser.plan,
        status: 'active',
        startDate: Date.now(),
        currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        cancelAtPeriodEnd: false,
      },
    });

    // Reset form
    setNewUser({ name: '', email: '', plan: 'free' });
    setShowAddModal(false);
    showSuccess('User Added', `${newUser.name} has been successfully added to the system.`);
  };

  const handleViewDetails = (user: AppUser) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleSuspend = (id: string) => {
    showConfirm(
      'Suspend User',
      'Are you sure you want to suspend this user? They will lose access to the platform.',
      () => {
        userStore.suspendUser(id);
        showSuccess('User Suspended', 'The user has been successfully suspended.');
      },
      { confirmText: 'Suspend', cancelText: 'Cancel' }
    );
  };

  const handleActivate = (id: string) => {
    userStore.activateUser(id);
    showSuccess('User Activated', 'The user has been successfully activated.');
  };

  const handleDelete = (id: string) => {
    showConfirm(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      () => {
        userStore.deleteUser(id);
        if (selectedUser?.id === id) {
          setShowDetailsModal(false);
        }
        showSuccess('User Deleted', 'The user has been successfully deleted from the system.');
      },
      { confirmText: 'Delete', cancelText: 'Cancel' }
    );
  };

  const getStatusBadge = (status: AppUser['status']) => {
    const variants = {
      active: { variant: 'default' as const, color: 'bg-green-500/10 text-green-400 border-green-500/20' },
      suspended: { variant: 'destructive' as const, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
      deleted: { variant: 'outline' as const, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
    };

    const config = variants[status];
    return (
      <span className={`px-2 py-1 rounded text-xs border ${config.color}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPlanBadge = (plan: AppUser['subscription']['plan']) => {
    const colors = {
      free: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      pro: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      enterprise: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs border ${colors[plan]}`}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-semibold ${textPrimary}`}>Users</h1>
          <p className={`${textSecondary} mt-1`}>
            Manage all users - {allUsers.length} total
          </p>
        </div>
        <Button 
          className="bg-gradient-to-r from-[#00C6FF] to-[#9D50BB]"
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className={`${bgCard} border rounded-xl p-6`}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${bgInput} border ${textPrimary}`}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('active')}
            >
              Active
            </Button>
            <Button
              variant={filterStatus === 'suspended' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('suspended')}
            >
              Suspended
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className={`${bgCard} border rounded-xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${theme === 'dark' ? 'bg-[#0E0E1F] border-[#2A2A3E]' : 'bg-gray-50 border-gray-200'} border-b`}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                  User
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                  Role
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                  Plan
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                  Status
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                  Usage
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                  Joined
                </th>
                <th className={`px-6 py-4 text-right text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`${theme === 'dark' ? 'divide-[#2A2A3E]' : 'divide-gray-200'} divide-y`}>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`px-6 py-12 text-center ${textSecondary}`}>
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className={`${theme === 'dark' ? 'hover:bg-[#2A2A3E]/30' : 'hover:bg-gray-50'} transition-colors cursor-pointer`}
                    onClick={() => handleViewDetails(user)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`${textPrimary} font-medium`}>{user.name}</p>
                          <p className={`text-sm ${textSecondary}`}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${textSecondary} capitalize`}>{user.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getPlanBadge(user.subscription.plan)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className={textPrimary}>{user.stats.workflowsCreated} workflows</p>
                        <p className={textSecondary}>{user.stats.workflowsExecuted} executions</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm ${textSecondary}`}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(user);
                          }}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {user.status === 'active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSuspend(user.id);
                            }}
                            className="text-yellow-400 hover:text-yellow-300"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivate(user.id);
                            }}
                            className="text-green-400 hover:text-green-300"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(user.id);
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <Card
            className="bg-[#1A1A2E] border-[#2A2A3E] p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add New User</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#CFCFE8] mb-2">
                  Name *
                </label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="John Doe"
                  className="bg-[#0E0E1F] border-[#2A2A3E] text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#CFCFE8] mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="john@example.com"
                  className="bg-[#0E0E1F] border-[#2A2A3E] text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#CFCFE8] mb-2">
                  Subscription Plan *
                </label>
                <select
                  value={newUser.plan}
                  onChange={(e) => setNewUser({ ...newUser, plan: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#0E0E1F] border border-[#2A2A3E] rounded-md text-white"
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - ${plan.monthlyPrice}/month
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-[#2A2A3E] text-white"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white"
                  onClick={handleAddUser}
                >
                  Add User
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <Card
            className="bg-[#1A1A2E] border-[#2A2A3E] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">User Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center text-white text-3xl font-semibold">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
                  <p className="text-[#CFCFE8]">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    {getStatusBadge(selectedUser.status)}
                    {getPlanBadge(selectedUser.subscription.plan)}
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="border-t border-[#2A2A3E] pt-4">
                <h4 className="text-sm font-semibold text-[#CFCFE8] mb-3">Account Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#CFCFE8] mb-1">User ID</p>
                    <p className="text-sm text-white font-mono">{selectedUser.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#CFCFE8] mb-1">Role</p>
                    <p className="text-sm text-white capitalize">{selectedUser.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#CFCFE8] mb-1">Joined</p>
                    <p className="text-sm text-white">
                      {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#CFCFE8] mb-1">Last Login</p>
                    <p className="text-sm text-white">
                      {new Date(selectedUser.lastLogin).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscription Info */}
              <div className="border-t border-[#2A2A3E] pt-4">
                <h4 className="text-sm font-semibold text-[#CFCFE8] mb-3">Subscription Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#CFCFE8] mb-1">Plan</p>
                    <p className="text-sm text-white capitalize">{selectedUser.subscription.plan}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#CFCFE8] mb-1">Status</p>
                    <p className="text-sm text-white capitalize">{selectedUser.subscription.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#CFCFE8] mb-1">Start Date</p>
                    <p className="text-sm text-white">
                      {new Date(selectedUser.subscription.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedUser.subscription.currentPeriodEnd && (
                    <div>
                      <p className="text-xs text-[#CFCFE8] mb-1">Period Ends</p>
                      <p className="text-sm text-white">
                        {new Date(selectedUser.subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Usage Stats */}
              <div className="border-t border-[#2A2A3E] pt-4">
                <h4 className="text-sm font-semibold text-[#CFCFE8] mb-3">Usage Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0E0E1F] p-4 rounded-lg">
                    <p className="text-xs text-[#CFCFE8] mb-1">Workflows Created</p>
                    <p className="text-2xl font-bold text-white">{selectedUser.stats.workflowsCreated}</p>
                  </div>
                  <div className="bg-[#0E0E1F] p-4 rounded-lg">
                    <p className="text-xs text-[#CFCFE8] mb-1">Workflows Executed</p>
                    <p className="text-2xl font-bold text-white">{selectedUser.stats.workflowsExecuted}</p>
                  </div>
                  <div className="bg-[#0E0E1F] p-4 rounded-lg">
                    <p className="text-xs text-[#CFCFE8] mb-1">Forms Created</p>
                    <p className="text-2xl font-bold text-white">{selectedUser.stats.formsCreated}</p>
                  </div>
                  <div className="bg-[#0E0E1F] p-4 rounded-lg">
                    <p className="text-xs text-[#CFCFE8] mb-1">AI Tokens Used</p>
                    <p className="text-2xl font-bold text-white">{selectedUser.stats.aiTokensUsed.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-[#2A2A3E] pt-4 flex gap-3">
                {selectedUser.status !== 'suspended' ? (
                  <Button
                    variant="outline"
                    className="flex-1 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-500/50 hover:text-yellow-300"
                    onClick={() => {
                      handleSuspend(selectedUser.id);
                      setShowDetailsModal(false);
                    }}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Suspend User
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/50 hover:text-green-300"
                    onClick={() => {
                      handleActivate(selectedUser.id);
                      setShowDetailsModal(false);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Activate User
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300"
                  onClick={() => handleDelete(selectedUser.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      <AlertComponent />
    </div>
  );
}
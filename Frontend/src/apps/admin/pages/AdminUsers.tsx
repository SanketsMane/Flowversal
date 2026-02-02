/**
 * Admin Users Management
 * Allow admins to add/remove admin users
 */

import React, { useState } from 'react';
import { Plus, Trash2, Mail, Lock, User, Calendar, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useThemeStore } from '@/core/stores/admin/themeStore';
import { useAdminUsersStore } from '@/core/stores/admin/adminUsersStore';
import { useAuthStore } from '@/core/stores/core/authStore';

export function AdminUsersPage() {
  const { theme } = useThemeStore();
  const { adminUsers, addAdminUser, removeAdminUser } = useAdminUsersStore();
  const { user } = useAuthStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedColor = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const cardBg = theme === 'dark' ? 'bg-[#1A1A2E] border-[#2A2A3E]' : 'bg-white border-gray-200';
  const inputBg = theme === 'dark' ? 'bg-[#0E0E1F] border-[#2A2A3E] text-white' : 'bg-gray-50 border-gray-200 text-gray-900';

  const handleAddUser = () => {
    setError('');
    setSuccess('');

    // Validation
    if (!newEmail || !newPassword || !newName) {
      setError('All fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Add user
    const success = addAdminUser(newEmail, newPassword, newName, user?.email || 'admin');

    if (success) {
      setSuccess(`Admin user ${newEmail} added successfully!`);
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      setTimeout(() => {
        setShowAddForm(false);
        setSuccess('');
      }, 2000);
    } else {
      setError('Admin user with this email already exists');
    }
  };

  const handleRemoveUser = (id: string, email: string) => {
    if (id === 'admin-1') {
      alert('Cannot remove the super admin account');
      return;
    }

    if (confirm(`Are you sure you want to remove admin user: ${email}?`)) {
      removeAdminUser(id);
      setSuccess('Admin user removed successfully');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-semibold ${textColor}`}>Admin Users</h1>
          <p className={`mt-1 ${mutedColor}`}>
            Manage admin panel access - only authorized users
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Admin User
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-sm text-green-400">{success}</p>
        </div>
      )}

      {/* Add Admin Form */}
      {showAddForm && (
        <Card className={`p-6 ${cardBg} border`}>
          <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Add New Admin User</h3>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="John Doe"
                  className={`pl-10 ${inputBg}`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className={`pl-10 ${inputBg}`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className={`pl-10 ${inputBg}`}
                />
              </div>
              <p className={`text-xs ${mutedColor} mt-1`}>
                Password must be at least 6 characters long
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleAddUser}
                className="bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Admin
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(false);
                  setError('');
                  setNewEmail('');
                  setNewPassword('');
                  setNewName('');
                }}
                variant="outline"
                className={theme === 'dark' ? 'border-[#2A2A3E] text-[#CFCFE8]' : ''}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Admin Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminUsers.map((admin) => (
          <Card key={admin.id} className={`p-6 ${cardBg} border`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center text-white font-semibold text-lg">
                  {admin.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className={`font-semibold ${textColor}`}>{admin.name}</h3>
                  <p className={`text-sm ${mutedColor}`}>{admin.email}</p>
                </div>
              </div>
              {admin.role === 'super_admin' && (
                <Shield className="w-5 h-5 text-yellow-400" />
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant={admin.role === 'super_admin' ? 'default' : 'secondary'}>
                  {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </Badge>
              </div>

              <div className={`flex items-center gap-2 text-sm ${mutedColor}`}>
                <Calendar className="w-4 h-4" />
                <span>Created: {formatDate(admin.createdAt)}</span>
              </div>

              {admin.lastLogin && (
                <div className={`flex items-center gap-2 text-sm ${mutedColor}`}>
                  <User className="w-4 h-4" />
                  <span>Last login: {formatDate(admin.lastLogin)}</span>
                </div>
              )}

              <p className={`text-xs ${mutedColor}`}>
                Added by: {admin.createdBy}
              </p>
            </div>

            {admin.id !== 'admin-1' && (
              <Button
                onClick={() => handleRemoveUser(admin.id, admin.email)}
                variant="outline"
                size="sm"
                className={`w-full ${
                  theme === 'dark'
                    ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                    : 'border-red-300 text-red-600 hover:bg-red-50'
                }`}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Access
              </Button>
            )}

            {admin.id === 'admin-1' && (
              <div className={`text-xs ${mutedColor} text-center p-2 bg-yellow-500/10 border border-yellow-500/30 rounded`}>
                <Shield className="w-3 h-3 inline mr-1" />
                Protected Super Admin
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Info Box */}
      <Card className={`p-6 ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'} border`}>
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className={`font-semibold ${textColor} mb-1`}>About Admin Users</h4>
            <ul className={`text-sm ${mutedColor} space-y-1`}>
              <li>• Only admin users can access the admin panel</li>
              <li>• Regular users cannot sign up for admin access</li>
              <li>• Super admin account cannot be removed</li>
              <li>• All admin actions are logged for security</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * Team Management Component
 * Manage team members, roles, and permissions
 */

import { useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { ConfirmDialog } from './ConfirmDialog';
import { DeleteConfirmationDialog } from '@/features/workflow-builder/components/dialogs/DeleteConfirmationDialog';
import { 
  Users, 
  Plus, 
  X, 
  Mail, 
  UserPlus, 
  Shield, 
  Settings, 
  Trash2,
  MoreVertical,
  Check,
  Search,
  Crown,
  User
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  permissions: {
    createWorkflows: boolean;
    editWorkflows: boolean;
    deleteWorkflows: boolean;
    createTasks: boolean;
    editTasks: boolean;
    assignTasks: boolean;
    manageTeam: boolean;
  };
  status: 'active' | 'invited' | 'inactive';
  joinedDate: string;
  avatar?: string;
}

interface TeamManagementProps {
  onClose: () => void;
}

export function TeamManagement({ onClose }: TeamManagementProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgModal = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgSecondary = theme === 'dark' ? 'bg-[#13131F]' : 'bg-gray-100';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const inputBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';

  // Mock team data
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@flowversal.com',
      role: 'owner',
      permissions: {
        createWorkflows: true,
        editWorkflows: true,
        deleteWorkflows: true,
        createTasks: true,
        editTasks: true,
        assignTasks: true,
        manageTeam: true,
      },
      status: 'active',
      joinedDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      email: 'sarah@flowversal.com',
      role: 'admin',
      permissions: {
        createWorkflows: true,
        editWorkflows: true,
        deleteWorkflows: true,
        createTasks: true,
        editTasks: true,
        assignTasks: true,
        manageTeam: true,
      },
      status: 'active',
      joinedDate: '2024-02-10',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@flowversal.com',
      role: 'editor',
      permissions: {
        createWorkflows: true,
        editWorkflows: true,
        deleteWorkflows: false,
        createTasks: true,
        editTasks: true,
        assignTasks: true,
        manageTeam: false,
      },
      status: 'active',
      joinedDate: '2024-03-05',
    },
    {
      id: '4',
      name: 'Emma Davis',
      email: 'emma@flowversal.com',
      role: 'viewer',
      permissions: {
        createWorkflows: false,
        editWorkflows: false,
        deleteWorkflows: false,
        createTasks: false,
        editTasks: false,
        assignTasks: false,
        manageTeam: false,
      },
      status: 'invited',
      joinedDate: '2024-11-10',
    },
  ]);

  const roleColors = {
    owner: 'from-[#FFD700] to-[#FFA500]',
    admin: 'from-[#9D50BB] to-[#B876D5]',
    editor: 'from-[#00C6FF] to-[#06B6D4]',
    viewer: 'from-gray-500 to-gray-600',
  };

  const roleLabels = {
    owner: 'Owner',
    admin: 'Admin',
    editor: 'Editor',
    viewer: 'Viewer',
  };

  const handleInviteMember = () => {
    if (!inviteEmail) return;
    
    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      permissions: getDefaultPermissions(inviteRole),
      status: 'invited',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setTeamMembers([...teamMembers, newMember]);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const getDefaultPermissions = (role: 'admin' | 'editor' | 'viewer') => {
    switch (role) {
      case 'admin':
        return {
          createWorkflows: true,
          editWorkflows: true,
          deleteWorkflows: true,
          createTasks: true,
          editTasks: true,
          assignTasks: true,
          manageTeam: true,
        };
      case 'editor':
        return {
          createWorkflows: true,
          editWorkflows: true,
          deleteWorkflows: false,
          createTasks: true,
          editTasks: true,
          assignTasks: true,
          manageTeam: false,
        };
      case 'viewer':
        return {
          createWorkflows: false,
          editWorkflows: false,
          deleteWorkflows: false,
          createTasks: false,
          editTasks: false,
          assignTasks: false,
          manageTeam: false,
        };
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      setTeamMembers(teamMembers.filter(m => m.id !== memberId));
    }
  };

  const handleUpdateMember = () => {
    if (!selectedMember) return;
    
    setTeamMembers(teamMembers.map(m =>
      m.id === selectedMember.id ? selectedMember : m
    ));
    setSelectedMember(null);
  };

  const handlePermissionChange = (permission: keyof TeamMember['permissions']) => {
    if (!selectedMember) return;
    
    setSelectedMember({
      ...selectedMember,
      permissions: {
        ...selectedMember.permissions,
        [permission]: !selectedMember.permissions[permission]
      }
    });
  };

  const handleRoleChange = (newRole: 'admin' | 'editor' | 'viewer') => {
    if (!selectedMember) return;
    
    setSelectedMember({
      ...selectedMember,
      role: newRole,
      permissions: getDefaultPermissions(newRole)
    });
  };

  const filteredMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`${bgModal} rounded-2xl border ${borderColor} shadow-2xl w-full max-w-6xl h-[90vh] 
                    flex flex-col relative z-10 overflow-hidden`}
      >
        {/* Header */}
        <div className={`${bgCard} border-b ${borderColor} px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`${textPrimary} text-xl`}>Team Management</h2>
              <p className={`${textSecondary} text-sm`}>{teamMembers.length} members</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`${textSecondary} hover:${textPrimary} transition-colors p-2`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Actions Bar */}
          <div className="flex items-center justify-between mb-6">
            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team members..."
                className={`w-full pl-10 pr-4 py-2 ${inputBg} border ${borderColor} rounded-lg ${textPrimary} placeholder:${textMuted} focus:outline-none focus:border-[#00C6FF]`}
              />
            </div>

            {/* Invite Button */}
            <button
              onClick={() => setShowInviteModal(true)}
              className="ml-4 px-4 py-2 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Invite Member
            </button>
          </div>

          {/* Team Members Table */}
          <div className={`${bgCard} border ${borderColor} rounded-xl overflow-hidden`}>
            <table className="w-full">
              <thead className={`${bgSecondary} border-b ${borderColor}`}>
                <tr>
                  <th className={`${textSecondary} text-left px-6 py-3 text-xs uppercase tracking-wider`}>Member</th>
                  <th className={`${textSecondary} text-left px-6 py-3 text-xs uppercase tracking-wider`}>Role</th>
                  <th className={`${textSecondary} text-left px-6 py-3 text-xs uppercase tracking-wider`}>Status</th>
                  <th className={`${textSecondary} text-left px-6 py-3 text-xs uppercase tracking-wider`}>Joined</th>
                  <th className={`${textSecondary} text-left px-6 py-3 text-xs uppercase tracking-wider`}>Permissions</th>
                  <th className={`${textSecondary} text-right px-6 py-3 text-xs uppercase tracking-wider`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleColors[member.role]} flex items-center justify-center`}>
                          {member.role === 'owner' ? (
                            <Crown className="w-5 h-5 text-white" />
                          ) : (
                            <User className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <div className={`${textPrimary} font-medium`}>{member.name}</div>
                          <div className={`${textSecondary} text-sm`}>{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${roleColors[member.role]} text-white`}>
                        {roleLabels[member.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.status === 'active' 
                          ? 'bg-green-500/20 text-green-400'
                          : member.status === 'invited'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {member.status === 'active' && <Check className="w-3 h-3 mr-1" />}
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`${textSecondary} text-sm`}>
                        {new Date(member.joinedDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {member.permissions.createWorkflows && (
                          <span className={`px-2 py-0.5 ${bgSecondary} rounded text-xs ${textSecondary}`}>
                            Create
                          </span>
                        )}
                        {member.permissions.editWorkflows && (
                          <span className={`px-2 py-0.5 ${bgSecondary} rounded text-xs ${textSecondary}`}>
                            Edit
                          </span>
                        )}
                        {member.permissions.deleteWorkflows && (
                          <span className={`px-2 py-0.5 ${bgSecondary} rounded text-xs ${textSecondary}`}>
                            Delete
                          </span>
                        )}
                        {member.permissions.manageTeam && (
                          <span className={`px-2 py-0.5 ${bgSecondary} rounded text-xs ${textSecondary}`}>
                            Manage Team
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {member.role !== 'owner' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedMember(member)}
                            className={`${textSecondary} hover:text-[#00C6FF] transition-colors p-2`}
                            title="Edit permissions"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setMemberToDelete(member)}
                            className={`${textSecondary} hover:text-red-400 transition-colors p-2`}
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Permission Legend */}
          <div className={`mt-6 ${bgCard} border ${borderColor} rounded-xl p-6`}>
            <h3 className={`${textPrimary} font-medium mb-4`}>Role Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${roleColors.owner}`} />
                  <span className={`${textPrimary} text-sm font-medium`}>Owner</span>
                </div>
                <p className={`${textSecondary} text-xs`}>Full access to everything</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${roleColors.admin}`} />
                  <span className={`${textPrimary} text-sm font-medium`}>Admin</span>
                </div>
                <p className={`${textSecondary} text-xs`}>Can manage team and workflows</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${roleColors.editor}`} />
                  <span className={`${textPrimary} text-sm font-medium`}>Editor</span>
                </div>
                <p className={`${textSecondary} text-xs`}>Can create and edit workflows</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${roleColors.viewer}`} />
                  <span className={`${textPrimary} text-sm font-medium`}>Viewer</span>
                </div>
                <p className={`${textSecondary} text-xs`}>Read-only access</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowInviteModal(false)}
          />
          <div className={`${bgCard} rounded-xl border ${borderColor} p-6 w-full max-w-md relative z-10`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`${textPrimary} text-lg font-medium`}>Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className={`${textSecondary} hover:text-white transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`${textSecondary} text-sm block mb-2`}>Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className={`w-full px-4 py-2 ${inputBg} border ${borderColor} rounded-lg ${textPrimary} placeholder:${textMuted} focus:outline-none focus:border-[#00C6FF]`}
                />
              </div>

              <div>
                <label className={`${textSecondary} text-sm block mb-2`}>Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'editor' | 'viewer')}
                  className={`w-full px-4 py-2 ${inputBg} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:border-[#00C6FF]`}
                >
                  <option value="admin">Admin - Full management access</option>
                  <option value="editor">Editor - Create & edit workflows</option>
                  <option value="viewer">Viewer - Read-only access</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className={`flex-1 px-4 py-2 ${bgSecondary} ${textSecondary} rounded-lg hover:bg-white/10 transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteMember}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {selectedMember && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedMember(null)}
          />
          <div className={`${bgCard} rounded-xl border ${borderColor} p-6 w-full max-w-2xl relative z-10`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleColors[selectedMember.role]} flex items-center justify-center`}>
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`${textPrimary} text-lg font-medium`}>Edit Permissions</h3>
                  <p className={`${textSecondary} text-sm`}>{selectedMember.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className={`${textSecondary} hover:text-white transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className={`${textSecondary} text-sm block mb-3`}>Role</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleRoleChange('admin')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedMember.role === 'admin'
                        ? 'border-[#9D50BB] bg-[#9D50BB]/10'
                        : `${borderColor} hover:border-[#9D50BB]/50`
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${roleColors.admin} flex items-center justify-center mb-2 mx-auto`}>
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div className={`${textPrimary} text-sm font-medium text-center`}>Admin</div>
                    <div className={`${textSecondary} text-xs text-center mt-1`}>Full access</div>
                  </button>

                  <button
                    onClick={() => handleRoleChange('editor')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedMember.role === 'editor'
                        ? 'border-[#00C6FF] bg-[#00C6FF]/10'
                        : `${borderColor} hover:border-[#00C6FF]/50`
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${roleColors.editor} flex items-center justify-center mb-2 mx-auto`}>
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className={`${textPrimary} text-sm font-medium text-center`}>Editor</div>
                    <div className={`${textSecondary} text-xs text-center mt-1`}>Create & edit</div>
                  </button>

                  <button
                    onClick={() => handleRoleChange('viewer')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedMember.role === 'viewer'
                        ? 'border-gray-500 bg-gray-500/10'
                        : `${borderColor} hover:border-gray-500/50`
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${roleColors.viewer} flex items-center justify-center mb-2 mx-auto`}>
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className={`${textPrimary} text-sm font-medium text-center`}>Viewer</div>
                    <div className={`${textSecondary} text-xs text-center mt-1`}>Read-only</div>
                  </button>
                </div>
              </div>

              {/* Custom Permissions */}
              <div>
                <label className={`${textSecondary} text-sm block mb-3`}>Custom Permissions</label>
                <div className={`${bgSecondary} rounded-lg p-4 space-y-3`}>
                  {/* Workflow Permissions */}
                  <div>
                    <div className={`${textPrimary} text-sm font-medium mb-2`}>Workflows</div>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className={`${textSecondary} text-sm group-hover:text-white transition-colors`}>Create Workflows</span>
                        <input
                          type="checkbox"
                          checked={selectedMember.permissions.createWorkflows}
                          onChange={() => handlePermissionChange('createWorkflows')}
                          className="w-5 h-5 rounded border-gray-600 text-[#00C6FF] focus:ring-[#00C6FF] focus:ring-offset-0"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className={`${textSecondary} text-sm group-hover:text-white transition-colors`}>Edit Workflows</span>
                        <input
                          type="checkbox"
                          checked={selectedMember.permissions.editWorkflows}
                          onChange={() => handlePermissionChange('editWorkflows')}
                          className="w-5 h-5 rounded border-gray-600 text-[#00C6FF] focus:ring-[#00C6FF] focus:ring-offset-0"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className={`${textSecondary} text-sm group-hover:text-white transition-colors`}>Delete Workflows</span>
                        <input
                          type="checkbox"
                          checked={selectedMember.permissions.deleteWorkflows}
                          onChange={() => handlePermissionChange('deleteWorkflows')}
                          className="w-5 h-5 rounded border-gray-600 text-[#00C6FF] focus:ring-[#00C6FF] focus:ring-offset-0"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Task Permissions */}
                  <div>
                    <div className={`${textPrimary} text-sm font-medium mb-2`}>Tasks</div>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className={`${textSecondary} text-sm group-hover:text-white transition-colors`}>Create Tasks</span>
                        <input
                          type="checkbox"
                          checked={selectedMember.permissions.createTasks}
                          onChange={() => handlePermissionChange('createTasks')}
                          className="w-5 h-5 rounded border-gray-600 text-[#00C6FF] focus:ring-[#00C6FF] focus:ring-offset-0"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className={`${textSecondary} text-sm group-hover:text-white transition-colors`}>Edit Tasks</span>
                        <input
                          type="checkbox"
                          checked={selectedMember.permissions.editTasks}
                          onChange={() => handlePermissionChange('editTasks')}
                          className="w-5 h-5 rounded border-gray-600 text-[#00C6FF] focus:ring-[#00C6FF] focus:ring-offset-0"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className={`${textSecondary} text-sm group-hover:text-white transition-colors`}>Assign Tasks</span>
                        <input
                          type="checkbox"
                          checked={selectedMember.permissions.assignTasks}
                          onChange={() => handlePermissionChange('assignTasks')}
                          className="w-5 h-5 rounded border-gray-600 text-[#00C6FF] focus:ring-[#00C6FF] focus:ring-offset-0"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Team Management */}
                  <div>
                    <div className={`${textPrimary} text-sm font-medium mb-2`}>Team</div>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className={`${textSecondary} text-sm group-hover:text-white transition-colors`}>Manage Team</span>
                        <input
                          type="checkbox"
                          checked={selectedMember.permissions.manageTeam}
                          onChange={() => handlePermissionChange('manageTeam')}
                          className="w-5 h-5 rounded border-gray-600 text-[#00C6FF] focus:ring-[#00C6FF] focus:ring-offset-0"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setSelectedMember(null)}
                  className={`flex-1 px-4 py-2 ${bgSecondary} ${textSecondary} rounded-lg hover:bg-white/10 transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateMember}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {memberToDelete && (
        <DeleteConfirmationDialog
          isOpen={true}
          onClose={() => setMemberToDelete(null)}
          onConfirm={() => {
            setTeamMembers(teamMembers.filter(m => m.id !== memberToDelete.id));
          }}
          title="Remove Team Member"
          itemName={memberToDelete.name}
          itemType="member"
        />
      )}
    </div>
  );
}
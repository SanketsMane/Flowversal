/**
 * Workflow Approvals Page
 * Admin can approve/disapprove workflows created by users
 */
import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Textarea } from '@/shared/components/ui/textarea';
import { useThemeStore } from '@/core/stores/admin/themeStore';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  User,
  Calendar,
  Activity,
} from 'lucide-react';
interface WorkflowApproval {
  id: string;
  name: string;
  description: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  triggerCount: number;
  nodeCount: number;
  category: string;
}
export const WorkflowApprovals: React.FC = () => {
  const { theme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | WorkflowApproval['status']>('all');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowApproval | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalMessage, setApprovalMessage] = useState('');
  const workflows = getMockWorkflows();
  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch =
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  const handleApprove = (workflow: WorkflowApproval) => {
    setSelectedWorkflow(workflow);
    setApprovalAction('approve');
    setApprovalMessage('');
    setShowApprovalDialog(true);
  };
  const handleReject = (workflow: WorkflowApproval) => {
    setSelectedWorkflow(workflow);
    setApprovalAction('reject');
    setApprovalMessage('');
    setShowApprovalDialog(true);
  };
  const handleConfirmAction = () => {
    if (!selectedWorkflow) return;
    const action = approvalAction === 'approve' ? 'approved' : 'rejected';
    // Here you would call your API to update the workflow status
    alert(`Workflow ${action}!\n\n${approvalMessage ? `Message: ${approvalMessage}` : 'No message provided'}`);
    setShowApprovalDialog(false);
    setSelectedWorkflow(null);
    setApprovalMessage('');
  };
  const getStatusColor = (status: WorkflowApproval['status']) => {
    switch (status) {
      case 'pending':
        return theme === 'dark'
          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
          : 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'approved':
        return theme === 'dark'
          ? 'bg-green-500/20 text-green-400 border-green-500/30'
          : 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return theme === 'dark'
          ? 'bg-red-500/20 text-red-400 border-red-500/30'
          : 'bg-red-50 text-red-700 border-red-200';
    }
  };
  const getStatusIcon = (status: WorkflowApproval['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
    }
  };
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedColor = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const cardBg = theme === 'dark' ? 'bg-[#1A1A2E] border-white/10' : 'bg-white border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50';
  const inputBg = theme === 'dark' ? 'bg-[#0E0E1F] border-[#2A2A3E] text-white' : 'bg-gray-50 border-gray-200 text-gray-900';
  const pendingCount = workflows.filter(w => w.status === 'pending').length;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl ${textColor}`}>Workflow Approvals</h1>
          <p className={`mt-1 ${mutedColor}`}>
            Review and approve workflows submitted by users
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-lg px-4 py-2">
            {pendingCount} Pending
          </Badge>
        )}
      </div>
      {/* Filters */}
      <Card className={`${cardBg} p-6`}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${mutedColor}`} />
            <Input
              placeholder="Search by workflow name, owner, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${inputBg}`}
            />
          </div>
          {/* Status Filter */}
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white'
                    : theme === 'dark'
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'pending' && pendingCount > 0 && ` (${pendingCount})`}
              </button>
            ))}
          </div>
        </div>
      </Card>
      {/* Workflows List */}
      <div className="space-y-4">
        {filteredWorkflows.length > 0 ? (
          filteredWorkflows.map((workflow) => (
            <Card key={workflow.id} className={`${cardBg} p-6 ${hoverBg} transition-all`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-xl font-semibold ${textColor}`}>{workflow.name}</h3>
                    <Badge className={getStatusColor(workflow.status)}>
                      {getStatusIcon(workflow.status)}
                      <span className="ml-1">{workflow.status}</span>
                    </Badge>
                    <Badge variant="outline" className={theme === 'dark' ? 'border-white/20' : 'border-gray-300'}>
                      {workflow.category}
                    </Badge>
                  </div>
                  <p className={`${mutedColor} mb-3`}>{workflow.description}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <User className={`w-4 h-4 ${mutedColor}`} />
                      <span className={mutedColor}>{workflow.owner.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className={`w-4 h-4 ${mutedColor}`} />
                      <span className={mutedColor}>Submitted {new Date(workflow.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className={`w-4 h-4 ${mutedColor}`} />
                      <span className={mutedColor}>{workflow.triggerCount} triggers, {workflow.nodeCount} nodes</span>
                    </div>
                  </div>
                  {workflow.status === 'rejected' && workflow.rejectionReason && (
                    <div className={`mt-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50'}`}>
                      <div className="flex items-start gap-2">
                        <MessageSquare className={`w-4 h-4 mt-0.5 ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`} />
                        <div>
                          <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>
                            Rejection Reason:
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>
                            {workflow.rejectionReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {workflow.status === 'approved' && workflow.reviewedBy && (
                    <div className={`mt-3 text-sm ${mutedColor}`}>
                      Approved by {workflow.reviewedBy} on {workflow.reviewedAt && new Date(workflow.reviewedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className={theme === 'dark' ? 'border-white/20' : 'border-gray-300'}
                    onClick={() => alert(`View workflow details for: ${workflow.name}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  {workflow.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => handleApprove(workflow)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`${theme === 'dark' ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-red-300 text-red-700 hover:bg-red-50'}`}
                        onClick={() => handleReject(workflow)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className={`${cardBg} p-12 text-center`}>
            <p className={mutedColor}>No workflows found matching your filters</p>
          </Card>
        )}
      </div>
      {/* Approval/Rejection Dialog */}
      {showApprovalDialog && selectedWorkflow && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowApprovalDialog(false)}
        >
          <Card
            className={`${cardBg} p-6 max-w-lg w-full`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={`text-2xl mb-4 ${textColor}`}>
              {approvalAction === 'approve' ? 'Approve Workflow' : 'Reject Workflow'}
            </h2>
            <div className="mb-4">
              <p className={`${mutedColor} mb-2`}>Workflow:</p>
              <p className={`${textColor} font-semibold`}>{selectedWorkflow.name}</p>
              <p className={`text-sm ${mutedColor}`}>by {selectedWorkflow.owner.name}</p>
            </div>
            <div className="mb-6">
              <label className={`block text-sm ${mutedColor} mb-2`}>
                {approvalAction === 'approve' ? 'Approval Message (Optional)' : 'Rejection Reason (Required)'}
              </label>
              <Textarea
                value={approvalMessage}
                onChange={(e) => setApprovalMessage(e.target.value)}
                placeholder={
                  approvalAction === 'approve'
                    ? 'Add a message for the user (optional)...'
                    : 'Please provide a reason for rejection...'
                }
                rows={4}
                className={inputBg}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className={`flex-1 ${theme === 'dark' ? 'border-white/20' : 'border-gray-300'}`}
                onClick={() => setShowApprovalDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className={`flex-1 ${
                  approvalAction === 'approve'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                } text-white`}
                onClick={handleConfirmAction}
                disabled={approvalAction === 'reject' && !approvalMessage.trim()}
              >
                {approvalAction === 'approve' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Approval
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Confirm Rejection
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
// Mock data
function getMockWorkflows(): WorkflowApproval[] {
  return [
    {
      id: '1',
      name: 'Customer Email Automation',
      description: 'Automated email sequence for new customer onboarding',
      owner: { id: '1', name: 'John Doe', email: 'john@example.com' },
      createdAt: '2024-11-15T10:00:00Z',
      status: 'pending',
      submittedAt: '2024-11-18T14:30:00Z',
      triggerCount: 2,
      nodeCount: 8,
      category: 'Marketing',
    },
    {
      id: '2',
      name: 'Sales Lead Qualification',
      description: 'Automatically qualify and route sales leads based on criteria',
      owner: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      createdAt: '2024-11-10T09:00:00Z',
      status: 'approved',
      submittedAt: '2024-11-12T11:00:00Z',
      reviewedAt: '2024-11-13T10:00:00Z',
      reviewedBy: 'Admin User',
      triggerCount: 1,
      nodeCount: 12,
      category: 'Sales',
    },
    {
      id: '3',
      name: 'Support Ticket Router',
      description: 'Route support tickets to appropriate teams',
      owner: { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
      createdAt: '2024-11-14T15:00:00Z',
      status: 'pending',
      submittedAt: '2024-11-17T09:00:00Z',
      triggerCount: 3,
      nodeCount: 6,
      category: 'Customer Support',
    },
    {
      id: '4',
      name: 'Inventory Management',
      description: 'Monitor and alert on low inventory levels',
      owner: { id: '1', name: 'John Doe', email: 'john@example.com' },
      createdAt: '2024-11-05T12:00:00Z',
      status: 'rejected',
      submittedAt: '2024-11-08T16:00:00Z',
      reviewedAt: '2024-11-09T10:00:00Z',
      reviewedBy: 'Admin User',
      rejectionReason: 'Workflow contains external integrations that require additional security review. Please remove Dropbox integration or submit security documentation.',
      triggerCount: 1,
      nodeCount: 5,
      category: 'Operations',
    },
    {
      id: '5',
      name: 'Social Media Scheduler',
      description: 'Schedule and post to multiple social media platforms',
      owner: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      createdAt: '2024-11-16T08:00:00Z',
      status: 'pending',
      submittedAt: '2024-11-18T13:00:00Z',
      triggerCount: 2,
      nodeCount: 10,
      category: 'Marketing',
    },
  ];
}

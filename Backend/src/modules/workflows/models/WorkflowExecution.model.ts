import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'stopped' | 'waiting_for_approval';

export interface IWorkflowExecution extends Document {
  workflowId?: Types.ObjectId; // Reference to Workflow (optional for unsaved workflows)
  userId: Types.ObjectId; // Reference to User

  // Execution details
  status: ExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // in milliseconds

  // Input/Output
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    stepId?: string;
    stepName?: string;
  };

  // Execution steps
  steps: Array<{
    stepId: string;
    stepName: string;
    stepType: string;
    status: ExecutionStatus;
    startedAt: Date;
    completedAt?: Date;
    duration?: number;
    input?: any;
    output?: any;
    error?: string;
  }>;

  // Metadata
  triggeredBy?: string; // 'manual' | 'webhook' | 'scheduled' | 'event'
  triggerData?: Record<string, any>;
  metadata?: Record<string, any>;
  
  // Execution metrics
  stepsExecuted?: number;
  totalSteps?: number;
  aiTokensUsed?: number;
  apiCallsMade?: number;

  // Human-in-the-loop fields
  pendingApprovals?: Array<{
    approvalId: string;
    nodeId: string;
    stepId: string;
    requestedAt: Date;
    requestedBy: Types.ObjectId; // User who requested approval
    approvedBy?: Types.ObjectId; // User who approved/rejected
    decision?: 'approved' | 'rejected';
    decisionAt?: Date;
    comments?: string;
    approvalData?: Record<string, any>; // Data requiring approval
    approvalType: 'manual_review' | 'confirmation' | 'decision_making' | 'quality_check';
    timeout?: Date; // When approval expires
  }>;

  approvalSettings?: {
    allowSelfApproval: boolean;
    approvalTimeoutHours: number;
    requiredApprovers?: Types.ObjectId[]; // Specific users who can approve
    approvalRoles?: string[]; // User roles that can approve
  };
}

const ExecutionStepSchema = new Schema(
  {
    stepId: {
      type: String,
      required: true,
    },
    stepName: {
      type: String,
      required: true,
    },
    stepType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed', 'cancelled', 'waiting_for_approval'],
      default: 'pending',
    },
    startedAt: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
    },
    duration: {
      type: Number,
    },
    input: {
      type: Schema.Types.Mixed,
    },
    output: {
      type: Schema.Types.Mixed,
    },
    error: {
      type: String,
    },
  },
  { _id: false }
);

// Human approval schema
const PendingApprovalSchema = new Schema(
  {
    approvalId: {
      type: String,
      required: true,
    },
    nodeId: {
      type: String,
      required: true,
    },
    stepId: {
      type: String,
      required: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    decision: {
      type: String,
      enum: ['approved', 'rejected'],
    },
    decisionAt: {
      type: Date,
    },
    comments: {
      type: String,
    },
    approvalData: {
      type: Schema.Types.Mixed,
    },
    approvalType: {
      type: String,
      enum: ['manual_review', 'confirmation', 'decision_making', 'quality_check'],
      required: true,
    },
    timeout: {
      type: Date,
    },
  },
  { _id: false }
);

const ApprovalSettingsSchema = new Schema(
  {
    allowSelfApproval: {
      type: Boolean,
      default: false,
    },
    approvalTimeoutHours: {
      type: Number,
      default: 24,
    },
    requiredApprovers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    approvalRoles: [{
      type: String,
    }],
  },
  { _id: false }
);

const WorkflowExecutionSchema = new Schema<IWorkflowExecution>(
  {
    workflowId: {
      type: Schema.Types.ObjectId,
      ref: 'Workflow',
      required: false, // Optional for unsaved workflows
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed', 'cancelled', 'stopped'],
      default: 'pending',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    duration: {
      type: Number,
    },
    input: {
      type: Schema.Types.Mixed,
    },
    output: {
      type: Schema.Types.Mixed,
    },
    error: {
      type: {
        message: String,
        stack: String,
        stepId: String,
        stepName: String,
      },
    },
    steps: {
      type: [ExecutionStepSchema],
      default: [],
    },
    triggeredBy: {
      type: String,
      enum: ['manual', 'webhook', 'scheduled', 'event'],
      default: 'manual',
    },
    triggerData: {
      type: Schema.Types.Mixed,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    // Execution metrics
    stepsExecuted: {
      type: Number,
      default: 0,
    },
    totalSteps: {
      type: Number,
      default: 0,
    },
    aiTokensUsed: {
      type: Number,
      default: 0,
    },
    apiCallsMade: {
      type: Number,
      default: 0,
    },

    // Human-in-the-loop fields
    pendingApprovals: {
      type: [PendingApprovalSchema],
      default: [],
    },
    approvalSettings: {
      type: ApprovalSettingsSchema,
      default: () => ({
        allowSelfApproval: false,
        approvalTimeoutHours: 24,
      }),
    },
  },
  {
    timestamps: true,
    collection: 'workflow_executions',
  }
);

// Indexes for performance
WorkflowExecutionSchema.index({ workflowId: 1, status: 1 });
WorkflowExecutionSchema.index({ userId: 1, startedAt: -1 });
WorkflowExecutionSchema.index({ status: 1, startedAt: -1 });
WorkflowExecutionSchema.index({ startedAt: -1 });

// Transform _id to id in JSON output and convert ObjectIds to strings
WorkflowExecutionSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = ret._id?.toString() || ret._id;
    // Convert workflowId and userId ObjectIds to strings
    if (ret.workflowId && ret.workflowId._id) {
      ret.workflowId = ret.workflowId._id.toString();
    } else if (ret.workflowId && typeof ret.workflowId === 'object') {
      ret.workflowId = ret.workflowId.toString();
    }
    if (ret.userId && typeof ret.userId === 'object') {
      ret.userId = ret.userId.toString();
    }
    // Convert dates to ISO strings
    if (ret.startedAt) ret.startedAt = ret.startedAt.toISOString();
    if (ret.completedAt) ret.completedAt = ret.completedAt.toISOString();
    // Convert step dates
    if (ret.steps && Array.isArray(ret.steps)) {
      ret.steps = ret.steps.map((step: any) => {
        if (step.startedAt) step.startedAt = step.startedAt.toISOString();
        if (step.completedAt) step.completedAt = step.completedAt.toISOString();
        return step;
      });
    }
    // Map 'cancelled' to 'stopped' for frontend compatibility
    if (ret.status === 'cancelled') {
      ret.status = 'stopped';
    }
    // Use object destructuring to remove properties safely
    const { _id, __v, ...rest } = ret;
    return rest;
  },
});

export const WorkflowExecutionModel: Model<IWorkflowExecution> = (mongoose.models.WorkflowExecution as Model<IWorkflowExecution>) || mongoose.model<IWorkflowExecution>(
  'WorkflowExecution',
  WorkflowExecutionSchema
);


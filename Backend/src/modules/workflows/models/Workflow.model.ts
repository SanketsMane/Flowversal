import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IWorkflow extends Document {
  name: string;
  description: string;
  userId: Types.ObjectId; // MongoDB user ID
  userName: string;

  // Workflow structure
  triggers: any[];
  containers: any[];
  formFields: any[];
  triggerLogic?: any[];

  // Breakpoint configuration
  breakpoints?: Array<{
    nodeId: string;
    condition?: string;
    enabled: boolean;
    persistState: boolean;
    allowResume: boolean;
    maxRetries?: number;
    timeout?: number;
    customLogic?: string;
  }>;

  // Metadata
  status: 'draft' | 'published' | 'archived';
  isPublic: boolean;
  category?: string;
  tags: string[];
  icon?: string;
  coverImage?: string;

  // Stats
  stats: {
    executions: number;
    lastExecuted?: Date;
    avgExecutionTime: number; // in milliseconds
    successRate: number; // percentage
  };

  // Version
  version: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowStatsSchema = new Schema(
  {
    executions: {
      type: Number,
      default: 0,
    },
    lastExecuted: {
      type: Date,
    },
    avgExecutionTime: {
      type: Number,
      default: 0,
    },
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const WorkflowSchema = new Schema<IWorkflow>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    triggers: {
      type: [Schema.Types.Mixed] as any,
      default: [],
    },
    containers: {
      type: [Schema.Types.Mixed] as any,
      default: [],
    },
    formFields: {
      type: [Schema.Types.Mixed] as any,
      default: [],
    },
    triggerLogic: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    icon: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    stats: {
      type: WorkflowStatsSchema,
      default: () => ({
        executions: 0,
        avgExecutionTime: 0,
        successRate: 0,
      }),
    },
    version: {
      type: Number,
      default: 1,
    },
    breakpoints: {
      type: [{
        nodeId: { type: String, required: true },
        condition: { type: String },
        enabled: { type: Boolean, default: true },
        persistState: { type: Boolean, default: true },
        allowResume: { type: Boolean, default: true },
        maxRetries: { type: Number },
        timeout: { type: Number }, // in minutes
        customLogic: { type: String },
      }],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'workflows',
  }
);

// Indexes for performance
WorkflowSchema.index({ userId: 1, status: 1 });
WorkflowSchema.index({ status: 1, isPublic: 1 });
WorkflowSchema.index({ category: 1 });
WorkflowSchema.index({ tags: 1 });
WorkflowSchema.index({ createdAt: -1 });
WorkflowSchema.index({ 'stats.executions': -1 });

// Text search index
WorkflowSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
});

// Transform _id to id in JSON output
WorkflowSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = ret._id?.toString() || ret._id;
    // Use object destructuring to remove properties safely
    const { _id, __v, ...rest } = ret;
    return rest;
  },
});

export const WorkflowModel: Model<IWorkflow> = (mongoose.models.Workflow as Model<IWorkflow>) || mongoose.model<IWorkflow>('Workflow', WorkflowSchema);


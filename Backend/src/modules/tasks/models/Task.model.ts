import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface AttachedWorkflow {
  workflowId: Types.ObjectId;
  triggerOnStatus?: string[]; // Array of statuses that trigger the workflow (e.g., ['In Progress'])
  schedule?: {
    type: 'daily' | 'weekly' | 'monthly' | 'onDueDate' | 'custom';
    time?: string; // Time in HH:mm format (e.g., '09:00')
    daysOfWeek?: number[]; // For weekly: [1,3,5] = Mon, Wed, Fri
    dayOfMonth?: number; // For monthly: 1-31
    cronExpression?: string; // For custom schedules
  };
  config?: Record<string, any>; // Additional configuration
}

export interface WorkflowExecutionHistory {
  executionId: Types.ObjectId;
  workflowId: Types.ObjectId;
  triggeredAt: Date;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  triggeredBy: 'status-change' | 'schedule' | 'manual';
  result?: any;
  error?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Checklist {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: Date;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'file' | 'link';
  url: string;
  size?: string;
}

export interface ITask extends Document {
  taskId: string; // Display ID like TSK-001
  name: string;
  description?: string;
  assignedTo?: Array<{ id: string; name: string; avatar?: string; email?: string }>;
  status: string;
  priority: string;
  labels?: string[];
  dueDate?: Date;
  startDate?: Date; // Start date for recurring tasks
  recurring?: string; // Recurring pattern (Never, Daily, Weekly, Monthly, etc.)
  reminder?: string; // Reminder setting (None, At time, 5 min before, etc.)
  selectedDays?: string[]; // Selected days for weekly recurring (e.g., ['Mon', 'Wed', 'Fri'])
  hasWorkflow?: boolean;
  attachedWorkflows?: AttachedWorkflow[]; // Array of workflows attached to this task
  workflowExecutionHistory?: WorkflowExecutionHistory[]; // History of workflow executions
  checklists?: Checklist[]; // Task checklists
  comments?: Comment[]; // Task comments
  attachments?: Attachment[]; // Task attachments (files and links)
  boardId: Types.ObjectId;
  projectId: Types.ObjectId;
  createdBy?: { id: string; name: string; avatar?: string };
  order?: number;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    taskId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    assignedTo: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    status: {
      type: String,
      default: 'To do',
    },
    priority: {
      type: String,
      default: 'Medium',
      enum: ['Low', 'Medium', 'High', 'Urgent'],
    },
    labels: {
      type: [String],
      default: [],
    },
    dueDate: {
      type: Date,
    },
    startDate: {
      type: Date,
    },
    recurring: {
      type: String,
      default: 'Never',
    },
    reminder: {
      type: String,
      default: 'None',
    },
    selectedDays: {
      type: [String],
      default: [],
    },
    hasWorkflow: {
      type: Boolean,
      default: false,
    },
    checklists: {
      type: [Schema.Types.Mixed] as any,
      default: [],
    },
    comments: {
      type: [Schema.Types.Mixed] as any,
      default: [],
    },
    attachments: {
      type: [Schema.Types.Mixed] as any,
      default: [],
    },
    attachedWorkflows: {
      type: [Schema.Types.Mixed] as any,
      default: [],
    },
    workflowExecutionHistory: {
      type: [Schema.Types.Mixed] as any,
      default: [],
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    createdBy: {
      type: Schema.Types.Mixed,
    },
    order: {
      type: Number,
      default: 0,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'tasks',
  }
);

// Indexes for performance
// Note: taskId already has unique: true which creates an index automatically
TaskSchema.index({ userId: 1 });
TaskSchema.index({ boardId: 1 });
TaskSchema.index({ projectId: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ createdAt: -1 });

// Transform _id to id in JSON output
TaskSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = ret._id.toString();
    const { _id, __v, ...rest } = ret;
    return rest;
  },
});

export const TaskModel: Model<ITask> = mongoose.model<ITask>('Task', TaskSchema);


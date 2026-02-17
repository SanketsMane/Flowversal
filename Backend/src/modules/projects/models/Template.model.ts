import mongoose, { Document, Model, Schema } from 'mongoose';

export type TemplateCategory =
  | 'automation'
  | 'data-processing'
  | 'communication'
  | 'content-generation'
  | 'integration'
  | 'customer-service'
  | 'productivity'
  | 'analytics';

export type TemplateDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ITemplate extends Document {
  name: string;
  description: string;
  category: TemplateCategory;
  icon: string; // Lucide icon name
  coverImage?: string;
  tags: string[];
  difficulty: TemplateDifficulty;
  estimatedTime: string; // e.g., "5 minutes"
  useCases: string[];

  // Workflow structure
  workflowData: {
    workflowName: string;
    workflowDescription: string;
    triggers: any[];
    triggerLogic?: any[];
    containers: any[];
    formFields: any[];
  };

  // Metadata
  author?: string;
  featured: boolean;
  popularity: number; // For sorting
  isPublic: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowDataSchema = new Schema(
  {
    workflowName: {
      type: String,
      required: true,
    },
    workflowDescription: {
      type: String,
      default: '',
    },
    triggers: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    triggerLogic: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    containers: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    formFields: {
      type: [Schema.Types.Mixed],
      default: [],
    },
  },
  { _id: false }
);

const TemplateSchema = new Schema<ITemplate>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'automation',
        'data-processing',
        'communication',
        'content-generation',
        'integration',
        'customer-service',
        'productivity',
        'analytics',
      ],
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    estimatedTime: {
      type: String,
      default: '5 minutes',
    },
    useCases: {
      type: [String],
      default: [],
    },
    workflowData: {
      type: WorkflowDataSchema,
      required: true,
    },
    author: {
      type: String,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    popularity: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'templates',
  }
);

// Indexes for performance
TemplateSchema.index({ category: 1, difficulty: 1 });
TemplateSchema.index({ featured: 1, popularity: -1 });
TemplateSchema.index({ isPublic: 1, popularity: -1 });
TemplateSchema.index({ tags: 1 });
TemplateSchema.index({ createdAt: -1 });

// Text search index
TemplateSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
  useCases: 'text',
});

// Transform _id to id in JSON output
TemplateSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    const { _id, __v, ...rest } = ret;
    return { ...rest, id: _id.toString() };
  },
});

export const TemplateModel: Model<ITemplate> = mongoose.model<ITemplate>('Template', TemplateSchema);


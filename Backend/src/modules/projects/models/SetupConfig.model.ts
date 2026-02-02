import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IntegrationConfig {
  name: string;
  apiKey?: string;
  config?: Record<string, any>;
  encrypted?: boolean; // Whether the API key is encrypted
}

export interface FileConfig {
  name: string;
  url: string;
  type: string;
  size?: number;
  uploadedAt?: Date;
}

export interface LinkConfig {
  name: string;
  url: string;
  description?: string;
}

export interface ISetupConfig extends Document {
  entityType: 'template' | 'project' | 'board';
  entityId: Types.ObjectId;
  userId: Types.ObjectId;
  integrations: IntegrationConfig[];
  files: FileConfig[];
  links: LinkConfig[];
  variables: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationConfigSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    apiKey: {
      type: String,
      // Note: In production, encrypt this field
    },
    config: {
      type: Schema.Types.Mixed,
      default: {},
    },
    encrypted: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const FileConfigSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const LinkConfigSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { _id: false }
);

const SetupConfigSchema = new Schema<ISetupConfig>(
  {
    entityType: {
      type: String,
      enum: ['template', 'project', 'board'],
      required: true,
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    integrations: {
      type: [IntegrationConfigSchema],
      default: [],
    },
    files: {
      type: [FileConfigSchema],
      default: [],
    },
    links: {
      type: [LinkConfigSchema],
      default: [],
    },
    variables: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'setup_configs',
  }
);

// Compound index for entity lookup
SetupConfigSchema.index({ entityType: 1, entityId: 1 });
SetupConfigSchema.index({ userId: 1, entityType: 1 });

// Transform _id to id in JSON output
SetupConfigSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = ret._id.toString();
    const { _id, __v, ...rest } = ret;
    return rest;
  },
});

export const SetupConfigModel: Model<ISetupConfig> = mongoose.model<ISetupConfig>(
  'SetupConfig',
  SetupConfigSchema
);


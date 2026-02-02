import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  configuration?: Record<string, any>;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
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
    icon: {
      type: String,
      default: 'Briefcase',
    },
    iconColor: {
      type: String,
      default: '#3B82F6',
    },
    configuration: {
      type: Schema.Types.Mixed,
      default: {},
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'projects',
  }
);

// Indexes for performance
ProjectSchema.index({ userId: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ name: 'text', description: 'text' });

// Transform _id to id in JSON output
ProjectSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = ret._id.toString();
    const { _id, __v, ...rest } = ret;
    return rest;
  },
});

export const ProjectModel: Model<IProject> = mongoose.model<IProject>('Project', ProjectSchema);


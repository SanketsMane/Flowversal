import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IBoard extends Document {
  name: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  projectId: Types.ObjectId;
  configuration?: Record<string, any>;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BoardSchema = new Schema<IBoard>(
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
      default: 'Folder',
    },
    iconColor: {
      type: String,
      default: '#3B82F6',
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
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
    collection: 'boards',
  }
);

// Indexes for performance
BoardSchema.index({ userId: 1 });
BoardSchema.index({ projectId: 1 });
BoardSchema.index({ createdAt: -1 });

// Transform _id to id in JSON output
BoardSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = ret._id.toString();
    const { _id, __v, ...rest } = ret;
    return rest;
  },
});

export const BoardModel: Model<IBoard> = mongoose.model<IBoard>('Board', BoardSchema);


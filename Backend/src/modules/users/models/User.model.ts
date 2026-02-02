import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  supabaseId: string; // Supabase user ID
  neonUserId?: string; // Neon PostgreSQL user ID
  email: string;
  metadata?: Record<string, any>;
  favoriteWorkflows?: Types.ObjectId[]; // Array of favorite workflow IDs
  
  // Onboarding fields
  onboardingCompleted: boolean;
  organizationName?: string;
  organizationSize?: string;
  referralSource?: string;
  automationExperience?: string;
  techStack?: string[];
  automationGoal?: string;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    supabaseId: {
      type: String,
      required: false, // Changed to false for migration
      unique: true,
      sparse: true,
    },
    neonUserId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: false, // stored encrypted
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    favoriteWorkflows: {
      type: [Schema.Types.ObjectId],
      ref: 'Workflow',
      default: [],
    },
    
    // Onboarding fields
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    organizationName: {
      type: String,
    },
    organizationSize: {
      type: String,
    },
    referralSource: {
      type: String,
    },
    automationExperience: {
      type: String,
    },
    techStack: {
      type: [String],
      default: [],
    },
    automationGoal: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Indexes for performance
//UserSchema.index({ supabaseId: 1 });
//UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });

// Transform _id to id in JSON output
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    // Use object destructuring to remove properties safely
    const { _id, __v, ...rest } = ret;
    return rest;
  },
});

export const UserModel: Model<IUser> = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);

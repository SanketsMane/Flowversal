import mongoose, { Document, Schema } from 'mongoose';

export interface IMfa extends Document {
  userId: string;
  secret: string;
  backupCodes: string[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MfaSchema = new Schema<IMfa>(
  {
    userId: { type: String, required: true, unique: true },
    secret: { type: String, required: true },
    backupCodes: { type: [String], default: [] },
    enabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const MfaModel = mongoose.model<IMfa>('Mfa', MfaSchema);


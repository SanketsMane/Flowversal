import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICounter {
  _id: string;
  seq: number;
}

export type CounterDocument = ICounter & Document;

const CounterSchema = new Schema<ICounter>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { 
    _id: false, // We set _id manually
    versionKey: false 
  }
);

export const CounterModel: Model<ICounter> = mongoose.model<ICounter>('Counter', CounterSchema);

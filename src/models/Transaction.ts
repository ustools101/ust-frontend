import { Schema, model, models } from 'mongoose';
import type ITransaction from '@/types/transactions';

const transactionSchema = new Schema<ITransaction>(
  {
    reference: {
      type: String,
      required: [true, 'Reference is required'],
      unique: true,
    },
    transactionType: {
      type: String,
      required: [true, 'Transaction type is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      ref: 'User',
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
    },
    points: {
      type: Number,
      required: [true, 'Points are required'],
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);


export default models.Transaction || model<ITransaction>('Transaction', transactionSchema);

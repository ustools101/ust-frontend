import { models, model, Schema } from 'mongoose';

export interface IWelcomeBonus {
  telegramId: number;
  claimedAt: Date;
  userId: Schema.Types.ObjectId;
  amount: number;
}

const welcomeBonusSchema = new Schema<IWelcomeBonus>({
  telegramId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  claimedAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    default: 2000,
  },
}, {
  timestamps: true,
});

const WelcomeBonus = models.WelcomeBonus || model<IWelcomeBonus>('WelcomeBonus', welcomeBonusSchema);

export default WelcomeBonus;

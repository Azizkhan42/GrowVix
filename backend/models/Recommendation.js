import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
  category: { type: String, enum: ['content', 'engagement', 'posting', 'strategy', 'competitor', 'profile', 'platform'], required: true },
  problem: { type: String, required: true },
  evidence: { type: String, required: true },
  recommendation: { type: String, required: true },
  expectedBenefit: { type: String, default: '' },
  estimatedEffort: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  reason: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  isDismissed: { type: Boolean, default: false },
  generatedAt: { type: Date, default: Date.now }
});

recommendationSchema.index({ userId: 1, type: 1, isDismissed: 1 });

export default mongoose.model('Recommendation', recommendationSchema);

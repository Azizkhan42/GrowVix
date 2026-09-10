import mongoose from 'mongoose';

const scheduledPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, enum: ['instagram', 'twitter', 'linkedin', 'facebook'], required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  scheduledTime: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'published', 'failed'], default: 'pending' },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },
  lastError: { type: String, default: '' },
  publishedPostId: { type: String, default: '' },
  publishedAt: { type: Date }
});

export default mongoose.model('ScheduledPost', scheduledPostSchema);
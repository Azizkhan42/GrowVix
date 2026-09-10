import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, enum: ['instagram', 'twitter', 'linkedin', 'facebook'], required: true },
  caption: { type: String, required: true },
  hashtags: [{ type: String }],
  imageUrl: { type: String },
  contentType: { type: String, enum: ['post', 'reel', 'story', 'carousel', 'article'], default: 'post' },
  objective: { type: String, enum: ['engagement', 'awareness', 'leads', 'sales', 'education', 'community', 'authority', 'promotion'], default: 'engagement' },
  tone: { type: String, default: 'Professional' },
  topic: { type: String, default: '' },
  variations: [{
    label: String,
    caption: String,
    hashtags: [String],
    style: String
  }],
  engagementScore: {
    overall: { type: Number, default: 0 },
    hook: { type: Number, default: 0 },
    value: { type: Number, default: 0 },
    clarity: { type: Number, default: 0 },
    emotionalAppeal: { type: Number, default: 0 },
    cta: { type: Number, default: 0 },
    audienceRelevance: { type: Number, default: 0 },
    explanation: { type: String, default: '' }
  },
  status: { type: String, enum: ['draft', 'saved', 'scheduled', 'published'], default: 'draft' },
  performanceData: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    lastUpdated: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
});

contentSchema.index({ userId: 1, createdAt: -1 });
contentSchema.index({ userId: 1, platform: 1 });

export default mongoose.model('Content', contentSchema);

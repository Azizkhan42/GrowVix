import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  competitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Competitor', required: true },
  platform: { type: String, enum: ['instagram', 'twitter', 'linkedin', 'facebook'], required: true },
  caption: { type: String },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  postUrl: { type: String },
  imageUrl: { type: String },
  videoUrl: { type: String },
  postDate: { type: Date },
  engagementRate: { type: Number, default: 0 },
  contentType: { type: String, enum: ['image', 'video', 'reel', 'carousel', 'text', 'link', 'story', 'unknown'], default: 'unknown' },
  contentCategory: { type: String, enum: ['educational', 'promotional', 'entertainment', 'social_proof', 'behind_scenes', 'engagement', 'announcement', 'unknown'], default: 'unknown' },
  hashtags: [{ type: String }],
  fetchedAt: { type: Date, default: Date.now }
});

postSchema.index({ competitorId: 1, postDate: -1 });
postSchema.index({ platform: 1 });

export default mongoose.model('Post', postSchema);

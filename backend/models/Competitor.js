import mongoose from 'mongoose';

const competitorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  industry: { type: String, required: true, trim: true },
  competitorType: {
    type: String,
    enum: ['Direct Competitor', 'Indirect Competitor', 'Aspirational Competitor'],
    default: 'Direct Competitor'
  },
  location: { type: String, default: '' },
  website: { type: String, default: '' },
  description: { type: String, default: '' },
  businessDescription: { type: String, default: '' },
  instagramProfile: { type: String, default: '' },
  facebookPage: { type: String, default: '' },
  linkedinPage: { type: String, default: '' },
  tiktokProfile: { type: String, default: '' },
  youtubeChannel: { type: String, default: '' },
  twitterHandle: { type: String, default: '' },
  logo: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Paused', 'Archived'], default: 'Active' },
  platforms: [{
    platform: { type: String, enum: ['instagram', 'twitter', 'linkedin', 'facebook', 'tiktok', 'youtube', 'website'] },
    username: { type: String },
    url: { type: String }
  }],
  platformStatuses: [{
    platform: { type: String },
    status: {
      type: String,
      enum: ['Connected', 'Collecting', 'Completed', 'Partial Data', 'Authentication Required', 'Restricted', 'Unsupported', 'Failed'],
      default: 'Connected'
    },
    lastAttemptAt: { type: Date },
    lastSuccessfulFetchAt: { type: Date },
    recordsCollected: { type: Number, default: 0 },
    errorMessage: { type: String, default: '' }
  }],
  profileData: {
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
    bio: { type: String, default: '' },
    profileUrl: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    fullName: { type: String, default: '' },
    lastUpdated: { type: Date }
  },
  digitalScore: { type: Number, default: 0 },
  lastAnalyzed: { type: Date },
  addedAt: { type: Date, default: Date.now }
});

competitorSchema.index({ userId: 1, addedAt: -1 });
competitorSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model('Competitor', competitorSchema);

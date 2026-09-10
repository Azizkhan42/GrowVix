import mongoose from 'mongoose';

const competitorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, default: '' },
  website: { type: String, default: '' },
  facebookPage: { type: String, default: '' },
  instagramProfile: { type: String, default: '' },
  linkedinPage: { type: String, default: '' },
  twitterHandle: { type: String, default: '' },
  industry: { type: String, default: '' },
  location: { type: String, default: '' },
  notes: { type: String, default: '' },
  platforms: [{
    platform: { type: String, enum: ['instagram', 'twitter', 'linkedin', 'facebook'] },
    username: { type: String }
  }],
  profileData: {
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
    bio: { type: String, default: '' },
    profileUrl: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    lastUpdated: { type: Date }
  },
  digitalScore: { type: Number, default: 0 },
  lastAnalyzed: { type: Date },
  addedAt: { type: Date, default: Date.now }
});

competitorSchema.index({ userId: 1, addedAt: -1 });

export default mongoose.model('Competitor', competitorSchema);

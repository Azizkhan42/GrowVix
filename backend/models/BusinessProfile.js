import mongoose from 'mongoose';

const businessProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName: { type: String, default: '' },
  industry: { type: String, default: '' },
  location: { type: String, default: '' },
  website: { type: String, default: '' },
  description: { type: String, default: '' },
  targetAudience: { type: String, default: '' },
  brandTone: { type: String, enum: ['professional', 'casual', 'funny', 'inspirational', 'educational', 'authoritative'], default: 'professional' },
  competitors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Competitor' }],
  socialAccounts: [{
    platform: { type: String, enum: ['instagram', 'twitter', 'linkedin', 'facebook'] },
    username: { type: String },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 }
  }],
  goals: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('BusinessProfile', businessProfileSchema);

import mongoose from 'mongoose';

const socialAccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, enum: ['instagram', 'twitter', 'linkedin', 'facebook'], required: true },
  accessToken: { type: String, default: '' },
  userToken: { type: String, default: '' },
  tokenType: { type: String, enum: ['user', 'page', 'none'], default: 'user' },
  pageId: { type: String },
  accountName: { type: String },
  accountId: { type: String },
  igBusinessAccountId: { type: String },
  igUsername: { type: String },
  profileUrl: { type: String },
  availablePages: [{
    id: String,
    name: String,
    igUsername: String
  }],
  isConnected: { type: Boolean, default: true },
  connectedAt: { type: Date, default: Date.now }
});

// Allow one account per platform per user
socialAccountSchema.index({ userId: 1, platform: 1 }, { unique: true });

export default mongoose.model('SocialAccount', socialAccountSchema);
import mongoose from 'mongoose';

const digitalScoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  overall: { type: Number, default: 0 },
  dimensions: {
    socialMedia: { type: Number, default: 0 },
    contentQuality: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 },
    consistency: { type: Number, default: 0 },
    website: { type: Number, default: 0 },
    seo: { type: Number, default: 0 },
    competitorPosition: { type: Number, default: 0 },
    brandStrength: { type: Number, default: 0 }
  },
  breakdown: {
    socialMedia: { details: { type: String, default: '' } },
    contentQuality: { details: { type: String, default: '' } },
    engagement: { details: { type: String, default: '' } },
    consistency: { details: { type: String, default: '' } },
    website: { details: { type: String, default: '' } },
    seo: { details: { type: String, default: '' } },
    competitorPosition: { details: { type: String, default: '' } },
    brandStrength: { details: { type: String, default: '' } }
  },
  calculatedAt: { type: Date, default: Date.now }
});

digitalScoreSchema.index({ userId: 1, calculatedAt: -1 });

export default mongoose.model('DigitalScore', digitalScoreSchema);

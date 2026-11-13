import mongoose from 'mongoose';

const competitorAnalysisSchema = new mongoose.Schema({
  competitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Competitor', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  analysisType: { type: String, enum: ['profile', 'content', 'engagement', 'comparison', 'gap', 'full_intelligence'], default: 'full_intelligence' },
  executiveSummary: { type: String, default: '' },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  opportunities: [{ type: String }],
  threats: [{ type: String }],
  contentStrategy: { type: mongoose.Schema.Types.Mixed },
  audienceInsights: { type: mongoose.Schema.Types.Mixed },
  marketingGaps: [{ type: mongoose.Schema.Types.Mixed }],
  recommendations: [{ type: mongoose.Schema.Types.Mixed }],
  contentIdeas: [{ type: mongoose.Schema.Types.Mixed }],
  supportingEvidence: { type: mongoose.Schema.Types.Mixed },
  data: { type: mongoose.Schema.Types.Mixed },
  aiSummary: { type: String, default: '' },
  modelVersion: { type: String, default: 'gpt-3.5-turbo' },
  calculatedAt: { type: Date, default: Date.now }
});

competitorAnalysisSchema.index({ competitorId: 1, analysisType: 1, calculatedAt: -1 });
competitorAnalysisSchema.index({ userId: 1, analysisType: 1 });

export default mongoose.model('CompetitorAnalysis', competitorAnalysisSchema);

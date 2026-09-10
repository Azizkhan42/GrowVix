import mongoose from 'mongoose';

const competitorAnalysisSchema = new mongoose.Schema({
  competitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Competitor', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  analysisType: { type: String, enum: ['profile', 'content', 'engagement', 'comparison', 'gap'], required: true },
  data: { type: mongoose.Schema.Types.Mixed },
  aiSummary: { type: String, default: '' },
  calculatedAt: { type: Date, default: Date.now }
});

competitorAnalysisSchema.index({ competitorId: 1, analysisType: 1, calculatedAt: -1 });
competitorAnalysisSchema.index({ userId: 1, analysisType: 1 });

export default mongoose.model('CompetitorAnalysis', competitorAnalysisSchema);

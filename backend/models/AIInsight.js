import mongoose from 'mongoose';

const aiInsightSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  analysis: { type: String },
  strategy: { type: String },
  improvementIdea: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('AIInsight', aiInsightSchema);

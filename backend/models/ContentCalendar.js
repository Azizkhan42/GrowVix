import mongoose from 'mongoose';

const contentCalendarSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekStarting: { type: Date, required: true },
  entries: [{
    day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
    platform: { type: String, enum: ['instagram', 'twitter', 'linkedin', 'facebook'] },
    contentType: { type: String },
    topic: { type: String },
    hook: { type: String },
    format: { type: String },
    objective: { type: String },
    cta: { type: String },
    bestTime: { type: String },
    reasoning: { type: String }
  }],
  generatedAt: { type: Date, default: Date.now }
});

contentCalendarSchema.index({ userId: 1, weekStarting: -1 });

export default mongoose.model('ContentCalendar', contentCalendarSchema);

import mongoose from 'mongoose';

const optimizationHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  originalResume: {
    type: String,
    required: true
  },
  optimizedResume: {
    type: String,
    required: true
  },
  jobPostingText: {
    type: String,
    required: true
  },
  improvements: {
    atsImprovements: [String],
    keywordsAdded: [String],
    formattingFixes: [{
      description: String,
      reason: String
    }],
    contentImprovements: [{
      what: String,
      why: String
    }]
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  applied: {
    type: Boolean,
    default: false
  },
  resumeUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Add indexes for common queries
optimizationHistorySchema.index({ userId: 1, date: -1 });
optimizationHistorySchema.index({ userId: 1, status: 1 });

const OptimizationHistory = mongoose.model('OptimizationHistory', optimizationHistorySchema);

export default OptimizationHistory;

const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issueType: {
    type: String,
    required: true,
    enum: ['missing_marks', 'incorrect_grade', 'grading_error', 'other']
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  attachments: {
    type: [String],
    default: []
  },
  adminResponse: {
    type: String,
    trim: true
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
issueSchema.index({ student: 1, createdAt: -1 });
issueSchema.index({ lecturer: 1, status: 1 });
issueSchema.index({ status: 1, priority: 1 });

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;



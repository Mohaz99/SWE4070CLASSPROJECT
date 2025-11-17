const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  offeringId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseOffering',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lecturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

markSchema.index({ assessmentId: 1, studentId: 1 }, { unique: true });

const Mark = mongoose.model('Mark', markSchema);

module.exports = Mark;





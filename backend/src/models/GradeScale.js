const mongoose = require('mongoose');

const gradeScaleSchema = new mongoose.Schema({
  letter: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  minPercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  maxPercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  points: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

const GradeScale = mongoose.model('GradeScale', gradeScaleSchema);

module.exports = GradeScale;


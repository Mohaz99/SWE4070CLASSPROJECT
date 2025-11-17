const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  maxScore: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: true });

const courseOfferingSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  term: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    default: null
  },
  assignedLecturerIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  assessments: [assessmentSchema]
}, {
  timestamps: true
});

// Validate assessments sum to 100
courseOfferingSchema.pre('save', function(next) {
  if (this.assessments && this.assessments.length > 0) {
    const totalWeight = this.assessments.reduce((sum, a) => sum + a.weight, 0);
    if (totalWeight !== 100) {
      return next(new Error('Assessment weights must sum to exactly 100'));
    }
  }
  next();
});

courseOfferingSchema.index({ courseId: 1, term: 1, year: 1 }, { unique: true });

const CourseOffering = mongoose.model('CourseOffering', courseOfferingSchema);

module.exports = CourseOffering;





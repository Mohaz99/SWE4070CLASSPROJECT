const Enrollment = require('../models/Enrollment');
const CourseOffering = require('../models/CourseOffering');
const Mark = require('../models/Mark');
const User = require('../models/User');
const GradeScale = require('../models/GradeScale');
const gradingService = require('./grading.service');

const exportToCSV = async (offeringId, format = 'csv') => {
  const offering = await CourseOffering.findById(offeringId)
    .populate('courseId');

  if (!offering) {
    throw new Error('Offering not found');
  }

  // Get enrollments for this offering
  const enrollments = await Enrollment.find({ offeringId })
    .populate('studentId', 'fullName regNo');

  const studentIds = enrollments.map(e => e.studentId._id);

  // Get marks for this offering and students
  const marks = await Mark.find({
    offeringId,
    studentId: { $in: studentIds }
  });

  // Calculate grades using the grading service
  const term = offering.term;
  const year = offering.year;

  const results = [];

  for (const enrollment of enrollments) {
    const studentMarks = marks.filter(m => 
      m.studentId.equals(enrollment.studentId._id)
    );

    let totalPercent = 0;
    const row = {
      'Full Name': enrollment.studentId.fullName,
      'Registration Number': enrollment.studentId.regNo || ''
    };

    // Add assessment columns
    for (const assessment of offering.assessments) {
      const mark = studentMarks.find(m => m.assessmentId.equals(assessment._id));
      const score = mark ? mark.score : 0;
      const percent = (score / assessment.maxScore) * assessment.weight;
      totalPercent += percent;
      row[assessment.name] = `${score}/${assessment.maxScore}`;
    }

    row['Total Percent'] = Math.round(totalPercent * 100) / 100;

    results.push(row);
  }

  // Get grade scale for letter grade assignment
  const gradeScales = await GradeScale.find().sort({ maxPercent: -1 });

  // Assign letter grades based on grade scale
  for (const row of results) {
    const totalPercent = row['Total Percent'];
    let letter = 'F';
    
    for (const grade of gradeScales) {
      if (totalPercent >= grade.minPercent && totalPercent <= grade.maxPercent) {
        letter = grade.letter;
        break;
      }
    }
    
    row['Grade'] = letter;
  }

  // Convert to CSV
  if (results.length === 0) {
    return '';
  }

  const headers = Object.keys(results[0]);
  const csv = [
    headers.join(','),
    ...results.map(row => 
      headers.map(header => `"${row[header] || ''}"`).join(',')
    )
  ].join('\n');

  return csv;
};

module.exports = {
  exportToCSV
};






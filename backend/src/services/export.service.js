const Enrollment = require('../models/Enrollment');
const CourseOffering = require('../models/CourseOffering');
const Mark = require('../models/Mark');
const User = require('../models/User');
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

    // Add letter grade (simple A-E scale)
    let letter = 'F';
    if (totalPercent >= 80) letter = 'A';
    else if (totalPercent >= 70) letter = 'B';
    else if (totalPercent >= 60) letter = 'C';
    else if (totalPercent >= 50) letter = 'D';
    else letter = 'F';
    row['Grade'] = letter;

    results.push(row);
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





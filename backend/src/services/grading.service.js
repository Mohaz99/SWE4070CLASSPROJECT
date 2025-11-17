const Enrollment = require('../models/Enrollment');
const CourseOffering = require('../models/CourseOffering');
const Mark = require('../models/Mark');
const GradeScale = require('../models/GradeScale');
const User = require('../models/User');

// Get final grades for a term/year, optionally filtered by student
const getFinals = async (term, year, options = {}) => {
  const { studentId } = options;

  // Find all offerings for the term/year
  const offerings = await CourseOffering.find({ term, year })
    .populate('courseId');

  if (offerings.length === 0) {
    return [];
  }

  const offeringIds = offerings.map(o => o._id);

  // Find enrollments
  let enrollments;
  if (studentId) {
    enrollments = await Enrollment.find({ 
      studentId, 
      offeringId: { $in: offeringIds }
    });
  } else {
    enrollments = await Enrollment.find({ 
      offeringId: { $in: offeringIds }
    });
  }

  // Get all marks for these students and offerings
  const studentIds = [...new Set(enrollments.map(e => e.studentId))];
  const marks = await Mark.find({
    offeringId: { $in: offeringIds },
    studentId: { $in: studentIds }
  });

  // Get grade scale
  const gradeScales = await GradeScale.find().sort({ maxPercent: -1 });

  // Build results
  const results = [];

  for (const enrollment of enrollments) {
    const offering = offerings.find(o => o._id.equals(enrollment.offeringId));
    if (!offering) continue;

    const studentMarks = marks.filter(m => 
      m.studentId.equals(enrollment.studentId) && 
      m.offeringId.equals(offering._id)
    );

    // Calculate total percentage
    let totalPercent = 0;
    const assessmentBreakdown = [];

    for (const assessment of offering.assessments) {
      const mark = studentMarks.find(m => m.assessmentId.equals(assessment._id));
      const score = mark ? mark.score : 0;
      const percent = (score / assessment.maxScore) * assessment.weight;
      totalPercent += percent;

      assessmentBreakdown.push({
        assessmentId: assessment._id,
        name: assessment.name,
        score,
        maxScore: assessment.maxScore,
        weight: assessment.weight,
        earnedPercent: percent
      });
    }

    // Determine letter grade
    let letter = 'F';
    let points = 0;
    for (const grade of gradeScales) {
      if (totalPercent >= grade.minPercent && totalPercent <= grade.maxPercent) {
        letter = grade.letter;
        points = grade.points;
        break;
      }
    }

    results.push({
      studentId: enrollment.studentId,
      offeringId: offering._id,
      course: {
        code: offering.courseId.code,
        name: offering.courseId.name,
        credits: offering.courseId.credits
      },
      term,
      year,
      assessments: assessmentBreakdown,
      totalPercent: Math.round(totalPercent * 100) / 100,
      letter,
      points
    });
  }

  return results;
};

// Get consolidated mark sheet with GPA
const getConsolidatedMarksheet = async (term, year, options = {}) => {
  const { studentId } = options;

  const finals = await getFinals(term, year, options);

  if (studentId) {
    // Return per-student view
    const student = await User.findById(studentId);
    const gpa = finals.length > 0 
      ? finals.reduce((sum, f) => sum + f.points, 0) / finals.length 
      : 0;

    return {
      studentId,
      fullName: student.fullName,
      regNo: student.regNo,
      term,
      year,
      courses: finals,
      gpa: Math.round(gpa * 100) / 100,
      average: finals.length > 0
        ? Math.round((finals.reduce((sum, f) => sum + f.totalPercent, 0) / finals.length) * 100) / 100
        : 0
    };
  } else {
    // Return per-cohort view
    const studentMap = new Map();
    
    for (const result of finals) {
      if (!studentMap.has(result.studentId.toString())) {
        studentMap.set(result.studentId.toString(), {
          studentId: result.studentId,
          courses: []
        });
      }
      studentMap.get(result.studentId.toString()).courses.push(result);
    }

    const students = await User.find({ _id: { $in: [...studentMap.keys()] } });
    const studentInfoMap = new Map(students.map(s => [s._id.toString(), s]));

    const cohort = Array.from(studentMap.values()).map(entry => {
      const student = studentInfoMap.get(entry.studentId.toString());
      const gpa = entry.courses.length > 0
        ? entry.courses.reduce((sum, c) => sum + c.points, 0) / entry.courses.length
        : 0;

      return {
        studentId: entry.studentId,
        fullName: student.fullName,
        regNo: student.regNo,
        term,
        year,
        courses: entry.courses,
        gpa: Math.round(gpa * 100) / 100,
        average: entry.courses.length > 0
          ? Math.round((entry.courses.reduce((sum, c) => sum + c.totalPercent, 0) / entry.courses.length) * 100) / 100
          : 0
      };
    });

    return cohort;
  }
};

module.exports = {
  getFinals,
  getConsolidatedMarksheet
};





const Enrollment = require('../models/Enrollment');
const CourseOffering = require('../models/CourseOffering');

const getEnrollmentsForTerm = async (studentId, term, year) => {
  const enrollments = await Enrollment.find({ 
    studentId,
    // Will need to join to get offerings matching term/year
  })
  .populate({
    path: 'offeringId',
    populate: { path: 'courseId' }
  })
  .populate('chosenLecturerId', 'fullName staffNo');

  // Filter enrollments by term/year from offering
  const filtered = enrollments.filter(e => 
    e.offeringId && 
    e.offeringId.term === term && 
    e.offeringId.year === year
  );

  return filtered;
};

const countEnrollmentsForTerm = async (studentId, term, year) => {
  const enrollments = await Enrollment.find({ studentId }).populate('offeringId');
  return enrollments.filter(e => 
    e.offeringId && 
    e.offeringId.term === term && 
    e.offeringId.year === year
  ).length;
};

const validateLecturerAssignment = async (offeringId, chosenLecturerId) => {
  const offering = await CourseOffering.findById(offeringId);
  if (!offering) {
    throw new Error('Course offering not found');
  }

  if (!offering.assignedLecturerIds.includes(chosenLecturerId)) {
    throw new Error('Chosen lecturer is not assigned to this offering');
  }

  return offering;
};

module.exports = {
  getEnrollmentsForTerm,
  countEnrollmentsForTerm,
  validateLecturerAssignment
};





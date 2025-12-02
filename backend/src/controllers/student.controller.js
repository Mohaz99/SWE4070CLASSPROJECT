const Enrollment = require('../models/Enrollment');
const CourseOffering = require('../models/CourseOffering');
const enrollmentService = require('../services/enrollment.service');
const gradingService = require('../services/grading.service');

const getEnrollments = async (req, res) => {
  try {
    const { term, year } = req.query;

    if (!term || !year) {
      return res.status(400).json({
        success: false,
        error: 'Term and year required'
      });
    }

    const enrollments = await enrollmentService.getEnrollmentsForTerm(
      req.user._id,
      term,
      year
    );

    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const createEnrollment = async (req, res) => {
  try {
    const { offeringId, chosenLecturerId } = req.body;

    if (!offeringId || !chosenLecturerId) {
      return res.status(400).json({
        success: false,
        error: 'offeringId and chosenLecturerId required'
      });
    }

    // Get offering to check term/year
    const offering = await CourseOffering.findById(offeringId);
    if (!offering) {
      return res.status(404).json({
        success: false,
        error: 'Offering not found'
      });
    }

    // Check max 5 enrollments per term/year
    const count = await enrollmentService.countEnrollmentsForTerm(
      req.user._id,
      offering.term,
      offering.year
    );

    if (count >= 5) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 5 enrollments per term/year'
      });
    }

    // Validate lecturer assignment
    await enrollmentService.validateLecturerAssignment(offeringId, chosenLecturerId);

    // Create enrollment
    const enrollment = await Enrollment.create({
      studentId: req.user._id,
      offeringId,
      chosenLecturerId
    });

    await enrollment.populate('offeringId');
    await enrollment.populate({
      path: 'offeringId',
      populate: { path: 'courseId' }
    });
    await enrollment.populate('chosenLecturerId', 'fullName staffNo');

    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const deleteEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found'
      });
    }

    // Check ownership
    if (enrollment.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    await Enrollment.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Enrollment deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getGrades = async (req, res) => {
  try {
    const { term, year } = req.query;

    if (!term || !year) {
      return res.status(400).json({
        success: false,
        error: 'Term and year required'
      });
    }

    const grades = await gradingService.getFinals(term, year, {
      studentId: req.user._id
    });

    res.json({
      success: true,
      data: grades
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getEnrollments,
  createEnrollment,
  deleteEnrollment,
  getGrades
};






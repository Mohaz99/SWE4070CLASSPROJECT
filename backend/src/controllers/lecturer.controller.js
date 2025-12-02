const CourseOffering = require('../models/CourseOffering');
const Enrollment = require('../models/Enrollment');
const Mark = require('../models/Mark');
const mongoose = require('mongoose');
const exportService = require('../services/export.service');

const getMyOfferings = async (req, res) => {
  try {
    const offerings = await CourseOffering.find({
      assignedLecturerIds: req.user._id
    })
    .populate('courseId')
    .populate('assignedLecturerIds', 'fullName staffNo');

    res.json({
      success: true,
      data: offerings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getOfferingStudents = async (req, res) => {
  try {
    const { id } = req.params;

    const offering = await CourseOffering.findById(id);
    if (!offering) {
      return res.status(404).json({
        success: false,
        error: 'Offering not found'
      });
    }

    // Check if lecturer is assigned
    if (!offering.assignedLecturerIds.some(l => l.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Not assigned to this offering'
      });
    }

    const enrollments = await Enrollment.find({ offeringId: id })
      .populate('studentId', 'fullName regNo email')
      .populate('chosenLecturerId', 'fullName staffNo');

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

const postMarks = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const marksData = req.body;

    if (!Array.isArray(marksData) || marksData.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Array of marks required'
      });
    }

    const results = [];

    for (const markData of marksData) {
      const { assessmentId, studentId, score, offeringId } = markData;

      if (!assessmentId || !studentId || score === undefined || !offeringId) {
        throw new Error('Missing required fields in mark data');
      }

      // Verify lecturer is assigned to offering
      const offering = await CourseOffering.findById(offeringId).session(session);
      if (!offering) {
        throw new Error('Offering not found');
      }

      if (!offering.assignedLecturerIds.some(l => l.toString() === req.user._id.toString())) {
        throw new Error('Not assigned to this offering');
      }

      // Validate score
      const assessment = offering.assessments.id(assessmentId);
      if (!assessment) {
        throw new Error('Assessment not found');
      }

      if (score < 0 || score > assessment.maxScore) {
        throw new Error(`Score must be between 0 and ${assessment.maxScore}`);
      }

      // Upsert mark
      const mark = await Mark.findOneAndUpdate(
        { assessmentId, studentId },
        {
          assessmentId,
          offeringId,
          studentId,
          lecturerId: req.user._id,
          score
        },
        { upsert: true, new: true, session }
      );

      results.push(mark);
    }

    await session.commitTransaction();
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

const exportCSV = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify lecturer is assigned
    const offering = await CourseOffering.findById(id);
    if (!offering) {
      return res.status(404).json({
        success: false,
        error: 'Offering not found'
      });
    }

    if (!offering.assignedLecturerIds.some(l => l.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Not assigned to this offering'
      });
    }

    const csv = await exportService.exportToCSV(id);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=marks_${id}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getMyOfferings,
  getOfferingStudents,
  postMarks,
  exportCSV
};






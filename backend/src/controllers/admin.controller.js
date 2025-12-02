const Course = require('../models/Course');
const CourseOffering = require('../models/CourseOffering');
const gradingService = require('../services/grading.service');
const { applyAssessmentDefaults } = require('../config/assessmentDefaults');

const createCourse = async (req, res) => {
  try {
    const { code, name, credits } = req.body;

    const course = await Course.create({
      code: code.toUpperCase(),
      name,
      credits
    });

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const createOffering = async (req, res) => {
  try {
    const { courseId, term, year, capacity, assignedLecturerIds } = req.body;

    const offering = await CourseOffering.create({
      courseId,
      term,
      year,
      capacity,
      assignedLecturerIds: assignedLecturerIds || []
    });

    await offering.populate('courseId');
    await offering.populate('assignedLecturerIds', 'fullName staffNo');

    res.status(201).json({
      success: true,
      data: offering
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const updateAssessments = async (req, res) => {
  try {
    const { id } = req.params;
    let { assessments } = req.body;

    // Apply default maxScores for assessment types
    assessments = applyAssessmentDefaults(assessments);

    // Validate that all assessments have maxScore
    for (const assessment of assessments) {
      if (assessment.maxScore === undefined || assessment.maxScore === null) {
        return res.status(400).json({
          success: false,
          error: `Assessment "${assessment.name}" must have a maxScore. Available defaults: Assignment (10), Quiz (15), Project (25), Midsem (20), Endsem (30)`
        });
      }
    }

    // Validate weights sum to 100
    const totalWeight = assessments.reduce((sum, a) => sum + a.weight, 0);
    if (totalWeight !== 100) {
      return res.status(400).json({
        success: false,
        error: 'Assessment weights must sum to exactly 100'
      });
    }

    const offering = await CourseOffering.findById(id);
    if (!offering) {
      return res.status(404).json({
        success: false,
        error: 'Offering not found'
      });
    }

    offering.assessments = assessments;
    await offering.save();

    res.json({
      success: true,
      data: offering
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getConsolidatedMarksheet = async (req, res) => {
  try {
    const { term, year } = req.query;
    const { studentId } = req.query;

    if (!term || !year) {
      return res.status(400).json({
        success: false,
        error: 'Term and year required'
      });
    }

    const data = await gradingService.getConsolidatedMarksheet(term, year, {
      studentId
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getMissingMarks = async (req, res) => {
  try {
    const { term, year } = req.query;
    const { offeringId, studentId } = req.query;

    if (!term || !year) {
      return res.status(400).json({
        success: false,
        error: 'Term and year required'
      });
    }

    const missingMarks = await gradingService.getMissingMarks(term, year, {
      offeringId,
      studentId
    });

    res.json({
      success: true,
      data: missingMarks,
      count: missingMarks.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createCourse,
  createOffering,
  updateAssessments,
  getConsolidatedMarksheet,
  getMissingMarks
};






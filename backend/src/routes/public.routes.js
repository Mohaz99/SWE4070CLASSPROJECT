const express = require('express');
const Course = require('../models/Course');
const CourseOffering = require('../models/CourseOffering');
const GradeScale = require('../models/GradeScale');
const { ASSESSMENT_DEFAULTS } = require('../config/assessmentDefaults');

const router = express.Router();

router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort('code');
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/offerings', async (req, res) => {
  try {
    const { term, year } = req.query;
    let filter = {};
    if (term) filter.term = term;
    if (year) filter.year = parseInt(year);

    const offerings = await CourseOffering.find(filter)
      .populate('courseId')
      .populate('assignedLecturerIds', 'fullName staffNo')
      .sort({ code: 1, term: 1, year: 1 });

    res.json({ success: true, data: offerings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/grade-scales', async (req, res) => {
  try {
    const scales = await GradeScale.find().sort({ maxPercent: -1 });
    res.json({ success: true, data: scales });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/assessment-defaults', async (req, res) => {
  try {
    // Return a clean list of assessment defaults for frontend use
    const defaults = {
      'Assignment': 10,
      'Quiz': 15,
      'Project': 25,
      'Midsem': 20,
      'Endsem': 30
    };
    res.json({ success: true, data: defaults });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;






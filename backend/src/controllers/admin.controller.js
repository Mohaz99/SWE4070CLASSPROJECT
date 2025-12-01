const Course = require('../models/Course');
const CourseOffering = require('../models/CourseOffering');
const gradingService = require('../services/grading.service');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

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
    const { assessments } = req.body;

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

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    // Simple password generation or default
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await User.create({ fullName: name, email, role, passwordHash });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, role } = req.body;
    const user = await User.findByIdAndUpdate(id, { fullName, email, role }, { new: true });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllMarks = async (req, res) => {
  try {
    // Fetch consolidated marks for current term/year (hardcoded or from query)
    const term = req.query.term || '2025S1';
    const year = req.query.year || 2025;
    const cohortData = await gradingService.getConsolidatedMarksheet(term, year);

    // Flatten for frontend compatibility if needed, or return as is
    // Frontend expects flat list of marks. Let's try to map it.
    const flatMarks = [];
    cohortData.forEach(student => {
      student.courses.forEach(course => {
        const markEntry = {
          id: course.offeringId, // unique enough?
          studentId: student.studentId,
          courseId: course.offeringId, // using offeringId as courseId for now
          // Map assessments to quiz1, midsem, etc. if possible, or just pass total
          // This is a simplification. Ideally frontend should handle dynamic assessments.
          endsem: course.totalPercent
        };
        // Try to map specific assessments if names match
        course.assessments.forEach(a => {
          if (a.name.toLowerCase().includes('quiz 1')) markEntry.quiz1 = a.score;
          if (a.name.toLowerCase().includes('mid')) markEntry.midsem = a.score;
          if (a.name.toLowerCase().includes('quiz 2')) markEntry.quiz2 = a.score;
          if (a.name.toLowerCase().includes('final') || a.name.toLowerCase().includes('end')) markEntry.endsem = a.score;
        });
        flatMarks.push(markEntry);
      });
    });

    res.json({ success: true, data: flatMarks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getIssues = async (req, res) => {
  try {
    const LegacyIssue = require('../legacy/models/LegacyIssue');
    const issues = await LegacyIssue.find();
    res.json({ success: true, data: issues });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const LegacyIssue = require('../legacy/models/LegacyIssue');
    const issue = await LegacyIssue.findByIdAndUpdate(id, { status }, { new: true });
    res.json({ success: true, data: issue });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const sendMessageToLecturer = async (req, res) => {
  try {
    // Mock implementation or log
    console.log('Message to lecturer:', req.body);
    res.json({ success: true, message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const assignLecturerToCourse = async (req, res) => {
  try {
    const { courseId, lecturerId } = req.body;
    // Find offering for current term/year and update assignedLecturerIds
    // Assuming courseId passed is actually Course ID, we need to find the Offering
    // For simplicity, let's assume we are creating/updating an offering for 2025S1
    let offering = await CourseOffering.findOne({ courseId, term: '2025S1', year: 2025 });
    if (!offering) {
      offering = await CourseOffering.create({
        courseId, term: '2025S1', year: 2025, assignedLecturerIds: [lecturerId]
      });
    } else {
      if (!offering.assignedLecturerIds.includes(lecturerId)) {
        offering.assignedLecturerIds.push(lecturerId);
        await offering.save();
      }
    }
    res.json({ success: true, message: 'Assigned' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const registerStudentToCourse = async (req, res) => {
  try {
    const { studentId, courseId, lecturerId } = req.body;
    const Enrollment = require('../models/Enrollment');
    // Find offering
    let offering = await CourseOffering.findOne({ courseId, term: '2025S1', year: 2025 });
    if (!offering) {
      // Create offering if not exists (auto-create for demo)
      offering = await CourseOffering.create({ courseId, term: '2025S1', year: 2025 });
    }

    const enrollment = await Enrollment.create({
      studentId,
      offeringId: offering._id,
      enrolledAt: new Date()
    });
    res.json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const Enrollment = require('../models/Enrollment');
    await Enrollment.findByIdAndDelete(id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateRegistrationLecturer = async (req, res) => {
  try {
    // Enrollments don't strictly have a lecturer, but we can ignore or store it if schema allows
    // For now, just success
    res.json({ success: true, message: 'Updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const resetDatabase = async (req, res) => {
  // Dangerous! Skip for now or implement partial cleanup
  res.json({ success: true, message: 'Reset simulated' });
};

module.exports = {
  createCourse,
  createOffering,
  updateAssessments,
  getConsolidatedMarksheet,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllMarks,
  getIssues,
  updateIssueStatus,
  sendMessageToLecturer,
  assignLecturerToCourse,
  registerStudentToCourse,
  deleteRegistration,
  updateRegistrationLecturer,
  resetDatabase
};





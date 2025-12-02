const Issue = require('../models/Issue');
const User = require('../models/User');

// Student: Create a new issue
const createIssue = async (req, res) => {
  try {
    const { lecturer, issueType, subject, description, priority, attachments } = req.body;

    // Validate required fields
    if (!lecturer || !issueType || !subject || !description) {
      return res.status(400).json({
        success: false,
        error: 'lecturer, issueType, subject, and description are required'
      });
    }

    // Validate lecturer exists
    const lecturerExists = await User.findById(lecturer);
    if (!lecturerExists || lecturerExists.role !== 'lecturer') {
      return res.status(404).json({
        success: false,
        error: 'Lecturer not found'
      });
    }

    // Create issue
    const issue = await Issue.create({
      student: req.user._id,
      lecturer,
      issueType,
      subject,
      description,
      priority: priority || 'medium',
      attachments: attachments || [],
      status: 'pending'
    });

    await issue.populate('student', 'fullName regNo email');
    await issue.populate('lecturer', 'fullName staffNo email');

    res.status(201).json({
      success: true,
      data: issue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Student: Get own issues
const getMyIssues = async (req, res) => {
  try {
    const { status, issueType } = req.query;
    
    let filter = { student: req.user._id };
    
    if (status) {
      filter.status = status;
    }
    
    if (issueType) {
      filter.issueType = issueType;
    }

    const issues = await Issue.find(filter)
      .populate('lecturer', 'fullName staffNo email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: issues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Student: Get single issue by ID
const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findById(id)
      .populate('student', 'fullName regNo email')
      .populate('lecturer', 'fullName staffNo email');

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    // Check if student owns this issue
    if (issue.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: issue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Admin: Get all issues
const getAllIssues = async (req, res) => {
  try {
    const { status, priority, issueType, studentId, lecturerId } = req.query;
    
    let filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (issueType) filter.issueType = issueType;
    if (studentId) filter.student = studentId;
    if (lecturerId) filter.lecturer = lecturerId;

    const issues = await Issue.find(filter)
      .populate('student', 'fullName regNo email')
      .populate('lecturer', 'fullName staffNo email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: issues,
      count: issues.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Admin: Update issue status
const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'in_progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    // Update issue
    issue.status = status;
    if (adminResponse) {
      issue.adminResponse = adminResponse;
    }
    if (status === 'resolved') {
      issue.resolvedAt = new Date();
    } else if (status !== 'resolved' && issue.resolvedAt) {
      issue.resolvedAt = undefined;
    }

    await issue.save();
    await issue.populate('student', 'fullName regNo email');
    await issue.populate('lecturer', 'fullName staffNo email');

    res.json({
      success: true,
      data: issue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Lecturer: Get issues assigned to them
const getLecturerIssues = async (req, res) => {
  try {
    const { status } = req.query;
    
    let filter = { lecturer: req.user._id };
    
    if (status) {
      filter.status = status;
    }

    const issues = await Issue.find(filter)
      .populate('student', 'fullName regNo email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: issues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createIssue,
  getMyIssues,
  getIssueById,
  getAllIssues,
  updateIssueStatus,
  getLecturerIssues
};


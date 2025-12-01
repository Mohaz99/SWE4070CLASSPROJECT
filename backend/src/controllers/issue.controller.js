const Issue = require('../models/issue.model');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');

// GET all issues (with optional filters)
exports.getIssues = async (req, res) => {
    try {
        const { studentId, lecturerId, status } = req.query;
        const filter = {};

        if (studentId) filter.student = studentId;
        if (lecturerId) filter.lecturer = lecturerId;
        if (status) filter.status = status;

        const issues = await Issue.find(filter)
            .populate('student', 'fullName email regNo')
            .populate('lecturer', 'fullName email')
            .populate('resolvedBy', 'fullName email')
            .sort({ createdAt: -1 }); // Most recent first

        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET issue by ID
exports.getIssueById = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id)
            .populate('student', 'fullName email regNo')
            .populate('lecturer', 'fullName email')
            .populate('resolvedBy', 'fullName email');

        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        res.json(issue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST create new issue (student submits)
exports.createIssue = async (req, res) => {
    try {
        const { studentId, lecturerId, issueType, subject, description, priority, attachments } = req.body;

        // Verify student exists
        const student = await User.findById(studentId);
        if (!student || student.role !== 'student') {
            return res.status(404).json({ message: "Student not found" });
        }

        // Check if student is registered under this lecturer
        // We check if there is ANY enrollment where this student has chosen this lecturer
        const enrollment = await Enrollment.findOne({
            studentId: studentId,
            chosenLecturerId: lecturerId
        });

        if (!enrollment) {
            return res.status(400).json({
                message: "You are not registered under this lecturer for any course"
            });
        }

        const issue = new Issue({
            student: studentId,
            lecturer: lecturerId,
            issueType: issueType || 'missing_marks',
            subject,
            description,
            priority: priority || 'medium',
            attachments: attachments || [],
            status: 'pending'
        });

        const savedIssue = await issue.save();
        const populatedIssue = await Issue.findById(savedIssue._id)
            .populate('student', 'fullName email regNo')
            .populate('lecturer', 'fullName email');

        res.status(201).json(populatedIssue);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// GET issues by student ID
exports.getStudentIssues = async (req, res) => {
    try {
        const { studentId } = req.params;

        const issues = await Issue.find({ student: studentId })
            .populate('lecturer', 'fullName email')
            .populate('resolvedBy', 'fullName email')
            .sort({ createdAt: -1 });

        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT update issue status (lecturer/admin resolves)
exports.updateIssueStatus = async (req, res) => {
    try {
        const { issueId } = req.params;
        const { status, resolution, resolvedBy } = req.body;

        const updateData = { status };

        if (status === 'resolved') {
            updateData.resolution = resolution;
            updateData.resolvedBy = resolvedBy;
            updateData.resolvedAt = new Date();
        }

        const updatedIssue = await Issue.findByIdAndUpdate(
            issueId,
            updateData,
            { new: true }
        )
            .populate('student', 'fullName email regNo')
            .populate('lecturer', 'fullName email')
            .populate('resolvedBy', 'fullName email');

        if (!updatedIssue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        res.json(updatedIssue);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// PUT update issue (student can update their own pending issues)
exports.updateIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const { subject, description, attachments } = req.body;

        const issue = await Issue.findById(issueId);
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        // Only allow updates if status is pending
        if (issue.status !== 'pending') {
            return res.status(400).json({
                message: "Cannot update issue that is not pending"
            });
        }

        const updatedIssue = await Issue.findByIdAndUpdate(
            issueId,
            { subject, description, attachments },
            { new: true }
        )
            .populate('student', 'fullName email regNo')
            .populate('lecturer', 'fullName email');

        res.json(updatedIssue);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE issue (student can delete their own pending issues)
exports.deleteIssue = async (req, res) => {
    try {
        const { issueId } = req.params;

        const issue = await Issue.findById(issueId);
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        // Only allow deletion if status is pending
        if (issue.status !== 'pending') {
            return res.status(400).json({
                message: "Cannot delete issue that is not pending"
            });
        }

        await Issue.findByIdAndDelete(issueId);
        res.json({ message: "Issue deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

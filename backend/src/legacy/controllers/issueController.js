const LegacyIssue = require("../models/LegacyIssue");
const Student = require("../models/Student");

// GET all issues (with optional filters)
const getIssues = async (req, res) => {
    try {
        const { studentId, lecturerId, status } = req.query;
        const filter = {};

        if (studentId) filter.student = studentId;
        if (lecturerId) filter.lecturer = lecturerId;
        if (status) filter.status = status;

        const issues = await LegacyIssue.find(filter)
            .populate('student', 'firstName lastName email schoolID')
            .populate('lecturer', 'name email course')
            .populate('resolvedBy', 'name email')
            .sort({ createdAt: -1 }); // Most recent first

        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET issue by ID
const getIssueById = async (req, res) => {
    try {
        const issue = await LegacyIssue.findById(req.params.id)
            .populate('student', 'firstName lastName email schoolID')
            .populate('lecturer', 'name email course')
            .populate('resolvedBy', 'name email');

        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        res.json(issue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST create new issue (student submits)
const createIssue = async (req, res) => {
    try {
        const { studentId, lecturerId, issueType, subject, description, priority, attachments } = req.body;

        // Verify student exists and is registered under this lecturer
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Check if student is registered under this lecturer
        const isRegistered = student.selections.some(
            sel => sel.lecturer.toString() === lecturerId
        );

        if (!isRegistered) {
            return res.status(400).json({
                message: "You are not registered under this lecturer"
            });
        }

        const issue = new LegacyIssue({
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
        const populatedIssue = await LegacyIssue.findById(savedIssue._id)
            .populate('student', 'firstName lastName email schoolID')
            .populate('lecturer', 'name email course');

        res.status(201).json(populatedIssue);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// GET issues by student ID
const getStudentIssues = async (req, res) => {
    try {
        const { studentId } = req.params;

        const issues = await LegacyIssue.find({ student: studentId })
            .populate('lecturer', 'name email course')
            .populate('resolvedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT update issue status (lecturer/admin resolves)
const updateIssueStatus = async (req, res) => {
    try {
        const { issueId } = req.params;
        const { status, resolution, resolvedBy } = req.body;

        const updateData = { status };

        if (status === 'resolved') {
            updateData.resolution = resolution;
            updateData.resolvedBy = resolvedBy;
            updateData.resolvedAt = new Date();
        }

        const updatedIssue = await LegacyIssue.findByIdAndUpdate(
            issueId,
            updateData,
            { new: true }
        )
            .populate('student', 'firstName lastName email schoolID')
            .populate('lecturer', 'name email course')
            .populate('resolvedBy', 'name email');

        if (!updatedIssue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        res.json(updatedIssue);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// PUT update issue (student can update their own pending issues)
const updateIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const { subject, description, attachments } = req.body;

        const issue = await LegacyIssue.findById(issueId);
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        // Only allow updates if status is pending
        if (issue.status !== 'pending') {
            return res.status(400).json({
                message: "Cannot update issue that is not pending"
            });
        }

        const updatedIssue = await LegacyIssue.findByIdAndUpdate(
            issueId,
            { subject, description, attachments },
            { new: true }
        )
            .populate('student', 'firstName lastName email schoolID')
            .populate('lecturer', 'name email course');

        res.json(updatedIssue);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE issue (student can delete their own pending issues)
const deleteIssue = async (req, res) => {
    try {
        const { issueId } = req.params;

        const issue = await LegacyIssue.findById(issueId);
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        // Only allow deletion if status is pending
        if (issue.status !== 'pending') {
            return res.status(400).json({
                message: "Cannot delete issue that is not pending"
            });
        }

        await LegacyIssue.findByIdAndDelete(issueId);
        res.json({ message: "Issue deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getIssues,
    getIssueById,
    createIssue,
    getStudentIssues,
    updateIssueStatus,
    updateIssue,
    deleteIssue
};

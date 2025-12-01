const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    lecturer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecturer",
        required: true
    },
    issueType: {
        type: String,
        required: true,
        enum: ['missing_marks', 'incorrect_marks', 'other'],
        default: 'missing_marks'
    },
    subject: {
        type: String,
        required: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ['pending', 'in_review', 'resolved', 'rejected'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    resolution: {
        type: String,
        maxlength: 500
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecturer"
    },
    resolvedAt: {
        type: Date
    },
    attachments: [{
        type: String // URLs or file paths
    }]
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model("LegacyIssue", issueSchema);

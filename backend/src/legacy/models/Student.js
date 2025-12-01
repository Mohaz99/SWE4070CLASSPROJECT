const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    schoolID: { type: Number, required: true, unique: true },
    major: { type: String, required: true },
    currentYear: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    selections: {
        type: [
            {
                lecturer: { type: mongoose.Schema.Types.ObjectId, ref: "Lecturer", required: true },
                marks: Number
            }
        ],
        validate: v => v.length <= 5
    }
});

module.exports = mongoose.model("Student", studentSchema);

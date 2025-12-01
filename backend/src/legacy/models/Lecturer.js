const mongoose = require("mongoose");

const lecturerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    course: { type: String, required: true }, // e.g. "Web Development"
});

module.exports = mongoose.model("Lecturer", lecturerSchema);

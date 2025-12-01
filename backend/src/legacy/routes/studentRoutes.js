const express = require("express");
const {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    updateStudentSelections,
    updateStudentMarks,
    deleteStudent,
} = require("../controllers/studentController");

const router = express.Router();

router.get("/", getStudents);          // GET all students
router.get("/:id", getStudentById);    // GET one student by ID
router.post("/", createStudent);       // POST create new student
router.put("/:id", updateStudent);     // PUT update existing student
router.put('/:id/selections', updateStudentSelections); // PUT update student's selections
router.put("/:studentId/lecturer/:lecturerId/marks", updateStudentMarks); // // PUT update student's marks
router.delete("/:id", deleteStudent);  // DELETE remove student

module.exports = router;

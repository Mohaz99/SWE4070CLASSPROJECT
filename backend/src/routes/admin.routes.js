const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/admin.controller');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.post('/courses',
  [
    body('code').trim().notEmpty(),
    body('name').trim().notEmpty(),
    body('credits').isInt({ min: 1 })
  ],
  validate,
  createCourse
);

router.post('/offerings',
  [
    body('courseId').notEmpty(),
    body('term').trim().notEmpty(),
    body('year').isInt({ min: 2000 }),
    body('capacity').optional().isInt({ min: 1 }),
    body('assignedLecturerIds').optional().isArray()
  ],
  validate,
  createOffering
);

router.put('/offerings/:id/assessments',
  [
    body('assessments').isArray().notEmpty(),
    body('assessments.*.name').trim().notEmpty(),
    body('assessments.*.weight').isFloat({ min: 0, max: 100 }),
    body('assessments.*.maxScore').isFloat({ min: 1 })
  ],
  validate,
  updateAssessments
);

router.get('/marksheets/consolidated',
  getConsolidatedMarksheet
);

// User Management
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Marks
router.get('/marks', getAllMarks);

// Issues
router.get('/issues', getIssues);
router.put('/issues/:id/status', updateIssueStatus);
router.post('/issues/message', sendMessageToLecturer);

// Registrations & Assignments
router.post('/assign-lecturer', assignLecturerToCourse);
router.post('/register-student', registerStudentToCourse);
router.delete('/registrations/:id', deleteRegistration);
router.put('/registrations/:id/lecturer', updateRegistrationLecturer);
router.post('/reset-db', resetDatabase);

module.exports = router;





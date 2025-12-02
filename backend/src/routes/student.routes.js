const express = require('express');
const {
  getEnrollments,
  createEnrollment,
  deleteEnrollment,
  getGrades
} = require('../controllers/student.controller');
const {
  createIssue,
  getMyIssues,
  getIssueById
} = require('../controllers/issue.controller');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roles');

const router = express.Router();

router.use(authenticate);
router.use(requireRole('student'));

router.get('/enrollments', getEnrollments);
router.post('/enrollments', createEnrollment);
router.delete('/enrollments/:id', deleteEnrollment);
router.get('/grades', getGrades);

// Issue routes
router.post('/issues', createIssue);
router.get('/issues', getMyIssues);
router.get('/issues/:id', getIssueById);

module.exports = router;






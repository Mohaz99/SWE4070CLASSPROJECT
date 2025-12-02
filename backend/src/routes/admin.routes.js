const express = require('express');
const { body } = require('express-validator');
const {
  createCourse,
  createOffering,
  updateAssessments,
  getConsolidatedMarksheet,
  getMissingMarks
} = require('../controllers/admin.controller');
const {
  getAllIssues,
  updateIssueStatus
} = require('../controllers/issue.controller');
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

router.get('/marks/missing',
  getMissingMarks
);

// Issue routes
router.get('/issues', getAllIssues);
router.put('/issues/:id/status',
  [
    body('status').isIn(['pending', 'in_progress', 'resolved', 'rejected']),
    body('adminResponse').optional().trim()
  ],
  validate,
  updateIssueStatus
);

module.exports = router;






const express = require('express');
const {
  getMyOfferings,
  getOfferingStudents,
  postMarks,
  exportCSV
} = require('../controllers/lecturer.controller');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roles');

const router = express.Router();

router.use(authenticate);
router.use(requireRole('lecturer'));

router.get('/offerings', getMyOfferings);
router.get('/offerings/:id/students', getOfferingStudents);
router.post('/marks/batch', postMarks);
router.get('/offerings/:id/marks/export', exportCSV);

module.exports = router;





const express = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/auth.controller');
const validate = require('../middleware/validate');

const router = express.Router();

router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('fullName').trim().notEmpty(),
    body('role').isIn(['student', 'lecturer', 'admin']),
    body('regNo').if(body('role').equals('student')).notEmpty(),
    body('staffNo').if(body('role').isIn(['lecturer', 'admin'])).notEmpty()
  ],
  validate,
  register
);

router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  validate,
  login
);

module.exports = router;





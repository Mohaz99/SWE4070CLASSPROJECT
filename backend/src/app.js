const express = require('express');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth.routes');
const publicRoutes = require('./routes/public.routes');
const adminRoutes = require('./routes/admin.routes');
const studentRoutes = require('./routes/student.routes');
const lecturerRoutes = require('./routes/lecturer.routes');

const issueRoutes = require('./routes/issue.routes');

// Legacy Routes
const legacyStudentRoutes = require('./legacy/routes/studentRoutes');
const legacyLecturerRoutes = require('./legacy/routes/lecturerRoutes');
const legacyIssueRoutes = require('./legacy/routes/issueRoutes');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/public', publicRoutes);
app.use('/admin', adminRoutes);
app.use('/student', studentRoutes);
app.use('/lecturer', lecturerRoutes);
app.use('/issues', issueRoutes);

// Legacy API Mounts
app.use('/api/students', legacyStudentRoutes);
app.use('/api/lecturers', legacyLecturerRoutes);
app.use('/api/issues', legacyIssueRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Online Examination System API',
    version: '1.0.0'
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;





const express = require('express');
const cors = require('cors'); 
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth.routes');
const publicRoutes = require('./routes/public.routes');
const adminRoutes = require('./routes/admin.routes');
const studentRoutes = require('./routes/student.routes');
const lecturerRoutes = require('./routes/lecturer.routes');

const app = express();

// ========== CORS MIDDLEWARE ==========
// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Your frontend URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Handle preflight requests
app.options('*', cors()); // Enable preflight for all routes

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/public', publicRoutes);
app.use('/admin', adminRoutes);
app.use('/student', studentRoutes);
app.use('/lecturer', lecturerRoutes);

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





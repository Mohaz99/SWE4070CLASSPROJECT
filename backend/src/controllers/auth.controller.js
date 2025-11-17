const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../config/jwt');

const register = async (req, res) => {
  try {
    const { email, password, fullName, role, regNo, staffNo } = req.body;

    // Validation
    if (!email || !password || !fullName || !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    if (role === 'student' && !regNo) {
      return res.status(400).json({
        success: false,
        error: 'Students must provide regNo'
      });
    }

    if ((role === 'lecturer' || role === 'admin') && !staffNo) {
      return res.status(400).json({
        success: false,
        error: 'Lecturers and admins must provide staffNo'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      fullName,
      role,
      regNo: role === 'student' ? regNo : undefined,
      staffNo: (role === 'lecturer' || role === 'admin') ? staffNo : undefined
    });

    // Generate token
    const token = generateToken({ userId: user._id, role: user.role });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken({ userId: user._id, role: user.role });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = { register, login };





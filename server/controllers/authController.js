const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'dev_secret_key_12345'; // Fallback for stability
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    // req.user.id populated by auth middleware (which uses User model)
    const user = await User.findByPk(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user settings (budget, goals)
// @route   PUT /api/auth/settings
// @access  Private
const updateSettings = async (req, res, next) => {
  try {
    const { monthlyBudget, savingsGoal } = req.body;
    
    // Build update object
    const updateFields = {};
    if (monthlyBudget !== undefined) updateFields.monthlyBudget = monthlyBudget;
    if (savingsGoal) updateFields.savingsGoal = savingsGoal;

    const user = await User.findByPk(req.user.id);
    await user.update(updateFields);

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget,
        savingsGoal: user.savingsGoal,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Self-promote to admin (for initial setup)
// @route   POST /api/auth/promote-me
// @access  Private
const promoteMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    user.role = 'admin';
    await user.save();
    res.status(200).json({ success: true, message: 'You are now an ADMIN!' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateSettings, promoteMe };

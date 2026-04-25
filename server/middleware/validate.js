const { validationResult, body } = require('express-validator');

// Middleware to check validation results
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array().map((e) => e.msg).join(', '),
      errors: errors.array(),
    });
  }
  next();
};

// Validation rules for registration
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .customSanitizer((value) => value.toLowerCase()),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

// Validation rules for login
const loginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .customSanitizer((value) => value.toLowerCase()),
  body('password').notEmpty().withMessage('Password is required'),
];

// Validation rules for expenses
const expenseRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('category').optional().isString(),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('notes').optional().isString(),
];

module.exports = {
  handleValidation,
  registerRules,
  loginRules,
  expenseRules,
};

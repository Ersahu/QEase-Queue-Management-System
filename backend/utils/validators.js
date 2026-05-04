const { body } = require('express-validator');

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role'),
  body('phone').optional().trim(),
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = {
  registerValidation,
  loginValidation,
};

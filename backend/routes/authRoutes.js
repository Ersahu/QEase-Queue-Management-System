const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  registerValidation,
  loginValidation,
} = require('../utils/validators');

// Public routes (spread so each validator runs as its own middleware)
router.post('/register', ...registerValidation, register);
router.post('/login', ...loginValidation, login);

// Protected route
router.get('/me', protect, getMe);

module.exports = router;

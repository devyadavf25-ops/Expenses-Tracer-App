const express = require('express');
const router = express.Router();
const { register, login, getMe, updateSettings, promoteMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerRules, loginRules, handleValidation } = require('../middleware/validate');

// Public routes
router.post('/register', registerRules, handleValidation, register);
router.post('/login', loginRules, handleValidation, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/settings', protect, updateSettings);
router.post('/promote-me', protect, promoteMe);

module.exports = router;

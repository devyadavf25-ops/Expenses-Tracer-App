const express = require('express');
const router = express.Router();
const { getPlatformStats, getAllUsers } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

router.use(protect);
router.use(admin);

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);

module.exports = router;

const express = require('express');
const router = express.Router();
const { aiCategorize, aiInsights, aiChat } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// All AI routes are protected
router.use(protect);

router.post('/categorize', aiCategorize);
router.get('/insights', aiInsights);
router.post('/chat', aiChat);

module.exports = router;

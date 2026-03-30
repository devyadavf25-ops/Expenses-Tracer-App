const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpenseStats,
  createExpense,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const { expenseRules, handleValidation } = require('../middleware/validate');

// All routes are protected
router.use(protect);

router.get('/stats', getExpenseStats);
router.route('/').get(getExpenses).post(expenseRules, handleValidation, createExpense);
router.route('/:id').put(updateExpense).delete(deleteExpense);

module.exports = router;

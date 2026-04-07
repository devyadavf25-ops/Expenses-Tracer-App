const Expense = require('../models/Expense');
const { categorizeExpense, getSpendingInsights, chatWithExpenses } = require('../services/openaiService');

// @desc    AI categorize an expense
// @route   POST /api/ai/categorize
// @access  Private
const aiCategorize = async (req, res, next) => {
  try {
    const { title, amount } = req.body;

    if (!title || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Title and amount are required',
      });
    }

    const result = await categorizeExpense(title, amount);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI spending insights
// @route   GET /api/ai/insights
// @access  Private
const aiInsights = async (req, res, next) => {
  try {
    const expenses = await Expense.findAll({ 
      where: { userId: req.user.id }, 
      order: [['date', 'DESC']] 
    });

    if (expenses.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          insights: [
            { type: 'info', title: 'No Data Yet', description: 'Add some expenses to get AI-powered insights about your spending patterns.' }
          ],
          totalSpent: 0,
          byCategory: {},
        },
      });
    }

    // Convert Sequelize instances to plain JS objects for the service
    const plainExpenses = expenses.map(e => e.toJSON());
    const result = await getSpendingInsights(plainExpenses, req.user.currency);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Chat with AI about expenses
// @route   POST /api/ai/chat
// @access  Private
const aiChat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const expenses = await Expense.findAll({ 
      where: { userId: req.user.id }, 
      order: [['date', 'DESC']] 
    });

    const plainExpenses = expenses.map(e => e.toJSON());
    const result = await chatWithExpenses(message, plainExpenses, req.user.currency);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { aiCategorize, aiInsights, aiChat };

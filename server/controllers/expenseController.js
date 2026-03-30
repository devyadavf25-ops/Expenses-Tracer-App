const Expense = require('../models/Expense');

// @desc    Get all expenses for the logged-in user
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const { category, search, startDate, endDate, sort, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = { user: req.user._id };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Sort
    let sortObj = { date: -1 }; // Default: newest first
    if (sort === 'amount_asc') sortObj = { amount: 1 };
    if (sort === 'amount_desc') sortObj = { amount: -1 };
    if (sort === 'date_asc') sortObj = { date: 1 };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Expense.countDocuments(filter);

    const expenses = await Expense.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense statistics
// @route   GET /api/expenses/stats
// @access  Private
const getExpenseStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Total expenses
    const totalResult = await Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthResult = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const thisMonthTotal = monthResult[0]?.total || 0;
    
    // Predictions 
    const daysPassed = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const runRate = thisMonthTotal / Math.max(daysPassed, 1);
    const predictedMonthly = Math.round(runRate * daysInMonth);

    // By category
    const byCategory = await Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalResult[0]?.total || 0,
        totalCount: totalResult[0]?.count || 0,
        thisMonth: thisMonthTotal,
        thisMonthCount: monthResult[0]?.count || 0,
        predictedMonthly,
        byCategory,
        monthlyTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res, next) => {
  try {
    const { title, amount, category, description, date, notes, isAiCategorized } = req.body;

    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount,
      description,
      category: category || 'Other',
      date: date || Date.now(),
      notes,
      isAiCategorized: isAiCategorized || false,
    });

    let warning = null;

    // Check budget limit
    const userDb = await require('../models/User').findById(req.user._id);
    if (userDb && userDb.monthlyBudget > 0) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const agg = await Expense.aggregate([
        { $match: { user: userDb._id, date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      const currentMonthTotal = agg[0]?.total || 0;
      
      const percentUsed = (currentMonthTotal / userDb.monthlyBudget) * 100;
      if (percentUsed >= 100) {
        warning = 'ALERT: You have exceeded your monthly budget!';
      } else if (percentUsed >= 90) {
        warning = 'Warning: You have reached 90% of your monthly budget!';
      } else if (percentUsed >= 80) {
        warning = 'Notice: You have used 80% of your monthly budget.';
      }
    }

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense,
      warning,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Make sure user owns the expense
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this expense',
      });
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Make sure user owns the expense
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this expense',
      });
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  getExpenseStats,
  createExpense,
  updateExpense,
  deleteExpense,
};

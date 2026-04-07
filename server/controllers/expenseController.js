const Expense = require('../models/Expense');
const User = require('../models/User');
const { Op, fn, col } = require('sequelize');

// @desc    Get all expenses for the logged-in user
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const { category, search, startDate, endDate, sort, page = 1, limit = 20 } = req.query;

    // Build where clause
    const where = { userId: req.user.id };

    if (category && category !== 'All') {
      where.category = category;
    }

    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate);
      if (endDate) where.date[Op.lte] = new Date(endDate);
    }

    // Sort order
    let order = [['date', 'DESC']]; // Default: newest first
    if (sort === 'amount_asc') order = [['amount', 'ASC']];
    if (sort === 'amount_desc') order = [['amount', 'DESC']];
    if (sort === 'date_asc') order = [['date', 'ASC']];

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: expenses } = await Expense.findAndCountAll({
      where,
      order,
      offset,
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
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
    const userId = req.user.id;

    // Total expenses
    const totalResult = await Expense.findAll({
      where: { userId },
      attributes: [
        [fn('SUM', col('amount')), 'total'],
        [fn('COUNT', col('id')), 'count'],
      ],
      raw: true,
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Monthly total
    const monthResult = await Expense.findAll({
      where: { 
        userId, 
        date: { [Op.gte]: startOfMonth } 
      },
      attributes: [
        [fn('SUM', col('amount')), 'total'],
        [fn('COUNT', col('id')), 'count'],
      ],
      raw: true,
    });

    const thisMonthTotal = parseFloat(monthResult[0]?.total || 0);
    
    // Predictions 
    const daysPassed = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const runRate = thisMonthTotal / Math.max(daysPassed, 1);
    const predictedMonthly = Math.round(runRate * daysInMonth);

    // By category
    const byCategory = await Expense.findAll({
      where: { userId },
      attributes: [
        ['category', '_id'],
        [fn('SUM', col('amount')), 'total'],
        [fn('COUNT', col('id')), 'count'],
      ],
      group: ['category'],
      order: [[fn('SUM', col('amount')), 'DESC']],
      raw: true,
    });

    res.status(200).json({
      success: true,
      data: {
        total: parseFloat(totalResult[0]?.total || 0),
        totalCount: parseInt(totalResult[0]?.count || 0),
        thisMonth: thisMonthTotal,
        thisMonthCount: parseInt(monthResult[0]?.count || 0),
        predictedMonthly,
        byCategory,
        // Monthly trend simplified for SQLite (complex grouping omitted for brevity, manageable with simpler query)
        monthlyTrend: [], 
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
      userId: req.user.id,
      title,
      amount: parseFloat(amount),
      description,
      category: category || 'Other',
      date: date || new Date(),
      notes,
      isAiCategorized: isAiCategorized || false,
    });

    let warning = null;

    // Check budget limit
    const userDb = await User.findByPk(req.user.id);
    if (userDb && userDb.monthlyBudget > 0) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const agg = await Expense.findAll({
        where: { 
          userId: userDb.id, 
          date: { [Op.gte]: startOfMonth } 
        },
        attributes: [[fn('SUM', col('amount')), 'total']],
        raw: true,
      });

      const currentMonthTotal = parseFloat(agg[0]?.total || 0);
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
    let expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Make sure user owns the expense
    if (expense.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this expense',
      });
    }

    await expense.update(req.body);

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
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Make sure user owns the expense
    if (expense.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this expense',
      });
    }

    await expense.destroy();

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

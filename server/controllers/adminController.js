const User = require('../models/User');
const Expense = require('../models/Expense');
const LedgerEntry = require('../models/LedgerEntry');
const { sequelize } = require('../config/db');

// @desc    Get platform-wide statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const totalExpenses = await Expense.count();
    const totalAmount = await Expense.sum('amount') || 0;
    const totalLedger = await LedgerEntry.count();

    // User growth (count by month)
    const userGrowth = await User.findAll({
      attributes: [
        [sequelize.fn('strftime', '%Y-%m', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('count', sequelize.col('id')), 'count']
      ],
      group: ['month'],
      order: [['month', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalExpenses,
        totalAmount,
        totalLedger,
        userGrowth
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPlatformStats, getAllUsers };

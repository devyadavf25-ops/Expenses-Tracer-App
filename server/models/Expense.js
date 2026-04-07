const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CATEGORIES = [
  'Food & Dining', 'Transportation', 'Housing & Rent', 'Shopping',
  'Healthcare', 'Education', 'Entertainment', 'Utilities & Bills',
  'Travel', 'Savings & Investments', 'Other',
];

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please provide an expense title' },
      len: [0, 100],
    },
  },
  description: {
    type: DataTypes.TEXT,
    validate: {
      len: [0, 500],
    },
  },
  amount: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Amount must be positive' },
    },
  },
  category: {
    type: DataTypes.ENUM(...CATEGORIES),
    defaultValue: 'Other',
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  notes: {
    type: DataTypes.TEXT,
    validate: {
      len: [0, 500],
    },
  },
  isAiCategorized: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId', 'date'] },
    { fields: ['userId', 'category'] },
  ],
});

// Associations
// Defined in a central place or here if needed, but for now just model definition
module.exports = Expense;
module.exports.CATEGORIES = CATEGORIES;

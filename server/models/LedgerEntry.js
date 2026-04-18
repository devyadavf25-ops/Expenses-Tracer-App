const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LedgerEntry = sequelize.define('LedgerEntry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  personName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: { msg: 'Person name is required' } },
  },
  type: {
    type: DataTypes.ENUM('lent', 'borrowed'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    validate: { min: { args: [0.01], msg: 'Amount must be positive' } },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'settled', 'partial'),
    defaultValue: 'pending',
  },
  settledAmount: {
    type: DataTypes.DOUBLE,
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId', 'status'] },
    { fields: ['userId', 'type'] },
  ],
});

module.exports = LedgerEntry;

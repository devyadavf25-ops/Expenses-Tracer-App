const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');
const Expense = require('./Expense');
const LedgerEntry = require('./LedgerEntry');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please provide your name' },
      len: [0, 50],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Please provide a valid email' },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100],
    },
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'NPR',
  },
  monthlyBudget: {
    type: DataTypes.DOUBLE,
    defaultValue: 0,
  },
  savingsGoal: {
    type: DataTypes.TEXT,
    defaultValue: JSON.stringify({ targetAmount: 0, currentSaved: 0 }),
    get() {
      const value = this.getDataValue('savingsGoal');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('savingsGoal', JSON.stringify(value));
    },
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
  },
  resetPasswordExpire: {
    type: DataTypes.DATE,
  },
}, {
  timestamps: true,
  hooks: {
    beforeValidate: (user) => {
      // Normalize email to lowercase (replaces Mongoose's `lowercase: true`)
      if (user.email) {
        user.email = user.email.toLowerCase().trim();
      }
    },
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

// Instance method to compare password
User.prototype.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Associations (Bug 7 fix: proper FK constraints + cascade)
User.hasMany(Expense, { foreignKey: 'userId', onDelete: 'CASCADE' });
Expense.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(LedgerEntry, { foreignKey: 'userId', onDelete: 'CASCADE' });
LedgerEntry.belongsTo(User, { foreignKey: 'userId' });

module.exports = User;

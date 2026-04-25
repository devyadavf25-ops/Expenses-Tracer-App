const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false, // Set to console.log to see SQL queries
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite Database Connected');
    
    // Sync all models - alter: true will add missing columns to existing tables
    await sequelize.sync({ alter: true });
    console.log('📦 Database Models Synced');
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Import models first so Sequelize registers them before sync()
require('./models/User');
require('./models/Expense');

// Import routes
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Initialize Express app
const app = express();

// ========================
// Middleware
// ========================
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ========================
// API Routes
// ========================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Smart Expense Tracker API is running!',
    timestamp: new Date().toISOString(),
  });
});

// Diagnostic route - check if keys exist (safe)
app.get('/api/ai/check-keys', (req, res) => {
  res.status(200).json({
    hasGemini: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here',
    hasOpenAI: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here',
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/ai', aiRoutes);

// ========================
// Error Handler (must be last)
// ========================
app.use(errorHandler);

// ========================
// Start Server
// ========================
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth API:   http://localhost:${PORT}/api/auth`);
      console.log(`💰 Expense API: http://localhost:${PORT}/api/expenses`);
      console.log(`🤖 AI API:     http://localhost:${PORT}/api/ai\n`);
    });
  } catch (error) {
    console.error(`❌ Shutdown: ${error.message}`);
    process.exit(1);
  }
};

startServer();
// Trigger nodemon restart

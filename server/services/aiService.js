const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require('openai');
const { CATEGORIES } = require('../models/Expense');

// --- Provider Initialization ---

const getGemini = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'your_gemini_api_key_here') return null;
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

const getOpenAI = () => {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key === 'your_openai_api_key_here') return null;
  return new OpenAI({ apiKey: key });
};

// --- Core Wrapper Logic ---

/**
 * Common entry point for AI tasks.
 * Tries Gemini first (Free), then OpenAI if configured.
 */
const runAiTask = async ({ systemPrompt, userPrompt, jsonMode = false }) => {
  // 1. Try Gemini first
  const gemini = getGemini();
  if (gemini) {
    try {
      const fullPrompt = `${systemPrompt}\n\nUser Request: ${userPrompt}\n\nReturn strictly valid JSON if requested.`;
      const result = await gemini.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
      return jsonMode ? JSON.parse(cleanedText) : cleanedText;
    } catch (err) {
      console.warn("Gemini failed, trying OpenAI...", err.message);
    }
  }

  // 2. Try OpenAI fallback
  const openai = getOpenAI();
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        response_format: jsonMode ? { type: 'json_object' } : undefined,
        temperature: 0.3,
      });
      const content = completion.choices[0].message.content;
      return jsonMode ? JSON.parse(content) : content;
    } catch (err) {
      console.error("OpenAI Fallback Error:", err.message);
    }
  }

  throw new Error("No AI provider (Gemini or OpenAI) is configured or available.");
};

// --- Public Services ---

const categorizeExpense = async (title, amount) => {
  try {
    const systemPrompt = `Classify this transaction into ONE of: ${CATEGORIES.join(', ')}. 
    Return ONLY JSON: {"category": "Name", "confidence": 0.9}`;
    
    const result = await runAiTask({ 
      systemPrompt, 
      userPrompt: `Title: "${title}", Amount: ${amount}`, 
      jsonMode: true 
    });

    return CATEGORIES.includes(result.category) ? result : { category: 'Other', confidence: 0.5 };
  } catch (error) {
    return { category: 'Other', confidence: 0, error: error.message };
  }
};

const getSpendingInsights = async (expenses, currency = 'NPR') => {
  try {
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const summary = expenses.slice(0, 30).map(e => `${e.category}: ${e.amount}`).join('\n');

    const systemPrompt = `Analyze these expenses and provide 5 insights in a JSON array. 
    Each object: {"type": "tip|warning|success|info", "title": "...", "description": "..."}`;
    
    const userPrompt = `Total Spent: ${currency} ${totalSpent}\nRecent Data:\n${summary}`;
    
    const insights = await runAiTask({ systemPrompt, userPrompt, jsonMode: true });
    return { insights: Array.isArray(insights) ? insights : insights.insights, totalSpent };
  } catch (error) {
    return { insights: [{ type: 'info', title: 'AI Limit', description: 'AI is currently unavailable. Please check your API keys.' }], error: error.message };
  }
};

const chatWithExpenses = async (message, expenses, currency = 'NPR') => {
  try {
    const recent = expenses.slice(0, 20).map(e => `${e.date}: ${e.title} (${e.amount})`).join(', ');
    const systemPrompt = `You are a helpful finance assistant. Currency: ${currency}. Recent history: ${recent}`;
    
    const reply = await runAiTask({ systemPrompt, userPrompt: message, jsonMode: false });
    return { reply };
  } catch (error) {
    console.error("DEBUG AI CHAT ERROR:", error);
    return { reply: `I hit a snag! Original error: ${error.message}. Please check your GEMINI_API_KEY in Render.` };
  }
};

module.exports = { categorizeExpense, getSpendingInsights, chatWithExpenses };

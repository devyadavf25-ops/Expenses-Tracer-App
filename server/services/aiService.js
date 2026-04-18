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

const getDeepSeek = () => {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key || key === 'your_deepseek_api_key_here') return null;
  return new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: key,
  });
};

const getGroq = () => {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === 'your_groq_api_key_here') return null;
  return new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: key,
  });
};

const runAiTask = async ({ systemPrompt, userPrompt, jsonMode = false }) => {
  const errors = [];

  // 1. Try DeepSeek first (Primary)
  const deepseek = getDeepSeek();
  if (deepseek) {
    try {
      const completion = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        response_format: jsonMode ? { type: 'json_object' } : undefined,
        temperature: 0.3,
      });
      const content = completion.choices[0].message.content;
      return jsonMode ? JSON.parse(content) : content;
    } catch (err) {
      console.warn("DeepSeek execution failed:", err.message);
      errors.push(`DeepSeek Error: ${err.message}`);
    }
  }

  // 2. Try Groq (Reliable Free Tier)
  const groq = getGroq();
  if (groq) {
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        response_format: jsonMode ? { type: 'json_object' } : undefined,
        temperature: 0.3,
      });
      const content = completion.choices[0].message.content;
      return jsonMode ? JSON.parse(content) : content;
    } catch (err) {
      console.warn("Groq execution failed:", err.message);
      errors.push(`Groq Error: ${err.message}`);
    }
  }

  // 3. Try Gemini fallback
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
      console.warn("Gemini execution failed:", err.message);
      errors.push(`Gemini Error: ${err.message}`);
    }
  }

  // 4. Try OpenAI fallback
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
      console.warn("OpenAI execution failed:", err.message);
      errors.push(`OpenAI Error: ${err.message}`);
    }
  }

  throw new Error(`AI providers failed or missing. [${errors.join(" | ")}]`);
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

const getSpendingInsights = async (expenses, currency = 'NPR', ledgerData = []) => {
  try {
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const summary = expenses.slice(0, 30).map(e => `${e.category}: ${e.amount}`).join('\n');
    
    // Summarize ledger data
    const pendingLent = ledgerData.filter(e => e.type === 'lent' && e.status !== 'settled').reduce((s, e) => s + (e.amount - e.settledAmount), 0);
    const pendingBorrowed = ledgerData.filter(e => e.type === 'borrowed' && e.status !== 'settled').reduce((s, e) => s + (e.amount - e.settledAmount), 0);

    const systemPrompt = `Analyze these expenses and ledger entries. Provide 5 insights in a JSON array. 
    Lend/Borrow Context: People owe user ${currency} ${pendingLent}, user owes others ${currency} ${pendingBorrowed}.
    Each object: {"type": "tip|warning|success|info", "title": "...", "description": "..."}`;
    
    const userPrompt = `Total Spent: ${currency} ${totalSpent}\nRecent Data:\n${summary}`;
    
    const insights = await runAiTask({ systemPrompt, userPrompt, jsonMode: true });
    return { insights: Array.isArray(insights) ? insights : (insights.insights || []), totalSpent };
  } catch (error) {
    return { insights: [{ type: 'info', title: 'AI Limit', description: 'AI is currently unavailable. Please check your API keys.' }], error: error.message };
  }
};

const chatWithExpenses = async (message, expenses, currency = 'NPR', ledgerData = []) => {
  try {
    const recent = expenses.slice(0, 20).map(e => `${e.date}: ${e.title} (${e.amount})`).join(', ');
    const ledger = ledgerData.map(e => `${e.personName} (${e.type}): Total ${e.amount}, Settled ${e.settledAmount}, Status ${e.status}`).join('; ');
    
    const systemPrompt = `You are a helpful finance assistant. Currency: ${currency}. 
    Recent Expenses: ${recent}
    Ledger (Lend/Borrow) Records: ${ledger}
    If the user asks about people who owe them or who they owe, use the Ledger records.
    Keep answers concise and friendly.`;
    
    const reply = await runAiTask({ systemPrompt, userPrompt: message, jsonMode: false });
    return { reply };
  } catch (error) {
    console.error("DEBUG AI CHAT ERROR:", error);
    return { reply: `I hit a snag! Original error: ${error.message}. Please check your GEMINI_API_KEY in Render.` };
  }
};

module.exports = { categorizeExpense, getSpendingInsights, chatWithExpenses };

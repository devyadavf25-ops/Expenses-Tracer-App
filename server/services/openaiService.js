const OpenAI = require('openai');
const { CATEGORIES } = require('../models/Expense');

let openaiClient = null;

const getOpenAI = () => {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return null;
    }
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
};

// Categorize an expense using OpenAI
const categorizeExpense = async (title, amount) => {
  const ai = getOpenAI();
  if (!ai) {
    return { category: 'Other', confidence: 0, error: 'OpenAI API key not configured' };
  }

  try {
    const prompt = `You are a financial category classification engine. Given a transaction description and amount, classify it strictly into ONE of the following precise categories:
${CATEGORIES.map(c => `- ${c}`).join('\n')}

Transaction: "${title}"
Amount: ${amount}

Return ONLY valid JSON (no markdown fences). Use this exact schema:
{"category": "Valid Category Name", "confidence": 0.95}`;

    const completion = await ai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2, 
    });

    const parsed = JSON.parse(completion.choices[0].message.content);

    // Validate category
    if (CATEGORIES.includes(parsed.category)) {
      return parsed;
    }
    return { category: 'Other', confidence: 0.5 };
  } catch (error) {
    console.error('AI Categorization Error:', error.message);
    return { category: 'Other', confidence: 0, error: error.message };
  }
};

// Get spending insights and analysis from OpenAI
const getSpendingInsights = async (expenses, currency = 'NPR') => {
  const ai = getOpenAI();
  if (!ai) {
    return { insights: [{ type: 'info', title: 'OpenAI Unavailable', description: 'Configure your OpenAI API key in .env to get AI insights.' }], error: 'API key not configured' };
  }

  try {
    const totalByCategory = {};
    let totalSpent = 0;
    
    // Simple current month vs last month calc for dynamic prompting
    const now = new Date();
    const currentMonth = now.getMonth();
    let thisMonthSpent = 0;
    
    expenses.forEach((exp) => {
      totalByCategory[exp.category] = (totalByCategory[exp.category] || 0) + exp.amount;
      totalSpent += exp.amount;
      if (new Date(exp.date).getMonth() === currentMonth) {
        thisMonthSpent += exp.amount;
      }
    });

    const summary = Object.entries(totalByCategory)
      .map(([cat, amt]) => `${cat}: ${currency} ${amt.toFixed(2)}`)
      .join('\n');

    const prompt = `You are a highly analytical personal finance advisor. Analyze the following expense data and provide precisely 5 actionable, personalized insights.

Data profile:
- Total Historic Spent: ${currency} ${totalSpent.toFixed(2)}
- Current Month Spent: ${currency} ${thisMonthSpent.toFixed(2)}
- Total Transactions: ${expenses.length}
- Spending Breakdown:
${summary}

Generate 5 distinct JSON objects in a valid JSON array. Each object MUST have:
- "type": "warning" (overspending/negative trends), "tip" (saving strategies), "info" (data observations), or "success" (good habits)
- "title": A short punchy headline (e.g. "Food Costs Too High")
- "description": 1-2 thoughtful, conversational sentences giving specific advice based on the numbers provided. (e.g., "You are spending too much on food. Try meal prepping to save on the 500 you spend per week.")

Return ONLY a valid JSON array.`;

    const completion = await ai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.6,
    });

    // OpenAI sometimes wraps JSON array in markdown despite instructions if response_format isn't strict object.
    const rawContent = completion.choices[0].message.content.trim();
    const cleaned = rawContent.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    const insights = JSON.parse(cleaned);

    return { insights, totalSpent, byCategory: totalByCategory };
  } catch (error) {
    console.error('AI Insights Error:', error.message);
    return {
      insights: [
        { type: 'warning', title: 'Analysis Error', description: 'OpenAI failed to process the insights request. Check your API key or data.' }
      ],
      error: error.message,
    };
  }
};

// Chat with OpenAI about expenses
const chatWithExpenses = async (message, expenses, currency = 'NPR') => {
  const ai = getOpenAI();
  if (!ai) {
    return { reply: 'Please configure your OpenAI API key in the server .env file to talk to the AI.' };
  }

  try {
    const recentExpenses = expenses.slice(0, 50).map((e) => ({
      title: e.title,
      amount: e.amount,
      category: e.category,
      date: new Date(e.date).toISOString().split('T')[0],
    }));

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    const systemPrompt = `You are a helpful, conversational AI finance assistant. The user's local currency is ${currency}.
You have access to their recent expense data. Answer their financial questions accurately, directly, and concisely (2-4 sentences max).

Context summary:
- Total Spent All Time: ${currency} ${totalSpent.toFixed(2)}
- Total Transactions: ${expenses.length}
- 50 most recent transactions (JSON format): ${JSON.stringify(recentExpenses)}

If the answer isn't in the provided data, politely say you don't know rather than hallucinating over past unknown data.`;

    const completion = await ai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.5,
    });

    return { reply: completion.choices[0].message.content };
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    return { reply: 'Sorry, I hit an error connecting to OpenAI. Please try again.', error: error.message };
  }
};

module.exports = { categorizeExpense, getSpendingInsights, chatWithExpenses };

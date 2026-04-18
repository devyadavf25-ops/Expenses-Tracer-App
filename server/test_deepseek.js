require('dotenv').config();
const OpenAI = require('openai');

async function testDeepSeek() {
  console.log("Checking DeepSeek Environment Variable...");
  const key = process.env.DEEPSEEK_API_KEY;
  console.log("DEEPSEEK_API_KEY:", key ? "PRESENT" : "MISSING");

  if (key) {
    try {
      console.log("\nTesting DeepSeek...");
      const deepseek = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: key,
      });
      const completion = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: "Hello, say 'DeepSeek is working'" }],
      });
      console.log("DeepSeek Success:", completion.choices[0].message.content);
    } catch (e) {
      console.error("DeepSeek Failed:", e.message);
    }
  }
}

testDeepSeek();

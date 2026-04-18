require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require('openai');

async function testAI() {
  console.log("Checking Environment Variables...");
  console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "PRESENT" : "MISSING");
  console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "PRESENT" : "MISSING");

  if (process.env.GEMINI_API_KEY) {
    try {
      console.log("\nTesting Gemini...");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      
      // List models first
      // const modelsResult = await genAI.listModels(); // listModels is not on genAI usually
      
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent("Hello, say 'Gemini is working'");
      const response = await result.response;
      console.log("Gemini Success:", response.text());
    } catch (e) {
      console.error("Gemini Failed:", e.message);
      console.log("Tip: Check if the API Key is active in Google AI Studio.");
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      console.log("\nTesting OpenAI...");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: "Hello, say 'OpenAI is working'" }],
      });
      console.log("OpenAI Success:", completion.choices[0].message.content);
    } catch (e) {
      console.error("OpenAI Failed:", e.message);
    }
  }
}

testAI();

require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // There is no listModels in the client SDK, but we can try to hit an endpoint or just try multiple names.
    const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-pro"];
    for (const m of models) {
      try {
        console.log(`Testing model: ${m}...`);
        const model = genAI.getGenerativeModel({ model: m });
        const result = await model.generateContent("hi");
        console.log(`✅ ${m} works!`);
        return;
      } catch (e) {
        console.log(`❌ ${m} failed: ${e.message}`);
      }
    }
  } catch (e) {
    console.error("List failed:", e.message);
  }
}

listModels();

import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";

// Try both keys
const keys = [
  process.env.MY_APP_GEMINI_KEY,
  process.env.MY_APP_GEMINI_KEY_2,
].filter(Boolean);

for (const key of keys) {
  console.log(`\nTrying key: ${key.substring(0, 10)}...`);
  const genAI = new GoogleGenerativeAI(key);
  for (const model of ["gemini-2.5-flash", "gemini-2.0-flash"]) {
    try {
      const m = genAI.getGenerativeModel({ model });
      const r = await m.generateContent("Say: working");
      console.log(`✅ KEY ${key.substring(0, 10)} + MODEL ${model} WORKS: ${r.response.text().trim()}`);
      process.exit(0);
    } catch (err) {
      console.log(`❌ ${model}: ${err.message.substring(0, 80)}`);
    }
  }
}

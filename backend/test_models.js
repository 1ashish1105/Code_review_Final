import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";

const key = process.env.MY_APP_GEMINI_KEY;
const genAI = new GoogleGenerativeAI(key);

async function run() {
  try {
    console.log("Testing gemini-2.0-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Say hello");
    console.log("GEMINI 2.0 SUCCESS!", result.response.text());
  } catch (err) {
    console.error("GEMINI 2.0 FAILED!", err.message);
  }

  try {
    console.log("Testing gemini-1.5-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hello");
    console.log("GEMINI 1.5 SUCCESS!", result.response.text());
  } catch (err) {
    console.error("GEMINI 1.5 FAILED!", err.message);
  }
}

run();

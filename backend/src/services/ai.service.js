import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

// Returns list of GenAI clients to try (primary + fallback keys)
function getGenAIClients() {
  const keys = [
    process.env.MY_APP_GEMINI_KEY,
    process.env.MY_APP_GEMINI_KEY_2,
  ].filter(Boolean);
  if (keys.length === 0) throw new Error("No Gemini API keys set in .env");
  return keys.map(k => new GoogleGenerativeAI(k));
}

// Models to try in order
const modelsToTry = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-001",
];

// --- 1. CODE REVIEW LOGIC ---
export async function generateContent(prompt) {
  const clients = getGenAIClients();
  let lastError = null;

  // Try every key × every model combination
  for (const genAI of clients) {
    for (const modelName of modelsToTry) {
      try {
        console.log(`Trying model: ${modelName} for review...`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const fullPrompt = `
          You are a Senior Software Engineer. Review the code for bugs, 
          security, and performance. Provide Markdown feedback with code snippets.

          CODE TO REVIEW:
          ${prompt}
        `;

        const result = await model.generateContent(fullPrompt);
        console.log(`✅ Model ${modelName} succeeded!`);
        return result.response.text();
      } catch (err) {
        console.warn(`Model ${modelName} failed. Reason: ${err.message.substring(0, 100)}`);
        lastError = err;
        continue;
      }
    }
  }
  throw lastError;
}

// --- 2. INTERACTIVE CHAT LOGIC ---
export async function aiChat(history, message) {
  const clients = getGenAIClients();
  let lastError = null;

  // Try every key × every model combination
  for (const genAI of clients) {
    for (const modelName of modelsToTry) {
      try {
        console.log(`Trying model: ${modelName} for chat...`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const chat = model.startChat({
          history: history,
          generationConfig: {
            maxOutputTokens: 1000,
          },
        });

        const voiceInstruction = `
          You are a Senior Software Engineer named DevMind. You are multilingual and can speak in Hindi, English, and other languages.
          Always reply in the SAME LANGUAGE as the user's message. 
          If the user speaks or writes in Hindi, you MUST reply in Hindi.
          Be concise and helpful for voice chat.
        `;

        const result = await chat.sendMessage(voiceInstruction + message);
        console.log(`✅ Chat model ${modelName} succeeded!`);
        return result.response.text();

      } catch (err) {
        console.warn(`Model ${modelName} failed for chat. Reason: ${err.message.substring(0, 100)}`);
        lastError = err;
        continue;
      }
    }
  }
  throw lastError;
}

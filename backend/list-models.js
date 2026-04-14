import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";

const key = process.env.MY_APP_GEMINI_KEY;
const genAI = new GoogleGenerativeAI(key);

async function run() {
  try {
    const list = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await list.json();
    console.log("Available Models:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("FAILED!", err.message);
  }
}

run();

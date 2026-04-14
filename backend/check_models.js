import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);
  
  const testModels = ["gemini-pro", "gemini-1.0-pro", "gemini-1.5-flash"];
  
  for (const name of testModels) {
    try {
      console.log(`Testing model: ${name}...`);
      const model = genAI.getGenerativeModel({ model: name });
      const result = await model.generateContent("Hi");
      console.log(`SUCCESS: ${name} replied: ${result.response.text().substring(0,20)}...`);
      return; // Exit if one works
    } catch (err) {
      console.log(`FAILED: ${name} - ${err.message}`);
    }
  }
  
  console.log("\n--- CONCLUSION ---");
  console.log("If ALL models failed with 404, your API Key is likely from a project that DOES NOT have the 'Generative Language API' enabled.");
  console.log("Please go to https://aistudio.google.com/ and make sure you click 'Create API Key' inside a NEW project.");
}

listModels();

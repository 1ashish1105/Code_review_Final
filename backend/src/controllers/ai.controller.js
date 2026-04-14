import { generateContent, aiChat } from '../services/ai.service.js';

export const getReview = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).send("Code is required for review.");
  }

  try {
    const response = await generateContent(code);
    res.send(response);
  } catch (error) {
    res.status(500).send("AI Review failed: " + error.message);
  }
};

export const chatWithAI = async (req, res) => {
  const { history, message } = req.body;

  if (!message) {
    return res.status(400).send("Message is required.");
  }

  try {
    const response = await aiChat(history || [], message);
    res.send(response);
  } catch (error) {
    console.error("AI CHAT ERROR:", error);
    res.status(500).send("AI Chat failed: " + error.message);
  }
};

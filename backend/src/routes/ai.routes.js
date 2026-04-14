import express from 'express';
const router = express.Router();
import * as aiController from "../controllers/ai.controller.js";

router.post('/get-review', aiController.getReview);
router.post('/chat', aiController.chatWithAI);

export default router;

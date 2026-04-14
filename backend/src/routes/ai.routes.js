import express from 'express';
const router = express.Router();
import * as aiController from "../controllers/ai.controller.js";

router.post('/get-review', aiController.getReview);

export default router;

import express from 'express';
import aiRoutes from './routes/ai.routes.js';
import userRoutes from './user/user.routes.js';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();

app.use(cors()); // Allow frontend to talk to backend
app.use(express.json()); // Allow backend to read JSON data


app.use('/ai', aiRoutes);
app.use('/users', userRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    env: {
        has_mongo: !!process.env.MONGODB_URI,
        has_gemini: !!process.env.MY_APP_GEMINI_KEY
    }
  });
});

export default app;

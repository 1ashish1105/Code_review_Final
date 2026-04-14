import express from 'express';
import aiRoutes from './routes/ai.routes.js';
import userRoutes from './user/user.routes.js';
import cors from 'cors';

const app = express();

app.use(cors()); // Allow frontend to talk to backend
app.use(express.json()); // Allow backend to read JSON data


app.use('/ai', aiRoutes);
app.use('/users', userRoutes);

export default app;

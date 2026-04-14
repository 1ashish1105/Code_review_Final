import dotenv from 'dotenv';
dotenv.config({ override: true });
import app from './src/app.js';
import connectDB from './src/db/db.js';

connectDB();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
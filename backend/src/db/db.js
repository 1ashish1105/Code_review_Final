// backend/src/db/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error("❌ MONGODB_URI is not defined in environment variables!");
            return;
        }
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`--- MongoDB Connected: ${conn.connection.host} ---`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
    }
};

export default connectDB;

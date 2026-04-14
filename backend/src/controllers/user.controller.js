import User from '../model/user.model.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// --- REGISTER USER ---
export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: "Database is not ready. Please check your connection or wait a moment." });
        }

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ 
            message: "User registered successfully!",
            user: { id: newUser._id, username: newUser.username, email: newUser.email }
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        res.status(500).json({ 
            message: "Registration failed: " + error.message, 
            error: error.message 
        });
    }
};

// --- LOGIN USER ---
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: "Database is not ready. Please check your connection." });
        }

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.status(200).json({ 
            message: "Login successful!",
            user: { id: user._id, username: user.username, email: user.email }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        res.status(500).json({ 
            message: "Login failed: " + error.message, 
            error: error.message 
        });
    }
};

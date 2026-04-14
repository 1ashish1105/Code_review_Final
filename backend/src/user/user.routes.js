import express from 'express';
const router = express.Router();
import * as userController from '../controllers/user.controller.js';

// Route for User Registration (Signup)
// POST /users/register
router.post('/register', userController.registerUser);

// Route for User Login
// POST /users/login
router.post('/login', userController.loginUser);

export default router; 
import express from 'express';
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin
} from '../middleware/validate.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;

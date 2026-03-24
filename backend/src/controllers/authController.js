import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/emailService.js';

// Generate tokens helper
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY }
  );

  return { accessToken, refreshToken };
};

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Register new user
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password
  });

  // Send welcome email (non-blocking)
  sendWelcomeEmail(user).catch(err => console.error('Welcome email failed:', err));

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      },
      accessToken
    }
  });
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.json({
    status: 'success',
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      },
      accessToken
    }
  });
});

// Refresh access token
export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError('Refresh token required', 401);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Generate new tokens
    const tokens = generateTokens(user._id);
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

    res.json({
      status: 'success',
      data: {
        accessToken: tokens.accessToken
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Refresh token expired', 401);
    }
    throw new AppError('Invalid refresh token', 401);
  }
});

// Logout user
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

// Get current user
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    }
  });
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  );

  res.json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    }
  });
});

// Forgot password - send reset link
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const user = await User.findOne({ email });

  // Always return success to prevent email enumeration
  if (!user) {
    res.json({
      status: 'success',
      message: 'If an account exists with this email, a password reset link has been sent'
    });
    return;
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Save hashed token and expiry (1 hour)
  user.resetPasswordToken = resetTokenHash;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  // Send reset email
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  try {
    await sendPasswordResetEmail(user, resetToken);
  } catch (error) {
    // Clear tokens if email fails
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save({ validateBeforeSave: false });
    throw new AppError('Failed to send reset email. Please try again later.', 500);
  }

  res.json({
    status: 'success',
    message: 'If an account exists with this email, a password reset link has been sent'
  });
});

// Reset password with token
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new AppError('Token and new password are required', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  // Hash the token and find user
  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: resetTokenHash,
    resetPasswordExpires: { $gt: Date.now() }
  }).select('+resetPasswordToken');

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  // Update password
  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.json({
    status: 'success',
    message: 'Password reset successful. You can now login with your new password.'
  });
});

import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { VerificationCode } from '../models/VerificationCode.js';

/**
 * 发送验证码
 * POST /api/auth/send-code
 */
export const sendVerificationCode = async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email || !type) {
      return res.status(400).json({
        success: false,
        message: 'Email and type are required'
      });
    }

    if (!['register', 'reset_password'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be register or reset_password'
      });
    }

    // Check if email already exists for registration
    if (type === 'register') {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
    }

    // Check if email exists for password reset
    if (type === 'reset_password') {
      const existingUser = await User.findByEmail(email);
      if (!existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email not found'
        });
      }
    }

    // Generate and save verification code
    const code = VerificationCode.generateCode();
    await VerificationCode.create({ email, code, type });

    // In production, send email here
    // For development, log the code
    console.log(`🔐 Verification code for ${email}: ${code}`);

    res.json({
      success: true,
      message: 'Verification code sent',
      code: code // Only for development, remove in production
    });
  } catch (error) {
    console.error('Send verification code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code'
    });
  }
};

/**
 * 注册
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { email, code, password, username } = req.body;

    if (!email || !code || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, code, and password are required'
      });
    }

    // Verify code
    const verificationCode = await VerificationCode.findByEmailAndCode(email, code);
    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    if (verificationCode.type !== 'register') {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code type'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      username: username || email.split('@')[0]
    });

    // Mark verification code as used
    await VerificationCode.markAsUsed(verificationCode.id);

    // Verify email
    await User.verifyEmail(email);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isVerified: user.is_verified
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    // MySQL 重复邮件错误 (Duplicate entry)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

/**
 * 登录
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        isVerified: user.is_verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

/**
 * 重置密码
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, code, and new password are required'
      });
    }

    // Verify code
    const verificationCode = await VerificationCode.findByEmailAndCode(email, code);
    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    if (verificationCode.type !== 'reset_password') {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code type'
      });
    }

    // Find user and update password
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.updatePassword(user.id, newPassword);

    // Mark verification code as used
    await VerificationCode.markAsUsed(verificationCode.id);

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        isVerified: user.is_verified,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
};

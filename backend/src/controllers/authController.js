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
        message: '请提供邮箱和验证类型'
      });
    }

    if (!['register', 'reset_password'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: '无效的验证类型，必须是register或reset_password'
      });
    }

    if (type === 'register') {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '该邮箱已被注册'
        });
      }
    }

    if (type === 'reset_password') {
      const existingUser = await User.findByEmail(email);
      if (!existingUser) {
        return res.status(400).json({
          success: false,
          message: '该邮箱未注册'
        });
      }
    }

    const code = VerificationCode.generateCode();
    await VerificationCode.create({ email, code, type });

    console.log(`🔐 验证码 ${email}: ${code}`);

    res.json({
      success: true,
      message: '验证码已发送',
      code: code
    });
  } catch (error) {
    console.error('发送验证码错误:', error);
    res.status(500).json({
      success: false,
      message: '发送验证码失败'
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
        message: '请提供邮箱、验证码和密码'
      });
    }

    const verificationCode = await VerificationCode.findByEmailAndCode(email, code);
    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        message: '验证码无效或已过期'
      });
    }

    if (verificationCode.type !== 'register') {
      return res.status(400).json({
        success: false,
        message: '验证码类型错误'
      });
    }

    const user = await User.create({
      email,
      password,
      username: username || email.split('@')[0]
    });

    await VerificationCode.markAsUsed(verificationCode.id);
    await User.verifyEmail(email);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: '注册成功',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isVerified: user.is_verified
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册'
      });
    }
    res.status(500).json({
      success: false,
      message: '注册失败'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '请提供邮箱和密码'
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: '登录成功',
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
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败'
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
        message: '请提供邮箱、验证码和新密码'
      });
    }

    const verificationCode = await VerificationCode.findByEmailAndCode(email, code);
    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        message: '验证码无效或已过期'
      });
    }

    if (verificationCode.type !== 'reset_password') {
      return res.status(400).json({
        success: false,
        message: '验证码类型错误'
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: '用户不存在'
      });
    }

    await User.updatePassword(user.id, newPassword);
    await VerificationCode.markAsUsed(verificationCode.id);

    res.json({
      success: true,
      message: '密码重置成功'
    });
  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({
      success: false,
      message: '重置密码失败'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
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
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
};

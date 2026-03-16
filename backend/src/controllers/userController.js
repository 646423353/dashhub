import { User } from '../models/User.js';
import { dbHelper } from '../config/database.js';

/**
 * 获取用户资料
 * GET /api/users/:id
 */
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's projects
    const projects = await User.getUserProjects(id);

    res.json({
      success: true,
      data: {
        ...user,
        projectCount: projects.length,
        projects: projects
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
};

/**
 * 更新用户资料
 * PUT /api/users/me
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username } = req.body;

    if (username && username.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 2 characters'
      });
    }

    // 使用 dbHelper 更新
    const user = await dbHelper.users.update(userId, { username });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

/**
 * 更新用户头像
 * PUT /api/users/me/avatar
 */
export const updateUserAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: 'Avatar URL is required'
      });
    }

    const user = await User.updateAvatar(userId, avatar);

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update avatar'
    });
  }
};

/**
 * 获取所有用户列表（管理员功能）
 * GET /api/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const users = await User.getAllUserProfiles(limit, offset);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
};

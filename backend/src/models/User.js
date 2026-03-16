import { dbHelper } from '../config/database.js';
import bcrypt from 'bcryptjs';

export class User {
  static async findByEmail(email) {
    return await dbHelper.users.findByEmail(email);
  }

  static async findById(id) {
    return await dbHelper.users.findById(id);
  }

  static async create({ email, password, username }) {
    const password_hash = await bcrypt.hash(password, 10);
    const user = await dbHelper.users.create({
      email,
      password_hash,
      username: username || email.split('@')[0],
      is_verified: 0
    });
    return user;
  }

  static async updateAvatar(userId, avatarUrl) {
    const user = await dbHelper.users.update(userId, { avatar: avatarUrl });
    return user;
  }

  static async verifyEmail(email) {
    const user = await dbHelper.users.findByEmail(email);
    if (user) {
      await dbHelper.users.update(user.id, { is_verified: 1 });
      return user;
    }
    return null;
  }

  static async updatePassword(userId, newPassword) {
    const password_hash = await bcrypt.hash(newPassword, 10);
    await dbHelper.users.update(userId, { password_hash });
    return true;
  }

  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  static async getUserProjects(userId) {
    // Project.findAll 直接接受 userId，内部生成 WHERE creator_id = ?
    const { Project } = await import('./Project.js');
    return await Project.findAll({ userId, limit: 100, offset: 0 });
  }

  static async getAllUserProfiles(limit = 10, offset = 0) {
    const users = await dbHelper.users.query({ limit, offset });
    return users;
  }
}

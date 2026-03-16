import { dbHelper } from '../config/database.js';
import pool from '../config/database.js';

export class VerificationCode {
  static generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async create({ email, code, type, expiresIn = 10 }) {
    // 使用数据库自身时间函数计算过期时间，彻底规避 JS 与 MySQL 的时区差异
    const [result] = await pool.execute(
      `INSERT INTO verification_codes (email, code, type, expires_at)
       VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ${Number(expiresIn)} MINUTE))`,
      [email, code, type]
    );
    const [rows] = await pool.execute('SELECT * FROM verification_codes WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  static async findByEmailAndCode(email, code) {
    return await dbHelper.verificationCodes.findByEmailAndCode(email, code);
  }

  static async markAsUsed(id) {
    await dbHelper.verificationCodes.markAsUsed(id);
  }

  // 清理过期验证码（MySQL 版无需处理，数据库通过 expires_at 自动过滤）
  static async cleanupExpired() { }
}

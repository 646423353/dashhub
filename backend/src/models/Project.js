import { dbHelper } from '../config/database.js';
import pool from '../config/database.js';

export class Project {
  static async create({
    creatorId,
    name,
    description,
    url,
    type,
    logo,
    coverImage,
    videoUrl,
    disclosureProtocol,
    cooperationForm,
    useDashtro,
    dashtroAgreement,
    isPinned = false
  }) {
    // cover_image/video_url 存为 JSON 数组字符串
    const project = await dbHelper.projects.create({
      creator_id: creatorId,
      name,
      description,
      url,
      type,
      logo,
      cover_image: coverImage ? JSON.stringify(Array.isArray(coverImage) ? coverImage : [coverImage]) : null,
      video_url: videoUrl ? JSON.stringify(Array.isArray(videoUrl) ? videoUrl : [videoUrl]) : null,
      disclosure_protocol: disclosureProtocol,
      cooperation_form: cooperationForm,
      use_dashtro: useDashtro ? 1 : 0,
      dashtro_agreement: dashtroAgreement,
      is_pinned: isPinned ? 1 : 0,
      view_count: 0,
      click_count: 0
    });
    return project;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT p.*, u.username AS creator_username, u.avatar AS creator_avatar,
              COALESCE(ps.total_transaction_amount, 0) AS total_transaction_amount,
              COALESCE(ps.total_revenue_share_amount, 0) AS total_revenue_share_amount,
              COALESCE(ps.weekly_transaction_amount, 0) AS weekly_transaction_amount,
              COALESCE(ps.weekly_revenue_share_amount, 0) AS weekly_revenue_share_amount
       FROM projects p
       LEFT JOIN users u ON p.creator_id = u.id
       LEFT JOIN project_stats ps ON p.id = ps.project_id
       WHERE p.id = ?`,
      [id]
    );
    const row = rows[0];
    if (!row) return null;
    return Project._parseJsonFields(row);
  }

  static async findAll(options = {}) {
    const { limit = 20, offset = 0, type, userId } = options;
    const conditions = [];
    const values = [];

    if (type) {
      conditions.push('p.type = ?');
      values.push(type);
    }
    if (userId) {
      conditions.push('p.creator_id = ?');
      values.push(userId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 注意：mysql2 不支持在 LIMIT/OFFSET 中使用 prepared statement 占位符，改用 pool.query
    const [rows] = await pool.query(
      `SELECT p.*, u.username AS creator_username, u.avatar AS creator_avatar,
              COALESCE(ps.total_transaction_amount, 0) AS total_transaction_amount,
              COALESCE(ps.total_revenue_share_amount, 0) AS total_revenue_share_amount,
              COALESCE(ps.weekly_transaction_amount, 0) AS weekly_transaction_amount,
              COALESCE(ps.weekly_revenue_share_amount, 0) AS weekly_revenue_share_amount
       FROM projects p
       LEFT JOIN users u ON p.creator_id = u.id
       LEFT JOIN project_stats ps ON p.id = ps.project_id
       ${whereClause}
       ORDER BY p.is_pinned DESC, p.view_count DESC
       LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
      values
    );
    return rows.map(row => Project._parseJsonFields(row));
  }

  static async getPinnedProjects() {
    const [rows] = await pool.execute(
      `SELECT p.*, u.username AS creator_username, u.avatar AS creator_avatar,
              COALESCE(ps.total_transaction_amount, 0) AS total_transaction_amount,
              COALESCE(ps.total_revenue_share_amount, 0) AS total_revenue_share_amount,
              COALESCE(ps.weekly_transaction_amount, 0) AS weekly_transaction_amount,
              COALESCE(ps.weekly_revenue_share_amount, 0) AS weekly_revenue_share_amount
       FROM projects p
       LEFT JOIN users u ON p.creator_id = u.id
       LEFT JOIN project_stats ps ON p.id = ps.project_id
       WHERE p.is_pinned = 1
       ORDER BY p.view_count DESC`
    );
    return rows.map(row => Project._parseJsonFields(row));
  }

  static async getHotProjects(limit = 20, offset = 0) {
    const [rows] = await pool.query(
      `SELECT p.*, u.username AS creator_username, u.avatar AS creator_avatar,
              COALESCE(ps.total_transaction_amount, 0) AS total_transaction_amount,
              COALESCE(ps.total_revenue_share_amount, 0) AS total_revenue_share_amount,
              COALESCE(ps.weekly_transaction_amount, 0) AS weekly_transaction_amount,
              COALESCE(ps.weekly_revenue_share_amount, 0) AS weekly_revenue_share_amount
       FROM projects p
       LEFT JOIN users u ON p.creator_id = u.id
       LEFT JOIN project_stats ps ON p.id = ps.project_id
       ORDER BY p.view_count DESC
       LIMIT ${Number(limit)} OFFSET ${Number(offset)}`
    );
    return rows.map(row => Project._parseJsonFields(row));
  }

  static async incrementViewCount(projectId) {
    await dbHelper.projects.incrementViewCount(projectId);
  }

  static async incrementClickCount(projectId) {
    await dbHelper.projects.incrementClickCount(projectId);
  }

  static async update(id, updates) {
    const project = await dbHelper.projects.update(id, updates);
    return project;
  }

  static async delete(id, userId) {
    const project = await dbHelper.projects.find(id);
    if (project && project.creator_id === userId) {
      await dbHelper.projects.delete(id);
      return project;
    }
    return null;
  }

  static async getProjectStats(projectId) {
    return await dbHelper.stats.getProjectStats(projectId);
  }

  static async updateProjectStats(projectId, stats) {
    return await dbHelper.stats.updateProjectStats(projectId, stats);
  }

  static async search(query, limit = 20, offset = 0) {
    const pattern = `%${query}%`;
    const [rows] = await pool.execute(
      `SELECT p.*, u.username AS creator_username, u.avatar AS creator_avatar,
              COALESCE(ps.total_transaction_amount, 0) AS total_transaction_amount,
              COALESCE(ps.total_revenue_share_amount, 0) AS total_revenue_share_amount,
              COALESCE(ps.weekly_transaction_amount, 0) AS weekly_transaction_amount,
              COALESCE(ps.weekly_revenue_share_amount, 0) AS weekly_revenue_share_amount,
              (CASE WHEN p.name LIKE ? THEN 0.5 ELSE 0 END +
               CASE WHEN p.description LIKE ? THEN 0.3 ELSE 0 END +
               CASE WHEN p.type LIKE ? THEN 0.2 ELSE 0 END) AS relevance
       FROM projects p
       LEFT JOIN users u ON p.creator_id = u.id
       LEFT JOIN project_stats ps ON p.id = ps.project_id
       WHERE p.name LIKE ? OR p.description LIKE ? OR p.type LIKE ?
       ORDER BY relevance DESC, p.view_count DESC
       LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
      [pattern, pattern, pattern, pattern, pattern, pattern]
    );
    return rows.map(row => Project._parseJsonFields(row));
  }

  static async countByType(type) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS count FROM projects WHERE type = ?',
      [type]
    );
    return rows[0].count;
  }

  static async getTotalLeaderboard(limit = 10) {
    const [rows] = await pool.execute(
      `SELECT p.*, u.username AS creator_username, u.avatar AS creator_avatar,
              COALESCE(ps.total_transaction_amount, 0) AS total_transaction_amount,
              COALESCE(ps.total_revenue_share_amount, 0) AS total_revenue_share_amount,
              COALESCE(ps.weekly_transaction_amount, 0) AS weekly_transaction_amount,
              COALESCE(ps.weekly_revenue_share_amount, 0) AS weekly_revenue_share_amount
       FROM projects p
       LEFT JOIN users u ON p.creator_id = u.id
       LEFT JOIN project_stats ps ON p.id = ps.project_id
       ORDER BY ps.total_revenue_share_amount DESC
       LIMIT ${Number(limit)}`
    );
    return rows.map(row => Project._parseJsonFields(row));
  }

  static async getRisingLeaderboard(limit = 10) {
    const [rows] = await pool.execute(
      `SELECT p.*, u.username AS creator_username, u.avatar AS creator_avatar,
              COALESCE(ps.total_transaction_amount, 0) AS total_transaction_amount,
              COALESCE(ps.total_revenue_share_amount, 0) AS total_revenue_share_amount,
              COALESCE(ps.weekly_transaction_amount, 0) AS weekly_transaction_amount,
              COALESCE(ps.weekly_revenue_share_amount, 0) AS weekly_revenue_share_amount
       FROM projects p
       LEFT JOIN users u ON p.creator_id = u.id
       LEFT JOIN project_stats ps ON p.id = ps.project_id
       ORDER BY ps.weekly_revenue_share_amount DESC
       LIMIT ${Number(limit)}`
    );
    return rows.map(row => Project._parseJsonFields(row));
  }

  // Helper method to parse JSON fields safely
  static _parseJsonFields(row) {
    if (!row) return row;
    try {
      if (typeof row.cover_image === 'string') {
        row.cover_image = JSON.parse(row.cover_image);
      }
    } catch (e) {
      row.cover_image = [];
    }

    try {
      if (typeof row.video_url === 'string') {
        row.video_url = JSON.parse(row.video_url);
      }
    } catch (e) {
      row.video_url = [];
    }
    return row;
  }
}

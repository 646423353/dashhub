import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 创建 MySQL 连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dashhub',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+08:00'
});

// 测试连接
pool.getConnection().then(conn => {
  console.log('✅ MySQL connected successfully');
  conn.release();
}).catch(err => {
  console.error('❌ MySQL connection failed:', err.message);
  process.exit(1);
});

// 便捷查询函数封装
export const dbHelper = {
  // 原始查询（供复杂 SQL 使用）
  query: async (sql, params = []) => {
    const [rows] = await pool.execute(sql, params);
    return rows;
  },

  users: {
    findByEmail: async (email) => {
      const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
      return rows[0] || null;
    },
    findById: async (id) => {
      const [rows] = await pool.execute('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
      return rows[0] || null;
    },
    create: async (data) => {
      const { email, password_hash, username, avatar, is_verified } = data;
      const [result] = await pool.execute(
        'INSERT INTO users (email, password_hash, username, avatar, is_verified) VALUES (?, ?, ?, ?, ?)',
        [email, password_hash, username || email.split('@')[0], avatar || null, is_verified ? 1 : 0]
      );
      const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
      return rows[0];
    },
    update: async (id, data) => {
      const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
      const values = [...Object.values(data), id];
      await pool.execute(`UPDATE users SET ${fields} WHERE id = ?`, values);
      const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
      return rows[0] || null;
    },
    query: async ({ limit = 10, offset = 0 } = {}) => {
      const [rows] = await pool.query(`SELECT * FROM users ORDER BY id DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`);
      return rows;
    }
  },

  projects: {
    findById: async (id) => {
      const [rows] = await pool.execute('SELECT * FROM projects WHERE id = ? LIMIT 1', [id]);
      return rows[0] || null;
    },
    findAll: async (options = {}) => {
      const { where = {}, limit = 20, offset = 0, orderBy = 'created_at', order = 'DESC' } = options;
      const conditions = Object.keys(where).map(k => `${k} = ?`);
      const values = [...Object.values(where)];
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      // mysql2 prepared statement 不支持 LIMIT/OFFSET 占位符，改用 pool.query
      const [rows] = await pool.query(
        `SELECT * FROM projects ${whereClause} ORDER BY ${orderBy} ${order} LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
        values
      );
      return rows;
    },
    create: async (data) => {
      const cols = Object.keys(data).filter(k => data[k] !== undefined);
      const placeholders = cols.map(() => '?').join(', ');
      const values = cols.map(k => data[k]);
      const [result] = await pool.execute(
        `INSERT INTO projects (${cols.join(', ')}) VALUES (${placeholders})`,
        values
      );
      const [rows] = await pool.execute('SELECT * FROM projects WHERE id = ?', [result.insertId]);
      return rows[0];
    },
    update: async (id, data) => {
      const cols = Object.keys(data).filter(k => data[k] !== undefined);
      if (cols.length === 0) {
        const [rows] = await pool.execute('SELECT * FROM projects WHERE id = ?', [id]);
        return rows[0] || null;
      }
      const fields = cols.map(k => `${k} = ?`).join(', ');
      const values = [...cols.map(k => data[k]), id];
      await pool.execute(`UPDATE projects SET ${fields} WHERE id = ?`, values);
      const [rows] = await pool.execute('SELECT * FROM projects WHERE id = ?', [id]);
      return rows[0] || null;
    },
    delete: async (id) => {
      const [rows] = await pool.execute('SELECT * FROM projects WHERE id = ?', [id]);
      if (rows[0]) {
        await pool.execute('DELETE FROM projects WHERE id = ?', [id]);
      }
      return rows[0] || null;
    },
    find: async (id) => {
      const [rows] = await pool.execute('SELECT * FROM projects WHERE id = ? LIMIT 1', [id]);
      return rows[0] || null;
    },
    incrementViewCount: async (id) => {
      await pool.execute('UPDATE projects SET view_count = view_count + 1 WHERE id = ?', [id]);
    },
    incrementClickCount: async (id) => {
      await pool.execute('UPDATE projects SET click_count = click_count + 1 WHERE id = ?', [id]);
    },
    findPinned: async () => {
      const [rows] = await pool.execute(
        'SELECT * FROM projects WHERE is_pinned = 1 ORDER BY view_count DESC'
      );
      return rows;
    },
    getHot: async (limit = 20, offset = 0) => {
      const [rows] = await pool.execute(
        'SELECT * FROM projects ORDER BY view_count DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      return rows;
    },
    countAll: async (where = {}) => {
      const conditions = Object.keys(where).map(k => `${k} = ?`);
      const values = Object.values(where);
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const [rows] = await pool.execute(`SELECT COUNT(*) as count FROM projects ${whereClause}`, values);
      return rows[0].count;
    }
  },

  stats: {
    getProjectStats: async (projectId) => {
      const [rows] = await pool.execute(
        'SELECT * FROM project_stats WHERE project_id = ? LIMIT 1',
        [projectId]
      );
      return rows[0] || null;
    },
    updateProjectStats: async (projectId, stats) => {
      const { total_transaction_amount, total_revenue_share_amount, weekly_transaction_amount, weekly_revenue_share_amount } = stats;
      await pool.execute(
        `INSERT INTO project_stats (project_id, total_transaction_amount, total_revenue_share_amount, weekly_transaction_amount, weekly_revenue_share_amount)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           total_transaction_amount = VALUES(total_transaction_amount),
           total_revenue_share_amount = VALUES(total_revenue_share_amount),
           weekly_transaction_amount = VALUES(weekly_transaction_amount),
           weekly_revenue_share_amount = VALUES(weekly_revenue_share_amount)`,
        [projectId, total_transaction_amount || 0, total_revenue_share_amount || 0, weekly_transaction_amount || 0, weekly_revenue_share_amount || 0]
      );
      const [rows] = await pool.execute('SELECT * FROM project_stats WHERE project_id = ?', [projectId]);
      return rows[0];
    }
  },

  verificationCodes: {
    create: async (data) => {
      const { email, code, type, expires_at } = data;
      const [result] = await pool.execute(
        'INSERT INTO verification_codes (email, code, type, expires_at) VALUES (?, ?, ?, ?)',
        [email, code, type || 'register', expires_at]
      );
      const [rows] = await pool.execute('SELECT * FROM verification_codes WHERE id = ?', [result.insertId]);
      return rows[0];
    },
    findByEmailAndCode: async (email, code) => {
      const [rows] = await pool.execute(
        'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND used = 0 AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
        [email, code]
      );
      return rows[0] || null;
    },
    markAsUsed: async (id) => {
      await pool.execute('UPDATE verification_codes SET used = 1 WHERE id = ?', [id]);
    }
  },

  searchHistory: {
    create: async (data) => {
      const { user_id, query, result_count } = data;
      const [result] = await pool.execute(
        'INSERT INTO search_history (user_id, query, result_count) VALUES (?, ?, ?)',
        [user_id, query, result_count || 0]
      );
      const [rows] = await pool.execute('SELECT * FROM search_history WHERE id = ?', [result.insertId]);
      return rows[0];
    },
    getUserHistory: async (userId, limit = 20) => {
      const [rows] = await pool.execute(
        `SELECT * FROM search_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ${Number(limit)}`,
        [userId]
      );
      return rows;
    },
    getAllHistory: async (limit = 100) => {
      const [rows] = await pool.execute(
        `SELECT * FROM search_history ORDER BY created_at DESC LIMIT ${Number(limit)}`
      );
      return rows;
    },
    clearUserHistory: async (userId) => {
      await pool.execute('DELETE FROM search_history WHERE user_id = ?', [userId]);
    }
  },

  transactions: {
    create: async (data) => {
      const { project_id, amount, revenue_share_amount, status } = data;
      const [result] = await pool.execute(
        'INSERT INTO transactions (project_id, amount, revenue_share_amount, status) VALUES (?, ?, ?, ?)',
        [project_id, amount || 0, revenue_share_amount || 0, status || 'pending']
      );
      const [rows] = await pool.execute('SELECT * FROM transactions WHERE id = ?', [result.insertId]);
      return rows[0];
    },
    getProjectTransactions: async (projectId) => {
      const [rows] = await pool.execute(
        'SELECT * FROM transactions WHERE project_id = ? ORDER BY created_at DESC',
        [projectId]
      );
      return rows;
    }
  }
};

export default pool;

import mysql from 'mysql2/promise';

const pool = await mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'aa123456',
  database: 'dashhub'
});

// 查询现有项目
const [projects] = await pool.execute('SELECT id, name FROM projects LIMIT 20');
console.log(`Found ${projects.length} projects: `, projects.map(p => p.id + ':' + p.name).join(', '));

// 为项目注入演示统计数据（梯度分布，让排行榜更好看）
const mockStats = [
  { total: 3850000, totalRev: 1280000, weeklyTx: 320000, weeklyRev: 96000 },
  { total: 2460000, totalRev: 780000,  weeklyTx: 188000, weeklyRev: 56400 },
  { total: 1920000, totalRev: 640000,  weeklyTx: 245000, weeklyRev: 73500 },
  { total: 1340000, totalRev: 402000,  weeklyTx: 108000, weeklyRev: 32400 },
  { total: 980000,  totalRev: 294000,  weeklyTx: 87000,  weeklyRev: 26100 },
  { total: 654000,  totalRev: 196200,  weeklyTx: 64000,  weeklyRev: 19200 },
  { total: 438000,  totalRev: 131400,  weeklyTx: 41000,  weeklyRev: 12300 },
  { total: 290000,  totalRev: 87000,   weeklyTx: 28000,  weeklyRev: 8400  },
  { total: 180000,  totalRev: 54000,   weeklyTx: 16000,  weeklyRev: 4800  },
  { total: 98000,   totalRev: 29400,   weeklyTx: 8500,   weeklyRev: 2550  },
];

for (let i = 0; i < projects.length; i++) {
  const proj = projects[i];
  const stats = mockStats[i % mockStats.length];
  
  // 先检查是否有 project_stats 记录
  const [existing] = await pool.execute('SELECT id FROM project_stats WHERE project_id = ?', [proj.id]);
  
  if (existing.length > 0) {
    await pool.execute(
      `UPDATE project_stats SET 
        total_transaction_amount = ?, 
        total_revenue_share_amount = ?,
        weekly_transaction_amount = ?,
        weekly_revenue_share_amount = ?
      WHERE project_id = ?`,
      [stats.total, stats.totalRev, stats.weeklyTx, stats.weeklyRev, proj.id]
    );
    console.log(`Updated stats for project ${proj.id}: ${proj.name}`);
  } else {
    await pool.execute(
      `INSERT INTO project_stats (project_id, total_transaction_amount, total_revenue_share_amount, weekly_transaction_amount, weekly_revenue_share_amount)
       VALUES (?, ?, ?, ?, ?)`,
      [proj.id, stats.total, stats.totalRev, stats.weeklyTx, stats.weeklyRev]
    );
    console.log(`Inserted stats for project ${proj.id}: ${proj.name}`);
  }
}

console.log('Demo stats injection done!');
await pool.end();
process.exit(0);

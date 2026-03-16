import mysql from 'mysql2/promise';

const pool = await mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'aa123456',
  database: 'dashhub'
});

const [existing] = await pool.execute("SHOW COLUMNS FROM projects LIKE 'cooperation_form'");
if (existing.length > 0) {
  console.log('Fields already exist.');
} else {
  await pool.execute("ALTER TABLE projects ADD COLUMN cooperation_form TEXT COMMENT '简洁合作形式概述'");
  await pool.execute("ALTER TABLE projects ADD COLUMN use_dashtro TINYINT(1) DEFAULT 0 COMMENT '是否使用Dashtro分账'");
  await pool.execute("ALTER TABLE projects ADD COLUMN dashtro_agreement TEXT COMMENT 'Dashtro的分账协议详情内容'");
  console.log('Migration SUCCESS - 3 columns added.');
}
await pool.end();
process.exit(0);

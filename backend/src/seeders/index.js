import createTables from '../config/initDb.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';

// Create tables
console.log('🔧 Creating database tables...');
await createTables();
console.log('✅ Tables created successfully\n');

// Insert test users
console.log('👥 Creating test users...');
const hashedPassword1 = await bcrypt.hash('password123', 10);
const hashedPassword2 = await bcrypt.hash('password123', 10);

const testUsers = [
  {
    id: uuidv4(),
    email: 'user1@example.com',
    password_hash: hashedPassword1,
    username: '品牌商A',
    is_verified: true,
    avatar: 'https://via.placeholder.com/100/4CAF50/FFFFFF?text=BA'
  },
  {
    id: uuidv4(),
    email: 'user2@example.com',
    password_hash: hashedPassword2,
    username: '流量厂牌B',
    is_verified: true,
    avatar: 'https://via.placeholder.com/100/2196F3/FFFFFF?text=TB'
  },
  {
    id: uuidv4(),
    email: 'user3@example.com',
    password_hash: await bcrypt.hash('password123', 10),
    username: 'AI-Agent开发团队',
    is_verified: true,
    avatar: 'https://via.placeholder.com/100/9C27B0/FFFFFF?text=AA'
  }
];

for (const user of testUsers) {
  await pool.query(
    `INSERT INTO users (id, email, password_hash, username, is_verified, avatar) VALUES ($1, $2, $3, $4, $5, $6)`,
    [user.id, user.email, user.password_hash, user.username, user.is_verified, user.avatar]
  );
  console.log(`✅ Created user: ${user.username}`);
}

// Insert test projects
console.log('\n📱 Creating test projects...');

const projects = [
  {
    id: uuidv4(),
    creator_id: testUsers[0].id,
    name: '智能购物助手',
    description: '基于AI的智能购物推荐系统，帮助用户找到最合适的产品',
    url: 'https://www.example.com/smart-shopping',
    type: 'ai_agent',
    logo: 'https://via.placeholder.com/200/4CAF50/FFFFFF?text=AI',
    cover_image: 'https://picsum.photos/800/400?random=1',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    disclosure_protocol: '我们严格遵守数据隐私保护政策，所有用户数据均经过加密处理',
    is_pinned: true,
    view_count: 1250,
    click_count: 380,
    total_transaction_amount: 125000.00,
    total_revenue_share_amount: 12500.00,
    weekly_transaction_amount: 25000.00,
    weekly_revenue_share_amount: 2500.00
  },
  {
    id: uuidv4(),
    creator_id: testUsers[0].id,
    name: '绿色家居品牌',
    description: '专注于环保材料的家居产品，致力于打造健康、可持续的生活空间',
    url: 'https://www.example.com/green-home',
    type: 'brand',
    logo: 'https://via.placeholder.com/200/4CAF50/FFFFFF?text=GD',
    cover_image: 'https://picsum.photos/800/400?random=2',
    disclosure_protocol: '产品材料均经过环保认证，生产过程零污染',
    is_pinned: false,
    view_count: 890,
    click_count: 156,
    total_transaction_amount: 89000.00,
    total_revenue_share_amount: 8900.00,
    weekly_transaction_amount: 12000.00,
    weekly_revenue_share_amount: 1200.00
  },
  {
    id: uuidv4(),
    creator_id: testUsers[1].id,
    name: '短视频流量平台',
    description: '为创作者提供优质的短视频内容和变现机会',
    url: 'https://www.example.com/short-video',
    type: 'traffic',
    logo: 'https://via.placeholder.com/200/2196F3/FFFFFF?text=SV',
    cover_image: 'https://picsum.photos/800/400?random=3',
    disclosure_protocol: '采用先进的流量分配算法，确保创作者收益最大化',
    is_pinned: true,
    view_count: 2100,
    click_count: 650,
    total_transaction_amount: 210000.00,
    total_revenue_share_amount: 21000.00,
    weekly_transaction_amount: 35000.00,
    weekly_revenue_share_amount: 3500.00
  },
  {
    id: uuidv4(),
    creator_id: testUsers[1].id,
    name: '生活方式内容库',
    description: '涵盖美食、旅行、时尚等领域的高质量内容',
    url: 'https://www.example.com/lifestyle',
    type: 'traffic',
    logo: 'https://via.placeholder.com/200/FF9800/FFFFFF?text=LS',
    cover_image: 'https://picsum.photos/800/400?random=4',
    disclosure_protocol: '内容均经过专业团队审核，确保质量',
    is_pinned: false,
    view_count: 1560,
    click_count: 423,
    total_transaction_amount: 78000.00,
    total_revenue_share_amount: 7800.00,
    weekly_transaction_amount: 18000.00,
    weekly_revenue_share_amount: 1800.00
  },
  {
    id: uuidv4(),
    creator_id: testUsers[2].id,
    name: '智能客服机器人',
    description: '基于大语言模型的智能客服解决方案，提升客户服务效率',
    url: 'https://www.example.com/ai-customer-service',
    type: 'ai_agent',
    logo: 'https://via.placeholder.com/200/9C27B0/FFFFFF?text=CS',
    cover_image: 'https://picsum.photos/800/400?random=5',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    disclosure_protocol: '支持多语言，可自定义知识库，API接口完整',
    is_pinned: false,
    view_count: 3200,
    click_count: 890,
    total_transaction_amount: 320000.00,
    total_revenue_share_amount: 32000.00,
    weekly_transaction_amount: 45000.00,
    weekly_revenue_share_amount: 4500.00
  }
];

for (const project of projects) {
  await pool.query(
    `INSERT INTO projects (id, creator_id, name, description, url, type, logo, cover_image, video_url, disclosure_protocol, is_pinned, view_count, click_count, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)`,
    [project.id, project.creator_id, project.name, project.description, project.url, project.type, project.logo, project.cover_image, project.video_url, project.disclosure_protocol, project.is_pinned, project.view_count, project.click_count]
  );

  // Insert stats
  await pool.query(
    `INSERT INTO project_stats (project_id, total_transaction_amount, total_revenue_share_amount, weekly_transaction_amount, weekly_revenue_share_amount, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [project.id, project.total_transaction_amount, project.total_revenue_share_amount, project.weekly_transaction_amount, project.weekly_revenue_share_amount]
  );

  console.log(`✅ Created project: ${project.name} (${project.type})`);
}

console.log('\n🎉 Data seeding completed!');
console.log('\n📊 Test Data Summary:');
console.log(`   - Users: ${testUsers.length}`);
console.log(`   - Projects: ${projects.length}`);
console.log('\n👤 Test Accounts:');
console.log(`   1. Email: user1@example.com, Password: password123`);
console.log(`   2. Email: user2@example.com, Password: password123`);
console.log(`   3. Email: user3@example.com, Password: password123`);
console.log('\n💡 Next steps:');
console.log('   1. Start PostgreSQL server');
console.log('   2. Install dependencies: cd backend && npm install');
console.log('   3. Update .env with your database credentials');
console.log('   4. Run the server: npm run dev');
console.log('   5. Set up frontend');

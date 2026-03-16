import { dbHelper } from './database.js';
import bcrypt from 'bcryptjs';

// 将内存数据库种子数据迁移为 MySQL 版本
async function seedData() {
  console.log('🔧 Seeding test data...');

  // 检查是否已有数据，避免重复写入
  const existingUsers = await dbHelper.users.findByEmail('user1@example.com');
  if (existingUsers) {
    console.log('ℹ️  Test data already exists, skipping seed.');
    return;
  }

  // 创建测试用户
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await dbHelper.users.create({
    email: 'user1@example.com',
    password_hash: hashedPassword,
    username: '品牌商A',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BA&backgroundColor=4CAF50&textColor=ffffff',
    is_verified: 1
  });

  const user2 = await dbHelper.users.create({
    email: 'user2@example.com',
    password_hash: hashedPassword,
    username: '流量厂牌B',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TB&backgroundColor=2196F3&textColor=ffffff',
    is_verified: 1
  });

  const user3 = await dbHelper.users.create({
    email: 'user3@example.com',
    password_hash: hashedPassword,
    username: 'AI-Agent开发团队',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AA&backgroundColor=9C27B0&textColor=ffffff',
    is_verified: 1
  });

  // 创建测试项目
  const project1 = await dbHelper.projects.create({
    creator_id: user1.id,
    name: '智能购物助手',
    description: '基于AI的智能购物推荐系统，帮助用户找到最合适的产品',
    url: 'https://www.example.com/smart-shopping',
    type: 'ai_agent',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=shopping',
    cover_image: 'https://picsum.photos/800/400?random=1',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    disclosure_protocol: '我们严格遵守数据隐私保护政策，所有用户数据均经过加密处理',
    is_pinned: 1,
    view_count: 1250,
    click_count: 380
  });

  const project2 = await dbHelper.projects.create({
    creator_id: user1.id,
    name: '绿色家居品牌',
    description: '专注于环保材料的家居产品，致力于打造健康、可持续的生活空间',
    url: 'https://www.example.com/green-home',
    type: 'brand',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=green',
    cover_image: 'https://picsum.photos/800/400?random=2',
    disclosure_protocol: '产品材料均经过环保认证，生产过程零污染',
    is_pinned: 0,
    view_count: 890,
    click_count: 156
  });

  const project3 = await dbHelper.projects.create({
    creator_id: user2.id,
    name: '短视频流量平台',
    description: '为创作者提供优质的短视频内容和变现机会',
    url: 'https://www.example.com/short-video',
    type: 'traffic',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=video',
    cover_image: 'https://picsum.photos/800/400?random=3',
    disclosure_protocol: '采用先进的流量分配算法，确保创作者收益最大化',
    is_pinned: 1,
    view_count: 2100,
    click_count: 650
  });

  const project4 = await dbHelper.projects.create({
    creator_id: user2.id,
    name: '生活方式内容库',
    description: '涵盖美食、旅行、时尚等领域的高质量内容',
    url: 'https://www.example.com/lifestyle',
    type: 'traffic',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=lifestyle',
    cover_image: 'https://picsum.photos/800/400?random=4',
    disclosure_protocol: '内容均经过专业团队审核，确保质量',
    is_pinned: 0,
    view_count: 1560,
    click_count: 423
  });

  const project5 = await dbHelper.projects.create({
    creator_id: user3.id,
    name: '智能客服机器人',
    description: '基于大语言模型的智能客服解决方案，提升客户服务效率',
    url: 'https://www.example.com/ai-customer-service',
    type: 'ai_agent',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=robot',
    cover_image: 'https://picsum.photos/800/400?random=5',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    disclosure_protocol: '支持多语言，可自定义知识库，API接口完整',
    is_pinned: 0,
    view_count: 3200,
    click_count: 890
  });

  // 创建项目统计数据
  await dbHelper.stats.updateProjectStats(project1.id, {
    total_transaction_amount: 125000.00,
    total_revenue_share_amount: 12500.00,
    weekly_transaction_amount: 25000.00,
    weekly_revenue_share_amount: 2500.00
  });

  await dbHelper.stats.updateProjectStats(project2.id, {
    total_transaction_amount: 89000.00,
    total_revenue_share_amount: 8900.00,
    weekly_transaction_amount: 12000.00,
    weekly_revenue_share_amount: 1200.00
  });

  await dbHelper.stats.updateProjectStats(project3.id, {
    total_transaction_amount: 210000.00,
    total_revenue_share_amount: 21000.00,
    weekly_transaction_amount: 35000.00,
    weekly_revenue_share_amount: 3500.00
  });

  await dbHelper.stats.updateProjectStats(project4.id, {
    total_transaction_amount: 78000.00,
    total_revenue_share_amount: 7800.00,
    weekly_transaction_amount: 18000.00,
    weekly_revenue_share_amount: 1800.00
  });

  await dbHelper.stats.updateProjectStats(project5.id, {
    total_transaction_amount: 320000.00,
    total_revenue_share_amount: 32000.00,
    weekly_transaction_amount: 45000.00,
    weekly_revenue_share_amount: 4500.00
  });

  console.log('✅ Test data seeded successfully!');
  console.log('\n👤 Test Accounts:');
  console.log('   1. Email: user1@example.com, Password: password123');
  console.log('   2. Email: user2@example.com, Password: password123');
  console.log('   3. Email: user3@example.com, Password: password123');
}

// 如果直接运行此文件，则执行种子数据插入
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData().catch(console.error);
}

export { seedData };

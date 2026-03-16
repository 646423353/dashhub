// 额外测试数据插入脚本
// 运行方式: node src/seeders/extraData.js
import { dbHelper } from '../config/database.js';
import bcrypt from 'bcryptjs';

async function insertExtraData() {
    console.log('🌱 开始插入额外测试数据...');

    const password = await bcrypt.hash('password123', 10);

    // 额外用户
    const extraUsers = [
        { email: 'brand1@example.com', username: '时尚品牌C', bg: 'E91E63', seed: 'BC' },
        { email: 'brand2@example.com', username: '美妆品牌D', bg: 'FF5722', seed: 'BD' },
        { email: 'traffic1@example.com', username: '科技博主E', bg: '00BCD4', seed: 'TE' },
        { email: 'traffic2@example.com', username: '旅游达人F', bg: '4DB6AC', seed: 'TF' },
        { email: 'agent1@example.com', username: 'AI创业团队G', bg: '7E57C2', seed: 'AG' },
        { email: 'agent2@example.com', username: '智能科技H', bg: '5C6BC0', seed: 'AH' },
    ];

    const createdUsers = [];
    for (const u of extraUsers) {
        const existing = await dbHelper.users.findByEmail(u.email);
        if (!existing) {
            const user = await dbHelper.users.create({
                email: u.email,
                password_hash: password,
                username: u.username,
                avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${u.seed}&backgroundColor=${u.bg}&textColor=ffffff`,
                is_verified: 1
            });
            createdUsers.push({ ...user, username: u.username });
            console.log(`  ✅ 用户创建: ${u.username}`);
        } else {
            createdUsers.push({ ...existing });
            console.log(`  ℹ️  用户已存在: ${u.username}`);
        }
    }

    // 额外项目（按类型平均分配）
    const extraProjects = [
        // 品牌商
        {
            creator: createdUsers[0],
            name: '北欧简约服装品牌',
            description: '专注于极简北欧风格服装设计，面向追求高品质生活的都市人群',
            type: 'brand',
            seed: 'nordic',
            view_count: 1340, click_count: 290, is_pinned: 0,
            total_tx: 156000, weekly_tx: 18000
        },
        {
            creator: createdUsers[0],
            name: '有机食品溯源平台',
            description: '全链路有机食品溯源，从农场到餐桌每一步透明可查',
            type: 'brand',
            seed: 'organic',
            view_count: 980, click_count: 175, is_pinned: 0,
            total_tx: 89000, weekly_tx: 11000
        },
        {
            creator: createdUsers[1],
            name: '天然护肤品牌',
            description: '纯天然植物提取，不含防腐剂和化学添加剂的护肤系列',
            type: 'brand',
            seed: 'skincare',
            view_count: 2230, click_count: 610, is_pinned: 1,
            total_tx: 320000, weekly_tx: 42000
        },
        {
            creator: createdUsers[1],
            name: '联名潮流球鞋',
            description: '与知名设计师联名推出限量版球鞋，融合街头文化与高端设计',
            type: 'brand',
            seed: 'sneaker',
            view_count: 4100, click_count: 1200, is_pinned: 0,
            total_tx: 530000, weekly_tx: 68000
        },
        // 流量厂牌
        {
            creator: createdUsers[2],
            name: '科技资讯聚合媒体',
            description: '每天精选全球科技资讯，帮助读者高效获取前沿技术动态',
            type: 'traffic',
            seed: 'tech-news',
            view_count: 5600, click_count: 1870, is_pinned: 0,
            total_tx: 178000, weekly_tx: 22000
        },
        {
            creator: createdUsers[2],
            name: '数码评测频道',
            description: '专业测评最新数码产品，购买前必看的真实使用报告',
            type: 'traffic',
            seed: 'review',
            view_count: 3200, click_count: 945, is_pinned: 0,
            total_tx: 145000, weekly_tx: 19000
        },
        {
            creator: createdUsers[3],
            name: '全球旅行攻略库',
            description: '超过200个国家和地区的旅行攻略，让每次出行都无懈可击',
            type: 'traffic',
            seed: 'travel',
            view_count: 7800, click_count: 2300, is_pinned: 1,
            total_tx: 280000, weekly_tx: 35000
        },
        {
            creator: createdUsers[3],
            name: '户外运动社区',
            description: '连接徒步、骑行、攀岩爱好者，分享装备和路线经验',
            type: 'traffic',
            seed: 'outdoor',
            view_count: 2100, click_count: 680, is_pinned: 0,
            total_tx: 96000, weekly_tx: 13000
        },
        // AI Agent
        {
            creator: createdUsers[4],
            name: 'AI 简历优化助手',
            description: '智能分析简历与岗位需求匹配度，帮助求职者提升面试成功率',
            type: 'ai_agent',
            seed: 'resume',
            view_count: 6300, click_count: 2100, is_pinned: 0,
            total_tx: 420000, weekly_tx: 55000
        },
        {
            creator: createdUsers[4],
            name: 'AI 法律文书生成器',
            description: '一键生成标准法律合同、协议模板，降低中小企业法律成本',
            type: 'ai_agent',
            seed: 'legal',
            view_count: 4500, click_count: 1450, is_pinned: 1,
            total_tx: 380000, weekly_tx: 48000
        },
        {
            creator: createdUsers[5],
            name: 'AI 财务数据分析平台',
            description: '自动抓取企业财务数据，生成直观的分析图表和投资建议报告',
            type: 'ai_agent',
            seed: 'finance',
            view_count: 3800, click_count: 1120, is_pinned: 0,
            total_tx: 290000, weekly_tx: 38000
        },
        {
            creator: createdUsers[5],
            name: 'AI 教育个性化辅导',
            description: '根据学生学习进度动态生成专属习题，实现真正的因材施教',
            type: 'ai_agent',
            seed: 'education',
            view_count: 2900, click_count: 880, is_pinned: 0,
            total_tx: 195000, weekly_tx: 25000
        }
    ];

    let createdCount = 0;
    for (const p of extraProjects) {
        const project = await dbHelper.projects.create({
            creator_id: p.creator.id,
            name: p.name,
            description: p.description,
            url: `https://www.example.com/${p.seed}`,
            type: p.type,
            logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${p.seed}`,
            cover_image: `https://picsum.photos/800/400?random=${Math.floor(Math.random() * 100) + 10}`,
            disclosure_protocol: '本项目严格遵守相关法律法规，保障用户权益',
            is_pinned: p.is_pinned,
            view_count: p.view_count,
            click_count: p.click_count
        });

        await dbHelper.stats.updateProjectStats(project.id, {
            total_transaction_amount: p.total_tx,
            total_revenue_share_amount: p.total_tx * 0.1,
            weekly_transaction_amount: p.weekly_tx,
            weekly_revenue_share_amount: p.weekly_tx * 0.1
        });

        createdCount++;
        console.log(`  ✅ 项目创建: [${p.type}] ${p.name}`);
    }

    console.log(`\n🎉 额外数据插入完成！共插入 ${createdCount} 个项目。`);
    process.exit(0);
}

insertExtraData().catch(err => {
    console.error('❌ 插入失败:', err.message);
    process.exit(1);
});

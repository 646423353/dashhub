import { dbHelper } from './src/config/database.js';

async function seed() {
    console.log('Fetching users...');
    const users = await dbHelper.query("SELECT id FROM users LIMIT 3");
    if (!users || users.length === 0) {
        console.log("No users found. Please register a user first.");
        process.exit();
    }

    const creatorId = users[0].id;
    const creatorId2 = users.length > 1 ? users[1].id : creatorId;

    console.log('Clearing old projects...');
    await dbHelper.query("DELETE FROM projects");

    const realisticProjects = [
        {
            name: "Midjourney 亚太区分发署",
            type: "ai_agent",
            desc: "一站式提供Midjourney亚太区商业授权与API高速镜像服务。具备完善的回调、Webhooks以及分账底层网络。",
            url: "https://mj-asia.api.demo",
            coop: "开放包月/流量按次计费两种合作方式。大客户可走专属API直连通道，采用充值扣费制。",
            dashtro: 1,
            agree: "凡是通过渠道方邀请码生成的订单，次日零点 Dashtro 会自动执行资金切割：45% 划入大区管理钱包，15% 拨给二级厂牌，剩余40%直达开发者的执行钱包。",
            logo: "https://picsum.photos/seed/mj/100/100",
            cover: `["https://picsum.photos/seed/mj/800/400"]`,
            totTx: 5600000.5,
            totRev: 1582000.0,
            wTx: 800000.0,
            wRev: 245000.0
        },
        {
            name: "千幻美妆种草分发联盟",
            type: "traffic",
            desc: "汇聚全网3000+头部/腰部美妆博主的商业分发引擎系统，以极高转化率和极低带货协作门槛闻名于世。",
            url: "https://qianhuan.traffic.demo",
            coop: "品牌入驻预存营销金额，博主通过带货定制CPS链接结算。无需前置费用，按实效转化提点。",
            dashtro: 1,
            agree: "Dashtro 提供绝对中立的品牌保障，资金先入收银台冻结。确认签收后的T+7日内，博主方可直接获得约定的 30% 收益提成，有效退货产生的费率将被智能系统自动扣减15%。",
            logo: "https://picsum.photos/seed/qianhuan/100/100",
            cover: `["https://picsum.photos/seed/qianhuan/800/400"]`,
            totTx: 14500000.0,
            totRev: 4280000.0,
            wTx: 2100000.0,
            wRev: 610000.0
        },
        {
            name: "本地生活·旅游专线",
            type: "brand",
            desc: "全球精选高端酒店与私导包车线路资源直供，主打高客单价、高佣金返利比例的高端本地深度游体验产品。",
            url: "https://local-tour.brand.demo",
            coop: "对接全国线下与线上旅行社、兼职私人定制导游群体。签署推广电子授权后，直接生成专属跳转分销码即可成单。",
            dashtro: 0,
            agree: "",
            logo: "https://picsum.photos/seed/localtour/100/100",
            cover: `["https://picsum.photos/seed/localtour/800/400"]`,
            totTx: 1205000.0,
            totRev: 315000.0,
            wTx: 400000.0,
            wRev: 102000.0
        },
        {
            name: "Auto-Deploy 智能自动化运维",
            type: "ai_agent",
            desc: "基于 LLM 与云原生基础设施构建的 DevOps 智能体系统，能够在 3 分钟内根据自然语言口令完成中大型项目的拓扑搭建与生产级上线。",
            url: "https://auto-deploy.dev",
            coop: "全面支持SaaS层标准授权协议与企业网闸隔离层私有化部署。IT服务商可以代理出售我们的算力Token，提成可观。",
            dashtro: 1,
            agree: "Dashtro 全面托管各级代理商的网状结构分账体系。企业终端用户消耗算力 Token 时，代理商将通过收银台实时获得 40% 分润直达个人或对公走账卡中。",
            logo: "https://picsum.photos/seed/autodeploy/100/100",
            cover: `["https://picsum.photos/seed/autodeploy/800/400"]`,
            totTx: 1050000.0,
            totRev: 420000.0,
            wTx: 380000.0,
            wRev: 152000.0
        }
    ];

    for (let i = 0; i < realisticProjects.length; i++) {
        const p = realisticProjects[i];
        const cid = (i % 2 === 0) ? creatorId : creatorId2;
        // Insert project
        const result = await dbHelper.query(
            `INSERT INTO projects (creator_id, name, description, url, type, logo, cover_image, view_count, click_count, is_pinned, cooperation_form, use_dashtro, dashtro_agreement)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [cid, p.name, p.desc, p.url, p.type, p.logo, p.cover, 1000 + i * 200, 500 + i * 100, 1, p.coop, p.dashtro, p.agree]
        );

        const projectId = result.insertId;

        // Insert specs
        await dbHelper.query(
            `INSERT INTO project_stats (project_id, total_transaction_amount, total_revenue_share_amount, weekly_transaction_amount, weekly_revenue_share_amount)
       VALUES (?, ?, ?, ?, ?)`,
            [projectId, p.totTx, p.totRev, p.wTx, p.wRev]
        );
    }

    console.log("Seeding complete!");
    process.exit();
}

seed();

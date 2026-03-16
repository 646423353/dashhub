# DashHub

DashHub 是一个项目展示和分账记录平台，为用户提供便捷的产品和服务入口，并记录项目可信性。

## 项目概述

DashHub 允许用户创建和展示三种类型的项目：
- **品牌商类**: 品牌和产品的展示平台
- **流量主类**: 内容分发和流量变现项目
- **AI-Agent类**: 基于 AI 的智能服务项目

每个项目都接入 Dashtro 服务，获取可信的分账数据，包括：
- 总交易金额
- 总分账金额
- 近一周交易金额
- 近一周分账金额

## 技术架构

### 前端
- Vue 3 + Vite
- Vue Router 4
- Pinia 状态管理
- Element Plus UI 组件
- Tailwind CSS
- Axios HTTP 客户端

### 后端
- Node.js + Express
- MySQL 数据库
- JWT 身份验证
- Multer 文件上传
- bcryptjs 密码加密

## 功能特性

### 用户功能
- 邮箱验证码注册/登录
- 创建和管理项目
- 上传项目资料（Logo、封面、视频）
- 查看项目统计数据
- 搜索项目
- 个人资料管理

### 项目展示
- 项目列表（置顶 + 热门）
- 项目详情页
- 按类型筛选
- 项目搜索（综合推荐算法）
- 响应式设计

### 搜索算法

搜索推荐算法综合权重计算：

```
relevance_score = (text_match_score * 0.4) +
                  (popularity_score * 0.3) +
                  (activity_score * 0.2) +
                  (recency_score * 0.1)
```

各组成部分：
1. **文本匹配度 (40%)**: MySQL 文本搜索
2. **人气得分 (30%)**: 浏览量 + 点击量
3. **活跃度得分 (20%)**: 近一周交易/分账金额
4. **新鲜度得分 (10%)**: 项目创建时间

## 目录结构

```
dashhub/
├── backend/           # 后端服务
│   ├── src/
│   │   ├── config/   # 配置文件
│   │   ├── controllers/
│   │   ├── models/   # 数据模型
│   │   ├── routes/   # 路由
│   │   ├── middleware/
│   │   ├── seeders/  # 种子数据
│   │   └── index.js
│   ├── public/       # 静态文件/上传
│   └── package.json
├── frontend/         # 前端应用
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── views/
│   │   ├── stores/
│   │   ├── router/
│   │   └── main.js
后端 API 将运行在 `http://localhost:3001`

### 3. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用将运行在 `http://localhost:5173`

### 4. 访问应用

打开浏览器访问 `http://localhost:5173`

## 测试数据

种子数据包含：
- 3个测试用户
- 5个测试项目（涵盖3种类型）

测试账号：
- user1@example.com / password123 (品牌商A)
- user2@example.com / password123 (流量主B)
- user3@example.com / password123 (AI-Agent开发团队)

## API 文档

详细的 API 文档请查看 [backend/README.md](./backend/README.md)

## 前端文档

详细的前端文档请查看 [frontend/README.md](./frontend/README.md)

## 数据库设计

### 主要表

- `users` - 用户表
- `projects` - 项目表
- `project_stats` - 项目统计表
- `transactions` - 交易记录表（Dashtro）
- `verification_codes` - 验证码表
- `search_history` - 搜索历史表

## 安全性

- JWT token 认证
- bcryptjs 密码加密
- 请求拦截器
- CORS 配置
- 文件上传验证

## 待办功能

- [ ] 邮件发送服务集成
- [ ] 云存储集成（图片/视频）
- [ ] 实时通知
- [ ] 项目评论/评分
- [ ] 数据可视化
- [ ] 后台管理系统

## 许可证

MIT

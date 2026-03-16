# DashHub Backend API

## 技术栈

- **运行时**: Node.js
- **框架**: Express.js
- **数据库**: PostgreSQL
- **认证**: JWT (JSON Web Token)
- **文件上传**: Multer
- **密码加密**: bcryptjs

## 目录结构

```
backend/
├── src/
│   ├── config/          # 配置文件
│   │   ├── database.js  # 数据库连接
│   │   └── initDb.js    # 数据库初始化
│   ├── controllers/     # 控制器
│   ├── models/          # 数据模型
│   ├── routes/          # 路由
│   ├── middleware/      # 中间件
│   ├── seeders/         # 种子数据
│   └── index.js         # 入口文件
├── public/              # 静态文件
│   └── uploads/         # 上传文件
├── .env                 # 环境变量
└── package.json
```

## 安装

```bash
cd backend
npm install
```

## 数据库设置

确保 PostgreSQL 已安装并运行：

1. 创建数据库：
```bash
createdb dashhub
```

2. 更新 `.env` 文件中的数据库连接信息

3. 初始化数据库和种子数据：
```bash
npm run seed
```

## 运行

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

API 将运行在 `http://localhost:3001`

## API 文档

### 认证接口

#### 发送验证码
```
POST /api/auth/send-code
Content-Type: application/json

{
  "email": "user@example.com",
  "type": "register"  // or "reset_password"
}
```

#### 注册
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456",
  "password": "password123",
  "username": "用户名"
}
```

#### 登录
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 重置密码
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newpassword123"
}
```

#### 获取当前用户信息
```
GET /api/auth/me
Authorization: Bearer <token>
```

### 项目接口

#### 获取首页项目
```
GET /api/projects/home?page=1
```

#### 获取项目详情
```
GET /api/projects/:id
```

#### 访问项目 (跳转并统计点击)
```
GET /api/projects/:id/visit
```

#### 创建项目
```
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "项目名称",
  "description": "项目描述",
  "url": "https://example.com",
  "type": "brand",  // "brand", "traffic", or "ai_agent"
  "logo": "/uploads/images/logo.png",
  "coverImage": "/uploads/images/cover.png",
  "videoUrl": "/uploads/videos/intro.mp4",
  "disclosureProtocol": "披露协议内容"
}
```

#### 更新项目
```
PUT /api/projects/:id
Authorization: Bearer <token>
```

#### 删除项目
```
DELETE /api/projects/:id
Authorization: Bearer <token>
```

#### 获取我的项目
```
GET /api/projects/my
Authorization: Bearer <token>
```

#### 按类型获取项目
```
GET /api/projects/type/:type?page=1
```

### 搜索接口

#### 搜索项目
```
GET /api/search/projects?q=关键词&page=1
```

#### 获取热门搜索
```
GET /api/search/trending
```

#### 获取搜索历史
```
GET /api/search/history
Authorization: Bearer <token>
```

### 用户接口

#### 获取用户资料
```
GET /api/users/:id
```

#### 更新个人资料
```
PUT /api/users/me
Authorization: Bearer <token>
```

### 上传接口

#### 上传文件
```
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

支持字段:
- logo: 项目Logo
- cover: 项目封面图
- video: 项目视频
- avatar: 用户头像

最大文件大小: 20MB
```

## 测试数据

种子数据包含：
- 3个测试用户
- 5个测试项目（涵盖3种类型）

测试账号：
- user1@example.com / password123
- user2@example.com / password123
- user3@example.com / password123

## 搜索算法说明

搜索推荐算法综合权重计算：

```
relevance_score = (text_match_score * 0.4) +
                  (popularity_score * 0.3) +
                  (activity_score * 0.2) +
                  (recency_score * 0.1)
```

各组成部分：
1. **文本匹配度 (40%)**: PostgreSQL 全文搜索
2. **人气得分 (30%)**: 浏览量 + 点击量
3. **活跃度得分 (20%)**: 近一周交易/分账金额
4. **新鲜度得分 (10%)**: 项目创建时间

## 环境变量

参考 `.env` 文件：
- `PORT`: 服务器端口
- `DB_HOST`: 数据库主机
- `DB_PORT`: 数据库端口
- `DB_NAME`: 数据库名称
- `DB_USER`: 数据库用户
- `DB_PASSWORD`: 数据库密码
- `JWT_SECRET`: JWT密钥
- `CORS_ORIGIN`: CORS允许的源

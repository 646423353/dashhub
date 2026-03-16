# DashHub 部署文档

## 技术栈

| 层级 | 技术 | 版本 |
|---|---|---|
| 前端 | Vue 3 + Vite + TailwindCSS | Vue ^3.4 |
| 后端 | Node.js + Express | Express ^4.18 |
| 数据库 | **MySQL**（非 PostgreSQL） | >= 8.0 |
| ORM | mysql2 原生驱动 | ^3.19 |
| 文件存储 | 本地磁盘（multer） | — |

---

## 一、前置要求

- **Node.js** >= 18.x
- **MySQL** >= 8.0（本地或云端均可）
- **npm**（随 Node.js 一起安装）

---

## 二、数据库部署

### 1. 创建数据库并建表

```bash
# 登录 MySQL
mysql -u root -p

# 在 MySQL Shell 里执行下方 SQL 文件
source /path/to/dashhub/backend/schema.sql
```

> `schema.sql` 会自动执行 `CREATE DATABASE IF NOT EXISTS dashhub` 并建好所有表。

### 2. 数据库表结构说明

| 表名 | 用途 |
|---|---|
| `users` | 用户账号、密码哈希、头像 |
| `projects` | 项目主表（含 Dashtro 字段） |
| `project_stats` | 项目累计 / 近七日协作数据，排行榜依赖此表 |
| `verification_codes` | 邮箱验证码 |
| `search_history` | 搜索历史记录 |
| `transactions` | 历史交易记录 |

### 3. (可选) 注入演示数据

```bash
cd backend
node seed-stats.mjs   # 为现有项目注入演示统计数据，让排行榜有内容展示
```

---

## 三、后端部署

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

复制并编辑 `.env` 文件：

```bash
cp .env.example .env   # 如有 example，否则手动创建
```

`.env` 完整内容：

```env
# 服务端口
PORT=3001

# JWT 密钥（生产环境请替换为随机长字符串）
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=7d

# MySQL 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=dashhub

# 邮件配置（注册验证码，选填）
EMAIL_HOST=smtp.qq.com
EMAIL_PORT=587
EMAIL_USER=your@qq.com
EMAIL_PASS=your_smtp_auth_code
```

### 3. 启动后端

**开发模式**（热重载）：
```bash
npm run dev
```

**生产模式**：
```bash
npm run start
```

后端默认运行在 `http://localhost:3001`。

### 4. (可选) 用 PM2 守护进程

```bash
npm install -g pm2
pm2 start src/index.js --name dashhub-backend
pm2 save
pm2 startup
```

---

## 四、前端部署

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 配置后端地址

前端所有的 API 请求地址通过 `.env` 文件统一管理：

- **开发**：`frontend/.env` 中 `VITE_API_BASE=http://localhost:3001`（已默认配置好）
- **生产**：修改 `frontend/.env.production` 中的值为实际后端域名，例如：

```env
VITE_API_BASE=https://api.yourdomain.com
```

修改后重新执行 `npm run build` 即可生效，无需逐一改代码文件。

### 3a. 本地开发模式

```bash
npm run dev
# 前端默认在 http://localhost:5173
```

### 3b. 生产构建

```bash
npm run build
# 构建产物输出到 frontend/dist/
```

构建完成后，将 `dist/` 目录托管到任意静态服务器即可：

**使用 Nginx 托管示例：**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/dashhub/dist;
    index index.html;

    # 支持 Vue Router history 模式
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 反向代理后端 API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 反向代理文件上传
    location /uploads {
        proxy_pass http://localhost:3001;
    }
}
```

---

## 五、完整启动顺序

```bash
# 1. 确认 MySQL 已启动
# 2. 确认 schema.sql 已执行

# 3. 启动后端
cd backend
npm run dev    # 或 npm start（生产）

# 4. 启动前端（开发）
cd frontend
npm run dev
```

访问 `http://localhost:5173` 即可看到 DashHub 首页。

---

## 六、常见问题

| 问题 | 排查方向 |
|---|---|
| 后端 500 错误 | 检查 `.env` 中数据库密码是否正确 |
| 图片/视频无法上传 | 检查 `backend/uploads/` 目录是否存在且有写权限 |
| 排行榜无数据 | 运行 `node seed-stats.mjs` 注入演示数据 |
| 前端白屏 | 生产构建后确认 Nginx 配置了 `try_files` 支持 history 路由 |
| 验证码收不到 | 在 `.env` 配置正确的 SMTP 信息 |

# DashHub Frontend

## 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **UI组件**: Element Plus
- **样式**: Tailwind CSS
- **HTTP客户端**: Axios

## 目录结构

```
frontend/
├── public/              # 静态资源
├── src/
│   ├── api/           # API 请求封装
│   ├── assets/        # 资源文件
│   ├── components/    # 公共组件
│   ├── router/        # 路由配置
│   ├── stores/        # Pinia 状态管理
│   ├── styles/        # 全局样式
│   ├── utils/         # 工具函数
│   ├── views/         # 页面组件
│   ├── App.vue        # 根组件
│   └── main.js       # 入口文件
├── index.html         # HTML 模板
├── vite.config.js     # Vite 配置
├── tailwind.config.js # Tailwind 配置
└── package.json
```

## 安装

```bash
cd frontend
npm install
```

## 运行

开发模式：
```bash
npm run dev
```

生产构建：
```bash
npm run build
```

预览构建：
```bash
npm run preview
```

开发服务器将运行在 `http://localhost:5173`

## 页面说明

| 路径 | 名称 | 说明 | 需要登录 |
|------|------|------|----------|
| `/` | 首页 | 展示推荐和热门项目 | 否 |
| `/search` | 搜索 | 搜索项目，支持热门搜索和历史记录 | 否 |
| `/project/:id` | 项目详情 | 项目详细信息、统计数据、披露协议 | 否 |
| `/login` | 登录 | 用户登录 | 否 |
| `/register` | 注册 | 用户注册（邮箱验证） | 否 |
| `/my-projects` | 我的项目 | 管理用户创建的项目 | 是 |
| `/create-project` | 创建项目 | 创建新项目（三步流程） | 是 |
| `/edit-project/:id` | 编辑项目 | 编辑已有项目 | 是 |
| `/profile` | 个人中心 | 用户信息和设置 | 是 |

## API 接口

### 认证
- `authApi.sendCode(email, type)` - 发送验证码
- `authApi.register(data)` - 注册
- `authApi.login(email, password)` - 登录
- `authApi.resetPassword(email, code, newPassword)` - 重置密码
- `authApi.getMe()` - 获取当前用户信息

### 项目
- `projectApi.getHomeProjects(page)` - 获取首页项目
- `projectApi.getProjectById(id)` - 获取项目详情
- `projectApi.visitProject(id)` - 访问项目
- `projectApi.createProject(data)` - 创建项目
- `projectApi.updateProject(id, data)` - 更新项目
- `projectApi.deleteProject(id)` - 删除项目
- `projectApi.getMyProjects()` - 获取我的项目
- `projectApi.getProjectsByType(type, page)` - 按类型获取项目

### 搜索
- `searchApi.searchProjects(query, page)` - 搜索项目
- `searchApi.getTrending()` - 获取热门搜索
- `searchApi.getHistory()` - 获取搜索历史
- `searchApi.clearHistory()` - 清除搜索历史

### 用户
- `userApi.getUserProfile(id)` - 获取用户资料
- `userApi.updateProfile(data)` - 更新个人资料
- `userApi.updateAvatar(avatar)` - 更新头像

### 上传
- `uploadApi.upload(formData)` - 上传文件

## 状态管理 (Pinia Stores)

### Auth Store (`useAuthStore`)
- 管理用户认证状态
- 存储用户信息和 token
- 提供登录、注册、登出等方法

### Project Store (`useProjectStore`)
- 管理项目数据
- 获取首页项目、项目详情等

### Search Store (`useSearchStore`)
- 管理搜索功能
- 搜索历史、热门搜索

## 搜索算法

搜索推荐算法综合权重计算：

```
relevance_score = (text_match_score * 0.4) +
                  (popularity_score * 0.3) +
                  (activity_score * 0.2) +
                  (recency_score * 0.1)
```

## 项目类型

| 类型 | 值 | 标签样式 |
|------|-----|----------|
| 品牌商 | `brand` | 绿色 |
| 流量主 | `traffic` | 蓝色 |
| AI Agent | `ai_agent` | 紫色 |

## 响应式设计

- 移动端优先设计
- 支持手机、平板、桌面
- 使用 Tailwind 响应式类

## 环境变量

在 `.env` 文件中配置（如果需要）：

```
VITE_API_URL=http://localhost:3001
```

## 快捷键

- `⌘K` / `Ctrl+K` - 打开搜索

## 注意事项

1. 文件上传目前使用模拟实现，需要后端支持
2. 验证码在开发环境会显示在控制台
3. 图片/视频URL使用占位符或上传后返回的路径

## 开发建议

- 使用浏览器 DevTools 的 Vue DevTools 扩展进行调试
- 查看 Network 面板了解 API 请求
- 使用 Pinia DevTools 查看状态变化

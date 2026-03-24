# DashHub OAuth 2.0 授权登录系统文档

## 目录

1. [系统概述](#1-系统概述)
2. [认证流程架构](#2-认证流程架构)
3. [安全协议与标准](#3-安全协议与标准)
4. [配置参数详解](#4-配置参数详解)
5. [客户端集成指南](#5-客户端集成指南)
6. [代码示例](#6-代码示例)
7. [故障排除指南](#7-故障排除指南)
8. [版本历史与更新](#8-版本历史与更新)

---

## 1. 系统概述

### 1.1 简介

DashHub OAuth 2.0 授权登录系统是一个统一的身份认证平台，允许子系统通过 OAuth 2.0 授权码流程实现单点登录（SSO）。用户只需在主系统（DashHub）登录一次，即可无缝访问所有接入的子系统。

### 1.2 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户浏览器                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      子系统 (Client)                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   前端      │    │   后端      │    │   数据库    │        │
│  │  (Vue 3)    │    │  (NestJS)   │    │  (MySQL)    │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ OAuth 2.0
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    主系统 (DashHub)                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   前端      │    │   后端      │    │   数据库    │        │
│  │  (Vue 3)    │    │  (Express)  │    │  (MySQL)    │        │
│  │ 授权页面    │    │ OAuth服务   │    │ OAuth表     │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 角色定义

| 角色 | 说明 | 示例 |
|------|------|------|
| 授权服务器 (Authorization Server) | 主系统 DashHub，负责用户认证和授权码/令牌发放 | dashhub.insfair.cn |
| 资源服务器 (Resource Server) | 主系统 DashHub，提供用户信息接口 | dashhub.insfair.cn |
| 客户端 (Client) | 子系统，请求用户授权并获取用户信息 | cehua.insfair.cn |
| 资源所有者 (Resource Owner) | 终端用户 | user@example.com |

---

## 2. 认证流程架构

### 2.1 完整授权流程

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   用户   │     │ 子系统   │     │ 主系统   │     │ 主系统   │
│  浏览器  │     │  前端    │     │  前端    │     │  后端    │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ 1. 点击"一键登录"               │                │
     │───────────────>│                │                │
     │                │                │                │
     │                │ 2. GET /api/oauth/authorize     │
     │                │───────────────>│                │
     │                │                │                │
     │ 3. 302 重定向到主系统授权页面   │                │
     │<───────────────────────────────│                │
     │                │                │                │
     │ 4. 显示授权确认页面            │                │
     │───────────────────────────────>│                │
     │                │                │                │
     │                │                │ 5. 检查登录状态│
     │                │                │───────────────>│
     │                │                │                │
     │ 6. 如未登录，显示登录页面      │                │
     │<───────────────────────────────│                │
     │                │                │                │
     │ 7. 用户输入凭证登录            │                │
     │───────────────────────────────>│                │
     │                │                │                │
     │                │                │ 8. 验证凭证    │
     │                │                │───────────────>│
     │                │                │                │
     │ 9. 登录成功，重定向回授权页面  │                │
     │<───────────────────────────────│                │
     │                │                │                │
     │ 10. 用户点击"授权并登录"       │                │
     │───────────────────────────────>│                │
     │                │                │                │
     │                │                │ 11. POST /api/oauth/authorize
     │                │                │───────────────>│
     │                │                │                │
     │                │                │ 12. 生成授权码 │
     │                │                │<───────────────│
     │                │                │                │
     │ 13. 重定向到子系统回调地址     │                │
     │<───────────────────────────────│                │
     │                │                │                │
     │ 14. 携带 code 参数             │                │
     │───────────────>│                │                │
     │                │                │                │
     │                │ 15. GET /api/oauth/callback?code=xxx
     │                │───────────────────────────────>│
     │                │                │                │
     │                │ 16. 用 code 换取 access_token  │
     │                │───────────────────────────────>│
     │                │                │                │
     │                │ 17. 用 access_token 获取用户信息
     │                │───────────────────────────────>│
     │                │                │                │
     │                │ 18. 创建/更新本地用户，生成本地token
     │                │<───────────────────────────────│
     │                │                │                │
     │ 19. 登录成功，跳转到首页       │                │
     │<───────────────│                │                │
     │                │                │                │
     ▼                ▼                ▼                ▼
```

### 2.2 步骤详解

#### 步骤 1-3：发起授权请求

用户在子系统点击"一键登录"按钮，子系统前端调用后端 `/api/oauth/authorize` 接口，后端生成授权URL并重定向。

**请求示例：**
```
GET /api/oauth/authorize HTTP/1.1
Host: cehua.insfair.cn
```

**响应示例：**
```
HTTP/1.1 302 Found
Location: https://dashhub.insfair.cn/oauth/authorize?response_type=code&client_id=business-planner&redirect_uri=https%3A%2F%2Fcehua.insfair.cn%2Fauth%2Fcallback&scope=openid+profile+email&state=abc123...
```

#### 步骤 4-9：用户认证

用户在主系统完成登录认证。如果已登录，跳过此步骤。

#### 步骤 10-13：用户授权

用户确认授权，主系统生成授权码（Authorization Code）并重定向回子系统。

**授权请求参数：**

| 参数 | 必填 | 说明 |
|------|------|------|
| response_type | 是 | 固定值 `code` |
| client_id | 是 | 客户端ID |
| redirect_uri | 是 | 回调地址，必须与注册时一致 |
| scope | 是 | 请求权限范围 |
| state | 是 | 防 CSRF 的随机字符串 |

**授权码响应：**
```
HTTP/1.1 302 Found
Location: https://cehua.insfair.cn/auth/callback?code=a1b2c3d4&state=abc123...
```

#### 步骤 14-18：令牌交换与用户信息获取

子系统后端使用授权码换取访问令牌，然后获取用户信息。

**令牌请求：**
```
POST /api/oauth/token HTTP/1.1
Host: dashhub.insfair.cn
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "a1b2c3d4",
  "redirect_uri": "https://cehua.insfair.cn/auth/callback",
  "client_id": "business-planner",
  "client_secret": "xxx"
}
```

**令牌响应：**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 7200,
  "refresh_token": "r1e2f3r4e5s6h7..."
}
```

**用户信息请求：**
```
GET /api/oauth/userinfo HTTP/1.1
Host: dashhub.insfair.cn
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**用户信息响应：**
```json
{
  "sub": "1",
  "username": "user1",
  "email": "user1@example.com",
  "avatar": "https://...",
  "role": "user"
}
```

---

## 3. 安全协议与标准

### 3.1 OAuth 2.0 授权码流程

本系统实现 OAuth 2.0 Authorization Code Flow，这是最安全的授权流程，适用于服务器端应用。

**安全特性：**
- 授权码一次性使用，使用后立即失效
- 授权码有效期短（默认10分钟）
- client_secret 仅在后端使用，不暴露给前端
- 支持 PKCE 扩展（可选）

### 3.2 JWT (JSON Web Token)

访问令牌采用 JWT 格式，包含以下声明：

| 声明 | 说明 |
|------|------|
| sub | 用户唯一标识 |
| email | 用户邮箱 |
| username | 用户名 |
| iat | 签发时间 |
| exp | 过期时间 |

**JWT 配置：**

| 配置项 | 开发环境 | 生产环境 |
|--------|----------|----------|
| 算法 | HS256 | HS256 |
| 有效期 | 7天 | 2小时 |
| 刷新令牌有效期 | 30天 | 30天 |

### 3.3 State 参数防 CSRF

每次授权请求必须携带 `state` 参数，子系统需验证回调时的 `state` 是否与发起时一致。

**State 生成规则：**
- 32字节随机字符串
- 十六进制编码
- 单次有效

### 3.4 安全最佳实践

1. **HTTPS 强制**：生产环境必须使用 HTTPS
2. **redirect_uri 严格验证**：必须完全匹配注册的回调地址
3. **Token 安全存储**：前端使用 localStorage 或 sessionStorage
4. **定期刷新令牌**：使用 refresh_token 刷新 access_token
5. **敏感操作二次验证**：重要操作需重新认证

---

## 4. 配置参数详解

### 4.1 主系统配置

#### 后端环境变量 (`.env`)

```env
# 服务器配置
PORT=3001
NODE_ENV=production

# 前端URL
FRONTEND_URL=https://dashhub.insfair.cn

# JWT 配置
JWT_SECRET=your-production-jwt-secret-at-least-32-characters
JWT_EXPIRES_IN=7d

# OAuth 配置
OAUTH_CODE_EXPIRES=600           # 授权码有效期（秒）
OAUTH_ACCESS_TOKEN_EXPIRES=7200  # 访问令牌有效期（秒）
OAUTH_REFRESH_TOKEN_EXPIRES=2592000  # 刷新令牌有效期（秒）
```

#### CORS 配置 (`backend/src/index.js`)

```javascript
const allowedOrigins = [
  'https://dashhub.insfair.cn',     // 主系统前端
  'https://cehua.insfair.cn',       // 子系统前端
];
```

#### 数据库配置

```sql
-- OAuth 客户端表
CREATE TABLE oauth_clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id VARCHAR(100) NOT NULL UNIQUE,
  client_secret VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  redirect_uris TEXT NOT NULL,
  scopes TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OAuth 授权码表
CREATE TABLE oauth_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(255) NOT NULL UNIQUE,
  client_id VARCHAR(100) NOT NULL,
  user_id INT NOT NULL,
  redirect_uri VARCHAR(500) NOT NULL,
  scopes TEXT,
  expires_at TIMESTAMP NOT NULL,
  used TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OAuth 令牌表
CREATE TABLE oauth_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  access_token VARCHAR(255) NOT NULL UNIQUE,
  refresh_token VARCHAR(255) NOT NULL UNIQUE,
  client_id VARCHAR(100) NOT NULL,
  user_id INT NOT NULL,
  scopes TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 子系统配置

#### 后端环境变量 (`.env.production`)

```env
# 应用配置
PORT=3000
NODE_ENV=production

# JWT 配置
JWT_SECRET=your-production-jwt-secret-at-least-32-characters
JWT_EXPIRES_IN=7d

# OAuth 配置 (主系统 DashHub)
OAUTH_CLIENT_ID=business-planner
OAUTH_CLIENT_SECRET=bp-secret-key-2026-change-in-production
OAUTH_AUTH_URL=https://dashhub.insfair.cn/oauth/authorize
OAUTH_TOKEN_URL=https://dashhub.insfair.cn/oauth/token
OAUTH_USERINFO_URL=https://dashhub.insfair.cn/oauth/userinfo
OAUTH_REDIRECT_URI=https://cehua.insfair.cn/auth/callback
```

#### 前端环境变量 (`.env.production`)

```env
VITE_API_BASE_URL=
```

### 4.3 客户端注册信息

| 字段 | 值 |
|------|-----|
| client_id | business-planner |
| client_secret | bp-secret-key-2026-change-in-production |
| name | 商业策划机 |
| redirect_uris | ["https://cehua.insfair.cn/auth/callback"] |
| scopes | ["openid", "profile", "email"] |

---

## 5. 客户端集成指南

### 5.1 接入前准备

1. 在主系统数据库注册客户端信息
2. 配置子系统环境变量
3. 确保网络可达（CORS配置）

### 5.2 后端集成

#### 5.2.1 创建 OAuth 模块

```typescript
// oauth.module.ts
import { Module } from '@nestjs/common';
import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';

@Module({
  controllers: [OAuthController],
  providers: [OAuthService],
  exports: [OAuthService],
})
export class OAuthModule {}
```

#### 5.2.2 实现 OAuth 服务

```typescript
// oauth.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class OAuthService {
  private readonly oauthConfig = {
    clientId: this.configService.get<string>('oauth.clientId'),
    clientSecret: this.configService.get<string>('oauth.clientSecret'),
    authorizationUrl: this.configService.get<string>('oauth.authUrl'),
    tokenUrl: this.configService.get<string>('oauth.tokenUrl'),
    userInfoUrl: this.configService.get<string>('oauth.userinfoUrl'),
    redirectUri: this.configService.get<string>('oauth.redirectUri'),
  };

  constructor(private configService: ConfigService) {}

  generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.oauthConfig.clientId,
      redirect_uri: this.oauthConfig.redirectUri,
      scope: 'openid profile email',
      state: state,
    });
    return `${this.oauthConfig.authorizationUrl}?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string) {
    const response = await axios.post(this.oauthConfig.tokenUrl, {
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.oauthConfig.redirectUri,
      client_id: this.oauthConfig.clientId,
      client_secret: this.oauthConfig.clientSecret,
    });
    return response.data;
  }

  async getUserInfo(accessToken: string) {
    const response = await axios.get(this.oauthConfig.userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  }
}
```

#### 5.2.3 实现 OAuth 控制器

```typescript
// oauth.controller.ts
import { Controller, Get, Query, Res, Session } from '@nestjs/common';
import { Response } from 'express';
import { OAuthService } from './oauth.service';

@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get('authorize')
  authorize(@Session() session: any, @Res() res: Response) {
    const state = this.oauthService.generateState();
    session.oauthState = state;
    const authUrl = this.oauthService.getAuthorizationUrl(state);
    res.redirect(authUrl);
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Session() session: any,
  ) {
    if (state !== session.oauthState) {
      throw new Error('Invalid state');
    }

    const tokenResponse = await this.oauthService.exchangeCodeForToken(code);
    const userInfo = await this.oauthService.getUserInfo(tokenResponse.access_token);
    
    // 创建或更新本地用户，生成本地令牌
    // ...

    return { user: userInfo, token: localToken };
  }
}
```

### 5.3 前端集成

#### 5.3.1 创建 OAuth 服务

```typescript
// oauth.ts
export const oauthApi = {
  authorize() {
    window.location.href = '/api/oauth/authorize';
  },
};
```

#### 5.3.2 登录页面集成

```vue
<template>
  <button @click="handleOAuthLogin">使用 DashHub 一键登录</button>
</template>

<script setup>
import { oauthApi } from '@/services/oauth';

const handleOAuthLogin = () => {
  oauthApi.authorize();
};
</script>
```

#### 5.3.3 回调页面处理

```vue
<template>
  <div>正在登录...</div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  const code = route.query.code as string;
  const state = route.query.state as string;

  try {
    const response = await fetch(`/api/oauth/callback?code=${code}&state=${state}`);
    const data = await response.json();
    
    authStore.setToken(data.token);
    authStore.setUser(data.user);
    
    router.push('/');
  } catch (error) {
    console.error('OAuth callback failed:', error);
    router.push('/login');
  }
});
</script>
```

### 5.4 请求头规范

| 请求类型 | Header | 值 |
|----------|--------|-----|
| 令牌请求 | Content-Type | application/json |
| 用户信息请求 | Authorization | Bearer {access_token} |
| API 请求 | Authorization | Bearer {local_token} |

### 5.5 错误码说明

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| invalid_request | 请求参数缺失或无效 | 检查请求参数 |
| invalid_client | 客户端认证失败 | 检查 client_id 和 client_secret |
| invalid_grant | 授权码无效或过期 | 重新发起授权请求 |
| unauthorized_client | 客户端无权使用此授权类型 | 检查客户端配置 |
| unsupported_response_type | 不支持的响应类型 | 使用 code |
| invalid_scope | 请求的权限范围无效 | 检查 scope 参数 |
| server_error | 服务器内部错误 | 联系管理员 |

---

## 6. 代码示例

### 6.1 完整后端实现示例

参见子系统代码：
- `backend/src/modules/oauth/oauth.module.ts`
- `backend/src/modules/oauth/oauth.service.ts`
- `backend/src/modules/oauth/oauth.controller.ts`

### 6.2 完整前端实现示例

参见子系统代码：
- `frontend/src/services/oauth.ts`
- `frontend/src/views/Login.vue`
- `frontend/src/views/OAuthCallback.vue`

### 6.3 主系统授权页面示例

参见主系统代码：
- `frontend/src/views/OAuthAuthorize.vue`

---

## 7. 故障排除指南

### 7.1 常见问题

#### 问题 1：点击一键登录后跳转到错误地址

**症状：** 跳转到 `http://localhost:3001` 或子系统自己的地址

**原因：** 环境变量未正确加载

**解决方案：**
1. 检查 `.env.production` 文件是否存在
2. 确认 `NODE_ENV=production` 已设置
3. 检查配置默认值是否正确

#### 问题 2：授权后参数丢失

**症状：** 授权页面显示空白或缺少授权信息

**原因：** 登录跳转时查询参数丢失

**解决方案：**
1. 确保 redirect 参数包含完整查询字符串
2. 检查登录成功后的重定向逻辑

#### 问题 3：CORS 错误

**症状：** 控制台显示 CORS 相关错误

**原因：** 主系统未配置子系统域名

**解决方案：**
在主系统 `backend/src/index.js` 中添加子系统域名：
```javascript
const allowedOrigins = [
  'https://dashhub.insfair.cn',
  'https://cehua.insfair.cn',  // 添加子系统域名
];
```

#### 问题 4：invalid_client 错误

**症状：** 返回 `{"error": "invalid_client"}`

**原因：** 客户端未注册或配置错误

**解决方案：**
1. 检查数据库 `oauth_clients` 表中是否有该客户端
2. 确认 `client_id` 和 `client_secret` 正确

#### 问题 5：invalid_redirect_uri 错误

**症状：** 返回 `{"error": "invalid_redirect_uri"}`

**原因：** 回调地址未注册

**解决方案：**
更新数据库中的 `redirect_uris`：
```sql
UPDATE oauth_clients 
SET redirect_uris = '["https://cehua.insfair.cn/auth/callback"]'
WHERE client_id = 'business-planner';
```

### 7.2 调试技巧

1. **检查后端日志**
   ```bash
   pm2 logs
   # 或
   journalctl -u your-service -f
   ```

2. **检查网络请求**
   - 打开浏览器开发者工具
   - 查看 Network 标签
   - 关注 302 重定向和请求参数

3. **验证配置加载**
   - 添加日志输出配置值
   - 确认环境变量正确读取

---

## 8. 版本历史与更新

### v1.0.0 (2026-03-21)

**初始版本**
- 实现 OAuth 2.0 授权码流程
- 支持 JWT 令牌
- 支持用户信息同步

### v1.1.0 (2026-03-22)

**功能增强**
- 添加开发/生产环境配置分离
- 优化错误提示信息（中文）
- 修复授权参数丢失问题

### v1.2.0 (2026-03-24)

**生产环境适配**
- 修复硬编码 localhost 地址问题
- 优化配置加载逻辑
- 添加调试日志

---

## 附录

### A. 相关文件清单

#### 主系统

| 文件 | 说明 |
|------|------|
| `backend/src/controllers/oauthController.js` | OAuth 控制器 |
| `backend/src/models/OAuth.js` | OAuth 数据模型 |
| `backend/src/routes/oauth.js` | OAuth 路由 |
| `frontend/src/views/OAuthAuthorize.vue` | 授权确认页面 |

#### 子系统

| 文件 | 说明 |
|------|------|
| `backend/src/modules/oauth/oauth.module.ts` | OAuth 模块 |
| `backend/src/modules/oauth/oauth.service.ts` | OAuth 服务 |
| `backend/src/modules/oauth/oauth.controller.ts` | OAuth 控制器 |
| `frontend/src/services/oauth.ts` | OAuth 前端服务 |
| `frontend/src/views/OAuthCallback.vue` | 回调处理页面 |

### B. 参考链接

- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [JWT.io](https://jwt.io/)

---

*文档最后更新：2026-03-24*

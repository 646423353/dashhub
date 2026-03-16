import request from './request';

// 认证相关
export const authApi = {
  // 发送验证码
  sendCode: (email, type) =>
    request.post('/auth/send-code', { email, type }),

  // 注册
  register: (data) =>
    request.post('/auth/register', data),

  // 登录
  login: (email, password) =>
    request.post('/auth/login', { email, password }),

  // 重置密码
  resetPassword: (email, code, newPassword) =>
    request.post('/auth/reset-password', { email, code, newPassword }),

  // 获取当前用户信息
  getMe: () =>
    request.get('/auth/me')
};

// 项目相关
export const projectApi = {
  // 获取首页项目
  getHomeProjects: (page = 1) =>
    request.get('/projects/home', { params: { page } }),

  // 获取项目详情
  getProjectById: (id) =>
    request.get(`/projects/${id}`),

  // 访问项目（跳转）
  visitProject: (id) =>
    request.get(`/projects/${id}/visit`),

  // 创建项目
  createProject: (data) =>
    request.post('/projects', data),

  // 更新项目
  updateProject: (id, data) =>
    request.put(`/projects/${id}`, data),

  // 删除项目
  deleteProject: (id) =>
    request.delete(`/projects/${id}`),

  // 获取我的项目
  getMyProjects: () =>
    request.get('/projects/my'),

  // 按类型获取项目
  getProjectsByType: (type, page = 1) =>
    request.get(`/projects/type/${type}`, { params: { page } }),

  // 更新项目统计数据
  updateProjectStats: (id, stats) =>
    request.put(`/projects/${id}/stats`, stats)
};

// 用户相关
export const userApi = {
  // 获取用户资料
  getUserProfile: (id) =>
    request.get(`/users/${id}`),

  // 更新个人资料
  updateProfile: (data) =>
    request.put('/users/me', data),

  // 更新头像
  updateAvatar: (avatar) =>
    request.put('/users/me/avatar', { avatar }),

  // 获取所有用户
  getAllUsers: (page = 1, limit = 20) =>
    request.get('/users', { params: { page, limit } })
};

// 搜索相关
export const searchApi = {
  // 搜索项目
  searchProjects: (query, page = 1) =>
    request.get('/search/projects', { params: { q: query, page } }),

  // 获取热门搜索
  getTrending: () =>
    request.get('/search/trending'),

  // 获取搜索历史
  getHistory: () =>
    request.get('/search/history'),

  // 清除搜索历史
  clearHistory: () =>
    request.delete('/search/history')
};

// 上传相关
export const uploadApi = {
  // 上传文件
  upload: (formData) => {
    return request.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default {
  auth: authApi,
  project: projectApi,
  user: userApi,
  search: searchApi,
  upload: uploadApi
};

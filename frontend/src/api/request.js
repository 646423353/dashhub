import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const apiBase = import.meta.env.VITE_API_BASE || '/api';

const request = axios.create({
  baseURL: apiBase,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从 store 获取 token
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
        case 403:
        case 404:
        case 500:
          console.error(`HTTP ${status}:`, data.message);
          break;
      }

      return Promise.reject(data);
    } else if (error.request) {
      console.error('No response:', error.message);
      return Promise.reject({ success: false, message: '网络错误，请检查网络连接' });
    } else {
      console.error('Request setup error:', error.message);
      return Promise.reject({ success: false, message: error.message });
    }
  }
);

export default request;

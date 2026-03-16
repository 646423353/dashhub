import { defineStore } from 'pinia';
import { authApi, userApi } from '@/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('dashhub_token') || null,
    user: JSON.parse(localStorage.getItem('dashhub_user')) || null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userEmail: (state) => state.user?.email || '',
    userName: (state) => state.user?.username || '',
    userAvatar: (state) => state.user?.avatar || ''
  },

  actions: {
    setToken(token) {
      this.token = token;
      localStorage.setItem('dashhub_token', token);
    },

    setUser(user) {
      this.user = user;
      localStorage.setItem('dashhub_user', JSON.stringify(user));
    },

    async sendCode(email, type) {
      const response = await authApi.sendCode(email, type);
      return response;
    },

    async register(data) {
      const response = await authApi.register(data);
      this.setToken(response.token);
      this.setUser(response.user);
      return response;
    },

    async login(email, password) {
      const response = await authApi.login(email, password);
      this.setToken(response.token);
      this.setUser(response.user);
      return response;
    },

    async resetPassword(email, code, newPassword) {
      const response = await authApi.resetPassword(email, code, newPassword);
      return response;
    },

    async fetchUser() {
      if (!this.token) return null;
      const response = await authApi.getMe();
      this.setUser(response.user);
      return response.user;
    },

    async updateProfile(data) {
      const response = await authApi.updateProfile(data);
      // Update local user data
      if (response.data) {
        this.user = { ...this.user, ...response.data };
        localStorage.setItem('dashhub_user', JSON.stringify(this.user));
      }
      return response;
    },

    async updateUserAvatar(avatar) {
      const response = await userApi.updateAvatar(avatar);
      // Update local user data
      if (response.data) {
        this.user = { ...this.user, ...response.data };
        localStorage.setItem('dashhub_user', JSON.stringify(this.user));
      }
      return response;
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('dashhub_token');
      localStorage.removeItem('dashhub_user');
    }
  }
});

import { defineStore } from 'pinia';
import { projectApi } from '@/api';

export const useProjectStore = defineStore('project', {
  state: () => ({
    homeProjects: {
      pinned: [],
      hot: [],
      hasMore: false,
      currentPage: 1
    },
    currentProject: null,
    myProjects: [],
    projectsByType: {},
    loading: false
  }),

  getters: {
    hasProjects: (state) =>
      state.homeProjects.pinned.length > 0 || state.homeProjects.hot.length > 0,
    allHomeProjects: (state) => [
      ...state.homeProjects.pinned,
      ...state.homeProjects.hot
    ]
  },

  actions: {
    setLoading(loading) {
      this.loading = loading;
    },

    async fetchHomeProjects(page = 1) {
      this.setLoading(true);
      try {
        const response = await projectApi.getHomeProjects(page);
        if (page === 1) {
          this.homeProjects.pinned = response.data.pinned;
          this.homeProjects.hot = response.data.hot;
        } else {
          this.homeProjects.hot.push(...response.data.hot);
        }
        this.homeProjects.hasMore = response.pagination.hasMore;
        this.homeProjects.currentPage = page;
        return response;
      } catch (error) {
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    async fetchProjectById(id) {
      this.setLoading(true);
      try {
        const response = await projectApi.getProjectById(id);
        this.currentProject = response.data;
        return response;
      } catch (error) {
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    async visitProject(id) {
      window.open(`${import.meta.env.VITE_API_URL || ''}/api/projects/${id}/visit`, '_blank');
    },

    async createProject(data) {
      this.setLoading(true);
      try {
        const response = await projectApi.createProject(data);
        await this.fetchMyProjects();
        return response;
      } catch (error) {
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    async updateProject(id, data) {
      this.setLoading(true);
      try {
        const response = await projectApi.updateProject(id, data);
        if (this.currentProject?.id === id) {
          this.currentProject = response.data;
        }
        await this.fetchMyProjects();
        return response;
      } catch (error) {
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    async deleteProject(id) {
      this.setLoading(true);
      try {
        const response = await projectApi.deleteProject(id);
        this.myProjects = this.myProjects.filter(p => p.id !== id);
        return response;
      } catch (error) {
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    async fetchMyProjects() {
      this.setLoading(true);
      try {
        const response = await projectApi.getMyProjects();
        this.myProjects = response.data;
        return response;
      } catch (error) {
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    async fetchProjectsByType(type, page = 1) {
      this.setLoading(true);
      try {
        const response = await projectApi.getProjectsByType(type, page);

        // 获取老数据并强制拷贝出一个全新的对象以确保 Vue Store 反应机制100%触发
        const oldState = this.projectsByType[type] || { list: [], hasMore: false, currentPage: 1 };
        const newList = page === 1 ? response.data : [...oldState.list, ...response.data];

        const nextState = {
          ...this.projectsByType,
          [type]: {
            list: newList,
            hasMore: response.pagination.hasMore,
            currentPage: page
          }
        };

        // 彻底覆盖根对象
        this.projectsByType = nextState;

        return response;
      } catch (error) {
        console.error('Fetch projects by type error:', error);
        throw error;
      } finally {
        this.setLoading(false);
      }
    }
  }
});

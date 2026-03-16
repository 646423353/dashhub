import { defineStore } from 'pinia';
import { searchApi } from '@/api';

export const useSearchStore = defineStore('search', {
  state: () => ({
    results: [],
    trending: [],
    history: [],
    loading: false,
    hasMore: false,
    currentPage: 1,
    currentQuery: ''
  }),

  actions: {
    setLoading(loading) {
      this.loading = loading;
    },

    async searchProjects(query, page = 1) {
      this.setLoading(true);
      try {
        const response = await searchApi.searchProjects(query, page);
        if (page === 1) {
          this.results = response.data;
        } else {
          this.results.push(...response.data);
        }
        this.hasMore = response.meta.hasMore;
        this.currentPage = page;
        this.currentQuery = query;
        return response;
      } catch (error) {
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    async fetchTrending() {
      try {
        const response = await searchApi.getTrending();
        this.trending = response.data;
        return response;
      } catch (error) {
        throw error;
      }
    },

    async fetchHistory() {
      try {
        const response = await searchApi.getHistory();
        this.history = response.data;
        return response;
      } catch (error) {
        throw error;
      }
    },

    async clearHistory() {
      try {
        const response = await searchApi.clearHistory();
        this.history = [];
        return response;
      } catch (error) {
        throw error;
      }
    },

    clearResults() {
      this.results = [];
      this.hasMore = false;
      this.currentPage = 1;
      this.currentQuery = '';
    }
  }
});

<template>
  <div class="min-h-screen bg-gray-50/50">
    <Navbar />

    <div class="container-responsive py-10">
      <!-- 搜索输入 -->
      <div class="max-w-2xl mx-auto mb-10 fade-in">
        <el-input
          ref="searchInputRef"
          v-model="searchQuery"
          placeholder="搜索项目名称、描述或类型..."
          size="large"
          :prefix-icon="SearchIcon"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch" class="cursor-pointer">
              搜索
            </el-button>
          </template>
        </el-input>

        <!-- 热门搜索 -->
        <div v-if="trending.length > 0" class="mt-5">
          <p class="text-sm text-gray-400 mb-2.5 font-medium">热门搜索</p>
          <div class="flex flex-wrap gap-2">
            <el-tag
              v-for="item in trending"
              :key="item"
              @click="searchWithTrending(item)"
              class="cursor-pointer hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-all duration-200"
            >
              {{ item }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-if="hasSearched" class="max-w-6xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">
            搜索结果 <span v-if="results.length > 0" class="text-gray-400 font-normal text-base">({{ results.length }}个)</span>
          </h2>
          <el-button
            v-if="hasMore && !loading"
            @click="loadMore"
            text
            class="cursor-pointer"
          >
            加载更多
          </el-button>
        </div>

        <div v-if="loading && results.length === 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="i in 4" :key="i" class="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <div class="skeleton h-44"></div>
            <div class="p-5 space-y-3">
              <div class="skeleton h-4 w-3/4 rounded"></div>
              <div class="skeleton h-3 w-1/2 rounded"></div>
            </div>
          </div>
        </div>

        <div v-else-if="results.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ProjectCard
            v-for="project in results"
            :key="project.id"
            :project="project"
          />
        </div>

        <div v-else class="empty-state">
          <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <el-icon class="text-3xl text-gray-300"><SearchIcon /></el-icon>
          </div>
          <p class="empty-state-text">未找到相关项目</p>
          <p class="text-gray-400 text-sm mt-2">试试其他关键词</p>
        </div>
      </div>

      <!-- 初始状态 -->
      <div v-else class="text-center py-20 fade-in">
        <div class="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <el-icon class="text-4xl text-primary-400"><SearchIcon /></el-icon>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">搜索项目</h2>
        <p class="text-gray-500">输入关键词，发现更多优质项目</p>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSearchStore } from '@/stores/search';
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
import ProjectCard from '@/components/ProjectCard.vue';
import { Search as SearchIcon } from '@element-plus/icons-vue';

const searchStore = useSearchStore();

const searchInputRef = ref(null);
const searchQuery = ref(searchStore.currentQuery || '');
const hasSearched = ref(searchStore.results.length > 0 || searchStore.loading);
const currentPage = ref(searchStore.currentPage || 1);

const results = computed(() => searchStore.results);
const trending = computed(() => searchStore.trending);
const hasMore = computed(() => searchStore.hasMore);
const loading = computed(() => searchStore.loading);

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return;

  hasSearched.value = true;
  currentPage.value = 1;
  await searchStore.searchProjects(searchQuery.value.trim(), currentPage.value);
};

const searchWithTrending = (keyword) => {
  searchQuery.value = keyword;
  handleSearch();
};

const loadMore = async () => {
  if (!hasMore.value || loading.value) return;
  currentPage.value++;
  await searchStore.searchProjects(searchStore.currentQuery, currentPage.value);
};

onMounted(async () => {
  // 自动聚焦搜索框
  if (searchInputRef.value) {
    searchInputRef.value.focus();
  }
  await searchStore.fetchTrending();
});
</script>

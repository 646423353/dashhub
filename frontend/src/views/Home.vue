<template>
  <div class="min-h-screen bg-gray-50/50">
    <Navbar />

    <!-- 商业榜单入口 Hero -->
    <section class="relative bg-gray-900 overflow-hidden border-b border-gray-800">
      <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 opacity-80 z-0"></div>
      
      <!-- 发光装饰 -->
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-primary-500 rounded-full blur-[120px] opacity-20 z-0 pointer-events-none"></div>
      
      <div class="container-responsive py-16 md:py-24 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <!-- 左侧：文字介绍 -->
          <div class="text-center lg:text-left fade-in">
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
              发现<span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">平台实力</span>最强的项目
            </h1>
            <p class="text-lg md:text-xl text-gray-400 leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
              最新最权威的流量厂牌与 AI Agent 协作热度榜单。数据透明，直连合作伙伴。发现平台最具实力的项目方。
            </p>
            <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <router-link to="/leaderboard" class="bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/30 flex items-center">
                <el-icon class="mr-2 text-xl"><Trophy /></el-icon> 查看权威排行榜
              </router-link>
              <router-link to="/search" class="bg-white/10 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/20 flex items-center">
                搜索项目
              </router-link>
            </div>
          </div>

          <!-- 右侧：冠亚军卡片预览 -->
          <div class="relative w-full h-[340px] hidden md:block fade-in-delay-1">
            <!-- 总榜首位 -->
            <div
              class="absolute top-0 right-10 w-72 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col z-20 transform hover:-translate-y-2 transition-transform cursor-pointer"
              @click="topTotal ? $router.push('/project/'+topTotal.id) : $router.push('/leaderboard')"
            >
              <div class="flex items-center justify-between mb-4">
                <span class="bg-yellow-400/20 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-yellow-400/30">平台实力 TOP 1</span>
                <el-icon class="text-yellow-400/60"><Trophy /></el-icon>
              </div>
              <template v-if="topTotal">
                <div class="flex items-center gap-4 mb-4">
                  <img v-if="topTotal.logo" :src="topTotal.logo" class="w-16 h-16 rounded-xl object-cover ring-1 ring-white/10" />
                  <div v-else class="w-16 h-16 rounded-xl bg-gray-800 flex items-center justify-center text-white text-xl font-bold border border-white/10">{{ topTotal.name.charAt(0).toUpperCase() }}</div>
                  <div>
                    <h3 class="text-white font-bold text-lg leading-tight mb-1">{{ topTotal.name }}</h3>
                    <span class="text-gray-400 text-xs font-medium">{{ topTotal.creator_username }}</span>
                  </div>
                </div>
                <div class="mt-auto">
                  <div class="text-xs text-gray-400 uppercase tracking-widest mb-1">累计协作规模</div>
                  <div class="text-2xl font-black text-white">¥{{ formatNumber(topTotal.total_revenue_share_amount) }}</div>
                </div>
              </template>
              <template v-else>
                <div class="flex items-center gap-4 mb-4">
                  <div class="w-16 h-16 rounded-xl bg-gray-700 animate-pulse"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
                    <div class="h-3 bg-gray-700 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
                <div class="mt-auto text-gray-500 text-sm">加载中...</div>
              </template>
            </div>

            <!-- 飙升首位 -->
            <div
              class="absolute bottom-0 left-0 w-72 bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col z-10 transform scale-95 hover:scale-100 transition-transform cursor-pointer"
              @click="topRising ? $router.push('/project/'+topRising.id) : $router.push('/leaderboard')"
            >
              <div class="flex items-center justify-between mb-4">
                <span class="bg-primary-500/20 text-primary-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-primary-500/30">本周新星 TOP 1</span>
                <el-icon class="text-primary-400/60"><Promotion /></el-icon>
              </div>
              <template v-if="topRising">
                <div class="flex items-center gap-4 mb-4">
                  <img v-if="topRising.logo" :src="topRising.logo" class="w-14 h-14 rounded-xl object-cover ring-1 ring-white/10" />
                  <div v-else class="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center text-white text-lg font-bold border border-white/10">{{ topRising.name.charAt(0).toUpperCase() }}</div>
                  <div>
                    <h3 class="text-white font-bold text-base leading-tight mb-1">{{ topRising.name }}</h3>
                    <span class="text-gray-400 text-xs font-medium">{{ topRising.creator_username }}</span>
                  </div>
                </div>
                <div class="mt-auto">
                  <div class="text-xs text-gray-400 uppercase tracking-widest mb-1">近七日新增协作</div>
                  <div class="text-xl font-black text-white">¥{{ formatNumber(topRising.weekly_revenue_share_amount) }}</div>
                </div>
              </template>
              <template v-else>
                <div class="flex items-center gap-4 mb-4">
                  <div class="w-14 h-14 rounded-xl bg-gray-700 animate-pulse"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
                    <div class="h-3 bg-gray-700 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
                <div class="text-gray-500 text-sm">加载中...</div>
              </template>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- 项目类型筛选 -->
    <section class="py-6 bg-white border-b border-gray-100/80">
      <div class="container-responsive">
        <div class="flex flex-wrap justify-center gap-3">
          <button
            v-for="type in projectTypes"
            :key="type.value"
            @click="filterByType(type.value)"
            :class="[
              'px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
              selectedType === type.value
                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            ]"
          >
            {{ type.label }}
          </button>
          <button
            @click="filterByType(null)"
            :class="[
              'px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
              selectedType === null
                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            ]"
          >
            全部
          </button>
        </div>
      </div>
    </section>

    <!-- 推荐项目 -->
    <section v-if="pinnedProjects.length > 0 && selectedType === null" class="py-10">
      <div class="container-responsive">
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
            <el-icon class="text-primary-600"><Star /></el-icon>
          </div>
          <h2 class="text-xl font-bold text-gray-900">推荐项目</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ProjectCard
            v-for="project in pinnedProjects"
            :key="project.id"
            :project="project"
          />
        </div>
      </div>
    </section>

    <!-- 热门项目 / 分类搜索结果 -->
    <section class="py-10 pb-16">
      <div class="container-responsive">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <el-icon class="text-orange-500"><TrendCharts /></el-icon>
            </div>
            <h2 class="text-xl font-bold text-gray-900">
              {{ selectedType ? (projectTypes.find(t => t.value === selectedType)?.label || '') + '项目' : '热门项目' }}
            </h2>
          </div>
          <el-button
            v-if="hasMore"
            @click="loadMore"
            :loading="projectStore.loading"
            text
            class="cursor-pointer"
          >
            加载更多
          </el-button>
        </div>

        <!-- 加载中骨架屏 -->
        <div v-if="projectStore.loading && (hotProjects.length === 0 || isFiltering)" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="i in 4" :key="i" class="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <div class="skeleton h-44"></div>
            <div class="p-5 space-y-3">
              <div class="flex items-center space-x-3">
                <div class="skeleton w-11 h-11 rounded-xl"></div>
                <div class="flex-1 space-y-2">
                  <div class="skeleton h-4 w-3/4 rounded"></div>
                  <div class="skeleton h-3 w-1/2 rounded"></div>
                </div>
              </div>
              <div class="skeleton h-3 w-full rounded"></div>
              <div class="skeleton h-3 w-2/3 rounded"></div>
              <div class="grid grid-cols-2 gap-2 mt-4">
                <div class="skeleton h-14 rounded-xl"></div>
                <div class="skeleton h-14 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="hotProjects.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ProjectCard
            v-for="project in hotProjects"
            :key="project.id"
            :project="project"
          />
        </div>

        <div v-else class="empty-state">
          <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <el-icon class="text-3xl text-gray-300"><Box /></el-icon>
          </div>
          <p class="empty-state-text">该分类暂无项目</p>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useProjectStore } from '@/stores/project';
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
import ProjectCard from '@/components/ProjectCard.vue';
import { Star, TrendCharts, Box, Trophy, Promotion } from '@element-plus/icons-vue';
import axios from 'axios';

const router = useRouter();
const authStore = useAuthStore();
const projectStore = useProjectStore();
const { projectsByType, homeProjects } = storeToRefs(projectStore);

const selectedType = ref(null);
const currentPage = ref(1);
const typeCurrentPage = ref(1);
const isFiltering = ref(false);

const projectTypes = [
  { label: '品牌商', value: 'brand' },
  { label: '流量厂牌', value: 'traffic' },
  { label: 'AI Agent', value: 'ai_agent' }
];

const pinnedProjects = computed(() => homeProjects.value.pinned);

// 如果选择了分类，则使用该分类的数据；否则使用首页的热门数据
const hotProjects = computed(() => {
  if (selectedType.value) {
    return projectsByType.value[selectedType.value]?.list || [];
  }
  return homeProjects.value.hot || [];
});

const hasMore = computed(() => {
  if (selectedType.value) {
    return projectsByType.value[selectedType.value]?.hasMore || false;
  }
  return homeProjects.value.hasMore;
});

const filterByType = async (type) => {
  if (selectedType.value === type) return; // 重复点击防抖
  
  isFiltering.value = true;
  selectedType.value = type;
  
  try {
    if (type === null) {
      // 选回“全部”，重置回首页热门逻辑
      currentPage.value = 1;
      await projectStore.fetchHomeProjects(1);
    } else {
      // 拉取特定分类数据的第一页
      typeCurrentPage.value = 1;
      // 在获取新数据前清空目标类型的旧数据以防闪烁
      if (projectsByType.value[type]) {
        projectStore.projectsByType = {
          ...projectsByType.value,
          [type]: {
            ...projectsByType.value[type],
            list: []
          }
        };
      }
      await projectStore.fetchProjectsByType(type, 1);
    }
  } finally {
    isFiltering.value = false;
  }
};

const loadMore = async () => {
  if (projectStore.loading || !hasMore.value) return;
  
  if (selectedType.value) {
    typeCurrentPage.value++;
    await projectStore.fetchProjectsByType(selectedType.value, typeCurrentPage.value);
  } else {
    currentPage.value++;
    await projectStore.fetchHomeProjects(currentPage.value);
  }
};

const topTotal = ref(null);
const topRising = ref(null);

const formatNumber = (num) => {
  if (!num) return '0';
  const floatNum = parseFloat(num) || 0;
  if (floatNum >= 10000) {
    return (floatNum / 10000).toFixed(1) + 'W';
  }
  return floatNum.toLocaleString();
};

const fetchTopProjects = async () => {
  try {
    const resTotal = await axios.get('http://localhost:3001/api/projects/leaderboard/total?limit=1');
    if (resTotal.data.success && resTotal.data.data.length > 0) {
      topTotal.value = resTotal.data.data[0];
    }
    const resRising = await axios.get('http://localhost:3001/api/projects/leaderboard/rising?limit=1');
    if (resRising.data.success && resRising.data.data.length > 0) {
      topRising.value = resRising.data.data[0];
    }
  } catch (error) {
    console.error('Failed to fetch top projects for hero section', error);
  }
};

onMounted(async () => {
  await projectStore.fetchHomeProjects();
  await fetchTopProjects();
});
</script>

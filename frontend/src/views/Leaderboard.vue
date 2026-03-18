<template>
  <div class="min-h-screen bg-gray-50/50">
    <Navbar />

    <!-- 顶部 Banner 区域 -->
    <div class="bg-gray-900 overflow-hidden relative border-b border-gray-800">
      <div class="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 opacity-90"></div>
      <!-- 发光装饰圈 -->
      <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
      
      <div class="container-responsive py-16 md:py-20 relative z-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-10">
        <div class="max-w-xl">
           <h1 class="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">DashHub 权威排行榜</h1>
           <p class="text-gray-400 text-lg leading-relaxed">最新最权威的平台协作实力榜单，基于真实数据自动生成。快速发现平台最具影响力的顶级项目。</p>
        </div>
        <div class="hidden md:flex gap-4">
           <div class="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 backdrop-blur text-center w-36">
             <div class="text-primary-400 text-3xl font-black mb-1">Top 100+</div>
             <div class="text-gray-500 text-xs font-bold uppercase tracking-widest">认证项目</div>
           </div>
           <div class="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 backdrop-blur text-center w-36">
             <div class="text-emerald-400 text-3xl font-black mb-1">亿级</div>
             <div class="text-gray-500 text-xs font-bold uppercase tracking-widest">分账流水跑通</div>
           </div>
        </div>
      </div>
    </div>

    <div class="container-responsive py-10 fade-in">
      <!-- 路由切换 Tabs -->
      <div class="flex flex-wrap items-center gap-3 mb-10 border-b border-gray-200/60 pb-5">
        <button 
          class="px-6 py-2.5 rounded-full font-bold transition-all"
          :class="activeTab === 'total' ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-200/60'"
          @click="activeTab = 'total'"
        >
          🏆 平台实力排行榜
        </button>
        <button 
          class="px-6 py-2.5 rounded-full font-bold transition-all"
          :class="activeTab === 'rising' ? 'bg-primary-50 text-primary-700 shadow-md border-primary-200' : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-200/60'"
          @click="activeTab = 'rising'"
        >
          🚀 快速上升新星榜 (周)
        </button>
      </div>

      <!-- 载入中 -->
      <div v-if="loading" class="py-20 flex justify-center items-center">
        <el-icon class="is-loading text-4xl text-primary-600"><Loading /></el-icon>
      </div>
      
      <!-- 排行榜清单容器 -->
      <div v-else class="space-y-4">
        <!-- 循环卡片 -->
        <div v-for="(project, index) in currentList" :key="project.id" 
             class="group bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100 hover:border-gray-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-all cursor-pointer relative overflow-hidden"
             @click="viewProject(project.id)">
             
          <!-- 靠前名次的绶带/高光背板 -->
          <div v-if="index === 0" class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-400/20 to-transparent pointer-events-none"></div>
          <div v-if="index === 1" class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gray-300/20 to-transparent pointer-events-none"></div>
          <div v-if="index === 2" class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-700/10 to-transparent pointer-events-none"></div>

          <div class="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <!-- 排名数字 -->
            <div class="w-12 h-12 flex items-center justify-center flex-shrink-0">
               <span v-if="index === 0" class="text-4xl text-yellow-400 font-black drop-shadow-sm">1</span>
               <span v-else-if="index === 1" class="text-4xl text-gray-400 font-black drop-shadow-sm">2</span>
               <span v-else-if="index === 2" class="text-4xl text-amber-700/80 font-black drop-shadow-sm">3</span>
               <span v-else class="text-2xl text-gray-300 font-bold">{{ index + 1 }}</span>
            </div>

            <!-- Logo -->
            <img v-if="project.logo" :src="$assetUrl(project.logo)" class="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover ring-1 ring-gray-100 shadow-sm" />
            <div v-else class="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {{ project.name.charAt(0).toUpperCase() }}
            </div>

            <!-- 项目核心信息汇总 -->
            <div class="flex-1 text-center md:text-left">
               <div class="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                  <h3 class="text-xl font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors">{{ project.name }}</h3>
                  <div v-if="project.use_dashtro" class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase">Dashtro</div>
               </div>
               <p class="text-gray-500 text-sm line-clamp-1 max-w-2xl mb-2">{{ project.description }}</p>
               <div class="flex items-center justify-center md:justify-start text-xs text-gray-400 gap-3">
                 <span class="flex items-center"><el-icon class="mr-1"><User /></el-icon>{{ project.creator_username }}</span>
                 <span class="px-2 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">{{ typeLabels[project.type] }}</span>
               </div>
            </div>

            <!-- 核心数据：总分账 / 周分账 -->
            <div class="text-right flex-shrink-0 hidden md:block w-48 border-l border-gray-100 pl-8">
               <div class="text-xs text-gray-500 font-medium mb-1 uppercase tracking-widest">{{ activeTab === 'total' ? '平台累计协作规模' : '近七日新增协作' }}</div>
               <div class="text-2xl font-black" :class="activeTab === 'total' ? 'text-gray-900' : 'text-primary-600'">
                 ¥{{ formatNumber(activeTab === 'total' ? project.total_revenue_share_amount : project.weekly_revenue_share_amount) }}
               </div>
            </div>
            
            <!-- 移动端金额 -->
            <div class="md:hidden mt-2 w-full text-center p-3 bg-gray-50 rounded-xl">
               <div class="text-xs text-gray-400 mb-1">{{ activeTab === 'total' ? '平台累计协作规模' : '近七日新增协作' }}</div>
               <div class="text-xl font-bold" :class="activeTab === 'total' ? 'text-gray-900' : 'text-primary-600'">
                 ¥{{ formatNumber(activeTab === 'total' ? project.total_revenue_share_amount : project.weekly_revenue_share_amount) }}
               </div>
            </div>
          </div>
        </div>

        <div v-if="currentList.length === 0" class="py-20 text-center">
          <div class="inline-flex w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
             <el-icon class="text-2xl text-gray-400"><Trophy /></el-icon>
          </div>
          <p class="text-gray-500">该榜单暂无数据</p>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
import { Loading, User, Trophy } from '@element-plus/icons-vue';
import axios from 'axios';

const router = useRouter();
const serverBase = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

const activeTab = ref('total');
const loading = ref(false);

const lists = ref({
  total: [],
  rising: []
});

const typeLabels = {
  brand: '品牌商',
  traffic: '流量厂牌',
  ai_agent: 'AI Agent'
};

const currentList = computed(() => lists.value[activeTab.value] || []);

const fetchLeaderboard = async (mode) => {
  // If we already fetched it, don't re-fetch unless desired to refresh
  if (lists.value[mode].length > 0) return;
  
  loading.value = true;
  try {
    const res = await axios.get(`${serverBase}/projects/leaderboard/${mode}?limit=30`);
    if (res.data.success) {
      lists.value[mode] = res.data.data;
    }
  } catch (error) {
    console.error(`Fetch ${mode} leaderboard error:`, error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchLeaderboard(activeTab.value);
});

watch(activeTab, (newTab) => {
  fetchLeaderboard(newTab);
});

const viewProject = (id) => {
  router.push(`/project/${id}`);
};

const formatNumber = (num) => {
  if (!num) return '0';
  const floatNum = parseFloat(num) || 0;
  if (floatNum >= 10000) {
    return (floatNum / 10000).toFixed(1) + 'W';
  }
  return floatNum.toLocaleString();
};
</script>

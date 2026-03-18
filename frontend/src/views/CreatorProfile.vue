<template>
  <div class="min-h-screen bg-gray-50/50">
    <Navbar />

    <div class="container-responsive py-10 fade-in">
      <!-- 返回 -->
      <button @click="$router.back()" class="flex items-center space-x-1.5 text-gray-500 hover:text-primary-600 transition-colors duration-200 mb-6 cursor-pointer">
        <el-icon><ArrowLeft /></el-icon>
        <span class="text-sm font-medium">返回</span>
      </button>

      <div v-if="loading" class="py-24 flex justify-center items-center">
        <el-icon class="is-loading text-4xl text-primary-600"><Loading /></el-icon>
      </div>

      <template v-else-if="creator">
        <!-- 创建者信息卡 -->
        <div class="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-12 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div class="flex-shrink-0">
            <el-avatar v-if="creator.avatar" :size="100" :src="$assetUrl(creator.avatar)" class="border-2 border-gray-100 shadow-xl" />
            <div v-else class="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl">
              {{ creator.username?.charAt(0)?.toUpperCase() }}
            </div>
          </div>
          <div class="flex-1 text-center md:text-left">
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">{{ creator.username }}</h1>
            <p class="text-gray-500 text-sm mb-4">{{ creator.email }}</p>
            <div class="flex flex-wrap gap-3 justify-center md:justify-start">
              <span class="px-3 py-1.5 bg-primary-50 text-primary-700 border border-primary-100 rounded-full text-xs font-bold tracking-widest uppercase">
                {{ creator.projectCount }} 个在架方案
              </span>
              <span v-if="creator.isVerified" class="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-1">
                <el-icon><CircleCheckFilled /></el-icon> 已实名验证
              </span>
            </div>
          </div>
        </div>

        <!-- 项目列表 -->
        <div v-if="creator.projects && creator.projects.length > 0">
          <h2 class="text-xl font-bold text-gray-900 mb-6 tracking-tight">全部在架方案</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="project in creator.projects"
              :key="project.id"
              class="group bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:border-gray-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-all cursor-pointer"
              @click="$router.push(`/project/${project.id}`)"
            >
              <div class="flex items-start gap-5">
                <img v-if="project.logo" :src="$assetUrl(project.logo)" class="w-16 h-16 rounded-2xl object-cover ring-1 ring-gray-100 flex-shrink-0" />
                <div v-else class="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {{ project.name?.charAt(0)?.toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center flex-wrap gap-2 mb-1.5">
                    <h3 class="font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors text-lg truncate">{{ project.name }}</h3>
                    <span v-if="project.use_dashtro" class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase flex-shrink-0">Dashtro</span>
                  </div>
                  <p class="text-gray-500 text-sm line-clamp-2 mb-3">{{ project.description }}</p>
                  <div class="flex items-center gap-3">
                    <span class="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">{{ typeLabels[project.type] || project.type }}</span>
                    <span class="text-xs text-gray-400 flex items-center gap-1">
                      <el-icon><View /></el-icon>{{ project.view_count || 0 }} 次浏览
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="py-16 text-center">
          <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <el-icon class="text-2xl text-gray-300"><Box /></el-icon>
          </div>
          <p class="text-gray-400">该用户暂无公开项目</p>
        </div>
      </template>

      <div v-else class="py-24 text-center">
        <p class="text-gray-400">用户不存在</p>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
import { ArrowLeft, Loading, CircleCheckFilled, View, Box } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const route = useRoute();
const loading = ref(true);
const creator = ref(null);
const serverBase = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

const typeLabels = {
  brand: '品牌商',
  traffic: '流量厂牌',
  ai_agent: 'AI Agent'
};

onMounted(async () => {
  try {
    const userId = route.params.userId;
    const res = await axios.get(`${serverBase}/users/${userId}`);
    if (res.data.success) {
      creator.value = res.data.data;
    }
  } catch (error) {
    ElMessage.error('加载用户信息失败');
  } finally {
    loading.value = false;
  }
});
</script>

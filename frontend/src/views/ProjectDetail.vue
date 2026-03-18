<template>
  <div class="min-h-screen bg-gray-50/50">
    <Navbar />

    <div v-if="project" class="container-responsive py-10 fade-in">
      <!-- 返回按钮 -->
      <button @click="goBack" class="flex items-center space-x-1.5 text-gray-500 hover:text-primary-600 transition-colors duration-200 mb-6 cursor-pointer">
        <el-icon><ArrowLeft /></el-icon>
        <span class="text-sm font-medium">返回</span>
      </button>

      <!-- 项目头部 商业名片 -->
      <div class="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-12 mb-8 relative overflow-hidden">
        <!-- 背景装饰 -->
        <div class="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

        <div class="flex flex-col md:flex-row gap-8 md:gap-12 relative z-10 items-center md:items-start">
          <!-- Logo -->
          <div class="flex-shrink-0">
            <img
              v-if="project.logo"
              :src="project.logo"
              :alt="project.name"
              class="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover ring-1 ring-gray-100 shadow-xl shadow-gray-200/50"
            />
            <div v-else class="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl flex items-center justify-center text-white text-5xl font-bold shadow-xl shadow-gray-900/20">
              {{ project.name.charAt(0).toUpperCase() }}
            </div>
          </div>

          <!-- 信息核心区 -->
          <div class="flex-1 text-center md:text-left">
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
              <span class="px-3 py-1 font-bold text-xs uppercase tracking-widest rounded-full" :class="`bg-gray-100 text-gray-800`">
                {{ typeLabels[project.type] }}
              </span>
              <div v-if="project.use_dashtro" class="flex items-center text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full tracking-wide">
                <el-icon class="mr-1"><CircleCheckFilled /></el-icon> DASHTRO PROTECTED
              </div>
            </div>
            
            <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              {{ project.name }}
            </h1>
            
            <div class="flex items-center justify-center md:justify-start text-gray-500 text-sm mb-6 space-x-2 cursor-pointer hover:text-primary-600 transition-colors" @click="goToCreator">
              <el-avatar :size="28" :src="project.creator_avatar" class="border border-gray-200" />
              <span class="font-medium text-gray-700 hover:text-primary-600 transition-colors">{{ project.creator_username }}</span>
              <el-icon class="text-gray-400"><ArrowRight /></el-icon>
            </div>
            
            <p v-if="project.description" class="text-gray-500 leading-relaxed text-base max-w-3xl mb-8">
              {{ project.description }}
            </p>

            <!-- 直达入口大按钮 -->
            <div class="flex flex-wrap gap-4 justify-center md:justify-start items-center">
              <el-button type="primary" size="large" class="!px-10 !py-6 !text-lg !font-bold !rounded-2xl !shadow-xl !shadow-primary-500/30 transition-transform hover:-translate-y-0.5" @click="visitProject">
                <el-icon class="mr-2 text-xl"><Link /></el-icon> 访问项目大厅
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 核心合作形式与分账协议 (二列布局) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <!-- 左侧：合作形式 -->
        <div class="bg-white rounded-3xl p-8 md:p-10 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100 h-full flex flex-col">
          <div class="flex items-center space-x-4 mb-6">
            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
               <el-icon class="text-2xl"><Briefcase /></el-icon>
            </div>
            <h2 class="text-xl font-bold text-gray-900">核心合作形式</h2>
          </div>
          <p class="text-gray-600 leading-relaxed whitespace-pre-wrap text-base flex-1">
            {{ project.cooperation_form || '项目方暂未填写详细的合作形式。' }}
          </p>
        </div>

        <!-- 右侧：Dashtro 或者 披露协议 -->
        <div class="rounded-3xl p-8 md:p-10 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border h-full flex flex-col relative overflow-hidden" :class="project.use_dashtro ? 'border-primary-100 bg-gradient-to-br from-white to-primary-50/40' : 'bg-white border-gray-100'">
          <!-- 如果使用了Dashtro，背景增加细微的纹理或印章感 -->
          <div v-if="project.use_dashtro" class="absolute top-0 right-0 p-8 opacity-5 flex items-start justify-end pointer-events-none">
            <el-icon class="text-9xl text-primary-900"><Connection /></el-icon>
          </div>

          <template v-if="project.use_dashtro">
            <div class="flex items-start justify-between mb-6 relative z-10">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center">
                   <el-icon class="text-2xl"><Connection /></el-icon>
                </div>
                <h2 class="text-xl font-bold text-gray-900">Dashtro 分账规则</h2>
              </div>
            </div>
            <p class="text-gray-800 leading-relaxed whitespace-pre-wrap text-base font-medium relative z-10 flex-1">
              {{ project.dashtro_agreement || '暂无详细的分账规则说明。' }}
            </p>
          </template>
          <template v-else>
            <div class="flex items-center space-x-4 mb-6 relative z-10">
              <div class="w-12 h-12 bg-gray-50 text-gray-600 rounded-2xl flex items-center justify-center">
                 <el-icon class="text-2xl"><Document /></el-icon>
              </div>
              <h2 class="text-xl font-bold text-gray-900">项目披露协议</h2>
            </div>
            <p class="text-gray-600 leading-relaxed whitespace-pre-wrap text-base relative z-10 flex-1">
              {{ project.disclosure_protocol || '项目方暂未填写披露协议。' }}
            </p>
          </template>
        </div>
      </div>

      <!-- 纯粹的数据大盘 -->
      <div class="bg-white rounded-3xl p-8 md:p-10 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100 mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-8 flex items-center">
          <el-icon class="mr-3 text-gray-400 text-2xl"><DataLine /></el-icon> 实时商业大盘
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="p-6 rounded-2xl bg-gray-50/50 border border-gray-100/50 transition-colors hover:bg-gray-50">
            <div class="text-sm text-gray-500 font-medium mb-2">累计交易总额</div>
            <div class="text-3xl font-extrabold text-gray-900">¥{{ formatNumber(animatedTotalTx) }}</div>
          </div>
          <div class="p-6 rounded-2xl bg-gray-50/50 border border-gray-100/50 transition-colors hover:bg-gray-50">
            <div class="text-sm text-gray-500 font-medium mb-2">累计协作规模</div>
            <div class="text-3xl font-extrabold text-gray-900">¥{{ formatNumber(animatedTotalRev) }}</div>
          </div>
          <div class="p-6 rounded-2xl bg-primary-50/30 border border-primary-100/30 transition-colors hover:bg-primary-50/50">
            <div class="text-sm text-primary-600 font-medium mb-2">近七天交易额</div>
            <div class="text-3xl font-extrabold text-primary-700">¥{{ formatNumber(animatedWeeklyTx) }}</div>
          </div>
          <div class="p-6 rounded-2xl bg-primary-50/30 border border-primary-100/30 transition-colors hover:bg-primary-50/50">
            <div class="text-sm text-primary-600 font-medium mb-2">近七日活跃度</div>
            <div class="text-3xl font-extrabold text-primary-700">¥{{ formatNumber(animatedWeeklyRev) }}</div>
          </div>
        </div>
      </div>

      <!-- 媒体展示区 (封面图+视频) -->
      <div v-if="(project.cover_image && project.cover_image.length > 0) || (project.video_url && project.video_url.length > 0)" class="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100 p-8 md:p-10 mb-8">
        <div class="flex items-center space-x-3 mb-8">
          <div class="w-12 h-12 bg-gray-50 text-gray-900 rounded-2xl flex items-center justify-center">
            <el-icon class="text-2xl"><VideoCamera /></el-icon>
          </div>
          <h2 class="text-xl font-bold text-gray-900">相关媒体资料</h2>
        </div>

        <!-- 视频 -->
        <div v-if="project.video_url && project.video_url.length > 0" class="flex flex-col gap-6 mb-8">
          <div v-for="(vUrl, index) in project.video_url" :key="'video-'+index" class="rounded-2xl overflow-hidden bg-black/5 border border-gray-100">
            <video controls class="w-full h-auto block">
              <source :src="serverBase + vUrl" type="video/mp4">
              您的浏览器不支持视频播放
            </video>
          </div>
        </div>

        <!-- 详情图（原封面图） -->
        <div v-if="project.cover_image && project.cover_image.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div v-for="(cUrl, index) in project.cover_image" :key="'cover-'+index" class="rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <img :src="cUrl.startsWith('http') ? cUrl : (serverBase + cUrl)" :alt="`${project.name} 详情图 ${index + 1}`" class="w-full h-auto block object-cover aspect-video" />
          </div>
        </div>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-else-if="loading" class="loading-container">
      <div class="flex flex-col items-center space-y-3">
        <div class="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p class="text-sm text-gray-400">加载中...</p>
      </div>
    </div>

    <!-- 未找到 -->
    <div v-else class="empty-state">
      <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <el-icon class="text-3xl text-gray-300"><Search /></el-icon>
      </div>
      <p class="empty-state-text">项目不存在</p>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import { useAuthStore } from '@/stores/auth';
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
import { ArrowLeft, ArrowRight, Link, Search, VideoCamera, Document, DataLine, Briefcase, Connection, CircleCheckFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();
const projectStore = useProjectStore();
const authStore = useAuthStore();

// 服务器基础地址，线上通过 VITE_API_BASE 环境变量注入
const serverBase = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

const project = ref(null);
const loading = ref(true);

const typeLabels = {
  brand: '品牌商',
  traffic: '流量厂牌',
  ai_agent: 'AI Agent'
};

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toLocaleString();
};

const goBack = () => {
  router.back();
};

const goToCreator = () => {
  if (project.value?.creator_id) {
    router.push(`/creator/${project.value.creator_id}`);
  }
};

const visitProject = () => {
  if (!project.value?.url) return;
  let targetUrl = project.value.url;
  // Dashtro SSO 方案A：已登录且项目接入了 Dashtro，则附带 token
  if (project.value.use_dashtro && authStore.token) {
    const separator = targetUrl.includes('?') ? '&' : '?';
    targetUrl = `${targetUrl}${separator}dh_token=${authStore.token}`;
  }
  window.open(targetUrl, '_blank');
};

// === 纯手工简易数字动画 ===
const animatedTotalTx = ref(0);
const animatedTotalRev = ref(0);
const animatedWeeklyTx = ref(0);
const animatedWeeklyRev = ref(0);

const animateValue = (refObj, start, end, duration) => {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    
    // 使用 easeOutQuart 缓动曲线让动画看起来更丝滑自然
    const easeOut = 1 - Math.pow(1 - progress, 4);
    refObj.value = start + (end - start) * easeOut;
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      refObj.value = end;
    }
  };
  window.requestAnimationFrame(step);
};

onMounted(async () => {
  loading.value = true;
  try {
    const projectId = route.params.id;
    const response = await projectStore.fetchProjectById(projectId);
    project.value = response.data;
    
    // 触发数字动画渲染
    if (project.value) {
      const duration = 1500; // 动画持续1.5秒
      animateValue(animatedTotalTx, 0, parseFloat(project.value.total_transaction_amount) || 0, duration);
      animateValue(animatedTotalRev, 0, parseFloat(project.value.total_revenue_share_amount) || 0, duration);
      animateValue(animatedWeeklyTx, 0, parseFloat(project.value.weekly_transaction_amount) || 0, duration);
      animateValue(animatedWeeklyRev, 0, parseFloat(project.value.weekly_revenue_share_amount) || 0, duration);
    }
  } catch (error) {
    ElMessage.error('加载项目失败');
  } finally {
    loading.value = false;
  }
});
</script>

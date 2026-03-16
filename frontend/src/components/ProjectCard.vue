<template>
  <div class="project-card" @click="goToProject">
    <!-- 封面图片 -->
    <div class="relative overflow-hidden">
      <div v-if="project.logo" class="image-container">
        <img :src="project.logo" :alt="project.name" />
      </div>
      <div v-else class="image-container flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <el-icon class="text-4xl text-gray-300"><Picture /></el-icon>
      </div>

      <!-- 类型标签 -->
      <div class="absolute top-3 left-3">
        <span class="type-tag" :class="`type-${project.type}`">
          {{ typeLabels[project.type] }}
        </span>
      </div>

      <!-- 周交易额标签 -->
      <div v-if="project.weekly_transaction_amount > 0" class="absolute top-3 right-3 bg-gray-900/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-medium">
        ¥{{ formatNumber(project.weekly_transaction_amount) }}/周
      </div>
    </div>

    <!-- 内容 -->
    <div class="p-5 flex flex-col flex-1">
      <!-- 用户头像 & 标题 -->
      <div class="flex items-start space-x-3">
        <img
          v-if="project.creator_avatar"
          :src="project.creator_avatar"
          :alt="project.creator_username"
          class="w-11 h-11 rounded-xl object-cover flex-shrink-0 ring-1 ring-gray-100"
        />
        <div v-else class="w-11 h-11 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-sm">
          {{ (project.creator_username || project.name).charAt(0).toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-gray-900 truncate leading-tight">{{ project.name }}</h3>
          <p class="text-sm text-gray-400 truncate mt-0.5">{{ project.creator_username }}</p>
        </div>
      </div>

      <!-- 描述 -->
      <p class="mt-3 text-sm text-gray-500 line-clamp-2 leading-relaxed">
        {{ project.description || '暂无描述' }}
      </p>

      <!-- 统计数据 -->
      <div class="mt-4 grid grid-cols-2 gap-2">
        <div class="bg-gray-50/80 rounded-xl p-2.5 text-center">
          <div class="text-sm font-bold text-gray-900">
            ¥{{ formatNumber(project.total_transaction_amount) }}
          </div>
          <div class="text-xs text-gray-400 mt-0.5">总交易额</div>
        </div>
        <div class="bg-gray-50/80 rounded-xl p-2.5 text-center">
          <div class="text-sm font-bold text-gray-900">
            ¥{{ formatNumber(project.total_revenue_share_amount) }}
          </div>
          <div class="text-xs text-gray-400 mt-0.5">总分账额</div>
        </div>
      </div>

      <!-- 操作按钮 - mt-auto 配合上边距确保独立空间 -->
      <div class="mt-auto pt-4 mt-4 border-t border-gray-100/80">
        <button class="btn-primary w-full flex items-center justify-center space-x-1.5 text-sm" @click.stop="handleVisit">
          <el-icon><Link /></el-icon>
          <span>访问项目</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { Picture, Link } from '@element-plus/icons-vue';

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
});

const router = useRouter();

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

const goToProject = () => {
  router.push(`/project/${props.project.id}`);
};

const handleVisit = async () => {
  window.open(props.project.url, '_blank');
};
</script>

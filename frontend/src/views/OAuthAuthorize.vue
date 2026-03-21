<template>
  <div class="min-h-screen bg-gray-50/50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div class="absolute top-20 right-20 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 left-20 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-md w-full relative z-10">
      <div class="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-gray-100/60">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">授权请求</h2>
          <p class="mt-2 text-gray-500">第三方应用请求访问您的账户</p>
        </div>

        <div class="bg-gray-50 rounded-xl p-4 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <el-icon :size="24" class="text-primary-600"><Key /></el-icon>
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ clientName || '商业策划机' }}</p>
              <p class="text-sm text-gray-500">请求访问以下权限</p>
            </div>
          </div>
          <div class="mt-3 space-y-1">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <el-icon :size="14" class="text-green-500"><Check /></el-icon>
              <span>获取您的用户名和头像</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <el-icon :size="14" class="text-green-500"><Check /></el-icon>
              <span>获取您的邮箱地址</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <el-button
            type="primary"
            size="large"
            class="w-full !ml-0"
            :loading="loading"
            @click="handleAuthorize"
          >
            授权并登录
          </el-button>
          <el-button
            size="large"
            class="w-full !ml-0"
            @click="handleCancel"
          >
            取消
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Key, Check } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const clientName = ref('');

const clientId = ref('');
const redirectUri = ref('');
const state = ref('');
const scope = ref('');

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push({
      path: '/login',
      query: { redirect: route.fullPath }
    });
    return;
  }

  clientId.value = route.query.client_id || '';
  redirectUri.value = route.query.redirect_uri || '';
  state.value = route.query.state || '';
  scope.value = route.query.scope || '';
  clientName.value = route.query.client_name || '商业策划机';
});

const handleAuthorize = async () => {
  loading.value = true;
  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId.value,
      redirect_uri: redirectUri.value,
      state: state.value,
      scope: scope.value || 'openid profile email',
    });
    
    const token = localStorage.getItem('dashhub_token');
    
    const response = await fetch(`${apiBaseUrl}/oauth/authorize?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success && data.redirect_url) {
      window.location.href = data.redirect_url;
    } else {
      ElMessage.error(data.error_description || '授权失败');
    }
  } catch (error) {
    console.error('Authorize error:', error);
    ElMessage.error('授权失败');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  window.location.href = redirectUri.value + '?error=access_denied&error_description=User%20denied%20access';
};
</script>

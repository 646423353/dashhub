<template>
  <nav class="navbar sticky top-0 z-50">
    <div class="navbar-container">
      <!-- Logo -->
      <router-link to="/" class="flex items-center space-x-2.5 cursor-pointer group">
        <img src="/logo_horizontal.png" alt="DashHub Logo" class="h-9 object-contain" />
      </router-link>

      <!-- 搜索栏（如果在搜索页面，则不显示顶部全局搜索） -->
      <div v-if="route.path !== '/search'" class="flex-1 max-w-xl mx-4 md:mx-8 fade-in">
        <router-link to="/search" class="cursor-pointer">
          <el-input
            v-model="searchQuery"
            placeholder="搜索项目..."
            :prefix-icon="Search"
            readonly
            class="cursor-pointer"
          >
            <template #suffix>
              <span class="text-gray-400 text-xs bg-gray-100 px-1.5 py-0.5 rounded hidden sm:inline font-mono">⌘K</span>
            </template>
          </el-input>
        </router-link>
      </div>

      <!-- 用户菜单 -->
      <div class="flex items-center space-x-2 sm:space-x-3">
        <!-- 未登录 -->
        <template v-if="!authStore.isAuthenticated">
          <router-link to="/login" class="btn-secondary hidden sm:block cursor-pointer">
            登录
          </router-link>
          <router-link to="/register" class="btn-primary cursor-pointer">
            注册
          </router-link>
        </template>

        <!-- 已登录 -->
        <template v-else>
          <router-link to="/my-projects" class="hidden sm:flex items-center space-x-1.5 text-gray-500 hover:text-primary-600 transition-colors duration-200 cursor-pointer">
            <el-icon><Collection /></el-icon>
            <span class="text-sm font-medium">我的项目</span>
          </router-link>
          <router-link to="/create-project" class="btn-primary flex items-center space-x-1 cursor-pointer">
            <el-icon><Plus /></el-icon>
            <span class="hidden sm:inline text-sm">创建项目</span>
          </router-link>

          <el-dropdown trigger="click">
            <div class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors duration-200">
              <img
                v-if="authStore.userAvatar"
                :src="authStore.userAvatar"
                alt="用户头像"
                class="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100"
              />
              <div v-else class="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm ring-2 ring-primary-100">
                {{ authStore.userName.charAt(0).toUpperCase() }}
              </div>
              <span class="text-gray-700 hidden md:block text-sm font-medium">{{ authStore.userName }}</span>
              <el-icon class="text-gray-400"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToProfile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';
import { Search, Grid, Plus, Collection, User, SwitchButton, ArrowDown } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const searchQuery = ref('');

const goToProfile = () => {
  router.push('/profile');
};

const handleLogout = () => {
  authStore.logout();
  ElMessage.success('已退出登录');
  router.push('/');
};

// 键盘快捷搜索
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    router.push('/search');
  }
});
</script>

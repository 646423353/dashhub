<template>
  <div class="min-h-screen bg-gray-50/50 flex flex-col">
    <Navbar />

    <div class="flex-1 container-responsive flex items-center justify-center py-16">
      <div class="text-center fade-in">
        <!-- 404 渐变数字 -->
        <div class="text-[10rem] font-extrabold leading-none bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 bg-clip-text text-transparent mb-4 select-none">
          404
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-3">页面未找到</h2>
        <p class="text-gray-500 mb-8 max-w-md mx-auto">抱歉，您访问的页面不存在或已被移动</p>
        <el-button type="primary" size="large" @click="router.push('/')" class="cursor-pointer">
          <el-icon><HomeFilled /></el-icon>
          <span class="ml-1.5">返回首页</span>
        </el-button>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
import { HomeFilled } from '@element-plus/icons-vue';

const router = useRouter();
</script>

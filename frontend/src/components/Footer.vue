<template>
  <footer class="footer py-12">
    <div class="container-responsive">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Logo & 描述 -->
        <div class="col-span-1 md:col-span-2">
          <router-link to="/" class="flex items-center space-x-2.5 mb-5 mt-1 cursor-pointer inline-flex">
            <img src="/logo_horizontal.png" alt="DashHub Logo" class="h-10 object-contain" />
          </router-link>
          <p class="text-gray-500 text-sm leading-relaxed max-w-md">
            连接优质项目与用户的可信平台，为用户提供便捷的产品和服务入口，记录项目可信性。
          </p>
        </div>

        <!-- 平台链接 -->
        <div>
          <h4 class="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wider">平台</h4>
          <ul class="space-y-2.5 text-sm text-gray-500">
            <li><router-link to="/" class="hover:text-primary-600 transition-colors duration-200 cursor-pointer">首页</router-link></li>
            <li><router-link to="/search" class="hover:text-primary-600 transition-colors duration-200 cursor-pointer">搜索项目</router-link></li>
            <li><router-link to="/page/about" class="hover:text-primary-600 transition-colors duration-200 cursor-pointer">关于我们</router-link></li>
            <li><router-link to="/page/contact" class="hover:text-primary-600 transition-colors duration-200 cursor-pointer">联系我们</router-link></li>
          </ul>
        </div>

        <!-- 法律 -->
        <div>
          <h4 class="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wider">法律</h4>
          <ul class="space-y-2.5 text-sm text-gray-500">
            <li><router-link to="/page/terms" class="hover:text-primary-600 transition-colors duration-200 cursor-pointer">用户协议</router-link></li>
            <li><router-link to="/page/privacy" class="hover:text-primary-600 transition-colors duration-200 cursor-pointer">隐私政策</router-link></li>
            <li><router-link to="/page/disclaimer" class="hover:text-primary-600 transition-colors duration-200 cursor-pointer">免责声明</router-link></li>
            <li><router-link to="/page/help" class="hover:text-primary-600 transition-colors duration-200 cursor-pointer">帮助中心</router-link></li>
          </ul>
        </div>
      </div>

      <!-- 底部分割线与版权 -->
      <div class="border-t border-gray-200/60 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p class="text-sm text-gray-400">
          © {{ new Date().getFullYear() }} DashHub. All rights reserved.
        </p>
        <div class="flex space-x-3 mt-4 md:mt-0">
          <a @click.prevent="copyWechat" class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 cursor-pointer" aria-label="即时通讯">
            <el-icon size="18"><ChatDotRound /></el-icon>
          </a>
          <a @click.prevent="copyEmail" class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 cursor-pointer" aria-label="邮件">
            <el-icon size="18"><Message /></el-icon>
          </a>
          <a @click.prevent="handleShare" class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 cursor-pointer" aria-label="分享">
            <el-icon size="18"><Share /></el-icon>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Grid, ChatDotRound, Message, Share } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const copyWechat = () => {
  navigator.clipboard.writeText('dashhub_official').then(() => {
    ElMessage.success('已复制官方微信号：dashhub_official，请往微信添加');
  }).catch(() => {
    ElMessage.error('复制失败，请手动添加微信号：dashhub_official');
  });
};

const copyEmail = () => {
  const email = 'contact@dashhub.com';
  navigator.clipboard.writeText(email).then(() => {
    ElMessage.success(`已复制邮箱地址：${email}`);
  }).catch(() => {
    window.location.href = `mailto:${email}`;
  });
};

const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: 'DashHub - 发现优质项目',
      text: '连接优质项目与用户的可信平台，寻找下一个爆款产品。',
      url: window.location.origin
    }).catch(console.error);
  } else {
    navigator.clipboard.writeText(window.location.origin).then(() => {
      ElMessage.success('平台地址已复制到剪贴板，快分享给好友吧！');
    });
  }
};
</script>

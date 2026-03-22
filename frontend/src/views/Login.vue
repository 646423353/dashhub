<template>
  <div class="min-h-screen bg-gray-50/50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- 装饰性背景元素 -->
    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div class="absolute top-20 right-20 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 left-20 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-md w-full space-y-6 relative z-10">
      <!-- Logo -->
      <div class="text-center fade-in">
        <div class="flex justify-center mb-5">
          <router-link to="/" class="cursor-pointer hover:opacity-90 transition-opacity">
            <img src="/logo_vertical.png" alt="DashHub Logo" class="w-20 h-20 object-contain" />
          </router-link>
        </div>
        <h2 class="text-3xl font-bold text-gray-900">登录 DashHub</h2>
        <p class="mt-2 text-gray-500">欢迎回来</p>
      </div>

      <!-- 表单 -->
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-gray-100/60 fade-in-delay-1">
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="form.email"
            type="email"
            placeholder="your@email.com"
            :prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="w-full"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>

        <div class="flex items-center justify-between text-sm">
          <router-link to="/register" class="text-primary-600 hover:text-primary-700 transition-colors duration-200 cursor-pointer">
            还没有账号？立即注册
          </router-link>
          <router-link to="/forgot-password" class="text-gray-500 hover:text-gray-700 transition-colors duration-200 cursor-pointer">
            忘记密码？
          </router-link>
        </div>
      </el-form>

      <!-- 测试账号 -->
      <div class="bg-primary-50/60 backdrop-blur-sm border border-primary-100 rounded-xl p-4 text-center fade-in-delay-2">
        <p class="text-sm text-primary-700">测试账号: user1@example.com / password123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Grid, Message, Lock } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  email: '',
  password: ''
});

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ]
};

const handleLogin = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  loading.value = true;
  try {
    await authStore.login(form.email, form.password);
    ElMessage.success('登录成功');
    
    const redirect = route.query.redirect;
    if (redirect) {
      // 解析 redirect 路径（可能包含查询参数）
      const [path, queryString] = redirect.toString().split('?');
      if (queryString) {
        // 如果有查询参数，解析并跳转
        const query = Object.fromEntries(new URLSearchParams(queryString));
        router.push({ path, query });
      } else {
        router.push(path);
      }
    } else {
      router.push('/');
    }
  } catch (error) {
    ElMessage.error(error.message || '登录失败，请检查邮箱和密码');
  } finally {
    loading.value = false;
  }
};
</script>

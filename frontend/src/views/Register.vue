<template>
  <div class="min-h-screen bg-gray-50/50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- 装饰性背景元素 -->
    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div class="absolute top-20 left-20 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-20 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-md w-full space-y-6 relative z-10">
      <!-- Logo -->
      <div class="text-center fade-in">
        <div class="flex justify-center mb-5">
          <router-link to="/" class="cursor-pointer hover:opacity-90 transition-opacity">
            <img src="/logo_vertical.png" alt="DashHub Logo" class="w-20 h-20 object-contain" />
          </router-link>
        </div>
        <h2 class="text-3xl font-bold text-gray-900">注册 DashHub</h2>
        <p class="mt-2 text-gray-500">创建您的账号</p>
      </div>

      <!-- 步骤指示器 -->
      <div class="flex items-center justify-center space-x-3 fade-in-delay-1">
        <div :class="['flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300',
          step === 1 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500']">
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" :class="step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-white'">1</span>
          <span>验证邮箱</span>
        </div>
        <div class="w-6 h-px bg-gray-200"></div>
        <div :class="['flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300',
          step === 2 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500']">
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" :class="step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-white'">2</span>
          <span>填写信息</span>
        </div>
      </div>

      <!-- 步骤1: 发送验证码 -->
      <div v-if="step === 1" class="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-gray-100/60 fade-in-delay-2">
        <el-form ref="step1FormRef" :model="form" :rules="step1Rules" label-position="top">
          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="form.email"
              type="email"
              placeholder="your@email.com"
              :prefix-icon="Message"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="w-full"
              :loading="loading"
              @click="sendCode"
            >
              发送验证码
            </el-button>
          </el-form-item>

          <div class="text-center text-sm text-gray-500">
            已有账号？
            <router-link to="/login" class="text-primary-600 hover:text-primary-700 transition-colors duration-200 cursor-pointer">
              立即登录
            </router-link>
          </div>
        </el-form>
      </div>

      <!-- 步骤2: 验证并注册 -->
      <div v-else class="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-gray-100/60 fade-in">
        <el-form ref="step2FormRef" :model="form" :rules="step2Rules" label-position="top">
          <el-form-item label="验证码" prop="code">
            <el-input
              v-model="form.code"
              placeholder="6位验证码"
              :prefix-icon="Key"
              maxlength="6"
            />
            <p class="text-xs text-gray-400 mt-1.5">验证码已发送到: {{ form.email }}</p>
          </el-form-item>

          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="至少6位密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="再次输入密码"
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
              @click="handleRegister"
            >
              注册
            </el-button>
          </el-form-item>

          <div class="text-center text-sm text-gray-500">
            已有账号？
            <router-link to="/login" class="text-primary-600 hover:text-primary-700 transition-colors duration-200 cursor-pointer">
              立即登录
            </router-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Grid, Message, Key, User, Lock } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const authStore = useAuthStore();
const step1FormRef = ref(null);
const step2FormRef = ref(null);
const step = ref(1);
const loading = ref(false);

const form = reactive({
  email: '',
  code: '',
  username: '',
  password: '',
  confirmPassword: ''
});

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const step1Rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
};

const step2Rules = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, message: '用户名至少2位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
};

const sendCode = async () => {
  const valid = await step1FormRef.value?.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const response = await authStore.sendCode(form.email, 'register');
    ElMessage.success('验证码已发送');
    console.log('验证码:', response.code);
    step.value = 2;
  } catch (error) {
    ElMessage.error(error.message || '发送验证码失败');
  } finally {
    loading.value = false;
  }
};

const handleRegister = async () => {
  const valid = await step2FormRef.value?.validate();
  if (!valid) return;

  loading.value = true;
  try {
    await authStore.register({
      email: form.email,
      code: form.code,
      username: form.username,
      password: form.password
    });
    ElMessage.success('注册成功');
    router.push('/');
  } catch (error) {
    ElMessage.error(error.message || '注册失败');
  } finally {
    loading.value = false;
  }
};
</script>

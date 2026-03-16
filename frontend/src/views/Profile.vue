<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="container-responsive py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">个人中心</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile Card -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="text-center relative">
              <!-- Top Right Settings Gear -->
              <button @click="showSettingsDialog = true" class="absolute top-0 right-0 text-gray-400 hover:text-primary-600 transition-colors p-1.5 rounded-full hover:bg-gray-50 z-10 cursor-pointer">
                <el-icon class="text-xl"><Setting /></el-icon>
              </button>

              <!-- 头像区域：修复编辑按钮定位 -->
              <div class="relative inline-block w-24 h-24 mb-4 mt-2">
                <img
                  v-if="userAvatar"
                  :src="userAvatar"
                  alt="Avatar"
                  class="w-24 h-24 rounded-full object-cover"
                />
                <div v-else class="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {{ userName.charAt(0).toUpperCase() }}
                </div>
                <!-- 编辑按钮：强制正方形，固定定位 -->
                <button
                  @click="showUploadDialog = true"
                  style="width:28px;height:28px;border-radius:50%;padding:0;display:flex;align-items:center;justify-content:center;"
                  class="absolute bottom-0 right-0 bg-primary-600 text-white hover:bg-primary-700 shadow-md border-2 border-white"
                >
                  <el-icon :size="13"><Edit /></el-icon>
                </button>
              </div>

              <h2 class="text-xl font-bold text-gray-900">{{ userName }}</h2>
              <p class="text-gray-600">{{ userEmail }}</p>
              
              <div v-if="userVerified" class="mt-2 inline-flex items-center justify-center space-x-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold border border-emerald-100/50 w-auto align-top">
                <el-icon><Check /></el-icon>
                <span>已验证厂商</span>
              </div>
              <div v-else class="mt-2 inline-flex items-center justify-center space-x-1 px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs font-semibold border border-gray-100/50 w-auto align-top">
                <span>未验证</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Quick Stats -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold mb-4">项目统计</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="stats-card text-center">
                <div class="stats-value">{{ animatedProjectCount }}</div>
                <div class="stats-label">我的项目</div>
              </div>
              <div class="stats-card text-center">
                <div class="stats-value">¥{{ formatMoney(animatedTotalTx) }}</div>
                <div class="stats-label">总交易额</div>
              </div>
              <div class="stats-card text-center">
                <div class="stats-value">¥{{ formatMoney(animatedTotalRev) }}</div>
                <div class="stats-label">总分账额</div>
              </div>
              <div class="stats-card text-center">
                <div class="stats-value">¥{{ formatMoney(animatedWeeklyRev) }}</div>
                <div class="stats-label">本周收益</div>
              </div>
            </div>
          </div>

          <!-- My Projects -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold">我的项目</h3>
              <el-button type="primary" @click="$router.push('/create-project')">
                <el-icon><Plus /></el-icon>
                新建项目
              </el-button>
            </div>

            <div v-if="myProjects.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="project in myProjects" :key="project.id" class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start space-x-3">
                  <img
                    :src="project.logo || '/placeholder.png'"
                    :alt="project.name"
                    class="w-12 h-12 rounded-lg object-cover"
                  />
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">{{ project.name }}</h4>
                    <p class="text-sm text-gray-500">{{ project.creator_username }}</p>
                    <div class="flex items-center mt-2 space-x-4">
                      <span class="text-sm text-gray-600">
                        <el-icon><Money /></el-icon>
                        ¥{{ formatNumber(project.total_transaction_amount) }}
                      </span>
                      <span class="text-sm text-gray-600">
                        <el-icon><CollectionTag /></el-icon>
                        {{ getTypeLabel(project.type) }}
                      </span>
                    </div>
                  </div>
                  <button
                    @click="$router.push(`/edit-project/${project.id}`)"
                    class="text-gray-400 hover:text-primary-600"
                  >
                    <el-icon><Edit /></el-icon>
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="empty-state py-8">
              <div class="empty-state-icon">📦</div>
              <p class="empty-state-text">您还没有创建任何项目</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 账号设置弹窗 -->
    <el-dialog v-model="showSettingsDialog" title="账号设置" width="400px" align-center class="rounded-3xl !box-border">
      <div class="px-2 py-4">
        <el-form label-position="top">
          <el-form-item label="企业/厂牌名称 (用户名)">
            <el-input v-model="settings.username" size="large" class="!text-lg font-medium" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer flex justify-end gap-3 mt-4">
          <el-button @click="showSettingsDialog = false" class="!rounded-xl cursor-pointer">取消</el-button>
          <el-button type="primary" @click="updateSettings" :loading="updating" class="!rounded-xl cursor-pointer shadow-md shadow-primary-500/20">
            保存设置
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 头像上传弹窗（优化版 UI）-->
    <el-dialog v-model="showUploadDialog" title="更换头像" width="460px" :close-on-click-modal="false">
      <div class="avatar-upload-container">
        <!-- 预览区域 -->
        <div class="preview-area">
          <div class="preview-circle" @click="triggerFileInput">
            <img v-if="previewUrl" :src="previewUrl" class="preview-img" />
            <div v-else class="preview-placeholder">
              <el-icon :size="36" class="upload-icon"><Plus /></el-icon>
              <span class="upload-text">点击选择图片</span>
            </div>
            <!-- 悬浮遮罩（有图片时显示） -->
            <div v-if="previewUrl" class="preview-overlay">
              <el-icon :size="24"><Edit /></el-icon>
              <span>更换照片</span>
            </div>
          </div>
        </div>

        <!-- 隐藏的文件输入 -->
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          style="display:none"
          @change="handleFileChange"
        />

        <!-- 提示文字 -->
        <div class="upload-tips">
          <p>支持 JPG、PNG、GIF 格式</p>
          <p>文件大小不超过 2MB</p>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelUpload">取消</el-button>
          <el-button
            type="primary"
            @click="uploadAvatar"
            :loading="uploading"
            :disabled="!previewUrl"
          >
            {{ uploading ? '上传中...' : '确认上传' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useProjectStore } from '@/stores/project';
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
import { Edit, Check, Plus, Money, CollectionTag, Setting } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const authStore = useAuthStore();
const projectStore = useProjectStore();

const showUploadDialog = ref(false);
const showSettingsDialog = ref(false);
const previewUrl = ref('');
const selectedFile = ref(null);
const uploading = ref(false);
const updating = ref(false);
const fileInputRef = ref(null);

const settings = reactive({
  username: ''
});

const typeLabels = {
  brand: '品牌商',
  traffic: '流量厂牌',
  ai_agent: 'AI Agent'
};

const userAvatar = computed(() => authStore.userAvatar);
const userName = computed(() => authStore.userName);
const userEmail = computed(() => authStore.userEmail);
const userVerified = computed(() => authStore.user?.isVerified || false);
const myProjects = computed(() => projectStore.myProjects);

const formatTotalAmount = computed(() => {
  return myProjects.value.reduce((sum, p) => sum + (parseFloat(p.total_transaction_amount) || 0), 0);
});

const formatRevenueAmount = computed(() => {
  return myProjects.value.reduce((sum, p) => sum + (parseFloat(p.total_revenue_share_amount) || 0), 0);
});

const formatWeeklyAmount = computed(() => {
  return myProjects.value.reduce((sum, p) => sum + (parseFloat(p.weekly_revenue_share_amount) || 0), 0);
});

// Animations
const animatedProjectCount = ref(0);
const animatedTotalTx = ref(0);
const animatedTotalRev = ref(0);
const animatedWeeklyRev = ref(0);

const animateValue = (refObj, start, end, duration) => {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 4);
    if (Number.isInteger(end)) {
       refObj.value = Math.round(start + (end - start) * easeOut);
    } else {
       refObj.value = start + (end - start) * easeOut;
    }
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      refObj.value = end;
    }
  };
  window.requestAnimationFrame(step);
};

watch(myProjects, () => {
  const duration = 1200;
  animateValue(animatedProjectCount, 0, myProjects.value.length, duration);
  animateValue(animatedTotalTx, 0, formatTotalAmount.value, duration);
  animateValue(animatedTotalRev, 0, formatRevenueAmount.value, duration);
  animateValue(animatedWeeklyRev, 0, formatWeeklyAmount.value, duration);
}, { immediate: true });

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toLocaleString();
};

const formatMoney = (num) => {
  if (!num) return '0.00';
  if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万';
  }
  return Number(num).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getTypeLabel = (value) => {
  return typeLabels[value] || value;
};

// 点击预览区域触发文件输入
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

// 处理文件选择（原生 input）
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // 校验类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件！');
    return;
  }
  // 校验大小 (2MB)
  if (file.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小不能超过 2MB！');
    return;
  }

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
};

// 将 File 转为 Base64 字符串
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// 上传头像（调用真实 API）
const uploadAvatar = async () => {
  if (!selectedFile.value) return;

  uploading.value = true;
  try {
    // 将图片转为 base64 传给后端
    const base64 = await fileToBase64(selectedFile.value);

    // 调用真实 API 更新头像
    await authStore.updateUserAvatar(base64);

    showUploadDialog.value = false;
    ElMessage.success('头像更新成功！');
  } catch (error) {
    console.error('Avatar upload error:', error);
    ElMessage.error('头像上传失败，请重试');
  } finally {
    uploading.value = false;
  }
};

// 取消上传，重置状态
const cancelUpload = () => {
  showUploadDialog.value = false;
  previewUrl.value = '';
  selectedFile.value = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
};

const updateSettings = async () => {
  updating.value = true;
  try {
    await authStore.updateProfile(settings);
    ElMessage.success('设置保存成功');
    showSettingsDialog.value = false;
  } catch (error) {
    ElMessage.error('保存失败');
  } finally {
    updating.value = false;
  }
};

// Initialize settings
if (authStore.user) {
  settings.username = authStore.userName;
}

// Fetch projects
projectStore.fetchMyProjects();
</script>

<style scoped>
/* 头像上传弹窗 */
.avatar-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 8px 0;
}

/* 预览圆形区域 */
.preview-area {
  display: flex;
  justify-content: center;
}

.preview-circle {
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px dashed #d0d5dd;
  background: #f9fafb;
  transition: border-color 0.2s;
}

.preview-circle:hover {
  border-color: #4361ee;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 空状态居中 */
.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  color: #9ca3af;
  user-select: none;
}

.upload-icon {
  color: #9ca3af;
}

.upload-text {
  font-size: 13px;
  color: #9ca3af;
}

/* 有图时的悬浮遮罩 */
.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #fff;
  font-size: 13px;
  opacity: 0;
  transition: opacity 0.2s;
}

.preview-circle:hover .preview-overlay {
  opacity: 1;
}

/* 提示文字 */
.upload-tips {
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
  line-height: 1.8;
}

/* Dialog footer */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>

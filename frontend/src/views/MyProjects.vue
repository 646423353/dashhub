<template>
  <div class="min-h-screen bg-gray-50/50">
    <Navbar />

    <div class="container-responsive py-10 fade-in">
      <div class="flex flex-col md:flex-row gap-8">
        <!-- 左侧：个人资料卡片 -->
        <div class="w-full md:w-80 flex-shrink-0">
          <div class="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100 p-8 flex flex-col items-center text-center relative overflow-hidden group">
            <!-- 绝对定位的背景装饰 -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl opacity-50 -mt-10 -mr-10 pointer-events-none"></div>

            <!-- 新增的右上角设置齿轮 -->
            <button @click="openSettings" class="absolute top-6 right-6 text-gray-400 hover:text-primary-600 transition-colors p-2 rounded-full hover:bg-gray-50 z-10 cursor-pointer">
              <el-icon class="text-xl"><Setting /></el-icon>
            </button>

            <!-- 头像区域 -->
            <div class="relative mb-5 z-10">
              <img
                v-if="user?.avatar && !user.avatar.includes('via.placeholder.com')"
                :src="user.avatar"
                :alt="user?.username"
                class="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-xl"
              />
              <div v-else class="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white shadow-xl">
                {{ user?.username?.charAt(0)?.toUpperCase() || 'U' }}
              </div>
            </div>

            <h2 class="text-xl font-bold text-gray-900 mb-1 z-10">{{ user?.username }}</h2>
            <p class="text-sm text-gray-500 mb-4 z-10">{{ user?.email }}</p>
            
            <!-- 修复后的已验证标签 (移除拉伸影响) -->
            <div class="z-10 inline-flex items-center space-x-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold border border-emerald-100/50">
              <el-icon><Check /></el-icon>
              <span>已验证厂商</span>
            </div>
          </div>
        </div>

        <!-- 右侧：核心业务区 -->
        <div class="flex-1 space-y-8">
          <!-- 项目大盘统计 (增加动画) -->
          <div class="bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100">
            <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <el-icon class="mr-2 text-primary-500"><DataLine /></el-icon> 核心资产与管线大盘
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-gray-50/50 rounded-2xl p-5 border border-gray-100/50 hover:bg-gray-50 transition-colors">
                <div class="text-sm text-gray-500 mb-2 font-medium">我的项目</div>
                <div class="text-3xl font-extrabold text-gray-900">{{ animatedProjectCount }}</div>
              </div>
              <div class="bg-gray-50/50 rounded-2xl p-5 border border-gray-100/50 hover:bg-gray-50 transition-colors">
                <div class="text-sm text-gray-500 mb-2 font-medium">总流水额</div>
                <div class="text-3xl font-extrabold text-gray-900">¥{{ formatNumber(animatedTotalTx) }}</div>
              </div>
              <div class="bg-primary-50/30 rounded-2xl p-5 border border-primary-100/30 hover:bg-primary-50 px-5">
                <div class="text-sm text-primary-600 mb-2 font-medium">总分账分润</div>
                <div class="text-3xl font-extrabold text-primary-700">¥{{ formatNumber(animatedTotalRev) }}</div>
              </div>
              <div class="bg-primary-50/30 rounded-2xl p-5 border border-primary-100/30 hover:bg-primary-50 px-5">
                <div class="text-sm text-emerald-600 mb-2 font-medium">本周新增收益</div>
                <div class="text-3xl font-extrabold text-emerald-700">¥{{ formatNumber(animatedWeeklyRev) }}</div>
              </div>
            </div>
          </div>

          <!-- 我的项目列表 -->
          <div class="bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100">
            <div class="flex items-center justify-between mb-8">
              <h3 class="text-lg font-bold text-gray-900 flex items-center">
                <el-icon class="mr-2 text-primary-500"><FolderOpened /></el-icon> 资产列表
              </h3>
              <el-button type="primary" class="!rounded-xl cursor-pointer shadow-md shadow-primary-500/20" @click="$router.push('/create-project')">
                <el-icon class="mr-1"><Plus /></el-icon> 发布新资产
              </el-button>
            </div>

            <div v-if="loading" class="py-12 flex justify-center text-primary-500">
               <el-icon class="is-loading text-3xl"><Loading /></el-icon>
            </div>

            <div v-else-if="myProjects.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProjectCard v-for="project in myProjects" :key="project.id" :project="project">
                <template #actions>
                  <div class="flex space-x-2 mt-3 pt-3 border-t border-gray-100">
                    <el-button size="small" type="primary" plain class="flex-1 !rounded-lg cursor-pointer" @click.stop="editProject(project.id)">
                      配置
                    </el-button>
                    <el-button size="small" type="danger" plain class="flex-1 !rounded-lg cursor-pointer" @click.stop="deleteProject(project.id)">
                      销毁
                    </el-button>
                  </div>
                </template>
              </ProjectCard>
            </div>

            <div v-else class="py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
              <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <el-icon class="text-4xl text-gray-300"><Box /></el-icon>
              </div>
              <p class="text-lg font-bold text-gray-700 mb-2">资产管线为空</p>
              <p class="text-gray-400 text-sm mb-6 max-w-sm mx-auto">您还没有发布任何商业化项目，现在创建一个并接入流量或AI通道开启分账。</p>
              <el-button type="primary" size="large" class="!rounded-xl !px-8 cursor-pointer shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 transition-transform" @click="$router.push('/create-project')">
                <el-icon class="mr-2"><Plus /></el-icon> 启动首个项目
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Footer />

    <!-- 弹窗式优雅帐号设置 -->
    <el-dialog
      v-model="settingVisible"
      title="帐号首选项"
      width="400px"
      align-center
      class="rounded-3xl !box-border"
      :show-close="true"
    >
      <div class="px-2 py-4">
        <el-form label-position="top">
          <el-form-item label="企业/厂牌名称 (用户名)">
            <el-input v-model="settingForm.username" size="large" class="!text-lg font-medium" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer flex justify-end gap-3 mt-4">
          <el-button @click="settingVisible = false" class="!rounded-xl cursor-pointer">取消</el-button>
          <el-button type="primary" @click="saveSettings" :loading="saving" class="!rounded-xl cursor-pointer shadow-md shadow-primary-500/20">
            确认应用
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useProjectStore } from '@/stores/project';
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
import ProjectCard from '@/components/ProjectCard.vue';
import { Plus, Box, Check, Setting, DataLine, FolderOpened, Loading } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const authStore = useAuthStore();
const projectStore = useProjectStore();

const { user } = storeToRefs(authStore);
const myProjects = computed(() => projectStore.myProjects);
const loading = ref(true);

// 动画相关
const animatedProjectCount = ref(0);
const animatedTotalTx = ref(0);
const animatedTotalRev = ref(0);
const animatedWeeklyRev = ref(0);

const animateValue = (refObj, start, end, duration) => {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    
    // easeOutQuart
    const easeOut = 1 - Math.pow(1 - progress, 4);
    // 处理整数与小数渲染
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

// 格式化功能
const formatNumber = (num) => {
  if (!num) return '0.00';
  const floatNum = parseFloat(num) || 0;
  if (floatNum >= 10000) {
    return (floatNum / 10000).toFixed(2) + '万';
  }
  return floatNum.toFixed(2);
};

// 表单与保存逻辑
const settingVisible = ref(false);
const saving = ref(false);
const settingForm = ref({ username: '' });

const openSettings = () => {
  settingForm.value.username = user.value?.username || '';
  settingVisible.value = true;
};

const saveSettings = async () => {
  if (!settingForm.value.username.trim()) {
    ElMessage.warning('用户名不能为空');
    return;
  }
  saving.value = true;
  try {
    await authStore.updateProfile({ username: settingForm.value.username });
    ElMessage.success('设置应用成功');
    settingVisible.value = false;
  } catch (error) {
    ElMessage.error(error.message || '更新失败');
  } finally {
    saving.value = false;
  }
};

const editProject = (projectId) => {
  router.push(`/edit-project/${projectId}`);
};

const deleteProject = async (projectId) => {
  try {
    await ElMessageBox.confirm('资产一旦摧毁相关的流水数据也将同时冻结，确定删除吗？', '危险操作验证', {
      confirmButtonText: '确定摧毁',
      cancelButtonText: '容我三思',
      type: 'error',
      customClass: 'rounded-2xl'
    });

    await projectStore.deleteProject(projectId);
    ElMessage.success('资产项目已销毁');
    recalculateDashboard();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 汇总大盘逻辑
const recalculateDashboard = () => {
   const duration = 1200;
   const pCount = myProjects.value.length;
   let totTx = 0, totRev = 0, wRev = 0;
   
   myProjects.value.forEach(p => {
      totTx += (parseFloat(p.total_transaction_amount) || 0);
      totRev += (parseFloat(p.total_revenue_share_amount) || 0);
      wRev += (parseFloat(p.weekly_revenue_share_amount) || 0);
   });
   
   animateValue(animatedProjectCount, 0, pCount, duration);
   animateValue(animatedTotalTx, 0, totTx, duration);
   animateValue(animatedTotalRev, 0, totRev, duration);
   animateValue(animatedWeeklyRev, 0, wRev, duration);
};

onMounted(async () => {
  loading.value = true;
  try {
    if (!authStore.isAuthenticated) {
       await authStore.fetchCurrentUser();
    }
    await projectStore.fetchMyProjects();
    recalculateDashboard();
  } catch (error) {
    ElMessage.error('加载资产列表失败');
  } finally {
    loading.value = false;
  }
});
</script>

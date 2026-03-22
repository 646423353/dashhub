<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="container-responsive py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">创建项目</h1>

      <el-steps :active="activeStep" finish-status="success" simple class="mb-8">
        <el-step title="基本信息" />
        <el-step title="上传资料" />
        <el-step title="确认提交" />
      </el-steps>

      <!-- Step 1: Basic Info -->
      <div v-if="activeStep === 0" class="bg-white rounded-xl shadow-sm p-6 md:p-8">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-form-item label="项目名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入项目名称" :prefix-icon="Edit" />
          </el-form-item>

          <el-form-item label="项目类型" prop="type">
            <el-select v-model="form.type" placeholder="请选择项目类型" style="width: 100%">
              <el-option v-for="type in projectTypes" :key="type.value" :label="type.label" :value="type.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="项目描述" prop="description">
            <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请描述您的项目功能、特色等" />
          </el-form-item>

          <el-form-item label="项目网址" prop="url">
            <el-input v-model="form.url" placeholder="例如：example.com 或 https://example.com" :prefix-icon="Link" @blur="normalizeUrl" />
          </el-form-item>

          <el-form-item label="核心合作形式概述" prop="cooperationForm">
            <el-input v-model="form.cooperationForm" type="textarea" :rows="3" placeholder="请提炼一小段文字概述项目核心的合作形式与商业模式" />
          </el-form-item>

          <el-form-item label="披露协议" prop="disclosureProtocol">
            <el-input v-model="form.disclosureProtocol" type="textarea" :rows="3" placeholder="请描述您的项目披露、合作方式等" />
          </el-form-item>

          <div class="bg-primary-50/50 rounded-xl p-5 mb-6 border border-primary-100">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <el-icon class="text-primary-600 text-xl"><Connection /></el-icon>
                <h4 class="font-semibold text-gray-900">接入 Dashtro 业务 (推荐)</h4>
              </div>
              <el-switch v-model="form.useDashtro" />
            </div>
            <p class="text-sm text-gray-500 mb-4">Dashtro 类似于 Stripe 收银台的接入体验，能够帮助平台级项目或者流量厂牌极速安全地完成基于交易驱动的智能分账，对平台交易闭环不可或缺。不接入也不影响创建项目。</p>
            
            <el-collapse-transition>
              <div v-if="form.useDashtro">
                <el-form-item label="Dashtro 分账协议概述" prop="dashtroAgreement" class="mb-0">
                  <el-input v-model="form.dashtroAgreement" type="textarea" :rows="3" placeholder="由于您确认接入了 Dashtro，请在此简洁描述 Dashtro 分账协议的核心规则内容..." />
                </el-form-item>
              </div>
            </el-collapse-transition>
          </div>
        </el-form>

        <div class="flex justify-end space-x-4">
          <el-button @click="$router.push('/my-projects')">取消</el-button>
          <el-button type="primary" @click="nextStep">下一步</el-button>
        </div>
      </div>

      <!-- Step 2: Upload Files -->
      <div v-if="activeStep === 1" class="bg-white rounded-xl shadow-sm p-6 md:p-8">
        <p class="text-gray-500 text-sm mb-6">请分别上传项目素材，项目封面和至少1张详情图为必填，视频选填。</p>

        <div class="upload-grid">

          <!-- 封面（原Logo）上传 -->
          <div class="upload-card" :class="{ 'is-done': uploads.logo.url }">
            <div class="upload-card__header">
              <span class="upload-badge logo-badge">项目封面</span>
              <span class="upload-hint">200×200 • PNG / JPG • ≤ 5MB</span>
            </div>

            <!-- 预览 -->
            <div v-if="uploads.logo.url" class="upload-preview square-preview" @click="clearUpload('logo')">
              <img :src="uploads.logo.url" alt="Logo 预览" />
              <div class="preview-mask"><el-icon><Delete /></el-icon></div>
            </div>

            <!-- 上传区域 -->
            <div v-else class="upload-dropzone" @click="triggerInput('logo')">
              <el-icon :size="32" class="drop-icon"><Picture /></el-icon>
              <p class="drop-text">点击或拖拽上传</p>
            </div>

            <el-progress v-if="uploads.logo.progress > 0 && !uploads.logo.url"
              :percentage="uploads.logo.progress" :stroke-width="4" class="mt-3" />

            <input ref="logoInputRef" type="file" accept="image/jpeg,image/png,image/jpg,image/webp"
              style="display:none" @change="handleFileChange($event, 'logo')" />
          </div>

          <!-- 详情图（封面）上传（多图） -->
          <div class="upload-card" :class="{ 'is-done': uploads.covers.length > 0 }">
            <div class="upload-card__header">
              <span class="upload-badge cover-badge">项目详情图</span>
              <span class="upload-hint">800×400 • 最多5张</span>
            </div>

            <div class="flex flex-wrap gap-3">
              <!-- 已上传的预览列表 -->
              <div v-for="(item, index) in uploads.covers" :key="index" class="relative w-[140px] h-[80px] rounded-lg overflow-hidden group border border-gray-100 placeholder-loading bg-gray-50">
                <img v-if="item.url" :src="item.url" class="w-full h-full object-cover" />
                <div v-if="item.progress >= 100" class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" @click="removeArrayUpload('covers', index)">
                  <el-icon class="text-white text-xl"><Delete /></el-icon>
                </div>
                <!-- 进度条叠在上方 -->
                <div v-if="item.progress > 0 && item.progress < 100" class="absolute inset-x-0 bottom-0 h-1 bg-gray-200">
                  <div class="h-full bg-primary-500 transition-all duration-300" :style="{ width: item.progress + '%' }"></div>
                </div>
              </div>

              <!-- 上传按钮（小于5张时显示） -->
              <div v-if="uploads.covers.length < 5" class="w-[140px] h-[80px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-primary-500 hover:text-primary-500 transition-colors" @click="triggerInput('cover')">
                <el-icon :size="24"><Plus /></el-icon>
                <span class="text-xs mt-1">上传</span>
              </div>
            </div>

            <input ref="coverInputRef" type="file" multiple accept="image/jpeg,image/png,image/jpg,image/webp"
              style="display:none" @change="handleFileChange($event, 'covers')" />
          </div>

          <!-- 视频上传（多视频） -->
          <div class="upload-card full-width-card" :class="{ 'is-done': uploads.videos.length > 0 }">
            <div class="upload-card__header">
              <span class="upload-badge video-badge">视频</span>
              <span class="upload-hint">MP4 / WebM • ≤ 20MB • 最多3个（选填）</span>
            </div>

            <div class="flex flex-wrap gap-4">
              <div v-for="(item, index) in uploads.videos" :key="index" class="relative w-[280px] group border border-gray-100 rounded-lg overflow-hidden placeholder-loading bg-black">
                <video v-if="item.url" :src="getAssetUrl(item.url)" controls class="w-full h-[150px] object-cover" />
                <div v-if="item.progress >= 100" class="absolute top-2 right-2 flex items-center justify-center cursor-pointer z-10" @click="removeArrayUpload('videos', index)">
                  <el-icon class="text-white text-2xl drop-shadow-md"><CircleCloseFilled /></el-icon>
                </div>
                <div v-if="item.progress > 0 && item.progress < 100" class="absolute inset-x-0 bottom-0 h-1 bg-gray-600">
                  <div class="h-full bg-primary-500 transition-all duration-300" :style="{ width: item.progress + '%' }"></div>
                </div>
              </div>

              <div v-if="uploads.videos.length < 3" class="w-[280px] h-[150px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-primary-500 hover:text-primary-500 transition-colors" @click="triggerInput('video')">
                <el-icon :size="28"><VideoPlay /></el-icon>
                <span class="text-xs mt-2">添加视频 ({{uploads.videos.length}}/3)</span>
              </div>
            </div>

            <input ref="videoInputRef" type="file" multiple accept="video/mp4,video/webm,video/quicktime"
              style="display:none" @change="handleFileChange($event, 'videos')" />
          </div>
        </div>

        <div class="flex justify-between mt-8">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="goToConfirm" :loading="anyUploading">
            {{ anyUploading ? '上传中...' : '下一步' }}
          </el-button>
        </div>
      </div>

      <!-- Step 3: Confirm -->
      <div v-if="activeStep === 2" class="bg-white rounded-xl shadow-sm p-6 md:p-8">
        <h3 class="text-lg font-semibold mb-6">确认项目信息</h3>

        <div class="confirm-grid">
          <!-- 文字信息 -->
          <div class="space-y-4">
            <div><p class="label">项目名称</p><p class="value">{{ form.name }}</p></div>
            <div><p class="label">项目类型</p><p class="value">{{ getTypeLabel(form.type) }}</p></div>
            <div><p class="label">项目描述</p><p class="value">{{ form.description }}</p></div>
            <div><p class="label">项目网址</p><p class="value">{{ form.url }}</p></div>
            <div v-if="form.disclosureProtocol"><p class="label">披露协议</p><p class="value">{{ form.disclosureProtocol }}</p></div>
          </div>

          <!-- 媒体预览 -->
          <div class="preview-summary">
            <div v-if="uploads.logo.url" class="preview-summary-item">
              <p class="label">项目封面</p>
              <img :src="uploads.logo.url" class="preview-thumb-square" />
            </div>
            <div v-if="form.coverImage.length > 0" class="preview-summary-item">
              <p class="label">项目详情图 ({{ form.coverImage.length }}张)</p>
              <div class="flex gap-2 flex-wrap mt-1">
                <img v-for="c in uploads.covers" :key="c.url" :src="c.url" class="preview-thumb-wide-small" />
              </div>
            </div>
            <div v-if="form.videoUrl.length > 0" class="preview-summary-item">
              <p class="label">介绍视频 ({{ form.videoUrl.length }}个)</p>
              <div class="flex gap-2 flex-wrap mt-1">
                <div v-for="(v, i) in form.videoUrl" :key="i" class="video-tag">
                  <el-icon><VideoPlay /></el-icon>
                  <span>视频 {{ i + 1 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-between mt-8">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="createProject" :loading="creating">确认创建</el-button>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import { useAuthStore } from '@/stores/auth';
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
import { Edit, Link, Upload, VideoPlay, Picture, Delete, CircleCloseFilled, Plus, Connection } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import { getAssetUrl } from '@/utils/asset';

const router = useRouter();
const authStore = useAuthStore();
const projectStore = useProjectStore();

// 服务器基础地址
const serverBase = import.meta.env.VITE_API_BASE || '';

const activeStep = ref(0);
const formRef = ref(null);
const creating = ref(false);

const logoInputRef = ref(null);
const coverInputRef = ref(null);
const videoInputRef = ref(null);

const inputRefs = { logo: logoInputRef, cover: coverInputRef, video: videoInputRef };

// 上传状态：logo为单对象，covers和videos为数组
const uploads = reactive({
  logo: { file: null, url: '', progress: 0 },
  covers: [],
  videos: []
});

const anyUploading = computed(() => {
  return (uploads.logo.progress > 0 && !uploads.logo.url) ||
         uploads.covers.some(u => u.progress > 0 && u.progress < 100) ||
         uploads.videos.some(u => u.progress > 0 && u.progress < 100);
});

const projectTypes = [
  { label: '品牌商', value: 'brand' },
  { label: '流量厂牌', value: 'traffic' },
  { label: 'AI Agent', value: 'ai_agent' }
];

const form = reactive({
  name: '', type: '', description: '', url: '',
  logo: '', coverImage: [], videoUrl: [], disclosureProtocol: '',
  cooperationForm: '', useDashtro: false, dashtroAgreement: ''
});

const rules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }, { min: 2, message: '至少2个字符', trigger: 'blur' }],
  type: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
  description: [{ required: true, message: '请输入项目描述', trigger: 'blur' }],
  url: [
    { required: true, message: '请输入项目网址', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) return callback();
        const withProto = /^https?:\/\//i.test(value) ? value : 'https://' + value;
        try { new URL(withProto); callback(); }
        catch { callback(new Error('请输入正确的网址格式，如 fhjd.com')); }
      },
      trigger: 'blur'
    }
  ]
};

const getTypeLabel = (value) => projectTypes.find(t => t.value === value)?.label || '';

const normalizeUrl = () => {
  const v = form.url.trim();
  if (v && !/^https?:\/\//i.test(v)) form.url = 'https://' + v;
};

const triggerInput = (type) => inputRefs[type].value?.click();

const clearUpload = (type) => {
  if (type === 'logo') {
    uploads.logo = { file: null, url: '', progress: 0 };
    form.logo = '';
  }
  if (inputRefs[type].value) inputRefs[type].value.value = '';
};

// 移除多选中某一项
const removeArrayUpload = (type, index) => {
  const removed = uploads[type].splice(index, 1)[0];
  // 同步到 form
  if (type === 'covers') {
    form.coverImage = form.coverImage.filter(url => !removed.url.includes(url));
  } else if (type === 'videos') {
    form.videoUrl = form.videoUrl.filter(url => !removed.url.includes(url));
  }
};

const validateFile = (file, type) => {
  const maxSize = type === 'videos' || type === 'video' ? 20 : 5;
  if (file.size / 1024 / 1024 > maxSize) {
    ElMessage.error(`${type === 'videos' || type === 'video' ? '视频' : '图片'} ${file.name} 超过 ${maxSize}MB`);
    return false;
  }
  return true;
};

const handleFileChange = async (event, type) => {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  if (type === 'logo') {
    const file = files[0];
    if (!validateFile(file, 'logo')) return;
    uploads.logo.file = file;
    uploads.logo.url = URL.createObjectURL(file);
    uploads.logo.progress = 0;
    await uploadToServer(file, 'logo');
  } else {
    // 处理 covers / videos 数组
    const limit = type === 'covers' ? 5 : 3;
    const remaining = limit - uploads[type].length;
    
    if (files.length > remaining) {
      ElMessage.warning(`最多还能选择 ${remaining} 个文件`);
    }

    const filesToUpload = files.slice(0, remaining).filter(f => validateFile(f, type));
    
    for (const file of filesToUpload) {
      const uploadItem = reactive({
        file,
        url: type !== 'videos' ? URL.createObjectURL(file) : '',
        progress: 0
      });
      uploads[type].push(uploadItem);
      // 独立并行或顺序上传均可，这里用顺序保持稳定
      await uploadToServerArrayItem(uploadItem, type);
    }
  }

  // 重置 input
  event.target.value = '';
};

const uploadToServer = async (file, type) => {
  const formData = new FormData();
  formData.append(type, file);
  
  try {
    uploads.logo.progress = 5;
    const response = await axios.post(`${serverBase}/api/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${authStore.token}` },
      onUploadProgress: (e) => {
        if (e.total) uploads.logo.progress = Math.round((e.loaded / e.total) * 90);
      }
    });
    if (response.data?.success) {
      const serverUrl = response.data.data.logo;
      uploads.logo.url = getAssetUrl(serverUrl);
      form.logo = serverUrl;
      uploads.logo.progress = 100;
      ElMessage.success('Logo上传成功');
    } else {
      throw new Error(response.data?.message || '上传失败');
    }
  } catch (error) {
    ElMessage.error(`上传失败：${error.message}`);
    uploads.logo.progress = 0;
    uploads.logo.url = '';
  }
};

const uploadToServerArrayItem = async (uploadItem, type) => {
  const fieldName = type === 'covers' ? 'cover' : 'video';
  const formData = new FormData();
  formData.append(fieldName, uploadItem.file);

  try {
    uploadItem.progress = 5;
    const response = await axios.post(`${serverBase}/api/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${authStore.token}` },
      onUploadProgress: (e) => {
        if (e.total) uploadItem.progress = Math.round((e.loaded / e.total) * 90);
      }
    });

    if (response.data?.success) {
      // 后端改造后，cover/video 若多选会返回数组，单传如果是数组也会返回数组
      // 我们在 uploadController 里用的是 req.files.cover.map(...)，所以一定返回数组
      const serverUrls = response.data.data[fieldName];
      const serverUrl = Array.isArray(serverUrls) ? serverUrls[0] : serverUrls;

      if (type !== 'videos') {
        uploadItem.url = getAssetUrl(serverUrl);
      } else {
        uploadItem.url = getAssetUrl(serverUrl);
      }
      uploadItem.progress = 100;

      // 同步到 form
      if (type === 'covers') form.coverImage.push(serverUrl);
      if (type === 'videos') form.videoUrl.push(serverUrl);
    } else {
      throw new Error(response.data?.message || '上传失败');
    }
  } catch (error) {
    uploadItem.progress = 0;
    if (type !== 'videos') uploadItem.url = '';
    // 从队列中移除失败的任务
    const idx = uploads[type].indexOf(uploadItem);
    if (idx !== -1) uploads[type].splice(idx, 1);
    ElMessage.error(`部分文件上传失败：${error.message}`);
  }
};

const nextStep = async () => {
  if (activeStep.value === 0) {
    const valid = await formRef.value?.validate().catch(() => false);
    if (!valid) return;
    activeStep.value++;
  }
};

const prevStep = () => {
  if (activeStep.value > 0) activeStep.value--;
};

const goToConfirm = () => {
  if (!uploads.logo.url) {
    ElMessage.warning('请上传项目封面');
    return;
  }
  if (uploads.covers.length === 0) {
    ElMessage.warning('请至少上传一张项目详情图');
    return;
  }
  if (anyUploading.value) {
    ElMessage.warning('文件正在上传中，请稍候');
    return;
  }
  activeStep.value++;
};

const createProject = async () => {
  creating.value = true;
  try {
    await projectStore.createProject({
      name: form.name,
      description: form.description,
      url: form.url,
      type: form.type,
      logo: form.logo,
      coverImage: form.coverImage,
      videoUrl: form.videoUrl,
      disclosureProtocol: form.disclosureProtocol,
      cooperationForm: form.cooperationForm,
      useDashtro: form.useDashtro,
      dashtroAgreement: form.dashtroAgreement
    });
    ElMessage.success('项目创建成功！');
    router.push('/my-projects');
  } catch (error) {
    ElMessage.error('创建失败，请重试');
  } finally {
    creating.value = false;
  }
};
</script>

<style scoped>
.upload-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
@media (min-width: 1024px) {
  .upload-grid { grid-template-columns: 1fr 1fr; }
}

.full-width-card {
  grid-column: 1 / -1;
}

.upload-card {
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: white;
}
.upload-card.is-done {
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.08);
}
.upload-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.upload-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
}
.logo-badge  { background: #eef2ff; color: #4361ee; }
.cover-badge { background: #f0fdf4; color: #16a34a; }
.video-badge { background: #fff7ed; color: #ea580c; }

.upload-hint {
  font-size: 12px;
  color: #9ca3af;
}

.upload-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 130px;
  border: 1.5px dashed #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  background: #f9fafb;
}
.upload-dropzone:hover {
  border-color: #4361ee;
  background: #eef2ff;
}
.drop-icon { color: #9ca3af; }
.drop-text { font-size: 13px; color: #9ca3af; user-select: none; }

.upload-preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}
.square-preview { width: 100%; aspect-ratio: 1/1; max-height: 180px; }
.upload-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
.preview-mask {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: #fff;
  font-size: 22px;
}
.upload-preview:hover .preview-mask { opacity: 1; }

.confirm-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}
@media (max-width: 640px) {
  .confirm-grid { grid-template-columns: 1fr; }
}

.label { font-size: 13px; color: #9ca3af; margin-bottom: 2px; }
.value { font-weight: 500; color: #111827; word-break: break-all; }

.preview-summary { display: flex; flex-direction: column; gap: 16px; }
.preview-thumb-square { width: 72px; height: 72px; object-fit: cover; border-radius: 8px; margin-top: 4px; }
.preview-thumb-wide-small { width: 90px; height: 60px; object-fit: cover; border-radius: 6px; }

.video-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #fff7ed;
  color: #ea580c;
  border-radius: 999px;
  font-size: 13px;
  margin-top: 4px;
}
</style>

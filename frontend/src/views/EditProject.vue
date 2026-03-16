<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="container-responsive py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">编辑项目</h1>
      </div>

      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading text-4xl text-primary-600"><Loading /></el-icon>
      </div>

      <div v-else-if="project" class="bg-white rounded-xl shadow-sm p-6 md:p-8">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <!-- 基础信息 -->
          <div class="mb-8">
            <h3 class="text-lg font-semibold mb-6 flex items-center space-x-2">
              <span class="w-1.5 h-5 bg-primary-500 rounded-full inline-block"></span>
              <span>基本信息</span>
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <el-form-item label="项目名称" prop="name">
                <el-input v-model="form.name" placeholder="请输入项目名称" :prefix-icon="Edit" />
              </el-form-item>

              <el-form-item label="项目类型" prop="type">
                <el-select v-model="form.type" placeholder="请选择项目类型" class="w-full">
                  <el-option v-for="type in projectTypes" :key="type.value" :label="type.label" :value="type.value" />
                </el-select>
              </el-form-item>
            </div>

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
              <p class="text-sm text-gray-500 mb-4">Dashtro 类似于 Stripe 收银台的接入体验，能够帮助平台级项目或者流量厂牌极速安全地完成基于交易驱动的智能分账。</p>
              
              <el-collapse-transition>
                <div v-if="form.useDashtro">
                  <el-form-item label="Dashtro 分账协议概述" prop="dashtroAgreement" class="mb-0">
                    <el-input v-model="form.dashtroAgreement" type="textarea" :rows="3" placeholder="由于您确认接入了 Dashtro，请在此简洁描述 Dashtro 分账协议的核心规则内容..." />
                  </el-form-item>
                </div>
              </el-collapse-transition>
            </div>
          </div>

          <el-divider class="my-8" />

          <!-- 上传资料 -->
          <div class="mb-8">
            <h3 class="text-lg font-semibold mb-6 flex items-center space-x-2">
              <span class="w-1.5 h-5 bg-primary-500 rounded-full inline-block"></span>
              <span>项目素材</span>
            </h3>
            <p class="text-gray-500 text-sm mb-6">如不需要修改素材，可跳过此区域。上传新文件会自动替换或追加。</p>

            <div class="upload-grid">
              <!-- 项目封面 (Logo) -->
              <div class="upload-card" :class="{ 'is-done': uploads.logo.url }">
                <div class="upload-card__header">
                  <span class="upload-badge logo-badge">项目封面</span>
                  <span class="upload-hint">200×200 • PNG / JPG • ≤ 5MB</span>
                </div>

                <div v-if="uploads.logo.url" class="upload-preview square-preview" @click="clearUpload('logo')">
                  <img :src="uploads.logo.url.startsWith('http') ? uploads.logo.url : (serverBase + uploads.logo.url)" alt="Logo 预览" />
                  <div class="preview-mask"><el-icon><Delete /></el-icon></div>
                </div>
                <div v-else class="upload-dropzone" @click="triggerInput('logo')">
                  <el-icon :size="32" class="drop-icon"><Picture /></el-icon>
                  <p class="drop-text">点击或拖拽上传</p>
                </div>

                <el-progress v-if="uploads.logo.progress > 0 && uploads.logo.progress < 100" :percentage="uploads.logo.progress" :stroke-width="4" class="mt-3" />
                <input ref="logoInputRef" type="file" accept="image/jpeg,image/png,image/jpg,image/webp" style="display:none" @change="handleFileChange($event, 'logo')" />
              </div>

              <!-- 详情图 (多选) -->
              <div class="upload-card" :class="{ 'is-done': uploads.covers.length > 0 }">
                <div class="upload-card__header">
                  <span class="upload-badge cover-badge">项目详情图</span>
                  <span class="upload-hint">800×400 • 最多5张</span>
                </div>

                <div class="flex flex-wrap gap-3">
                  <div v-for="(item, index) in uploads.covers" :key="index" class="relative w-[140px] h-[80px] rounded-lg overflow-hidden group border border-gray-100 placeholder-loading bg-gray-50">
                    <img v-if="item.url" :src="item.url.startsWith('http') ? item.url : (serverBase + item.url)" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" @click="removeArrayUpload('covers', index)">
                      <el-icon class="text-white text-xl"><Delete /></el-icon>
                    </div>
                    <div v-if="item.progress > 0 && item.progress < 100" class="absolute inset-x-0 bottom-0 h-1 bg-gray-200">
                      <div class="h-full bg-primary-500 transition-all duration-300" :style="{ width: item.progress + '%' }"></div>
                    </div>
                  </div>

                  <div v-if="uploads.covers.length < 5" class="w-[140px] h-[80px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-primary-500 hover:text-primary-500 transition-colors" @click="triggerInput('cover')">
                    <el-icon :size="24"><Plus /></el-icon>
                    <span class="text-xs mt-1">上传</span>
                  </div>
                </div>

                <input ref="coverInputRef" type="file" multiple accept="image/jpeg,image/png,image/jpg,image/webp" style="display:none" @change="handleFileChange($event, 'covers')" />
              </div>

              <!-- 视频 (多选) -->
              <div class="upload-card full-width-card" :class="{ 'is-done': uploads.videos.length > 0 }">
                <div class="upload-card__header">
                  <span class="upload-badge video-badge">视频</span>
                  <span class="upload-hint">MP4 / WebM • ≤ 20MB • 最多3个（选填）</span>
                </div>

                <div class="flex flex-wrap gap-4">
                  <div v-for="(item, index) in uploads.videos" :key="index" class="relative w-[280px] group border border-gray-100 rounded-lg overflow-hidden placeholder-loading bg-black">
                    <video v-if="item.url" :src="item.url.startsWith('http') ? item.url : (serverBase + item.url)" class="w-full h-[150px] object-cover" />
                    <div class="absolute top-2 right-2 flex items-center justify-center cursor-pointer z-10" @click="removeArrayUpload('videos', index)">
                      <el-icon class="text-white text-2xl drop-shadow-md bg-black/40 rounded-full"><CircleCloseFilled /></el-icon>
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

                <input ref="videoInputRef" type="file" multiple accept="video/mp4,video/webm,video/quicktime" style="display:none" @change="handleFileChange($event, 'videos')" />
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
            <el-button @click="deleteProject" type="danger" text class="hover:bg-red-50">
              删除项目
            </el-button>
            <div class="space-x-4">
              <el-button @click="router.back()">取消</el-button>
              <el-button type="primary" @click="updateProject" :loading="updating || anyUploading" class="px-8">
                {{ anyUploading ? '素材上传中...' : '保存修改' }}
              </el-button>
            </div>
          </div>
        </el-form>
      </div>

      <div v-else class="empty-state">
        <div class="empty-state-icon">📭</div>
        <p class="empty-state-text">项目不存在或加载失败</p>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import { useAuthStore } from '@/stores/auth';
import Navbar from '@/components/Navbar.vue';
import Footer from '@/components/Footer.vue';
import { Edit, Link, VideoPlay, Picture, Delete, CircleCloseFilled, Plus, Loading, Connection } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const projectStore = useProjectStore();

const serverBase = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

const loading = ref(true);
const updating = ref(false);
const formRef = ref(null);
const project = ref(null);

const logoInputRef = ref(null);
const coverInputRef = ref(null);
const videoInputRef = ref(null);
const inputRefs = { logo: logoInputRef, cover: coverInputRef, video: videoInputRef };

const uploads = reactive({
  logo: { file: null, url: '', progress: 0 },
  covers: [],
  videos: []
});

const anyUploading = computed(() => {
  return (uploads.logo.progress > 0 && uploads.logo.progress < 100) ||
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
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }, { min: 2, message: '项目名称至少2个字符', trigger: 'blur' }],
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

const normalizeUrl = () => {
  const v = form.url.trim();
  if (v && !/^https?:\/\//i.test(v)) form.url = 'https://' + v;
};

const fetchProject = async () => {
  loading.value = true;
  try {
    const projectId = route.params.id;
    const response = await projectStore.fetchProjectById(projectId);
    project.value = response.data;

    // Fill textual form fields
    form.name = project.value.name;
    form.type = project.value.type;
    form.description = project.value.description;
    form.url = project.value.url;
    form.disclosureProtocol = project.value.disclosureProtocol || '';
    form.cooperationForm = project.value.cooperation_form || '';
    form.useDashtro = !!project.value.use_dashtro;
    form.dashtroAgreement = project.value.dashtro_agreement || '';
    form.logo = project.value.logo || '';
    form.coverImage = project.value.cover_image || [];
    form.videoUrl = project.value.video_url || [];

    // Pre-hydrate existing media into uploads layout
    if (form.logo) {
      uploads.logo.url = form.logo;
      uploads.logo.progress = 100;
    }
    
    if (Array.isArray(form.coverImage)) {
      uploads.covers = form.coverImage.map(url => ({ file: null, url, progress: 100 }));
    }
    
    if (Array.isArray(form.videoUrl)) {
      uploads.videos = form.videoUrl.map(url => ({ file: null, url, progress: 100 }));
    }
  } catch (error) {
    ElMessage.error('加载项目失败');
  } finally {
    loading.value = false;
  }
};

const triggerInput = (type) => inputRefs[type].value?.click();

const clearUpload = (type) => {
  if (type === 'logo') {
    uploads.logo = { file: null, url: '', progress: 0 };
    form.logo = '';
  }
  if (inputRefs[type].value) inputRefs[type].value.value = '';
};

const removeArrayUpload = (type, index) => {
  const removed = uploads[type].splice(index, 1)[0];
  if (!removed) return;
  if (type === 'covers') {
    form.coverImage = form.coverImage.filter(u => u !== removed.url);
  } else if (type === 'videos') {
    form.videoUrl = form.videoUrl.filter(u => u !== removed.url);
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
      await uploadToServerArrayItem(uploadItem, type);
    }
  }
  event.target.value = '';
};

const uploadToServer = async (file, type) => {
  const formData = new FormData();
  formData.append(type, file);
  
  try {
    uploads.logo.progress = 5;
    const response = await axios.post('http://localhost:3001/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${authStore.token}` },
      onUploadProgress: (e) => {
        if (e.total) uploads.logo.progress = Math.round((e.loaded / e.total) * 90);
      }
    });
    if (response.data?.success) {
      const serverUrl = response.data.data.logo;
      uploads.logo.url = serverUrl;
      form.logo = serverUrl;
      uploads.logo.progress = 100;
      ElMessage.success('详情封面上传成功');
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
    const response = await axios.post('http://localhost:3001/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${authStore.token}` },
      onUploadProgress: (e) => {
        if (e.total) uploadItem.progress = Math.round((e.loaded / e.total) * 90);
      }
    });

    if (response.data?.success) {
      const serverUrls = response.data.data[fieldName];
      const serverUrl = Array.isArray(serverUrls) ? serverUrls[0] : serverUrls;

      uploadItem.url = serverUrl;
      uploadItem.progress = 100;

      if (type === 'covers') form.coverImage.push(serverUrl);
      if (type === 'videos') form.videoUrl.push(serverUrl);
    } else {
      throw new Error(response.data?.message || '上传失败');
    }
  } catch (error) {
    uploadItem.progress = 0;
    uploadItem.url = '';
    const idx = uploads[type].indexOf(uploadItem);
    if (idx !== -1) uploads[type].splice(idx, 1);
    ElMessage.error(`部分文件上传失败：${error.message}`);
  }
};

const updateProject = async () => {
  if (anyUploading.value) {
    ElMessage.warning('视频或图片正在上传中，请稍后再保存');
    return;
  }
  const valid = await formRef.value?.validate();
  if (!valid) return;

  updating.value = true;
  try {
    await projectStore.updateProject(route.params.id, {
      ...form,
      coverImage: form.coverImage,
      videoUrl: form.videoUrl
    });
    ElMessage.success('项目更新成功');
    router.back();
  } catch (error) {
    ElMessage.error('更新失败');
  } finally {
    updating.value = false;
  }
};

const deleteProject = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这个项目吗？删除后无法恢复。', '确认删除', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    });

    await projectStore.deleteProject(route.params.id);
    ElMessage.success('项目删除成功');
    router.back();
  } catch (error) {
    // cancelled do nothing
  }
};

onMounted(fetchProject);
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
</style>

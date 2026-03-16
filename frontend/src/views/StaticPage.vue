<template>
  <div class="min-h-screen bg-gray-50/50 flex flex-col">
    <Navbar />

    <div class="flex-1 container-responsive py-12 fade-in min-h-[600px] flex flex-col">
      <!-- 页面标题与内容容器 -->
      <div class="w-full lg:w-[1024px] mx-auto flex-1">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">{{ pageTitle }}</h1>

        <!-- 关于我们 -->
        <template v-if="page === 'about'">
          <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100/60 p-8 mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">我们是谁</h2>
            <p class="text-gray-600 leading-relaxed mb-4">
              DashHub 是一个连接品牌商、流量厂牌和 AI Agent 的可信项目展示平台。我们致力于为用户提供便捷的产品和服务入口，记录项目可信性，让优质项目被更多人发现。
            </p>
            <p class="text-gray-600 leading-relaxed">
              我们的团队由一群热爱技术和创新的人组成，专注于打造一个开放、透明、可信的项目生态。
            </p>
          </div>
          <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100/60 p-8">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">我们的愿景</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="text-center p-4">
                <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <el-icon class="text-primary-600 text-xl"><Connection /></el-icon>
                </div>
                <h3 class="font-semibold text-gray-800 mb-2">连接</h3>
                <p class="text-sm text-gray-500">连接优质项目与用户，促进互信合作</p>
              </div>
              <div class="text-center p-4">
                <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <el-icon class="text-primary-600 text-xl"><View /></el-icon>
                </div>
                <h3 class="font-semibold text-gray-800 mb-2">透明</h3>
                <p class="text-sm text-gray-500">公开项目数据，保障信息透明</p>
              </div>
              <div class="text-center p-4">
                <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <el-icon class="text-primary-600 text-xl"><CircleCheck /></el-icon>
                </div>
                <h3 class="font-semibold text-gray-800 mb-2">可信</h3>
                <p class="text-sm text-gray-500">验证项目合规性，建立信任体系</p>
              </div>
            </div>
          </div>
        </template>

        <!-- 联系我们 -->
        <template v-else-if="page === 'contact'">
          <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100/60 p-8 mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-6">联系方式</h2>
            <div class="space-y-4">
              <div class="flex items-center space-x-3 text-gray-600">
                <el-icon class="text-primary-600"><Message /></el-icon>
                <span>邮箱：contact@dashhub.com</span>
              </div>
              <div class="flex items-center space-x-3 text-gray-600">
                <el-icon class="text-primary-600"><Phone /></el-icon>
                <span>电话：400-888-8888</span>
              </div>
              <div class="flex items-center space-x-3 text-gray-600">
                <el-icon class="text-primary-600"><Location /></el-icon>
                <span>地址：上海市浦东新区张江高科技园区</span>
              </div>
            </div>
          </div>
          <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100/60 p-8">
            <h2 class="text-xl font-semibold text-gray-800 mb-6">发送消息</h2>
            <el-form label-position="top">
              <el-form-item label="姓名">
                <el-input placeholder="您的名字" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input placeholder="your@email.com" />
              </el-form-item>
              <el-form-item label="消息">
                <el-input type="textarea" :rows="4" placeholder="请输入您的消息..." />
              </el-form-item>
              <el-button type="primary" class="cursor-pointer">发送消息</el-button>
            </el-form>
          </div>
        </template>

        <!-- 法律页面（用户协议/隐私政策/免责声明/帮助中心） -->
        <template v-else>
          <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100/60 p-8">
            <div v-if="page === 'terms'" class="prose max-w-none">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">用户协议</h2>
              <p class="text-gray-600 mb-4">更新日期：2026年3月5日</p>
              <div class="space-y-4 text-gray-600 leading-relaxed">
                <p>欢迎使用 DashHub 平台（以下简称"本平台"）。在使用本平台提供的各项服务之前，请您仔细阅读并理解本用户协议。</p>
                <h3 class="text-lg font-medium text-gray-800 mt-6">1. 服务说明</h3>
                <p>本平台是一个项目展示和发现平台，为品牌商、流量厂牌和 AI Agent 提供可信的项目入口和服务展示。</p>
                <h3 class="text-lg font-medium text-gray-800 mt-6">2. 用户注册与账号安全</h3>
                <p>用户应提供真实、准确的注册信息，并妥善保管账号及密码安全。因用户行为导致的账号安全问题由用户自行承担。</p>
                <h3 class="text-lg font-medium text-gray-800 mt-6">3. 用户行为规范</h3>
                <p>用户在使用本平台时，应遵守相关法律法规，不得发布违法违规内容，不得侵犯他人合法权益。</p>
              </div>
            </div>

            <div v-else-if="page === 'privacy'" class="prose max-w-none">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">隐私政策</h2>
              <p class="text-gray-600 mb-4">更新日期：2026年3月5日</p>
              <div class="space-y-4 text-gray-600 leading-relaxed">
                <h3 class="text-lg font-medium text-gray-800 mt-2">1. 信息收集</h3>
                <p>我们收集您在注册和使用过程中提供的个人信息，包括但不限于邮箱地址、用户名等。</p>
                <h3 class="text-lg font-medium text-gray-800 mt-6">2. 信息使用</h3>
                <p>我们将收集的信息用于提供、改善和个性化我们的服务，包括用户认证、项目推荐等。</p>
                <h3 class="text-lg font-medium text-gray-800 mt-6">3. 信息保护</h3>
                <p>我们采取合理的安全措施保护您的个人信息，防止未经授权的访问、使用或泄露。</p>
              </div>
            </div>

            <div v-else-if="page === 'disclaimer'" class="prose max-w-none">
              <h2 class="text-xl font-semibold text-gray-800 mb-4">免责声明</h2>
              <p class="text-gray-600 mb-4">更新日期：2026年3月5日</p>
              <div class="space-y-4 text-gray-600 leading-relaxed">
                <p>本平台仅提供项目信息展示服务，不对入驻项目的真实性、合法性做出保证。</p>
                <p>用户在使用项目服务时产生的交易行为和风险由用户自行承担，本平台不承担任何连带责任。</p>
                <p>本平台对因不可抗力、系统故障等原因导致的服务中断或数据丢失不承担赔偿责任。</p>
              </div>
            </div>

            <div v-else-if="page === 'help'" class="prose max-w-none">
              <h2 class="text-xl font-semibold text-gray-800 mb-6">帮助中心</h2>
              <div class="space-y-4">
                <el-collapse>
                  <el-collapse-item title="如何注册账号？" name="1">
                    <p class="text-gray-600">点击页面右上角的"注册"按钮，输入邮箱获取验证码，填写用户名和密码即可完成注册。</p>
                  </el-collapse-item>
                  <el-collapse-item title="如何创建项目？" name="2">
                    <p class="text-gray-600">登录后，点击导航栏的"创建项目"按钮，填写项目基本信息、上传封面图、填写描述内容后提交即可。</p>
                  </el-collapse-item>
                  <el-collapse-item title="如何编辑或删除已有项目？" name="3">
                    <p class="text-gray-600">进入"我的项目"页面，找到需要修改的项目，点击"编辑"或"删除"按钮即可操作。</p>
                  </el-collapse-item>
                  <el-collapse-item title="项目数据如何计算？" name="4">
                    <p class="text-gray-600">平台根据项目的交易数据实时统计总交易额、总分账额、周交易额等核心指标，数据透明可信。</p>
                  </el-collapse-item>
                  <el-collapse-item title="如何联系客服？" name="5">
                    <p class="text-gray-600">您可以通过"联系我们"页面发送消息，或发送邮件至 contact@dashhub.com。</p>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
import FooterComponent from '@/components/Footer.vue';
import { Connection, View, CircleCheck, Message, Phone, Location } from '@element-plus/icons-vue';

// 由于 Footer 是 HTML 原生标签，这里用别名
const Footer = FooterComponent;

const route = useRoute();

const page = computed(() => route.params.page || 'about');

const pageTitles = {
  about: '关于我们',
  contact: '联系我们',
  terms: '用户协议',
  privacy: '隐私政策',
  disclaimer: '免责声明',
  help: '帮助中心'
};

const pageTitle = computed(() => pageTitles[page.value] || '页面');
</script>

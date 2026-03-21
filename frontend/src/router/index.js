import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/oauth/authorize',
    name: 'OAuthAuthorize',
    component: () => import('@/views/OAuthAuthorize.vue'),
    meta: { title: '授权', requiresAuth: true }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search.vue'),
    meta: { title: '搜索' }
  },
  {
    path: '/leaderboard',
    name: 'Leaderboard',
    component: () => import('@/views/Leaderboard.vue'),
    meta: { title: '排行榜' }
  },
  {
    path: '/creator/:userId',
    name: 'CreatorProfile',
    component: () => import('@/views/CreatorProfile.vue'),
    meta: { title: '创建者主页' }
  },
  {
    path: '/project/:id',
    name: 'ProjectDetail',
    component: () => import('@/views/ProjectDetail.vue'),
    meta: { title: '项目详情' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/my-projects',
    name: 'MyProjects',
    component: () => import('@/views/MyProjects.vue'),
    meta: { title: '我的项目', requiresAuth: true }
  },
  {
    path: '/create-project',
    name: 'CreateProject',
    component: () => import('@/views/CreateProject.vue'),
    meta: { title: '创建项目', requiresAuth: true }
  },
  {
    path: '/edit-project/:id',
    name: 'EditProject',
    component: () => import('@/views/EditProject.vue'),
    meta: { title: '编辑项目', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/page/:page',
    name: 'StaticPage',
    component: () => import('@/views/StaticPage.vue'),
    meta: { title: '页面' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '404' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard
router.beforeEach((to, from, next) => {
  // Set page title
  document.title = to.meta.title ? `${to.meta.title} - DashHub` : 'DashHub';

  // Check authentication
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

export default router;

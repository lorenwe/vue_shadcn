import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { setupRouterGuard } from './guard'

// 1. 替换：手动定义静态路由（登录、404、首页等固定页面）
const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    meta: {auth: true},
    component: () => import('@/pages/index.vue')
  },
  {
    path: '/login',
    name: 'Login',
    meta: { layout: true }, // 不需要布局
    component: () => import('@/pages/login.vue')
  },
//   {
//     path: '/:pathMatch(.*)*',
//     name: 'NotFound',
//     component: () => import('@/pages/404.vue')
//   }
]

const router = createRouter({
  history: createWebHistory(),
  routes: setupLayouts(staticRoutes),

  scrollBehavior() {
    return { left: 0, top: 0, behavior: 'smooth' }
  },
})

setupRouterGuard(router)

export default router

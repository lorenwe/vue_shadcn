import type { Router } from 'vue-router'

import { storeToRefs } from 'pinia'

import pinia from '@/plugins/pinia/setup'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore(pinia)

export function setupAuthGuard(router: Router) {
  router.beforeEach((to, from) => {
    const { isLogin } = storeToRefs(authStore)

    const authPaths = ['/auth/sign-in', '/auth/sign-up']
    const isAuthPage = authPaths.includes(to.path)
    const isFromAuthPage = authPaths.includes(from.path)

    // 若已登录，则从认证页面重定向至先前的非认证页面（若有效），否则重定向至首页
    if (isLogin.value && isAuthPage) {
      // 来源路由有效：有路径、不是当前页、也不是登录页
      if (from.path && from.path !== to.path && !isFromAuthPage) {
        return from // 回到上一页
      }
      // 来源无效 / 直接打开登录页 → 跳首页
      return { path: '/' }
    }

    // 如果页面需要身份验证，但用户未登录，请重定向到登录页面
    if (to.meta.auth && !isLogin.value && !isAuthPage) {
      return {
        name: '/auth/sign-in',
        query: { redirect: to.fullPath },
      }
    }
  })
}

import type { Router } from 'vue-router'

import { storeToRefs } from 'pinia'

import pinia from '@/plugins/pinia/setup'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore(pinia)

export function setupAuthGuard(router: Router) {
  router.beforeEach((to, from) => {
    const { isLogin, token } = storeToRefs(authStore)

    const authPaths = ['/login']
    const isAuthPage = authPaths.includes(to.path)
    const isFromAuthPage = authPaths.includes(from.path)

    console.log(isLogin.value, token.value, isAuthPage)

    // 已登录（含 token 校验）：若访问登录页，则重定向至首页或上一页
    if (isLogin.value && token.value && isAuthPage) {
      if (from.path && from.path !== to.path && !isFromAuthPage) {
        return from
      }
      return { path: '/' }
    }

    // 未登录访问需要认证的页面，重定向到登录页
    if (to.meta.auth && !isLogin.value && !isAuthPage) {
      return {
        path: '/login',
        query: { redirect: to.fullPath },
      }
    }
  })
}

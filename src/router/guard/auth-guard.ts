import type { Router } from 'vue-router'

import { storeToRefs } from 'pinia'

import pinia from '@/plugins/pinia/setup'
import { useAuthStore } from '@/stores/auth'



export function setupAuthGuard(router: Router) {
  router.beforeEach((to, from) => {
    const authStore = useAuthStore(pinia)
    const { isLogin, token, userInfo } = storeToRefs(authStore)

    const authPaths = ['/login']
    const isAuthPage = authPaths.includes(to.path)  // 判断：**即将要跳转到的页面** 是不是登录页
    const isFromAuthPage = authPaths.includes(from.path)  // 判断：**当前离开的来源页面** 是不是登录页

    console.log(isLogin.value, token.value, isAuthPage, userInfo.value)

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

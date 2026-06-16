import type { Router } from 'vue-router'

import { storeToRefs } from 'pinia'

import pinia from '@/plugins/pinia/setup'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'

export function setupAuthGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const authStore = useAuthStore(pinia)
    const { isLogin, token } = storeToRefs(authStore)

    const authPaths = ['/login']
    const isAuthPage = authPaths.includes(to.path)
    const isFromAuthPage = authPaths.includes(from.path)

    // 已登录（含 token 校验）：若访问登录页，则重定向至首页或上一页
    if (isLogin.value && token.value && isAuthPage) {
      if (from.path && from.path !== to.path && !isFromAuthPage) {
        return from
      }
      return { path: '/' }
    }

    // 已登录访问非登录页：确保菜单已加载
    if (isLogin.value && token.value && !isAuthPage) {
      const menuStore = useMenuStore(pinia)
      if (!menuStore.isLoaded) {
        await menuStore.fetchMenu(router)
      }
      return
    }

    // 未登录 → 前往登录页：清除菜单（登出场景）
    if (!isLogin.value && isAuthPage && !isFromAuthPage) {
      const menuStore = useMenuStore(pinia)
      if (menuStore.isLoaded) {
        menuStore.clear(router)
      }
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

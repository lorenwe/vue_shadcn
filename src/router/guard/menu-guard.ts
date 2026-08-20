import type { Router } from 'vue-router'

import pinia from '@/plugins/pinia/setup'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'

import { useGuardContext } from './guard-context'

/**
 * 菜单守卫：处理动态菜单的加载与清除
 * - 已登录 + 菜单未加载 → 加载菜单 → 重定向触发路由重新匹配（仅一次）
 * - 未登录 + 前往登录页 → 清除菜单与动态路由
 */
export function setupMenuGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const { isLogin, isAuthPage } = useGuardContext(to, from)
    const menuStore = useMenuStore(pinia)

    // 已登录 + 菜单未加载 → 加载后重定向一次，让 Vue Router 重新匹配
    if (isLogin.value && !menuStore.isLoaded) {
      const ok = await menuStore.fetchMenu(router)
      // 装载成功才重新匹配动态路由；失败则清除登录态并跳转登录页，
      // 否则 isLoaded 一直是 false，配合 return to.fullPath 会反复重试接口造成死循环
      if (ok) {
        return to.fullPath
      }
      const authStore = useAuthStore(pinia)
      authStore.clearLocal()
      return { path: '/login', replace: true }
    }

    // 未登录 + 前往登录页 → 清除动态路由
    if (!isLogin.value && isAuthPage) {
      if (menuStore.isLoaded) {
        menuStore.clear(router)
      }
    }
  })
}

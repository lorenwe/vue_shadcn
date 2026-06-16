import type { Router } from 'vue-router'

import pinia from '@/plugins/pinia/setup'
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
      await menuStore.fetchMenu(router)
      return to.fullPath
    }

    // 未登录 + 前往登录页 → 清除动态路由
    if (!isLogin.value && isAuthPage) {
      if (menuStore.isLoaded) {
        menuStore.clear(router)
      }
    }
  })
}

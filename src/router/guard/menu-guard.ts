import type { Router } from 'vue-router'

import pinia from '@/plugins/pinia/setup'
import { useMenuStore } from '@/stores/menu'

import { useGuardContext } from './guard-context'

/**
 * 菜单守卫：处理动态菜单的加载与清除
 * - 已登录 → 非登录页 → 确保菜单已加载（注册动态路由后重定向以触发重新匹配）
 * - 未登录 → 前往登录页 → 清除菜单与动态路由
 */
export function setupMenuGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const { isLogin, token, isAuthPage, isFromAuthPage } = useGuardContext(to, from)

    // 已登录 + 非登录页：确保菜单已加载
    if (isLogin.value && token.value && !isAuthPage) {
      const menuStore = useMenuStore(pinia)
      if (!menuStore.isLoaded) {
        await menuStore.fetchMenu(router)
        return to.fullPath
      }
    }

    // 未登录 + 前往登录页：清除菜单（登出场景）
    if (!isLogin.value && isAuthPage && !isFromAuthPage) {
      const menuStore = useMenuStore(pinia)
      if (menuStore.isLoaded) {
        menuStore.clear(router)
      }
    }
  })
}

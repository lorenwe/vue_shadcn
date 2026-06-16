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
    const { isLogin, isAuthPage, isFromAuthPage } = useGuardContext(to, from)
    const menuStore = useMenuStore(pinia)
    console.log("setupMenuGuard")
    console.log("menuStore.isLoaded", menuStore.isLoaded)
    // 已登录
    if (isLogin.value) {
      if (!menuStore.isLoaded) {
        await menuStore.fetchMenu(router)
      }
    }

    // 已登录 + 从登录页跳转过来 → 加载菜单
    if (isLogin.value && isFromAuthPage && !isAuthPage) {
      return to.fullPath // 中断当前导航，并使用新的路径重新导航
    }

    // 未登录 + 前往登录页：清除菜单（登出场景）
    if (!isLogin.value && isAuthPage && !isFromAuthPage) {
      if (menuStore.isLoaded) {
        menuStore.clear(router)
      }
    }

    // 检查路由是否存在
    const routeExists = router.getRoutes().some(r => r.path === to.path)

    console.log("menuStore.isLoaded", menuStore.isLoaded)
    console.log("routeExists", routeExists)
    if (routeExists) {
      return to.fullPath
    }

    return true
  })
}

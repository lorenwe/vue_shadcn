import type { Router } from 'vue-router'

import pinia from '@/plugins/pinia/setup'
import { useTabsStore } from '@/stores/tabs'

/**
 * 标签守卫：在导航前把目标路由加入标签栏
 * 放在菜单守卫之后，确保动态路由已注册、meta 已就绪
 */
export function setupTabGuard(router: Router) {
  router.beforeEach((to) => {
    const tabsStore = useTabsStore(pinia)
    tabsStore.addTab(to)
  })
}

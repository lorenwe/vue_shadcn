import type { Router } from 'vue-router'

import { setupAuthGuard } from './auth-guard'
import { setupCommonGuard } from './common-guard'
import { setupMenuGuard } from './menu-guard'
import { setupTabGuard } from './tab-guard'

export function setupRouterGuard(router: Router) {
  // ① 通用：NProgress 进度条
  setupCommonGuard(router)
  // ② 认证：登录态校验、重定向
  setupAuthGuard(router)
  // ③ 菜单：动态路由加载、清除
  setupMenuGuard(router)
  // ④ 标签：把目标路由加入标签栏（放在菜单守卫后，meta 已就绪）
  setupTabGuard(router)
}

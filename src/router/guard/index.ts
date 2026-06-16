import type { Router } from 'vue-router'

import { setupAuthGuard } from './auth-guard'
import { setupCommonGuard } from './common-guard'
import { setupMenuGuard } from './menu-guard'

export function setupRouterGuard(router: Router) {
  // ① 通用：NProgress 进度条
  setupCommonGuard(router)
  // ② 认证：登录态校验、重定向
  setupAuthGuard(router)
  // ③ 菜单：动态路由加载、清除
  setupMenuGuard(router)
}

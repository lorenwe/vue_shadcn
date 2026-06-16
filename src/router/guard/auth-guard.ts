import type { Router } from 'vue-router'

import { useGuardContext } from './guard-context'

/**
 * 认证守卫：处理登录态校验与重定向
 * - 已登录 → 访问 /login → 重定向到首页或上一页
 * - 未登录 → 访问需认证页面 → 重定向到 /login?redirect=...
 */
export function setupAuthGuard(router: Router) {
  router.beforeEach((to, from) => {
    const { isLogin, token, isAuthPage, isFromAuthPage } = useGuardContext(to, from)

    // 已登录：访问登录页 → 重定向离开
    if (isLogin.value && token.value && isAuthPage) {
      if (from.path && from.path !== to.path && !isFromAuthPage) {
        return from
      }
      return { path: '/' }
    }

    // 未登录：访问需认证页面 → 重定向到登录页
    if (to.meta.auth && !isLogin.value && !isAuthPage) {
      return {
        path: '/login',
        query: { redirect: to.fullPath },
      }
    }
  })
}

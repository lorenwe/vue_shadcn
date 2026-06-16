import type { Router } from 'vue-router'

import { useGuardContext } from './guard-context'

/**
 * 认证守卫：处理登录态校验与重定向
 * - 已登录 → 访问 /login → 重定向到首页或上一页
 * - 未登录 → 访问需认证页面 → 重定向到 /login?redirect=...
 */
export function setupAuthGuard(router: Router) {
  router.beforeEach((to, from) => {
    const { isLogin, isAuthPage } = useGuardContext(to, from)

    console.log("setupAuthGuard")
    console.log(isLogin.value)
    console.log(isAuthPage)

    // 未登录 + 不是公共页面 → 立即重定向，不继续匹配
    if (!isLogin.value && !isAuthPage) {
      return {
        path: '/login',
        replace: true,
        query: { redirect: to.fullPath },
      }
    }

    // 已登录：访问登录页 → 重定向离开
    if (isLogin.value && isAuthPage) {
      return { path: '/' }
    }

    // 所有其他情况：返回 true 或 undefined 放行
    return true
  })
}

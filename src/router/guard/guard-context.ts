import type { RouteLocationNormalized } from 'vue-router'
import { storeToRefs } from 'pinia'

import pinia from '@/plugins/pinia/setup'
import { useAuthStore } from '@/stores/auth'

/**
 * 守卫公共上下文：认证状态 + 路径判断
 * auth-guard 和 menu-guard 共用，避免重复代码
 */
export function useGuardContext(to: RouteLocationNormalized, from: RouteLocationNormalized) {
  const authStore = useAuthStore(pinia)
  const { isLogin, token } = storeToRefs(authStore)
  // 定义认证页面路径列表
  const authPaths = ['/login', '/register']
  // 判断目标页面是否为认证页面
  const isAuthPage = authPaths.includes(to.path)
  // 判断来源页面是否为认证页面
  const isFromAuthPage = authPaths.includes(from.path) // 例如：从 /login 跳转 → true，从 /dashboard 跳转 → false

  return { isLogin, token, isAuthPage, isFromAuthPage, authPaths }
}

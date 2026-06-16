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

  const authPaths = ['/login']
  const isAuthPage = authPaths.includes(to.path)
  const isFromAuthPage = authPaths.includes(from.path)

  return { isLogin, token, isAuthPage, isFromAuthPage }
}

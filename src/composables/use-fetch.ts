/**
 * ofetch: https://github.com/unjs/ofetch
 */
import { ofetch } from 'ofetch'

import { API_BASE_URL, API_TIMEOUT } from '@/constants/app-config'
import pinia from '@/plugins/pinia/setup'
import { useAuthStore } from '@/stores/auth'

const apiFetch = ofetch.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT ?? false,
  onRequest: ({ options }) => {
    const authStore = useAuthStore(pinia)
    if (authStore.token) {
      options.headers = new Headers(options.headers)
      options.headers.set('Authorization', `Bearer ${authStore.token}`)
    }
  },
  onRequestError: ({ error }) => {
    console.error('[Fetch] 请求错误:', error)
  },
  onResponse: () => {
    // 响应拦截：可在此处理通用逻辑
  },
  onResponseError: async ({ request, response }) => {
    // 401 未授权：清除登录态并跳转登录页（排除登录接口本身）
    if (response?.status === 401 && !request?.toString().includes('/auth/login')) {
      const authStore = useAuthStore(pinia)
      await authStore.logout()
      // 若当前不在登录页，则跳转
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
  },
})

export function useApiFetch() {
  return {
    apiFetch,
  }
}

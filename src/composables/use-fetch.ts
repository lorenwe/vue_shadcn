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
})

export function useApiFetch() {
  return {
    apiFetch,
  }
}

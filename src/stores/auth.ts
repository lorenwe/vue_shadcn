import { defineStore } from 'pinia'
import { loginApi, logoutApi } from '@/api/auth/auth'
import type { UserInfo } from '@/api/auth/types'

export const useAuthStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref<UserInfo | null>(null)
  
  // 计算属性：由 token 自动推导登录态，不单独存
  const isLogin = computed(() => !!token.value)

  /**
   * 用户登录
   */
  async function login(email: string, password: string) {
    const res = await loginApi({ email, password })
    token.value = res.token
    userInfo.value = res.user
  }

  /**
   * 用户登出
   */
  async function logout() {
    try {
      await logoutApi()
    } catch {
      // 即使登出接口失败，也清除本地状态
    } finally {
      token.value = ''
      userInfo.value = null
    }
  }

  return {
    token,
    userInfo,
    isLogin,
    login,
    logout,
  }
}, {
  persist: {
    pick: ['token', 'userInfo'],
  },
})

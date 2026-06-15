import { defineStore } from 'pinia'
import { loginApi, logoutApi } from '@/api/auth'
import type { UserInfo } from '@/api/auth'

export const useAuthStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref<UserInfo | null>(null)
  const isLogin = ref(false)

  /**
   * 用户登录
   */
  async function login(email: string, password: string) {
    const res = await loginApi({ email, password })
    token.value = res.token
    userInfo.value = res.user
    isLogin.value = true
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
      isLogin.value = false
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
    pick: ['token', 'userInfo', 'isLogin'],
  },
})

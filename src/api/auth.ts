import { useApiFetch } from '@/composables/use-fetch'
import type { ApiResponse } from '@/types/api'

export interface LoginRequest {
  email: string
  password: string
}

export interface UserInfo {
  id: string
  email: string
  name?: string
  avatar?: string
}

export interface LoginResponse {
  token: string
  user: UserInfo
}

/**
 * 用户登录
 */
export async function loginApi(data: LoginRequest): Promise<LoginResponse> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch<ApiResponse<LoginResponse>>('/auth/login', {
    method: 'POST',
    body: data,
  })
  if (res.code !== 0) {
    throw new Error(res.message || '登录失败')
  }
  return res.data
}

/**
 * 用户登出
 */
export async function logoutApi(): Promise<void> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch<ApiResponse<null>>('/auth/logout', {
    method: 'POST',
  })
  if (res.code !== 0) {
    throw new Error(res.message || '登出失败')
  }
}

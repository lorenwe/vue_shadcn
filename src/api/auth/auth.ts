import z from 'zod'
import { useApiFetch } from '@/composables/use-fetch'
import { ApiResponseSchema } from '@/types/api'
import { LoginRequestSchema, LoginResponseSchema } from '@/validators/auth.validator'
import type { LoginRequest, LoginResponse } from './types'

/**
 * 用户登录
 */
export async function loginApi(data: LoginRequest): Promise<LoginResponse> {
  // 请求参数运行时校验（开发阶段可快速发现字段错误）
  const body = LoginRequestSchema.parse(data)

  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body,
  })

  // 响应结构 + 业务状态码一把校验
  const parsed = ApiResponseSchema(LoginResponseSchema).parse(res)
  if (parsed.code !== 0) {
    throw new Error(parsed.message || '登录失败')
  }
  return parsed.data
}

/**
 * 用户登出
 */
export async function logoutApi(): Promise<void> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/auth/logout', {
    method: 'POST',
  })

  const parsed = ApiResponseSchema(z.null()).parse(res)
  if (parsed.code !== 0) {
    throw new Error(parsed.message || '登出失败')
  }
}

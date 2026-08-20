import { useApiFetch } from '@/composables/use-fetch'
import { parseApiResponse } from '@/api/response'
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

  // 登录接口 code 401 表示账号密码错误，不按登录失效处理
  return parseApiResponse(res, LoginResponseSchema, { isLoginRequest: true })
}

/**
 * 用户登出
 */
export async function logoutApi(): Promise<void> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/auth/logout', {
    method: 'POST',
  })

  parseApiResponse(res)
}

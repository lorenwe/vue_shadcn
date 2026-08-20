import z from 'zod'
import { useApiFetch } from '@/composables/use-fetch'
import { ApiResponseSchema, ApiEnvelopeSchema } from '@/types/api'
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

  // 第一步解析外层信封
  const envelope = ApiEnvelopeSchema.parse(res)
  if (envelope.code !== 200) {
    throw new Error(envelope.message || '登录失败')
  }

  // 第二步解析数据结构
  const parsed = LoginResponseSchema.parse(envelope.data)
  return parsed
}

/**
 * 用户登出
 */
export async function logoutApi(): Promise<void> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/auth/logout', {
    method: 'POST',
  })

  // 第一步解析外层信封
  const envelope = ApiEnvelopeSchema.parse(res)
  if (envelope.code !== 200) {
    throw new Error(envelope.message || '登出失败')
  }
}

import z from 'zod'

import { ApiEnvelopeSchema } from '@/types/api'
import pinia from '@/plugins/pinia/setup'
import { useAuthStore } from '@/stores/auth'

/**
 * 统一响应解析选项
 */
interface ParseOptions {
  /** 成功业务码，默认 200 */
  successCode?: number
  /** 业务失败时的兜底提示文案 */
  errorMessage?: string
  /** 是否为登录接口本身：登录接口 code 401 表示账号密码错误，而非登录失效 */
  isLoginRequest?: boolean
}

/**
 * 解析服务端统一响应：两步验证
 * 第一步：解析外层信封（code/message）
 * 第二步：解析 data 数据结构
 * 内置登录失效判断（业务码 401），各接口无需再重复处理
 */
export function parseApiResponse<T extends z.ZodTypeAny>(
  res: unknown,
  dataSchema: T,
  options?: ParseOptions,
): z.infer<T>
export function parseApiResponse(
  res: unknown,
  dataSchema?: undefined,
  options?: ParseOptions,
): void
export function parseApiResponse<T extends z.ZodTypeAny>(
  res: unknown,
  dataSchema?: T,
  options: ParseOptions = {},
): z.infer<T> | void {
  // 第一步：解析外层信封（只校验 code/message，data 用 unknown 兜底）
  const envelope = ApiEnvelopeSchema.safeParse(res)
  if (!envelope.success) {
    throw new Error('响应格式错误：无法解析 code/message')
  }
  const { code, message, data } = envelope.data

  // 登录失效判断：业务码 401 且非登录接口本身
  if (code === 401 && !options.isLoginRequest) {
    handleLoginExpired()
    throw new Error(message || '登录已失效，请重新登录')
  }

  // 业务码判断
  const successCode = options.successCode ?? 200
  if (code !== successCode) {
    throw new Error(message || options.errorMessage || `请求失败（code: ${code}）`)
  }

  // 第二步：解析数据结构
  if (dataSchema) {
    const dataResult = dataSchema.safeParse(data)
    if (!dataResult.success) {
      console.error('接口返回数据格式错误', dataResult.error.issues)
      throw new Error('服务端返回数据异常')
    }
    return dataResult.data
  }
}

/**
 * 登录失效处理：清除本地登录态并跳转登录页
 */
function handleLoginExpired() {
  const authStore = useAuthStore(pinia)
  authStore.clearLocal()
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

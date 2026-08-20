import { useApiFetch } from '@/composables/use-fetch'
import { ApiResponseSchema, ApiEnvelopeSchema } from '@/types/api'
import { MenuResponseSchema2 } from './types'
import type { MenuResponse2 } from './types'

/**
 * 从服务端获取菜单数据
 */
export async function fetchMenuApi(): Promise<MenuResponse2> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/admin/user/menu', { method: 'POST' })

  // 第一步解析外层信封
  const envelope = ApiEnvelopeSchema.parse(res)
  if (envelope.code !== 200) {
    throw new Error(envelope.message || '获取菜单失败')
  }

  // 第二步解析数据结构
  const parsed = MenuResponseSchema2.parse(envelope.data)
  return parsed
}

import { useApiFetch } from '@/composables/use-fetch'
import { ApiResponseSchema } from '@/types/api'
import { MenuResponseSchema2 } from './types'
import type { MenuResponse2 } from './types'

/**
 * 从服务端获取菜单数据
 */
export async function fetchMenuApi(): Promise<MenuResponse2> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/admin/user/menu', { method: 'POST' })

  const parsed = ApiResponseSchema(MenuResponseSchema2).parse(res)
  if (parsed.code !== 200) {
    throw new Error(parsed.message || '获取菜单失败')
  }
  return parsed.data
}

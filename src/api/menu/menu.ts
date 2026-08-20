import { useApiFetch } from '@/composables/use-fetch'
import { parseApiResponse } from '@/api/response'
import { MenuResponseSchema2 } from './types'
import type { MenuResponse2 } from './types'

/**
 * 从服务端获取菜单数据
 */
export async function fetchMenuApi(): Promise<MenuResponse2> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/admin/user/menu', { method: 'POST' })

  return parseApiResponse(res, MenuResponseSchema2, { errorMessage: '获取菜单失败' })
}

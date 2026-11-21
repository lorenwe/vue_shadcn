import { useApiFetch } from '@/composables/use-fetch'
import { parseApiResponse } from '@/api/response'
import { MenuListResponseSchema } from './types'
import type { MenuListResponse } from './types'

/**
 * 获取菜单管理列表（/menu/list）
 */
export async function fetchMenuListApi(): Promise<MenuListResponse> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/menu/list', { method: 'POST' })

  return parseApiResponse(res, MenuListResponseSchema, { errorMessage: '获取菜单列表失败' })
}

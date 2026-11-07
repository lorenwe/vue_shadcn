import { useApiFetch } from '@/composables/use-fetch'
import { parseApiResponse } from '@/api/response'
import { MenuListResponseSchema, MenuResponseSchema2 } from './types'
import type { MenuListResponse, MenuResponse2 } from './types'

/**
 * 从服务端获取菜单数据
 */
export async function fetchMenuApi(): Promise<MenuResponse2> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/admin/user/menu', { method: 'POST' })

  return parseApiResponse(res, MenuResponseSchema2, { errorMessage: '获取菜单失败' })
}

/**
 * 获取菜单管理列表（/menu/list）
 */
export async function fetchMenuListApi(): Promise<MenuListResponse> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/menu/list', { method: 'POST' })

  return parseApiResponse(res, MenuListResponseSchema, { errorMessage: '获取菜单列表失败' })
}

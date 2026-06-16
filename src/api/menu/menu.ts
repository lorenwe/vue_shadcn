import { useApiFetch } from '@/composables/use-fetch'
import { ApiResponseSchema } from '@/types/api'
import { MenuResponseSchema } from './types'
import type { MenuResponse } from './types'

/**
 * 从服务端获取菜单数据
 */
export async function fetchMenuApi(): Promise<MenuResponse> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/menu/tree', { method: 'POST' })


  const parsed = ApiResponseSchema(MenuResponseSchema).parse(res)
  console.log(parsed.code)
  if (parsed.code !== 0) {
    throw new Error(parsed.message || '获取菜单失败')
  }
  return parsed.data
}

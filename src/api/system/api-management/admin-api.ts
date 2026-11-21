import { parseApiResponse } from "@/api/response"
import { AdminApiListResponseSchema, type AdminApiListResponse } from "./types"

/**
 * 获取菜单管理列表（/menu/list）
 */
export async function fetchAdminApiListApi(): Promise<AdminApiListResponse> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/admin/api/list', { method: 'POST' })

  return parseApiResponse(res, AdminApiListResponseSchema, { errorMessage: '获取接口列表失败' })
}
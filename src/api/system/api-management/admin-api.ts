import { parseApiResponse } from "@/api/response"
import {
  AdminApiListResponseSchema,
  type AdminApiListResponse,
  type AdminApiSavePayload,
} from "./types"

/**
 * 获取接口管理列表（/admin/api/list）
 */
export async function fetchAdminApiListApi(): Promise<AdminApiListResponse> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/admin/api/list', { method: 'POST' })

  return parseApiResponse(res, AdminApiListResponseSchema, { errorMessage: '获取接口列表失败' })
}

/** 新增接口（/admin/api/add） */
export async function createAdminApiApi(payload: AdminApiSavePayload): Promise<void> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/admin/api/add', {
    method: 'POST',
    body: payload,
  })

  parseApiResponse(res, undefined, { errorMessage: '新增接口失败' })
}

/** 编辑接口（/admin/api/edit） */
export async function updateAdminApiApi(payload: AdminApiSavePayload): Promise<void> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/admin/api/edit', {
    method: 'POST',
    body: payload,
  })

  parseApiResponse(res, undefined, { errorMessage: '保存接口失败' })
}

/** 删除接口（/admin/api/del） */
export async function deleteAdminApiApi(id: number): Promise<void> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/admin/api/del', {
    method: 'POST',
    body: { id },
  })

  parseApiResponse(res, undefined, { errorMessage: '删除接口失败' })
}

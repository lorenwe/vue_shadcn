import { useApiFetch } from '@/composables/use-fetch'
import { parseApiResponse } from '@/api/response'
import {
  RoleListResponseSchema,
  type RoleListQuery,
  type RoleListResponse,
  type RoleSavePayload,
  type RoleSortPayload,
} from './types'

/** 角色列表（/role/list） */
export async function fetchRolesApi(params: RoleListQuery): Promise<RoleListResponse> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/role/list', {
    method: 'POST',
    body: params,
  })

  return parseApiResponse(res, RoleListResponseSchema, { errorMessage: '获取角色列表失败' })
}

/** 新增角色（/role/add） */
export async function createRoleApi(payload: RoleSavePayload): Promise<void> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/role/add', {
    method: 'POST',
    body: payload,
  })

  parseApiResponse(res, undefined, { errorMessage: '新增角色失败' })
}

/** 编辑角色（/role/edit） */
export async function updateRoleApi(payload: RoleSavePayload): Promise<void> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/role/edit', {
    method: 'POST',
    body: payload,
  })

  parseApiResponse(res, undefined, { errorMessage: '保存角色失败' })
}

/** 删除角色（/role/del） */
export async function deleteRoleApi(id: number): Promise<void> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/role/del', {
    method: 'POST',
    body: { id },
  })

  parseApiResponse(res, undefined, { errorMessage: '删除角色失败' })
}

/** 修改当前行排序（/role/sort） */
export async function updateRoleSortApi(payload: RoleSortPayload): Promise<void> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/role/sort', {
    method: 'POST',
    body: payload,
  })

  parseApiResponse(res, undefined, { errorMessage: '修改排序失败' })
}

import { useApiFetch } from '@/composables/use-fetch'
import { parseApiResponse } from '@/api/response'
import {
  UserListResponseSchema,
  type UserListQuery,
  type UserListResponse,
  type UserSavePayload,
  type UserSortPayload,
} from './types'

/** 用户列表（/admin/user/list） */
export async function fetchUsersApi(params: UserListQuery): Promise<UserListResponse> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/admin/user/list', {
    method: 'POST',
    body: params,
  })

  return parseApiResponse(res, UserListResponseSchema, { errorMessage: '获取用户列表失败' })
}

/** 新增用户（/admin/user/add） */
export async function createUserApi(payload: UserSavePayload): Promise<void> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/admin/user/add', {
    method: 'POST',
    body: payload,
  })

  parseApiResponse(res, undefined, { errorMessage: '新增用户失败' })
}

/** 编辑用户（/admin/user/edit） */
export async function updateUserApi(payload: UserSavePayload): Promise<void> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/admin/user/edit', {
    method: 'POST',
    body: payload,
  })

  parseApiResponse(res, undefined, { errorMessage: '保存用户失败' })
}

/** 删除用户（/admin/user/del） */
export async function deleteUserApi(id: number): Promise<void> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/admin/user/del', {
    method: 'POST',
    body: { id },
  })

  parseApiResponse(res, undefined, { errorMessage: '删除用户失败' })
}

/** 修改当前行排序（/admin/user/sort） */
export async function updateUserSortApi(payload: UserSortPayload): Promise<void> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/admin/user/sort', {
    method: 'POST',
    body: payload,
  })

  parseApiResponse(res, undefined, { errorMessage: '修改排序失败' })
}

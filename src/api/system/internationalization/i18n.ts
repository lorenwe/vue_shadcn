import { useApiFetch } from '@/composables/use-fetch'
import { parseApiResponse } from '@/api/response'
import { LanguageListResponseSchema } from './types'
import type { LanguageListResponse, LanguageSavePayload } from './types'

/** 语言词条写接口（后端 SysLanguage 控制器） */
const LANGUAGE_WRITE_API = {
  create: '/language/add',
  update: '/language/edit',
  remove: '/language/del',
} as const

/**
 * 获取多语言词条列表（/language/list）
 * 返回树形结构，供国际化管理页展示
 */
export async function fetchLanguageListApi(): Promise<LanguageListResponse> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/language/list', {
    method: 'POST',
  })

  return parseApiResponse(res, LanguageListResponseSchema, {
    errorMessage: '获取多语言列表失败',
  })
}

/**
 * 新增语言词条（/language/add）
 */
export async function createLanguageApi(payload: LanguageSavePayload): Promise<void> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch(LANGUAGE_WRITE_API.create, {
    method: 'POST',
    body: payload,
  })

  parseApiResponse(res, undefined, { errorMessage: '新增词条失败' })
}

/**
 * 编辑语言词条（/language/edit）
 */
export async function updateLanguageApi(payload: LanguageSavePayload): Promise<void> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch(LANGUAGE_WRITE_API.update, {
    method: 'POST',
    body: payload,
  })

  parseApiResponse(res, undefined, { errorMessage: '保存词条失败' })
}

/**
 * 删除语言词条（/language/del）
 * 同时带 query 与 body，兼容 @RequestParam / @RequestBody 两种后端写法。
 */
export async function deleteLanguageApi(id: number): Promise<void> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch(`${LANGUAGE_WRITE_API.remove}?id=${encodeURIComponent(id)}`, {
    method: 'POST',
    body: { id },
  })

  parseApiResponse(res, undefined, { errorMessage: '删除词条失败' })
}

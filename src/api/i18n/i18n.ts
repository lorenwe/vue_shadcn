import { useApiFetch } from '@/composables/use-fetch'
import { parseApiResponse } from '@/api/response'
import { LanguageListResponseSchema, LanguagePackSchema } from './types'
import type { LanguageListResponse, LanguagePack } from './types'

/**
 * 从服务端获取完整语言包（所有语言一次性返回）
 */
export async function fetchLanguagePack(): Promise<LanguagePack> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/language/allLocales', {
    method: 'POST',
  })

  return parseApiResponse(res, LanguagePackSchema, { errorMessage: '获取语言包失败' })
}

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

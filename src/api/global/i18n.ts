import { useApiFetch } from '@/composables/use-fetch'
import { parseApiResponse } from '@/api/response'
import { LanguagePackSchema } from './types'
import type { LanguagePack } from './types'

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

import { useApiFetch } from '@/composables/use-fetch'
import { ApiResponseSchema } from '@/types/api'
import { LanguagePackSchema } from './types'
import type { LanguagePack } from './types'

/**
 * 从服务端获取完整语言包（所有语言一次性返回）
 */
export async function fetchLanguagePack(): Promise<LanguagePack> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch('/i18n/pack', {
    method: 'POST',
  })

  const parsed = ApiResponseSchema(LanguagePackSchema).parse(res)
  if (parsed.code !== 0) {
    throw new Error(parsed.message || '获取语言包失败')
  }
  return parsed.data
}

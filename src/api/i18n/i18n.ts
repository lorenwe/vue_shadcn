import { useApiFetch } from '@/composables/use-fetch'
import { ApiEnvelopeSchema } from '@/types/api'
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

  // 第一步解析外层信封
  const envelope = ApiEnvelopeSchema.parse(res)
  if (envelope.code !== 200) {
    throw new Error(envelope.message || '获取语言包失败')
  }
  // 第二步验证数据结构正确性
  const parsed = LanguagePackSchema.parse(envelope.data)
  return parsed
}

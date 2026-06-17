import type { Language } from '@/api/i18n/types';
import { useStorage } from '@vueuse/core'

/** 与 API 返回的 locale 码对齐 */
// export type Language = 'zh-CN' | 'en-US' | 'ja-JP' | 'zh-TW'

export const SUPPORTED_LOCALES: { code: Language; label: string }[] = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'en-US', label: 'English' },
  { code: 'ja-JP', label: '日本語' },
  { code: 'zh-TW', label: '繁體中文' },
]

export const DEFAULT_LOCALE: Language = 'zh-CN'

export const appLocale = useStorage<Language>('app-locale', DEFAULT_LOCALE)

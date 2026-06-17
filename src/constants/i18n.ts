import type { Language } from '@/api/i18n/types';

export const SUPPORTED_LOCALES: { code: Language; label: string }[] = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'en-US', label: 'English' },
  { code: 'ja-JP', label: '日本語' },
  { code: 'zh-TW', label: '繁體中文' },
]

export const DEFAULT_LOCALE: Language = 'zh-CN'



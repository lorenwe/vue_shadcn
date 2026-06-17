import type { App } from 'vue'
import { createI18n, type I18n } from 'vue-i18n'
import { appLocale, DEFAULT_LOCALE } from './index'
import en from './en.json'
import zh from './zh.json'
import { fetchLanguagePack } from '@/api/i18n/i18n'
import type { Language } from '@/api/i18n/types'

export let i18n: I18n

const builtIn: Record<Language, Record<string, any>> = {
  'zh-CN': zh,
  'en-US': en,
  'ja-JP': {},
  'zh-TW': {},
}

// const messages: Record<Language2, Record<string, any>> = {
//   zh,
//   en,
// }

export async function setupI18n(app: App) {
  i18n = createI18n({
    legacy: false,
    locale: appLocale.value,
    fallbackLocale: DEFAULT_LOCALE,
    messages: builtIn,
  })
  app.use(i18n)

  // 拉取远程语言包，逐个 locale 安全合并
  try {
    const remote = await fetchLanguagePack()
    for (const lang of Object.keys(remote) as Language[]) {
      try {
        const base = builtIn[lang] ?? {}
        const merged = deepMerge(base, remote[lang])
        i18n.global.setLocaleMessage(lang, merged)
      } catch {
        // 单个 locale 消息编译失败不阻塞其他语言
        console.warn(`[i18n] ${lang} 消息编译失败，使用内置兜底`)
      }
    }
  } catch {
    console.warn('[i18n] 远程语言包获取失败，使用内置兜底')
  }
}

function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (
      typeof source[key] === 'object' &&
      source[key] !== null &&
      !Array.isArray(source[key]) &&
      typeof result[key] === 'object' &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key], source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}

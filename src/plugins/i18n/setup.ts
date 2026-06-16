import type { App } from 'vue'

import { createI18n, type I18n } from 'vue-i18n'

import type { Language } from './index'

import { appLocale, DEFAULT_LOCALE } from './index'
import en from './en.json'
import zh from './zh.json'

export let i18n: I18n

export function setupI18n(app: App) {
  const messages: Record<Language, Record<string, any>> = {
    zh,
    en,
  }
  i18n = createI18n({
    legacy: false,
    locale: appLocale.value,
    fallbackLocale: DEFAULT_LOCALE,
     messages: {}, // 初始为空，接口动态填充
    // messages,
  })
  app.use(i18n)
}

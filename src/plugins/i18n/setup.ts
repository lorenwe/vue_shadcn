import type { App } from 'vue'

import { createI18n } from 'vue-i18n'

import type { Language } from './index'

import { appLocale, DEFAULT_LOCALE } from './index'
import en from './en.json'
import zh from './zh.json'

export function setupI18n(app: App) {
  const messages: Record<Language, Record<string, any>> = {
    zh,
    en,
  }
  const i18n = createI18n({
    legacy: false,
    locale: appLocale.value,
    fallbackLocale: DEFAULT_LOCALE,
    messages
  })
  app.use(i18n)
}
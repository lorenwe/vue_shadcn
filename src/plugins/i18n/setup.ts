import type { App } from 'vue'
import { createI18n, type I18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import pinia from '@/plugins/pinia/setup'
import { useAuthStore } from '@/stores/auth'
import { useI18nLoader, appLocale } from '@/composables/use-i18n-loader'

const { loadLocaleMessages, builtIn } = useI18nLoader()

let i18nInstance: I18n | null = null

export async function setupI18n(app: App) {
  i18nInstance = createI18n({
    legacy: false,
    locale: appLocale.value,
    fallbackLocale: DEFAULT_LOCALE,
    messages: builtIn,
  })
  app.use(i18nInstance)

  const { isLogin } = storeToRefs(useAuthStore(pinia))

  if (isLogin.value) {
    // 拉取远程语言包，逐个 locale 安全合并
    await loadLocaleMessages(i18nInstance)
  }
}

export function getI18nInstance() {
  if (!i18nInstance) {
    throw new Error('i18n 尚未初始化，请先调用 setupI18n')
  }
  return i18nInstance
}

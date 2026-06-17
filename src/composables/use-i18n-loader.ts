import { type I18n } from 'vue-i18n'
import { fetchLanguagePack } from '@/api/i18n/i18n'
import { deepMerge } from '@/utils/i18n'
import type { Language } from '@/api/i18n/types'
import en_us from '@/plugins/i18n/lang/en_us.json'
import ja_jp from '@/plugins/i18n/lang/ja_jp.json'
import zh_cn from '@/plugins/i18n/lang/zh_cn.json'
import zh_tw from '@/plugins/i18n/lang/zh_tw.json'
import { useStorage } from '@vueuse/core';

// 初始化 默认语言字段
export const appLocale = useStorage<Language>('app-locale', DEFAULT_LOCALE)

export function useI18nLoader() {
  const builtIn: Record<Language, Record<string, any>> = {
    'zh-CN': zh_cn,
    'en-US': en_us,
    'ja-JP': ja_jp,
    'zh-TW': zh_tw
  }

  // 从接口加载指定语言包 语言标识 zh-CN / en-US
  async function loadLocaleMessages(i18n: I18n) {
    console.log(`[i18n] 开始加载远程多语言包`)
    try {
      const remoteData = await fetchLanguagePack()
      // 合并远程语言包到 i18n
      for (const lang of Object.keys(remoteData) as Language[]) {
        try {
          const base = builtIn[lang] ?? {}
          const merged = deepMerge(base, remoteData[lang])
          i18n.global.setLocaleMessage(lang, merged)
        } catch {
          // 单个 locale 消息编译失败不阻塞其他语言
          console.warn(`[i18n] ${lang} 消息编译失败，使用内置兜底`)
        }
      }
    } catch (err) {
      console.error('加载语言包失败', err)
    }
  }

  // 切换语言
  async function setLocale(i18n: I18n, lang: string) {
    // 切换当前语言
    i18n.global.locale = lang
  }

  // 重置为本地语言包（退出登录时调用
  function resetToLocal(i18n: I18n) {
    // 重置 i18n 消息为本地语言包
    Object.entries(builtIn).forEach(([locale, messages]) => {
      i18n.global.setLocaleMessage(locale, messages)
    })
    console.log('📍 已重置为本地语言包')
  }

  return {
    builtIn,
    loadLocaleMessages,
    resetToLocal,
    setLocale
  }
}
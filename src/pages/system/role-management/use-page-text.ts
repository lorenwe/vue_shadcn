import { useI18n } from 'vue-i18n'

/**
 * 页面文案读取：
 * 优先命中登录后从 /language/allLocales 下发的词条；
 * 接口暂未提供该 key 时返回 fallback（不写入静态 lang 文件）。
 */
export function usePageText() {
  const { t, te, locale } = useI18n()

  function tr(key: string, fallback: string) {
    return te(key) ? t(key) : fallback
  }

  return { t, te, locale, tr }
}

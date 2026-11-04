import { defineStore } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'

/**
 * 标签页数据项
 */
export interface TabItem {
  /** 唯一标识：完整路径（含 query） */
  fullPath: string
  /** 路由路径 */
  path: string
  /** 路由 name */
  name: string
  /** 兜底标题（i18n key 存在时优先翻译） */
  title: string
  /** i18n key，如 menu.xxx / tabs.home */
  i18nKey?: string
  /** 组件 name，用于 keep-alive include */
  cacheName: string
  /** 固定标签（不可关闭，如首页） */
  affix?: boolean
}

/**
 * 首页固定标签：始终存在，不可关闭
 */
const HOME_TAB: TabItem = {
  fullPath: '/',
  path: '/',
  name: 'Home',
  title: '首页',
  i18nKey: 'tabs.home',
  cacheName: 'Home',
  affix: true,
}

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<TabItem[]>([{ ...HOME_TAB }])

  /** keep-alive include：当前打开标签对应的组件名（去重） */
  const cachedViews = computed(() => {
    const set = new Set<string>()
    for (const tab of tabs.value) {
      if (tab.cacheName) set.add(tab.cacheName)
    }
    return [...set]
  })

  /**
   * 打开标签：仅处理需要认证的页面，登录页不生成标签
   */
  function addTab(route: RouteLocationNormalized) {
    if (route.path === '/login') return
    const meta = route.meta as Record<string, any>
    if (!meta?.auth) return

    const fullPath = route.fullPath
    if (tabs.value.some(t => t.fullPath === fullPath)) return

    tabs.value.push({
      fullPath,
      path: route.path,
      name: String(route.name ?? ''),
      title: (meta.title as string) || String(route.name ?? '') || route.path,
      i18nKey: meta.i18nKey as string | undefined,
      cacheName: (meta.cacheName as string) || '',
      affix: !!meta.affix,
    })
  }

  /**
   * 关闭单个标签（固定标签不可关闭）
   */
  function removeTab(fullPath: string) {
    const idx = tabs.value.findIndex(t => t.fullPath === fullPath)
    if (idx === -1) return
    if (tabs.value[idx].affix) return
    tabs.value.splice(idx, 1)
  }

  /**
   * 关闭其他标签：保留固定标签 + 指定标签
   */
  function closeOthers(fullPath: string) {
    tabs.value = tabs.value.filter(t => t.affix || t.fullPath === fullPath)
  }

  /**
   * 关闭所有标签：仅保留固定标签
   */
  function closeAll() {
    tabs.value = tabs.value.filter(t => t.affix)
  }

  /**
   * 重置为初始状态（登出时调用）
   */
  function reset() {
    tabs.value = [{ ...HOME_TAB }]
  }

  return {
    tabs,
    cachedViews,
    addTab,
    removeTab,
    closeOthers,
    closeAll,
    reset,
  }
})

import { defineStore } from 'pinia'
import type { Router } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import { fetchMenuApi } from '@/api/menu/menu'
import type { MenuItem } from '@/api/menu/types'

export const useMenuStore = defineStore('menu', () => {
  const menuItems = ref<MenuItem[]>([])
  const isLoading = ref(false)
  const isLoaded = ref(false)
  const error = ref<string | null>(null)

  /**
   * 从服务端获取菜单，并动态注册路由（含布局包裹）
   */
  async function fetchMenu(router: Router) {
    if (isLoaded.value || isLoading.value) return

    isLoading.value = true
    error.value = null
    try {
      const data = await fetchMenuApi()
      menuItems.value = data
      registerDynamicRoutes(router, data)
      isLoaded.value = true
    } catch (e: any) {
      error.value = e?.message || '装载动态路由失败'
      console.error('[MenuStore] 装载动态路由失败:', e)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 递归注册动态路由（带 layout 包裹）
   * 使用 setupLayouts 确保动态路由与静态路由共享同一布局
   */
  function registerDynamicRoutes(router: Router, items: MenuItem[]) {
    const routeConfigs: Array<{ path: string; name: string; component: any; meta: any }> = []

    function collectRoutes(list: MenuItem[]) {
      for (const item of list) {
        if (item.url && !router.hasRoute(item.title)) {
          routeConfigs.push({
            path: item.url,
            name: item.title,
            component: () => import('@/pages/generic-page.vue'),
            meta: { auth: true, title: item.title },
          })
        }
        if (item.items && item.items.length > 0) {
          collectRoutes(item.items)
        }
      }
    }

    collectRoutes(items)

    // 用 setupLayouts 统一包裹布局，再逐条 addRoute
    const wrapped = setupLayouts(routeConfigs)
    for (const route of wrapped) {
      router.addRoute(route)
    }
  }

  /**
   * 清空菜单与动态路由（登出时调用）
   */
  function clear(router: Router) {
    for (const item of menuItems.value) {
      removeItemRoutes(router, item)
    }
    menuItems.value = []
    isLoaded.value = false
    isLoading.value = false
    error.value = null
  }

  function removeItemRoutes(router: Router, item: MenuItem) {
    if (item.url && router.hasRoute(item.title)) {
      router.removeRoute(item.title)
    }
    if (item.items) {
      for (const child of item.items) {
        removeItemRoutes(router, child)
      }
    }
  }

  return {
    menuItems,
    isLoading,
    isLoaded,
    error,
    fetchMenu,
    clear,
  }
})

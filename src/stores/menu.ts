import { defineStore } from 'pinia'
import type { Router } from 'vue-router'
// import { setupLayouts } from 'virtual:generated-layouts'
import { fetchMenuApi } from '@/api/menu/menu'
import type { MenuItem2 } from '@/api/menu/types'
import { clearDynamicRoutes, registerDynamicRoutes } from '@/router/dynamic-routes'

export const useMenuStore = defineStore('menu', () => {
  const menuItems = ref<MenuItem2[]>([])
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

  function removeItemRoutes(router: Router, item: MenuItem2) {
    // if (item.url && router.hasRoute(item.title)) {
    //   router.removeRoute(item.title)
    // }
    // if (item.items) {
    //   for (const child of item.items) {
    //     removeItemRoutes(router, child)
    //   }
    // } else {
    //   router.removeRoute(item.title)
    // }
    clearDynamicRoutes(router, item)
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

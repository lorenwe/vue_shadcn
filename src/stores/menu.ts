import { defineStore } from 'pinia'
import type { Router } from 'vue-router'
// import { setupLayouts } from 'virtual:generated-layouts'
import { fetchMenuApi } from '@/api/menu/menu'
import type { MenuItem } from '@/api/menu/types'
import { clearDynamicRoutes, registerDynamicRoutes } from '@/router/dynamic-routes'

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

  // /**
  //  * 递归注册动态路由（带 layout 包裹）
  //  * 使用 setupLayouts 确保动态路由与静态路由共享同一布局
  //  */
  // function registerDynamicRoutes(router: Router, items: MenuItem[]) {
  //   const routeConfigs: Array<{ path: string; name: string; component: any; meta: any }> = []

  //   function collectRoutes(list: MenuItem[]) {
  //     for (const item of list) {
  //       // 菜单树 生成路由表，只获取菜单最小节点，其余的都是菜单分组，无需注册成为路由
  //       if (item.items && item.items.length > 0) {
  //         collectRoutes(item.items)
  //       } else {
  //         routeConfigs.push({
  //           path: item.url ? item.url : "/",
  //           name: item.title,
  //           component: () => import('@/pages/generic-page.vue'),
  //           meta: { auth: true, title: item.title },
  //         })
  //       }
  //       // if (item.url && !router.hasRoute(item.title)) {
  //       //   routeConfigs.push({
  //       //     path: item.url,
  //       //     name: item.title,
  //       //     component: () => import('@/pages/generic-page.vue'),
  //       //     meta: { auth: true, title: item.title },
  //       //   })
  //       // }
  //       // if (item.items && item.items.length > 0) {
  //       //   collectRoutes(item.items)
  //       // }
  //     }
  //   }

  //   collectRoutes(items)
  //   // console.log(routeConfigs)

  //   // setupLayouts 包裹布局：name 会落到子路由上，需提到外层才能被 removeRoute 清除
  //   const wrapped = setupLayouts(routeConfigs)

  //   // console.log(wrapped)
  //   for (const route of wrapped) {
  //     if (route.children?.[0]?.name) {
  //       // 包裹了 Layouts 路由，name 在子路由上，把 name 提到上级路由去，后续才能正常清除路由
  //       route.name = route.children[0].name
  //       // 为子路由 name 重命名，防止和父级路由 name 一样
  //       route.children[0].name = `${route.children[0].name as String}Index`
  //     }
  //     router.addRoute(route)
  //   }
  // }

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

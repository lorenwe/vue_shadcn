// router/dynamic-routes.ts
import type { Router, RouteRecordRaw } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import type { MenuItem2 } from '@/api/menu/types'
import { routeMap, type RouteMapping } from './route-mapping'

// ===== 2. 构建快速查找索引 =====
const pathMap = new Map<string, RouteMapping>() // 静态路由
const dynamicPathMap = new Map<string, RouteMapping[]>() // 参数路由

// 构建索引
for (const mapping of routeMap) {
  if (mapping.dynamic) {
    // 参数路由：按前缀分组
    const prefix = mapping.path.replace(/\/:[^/]+$/, '')
    if (!dynamicPathMap.has(prefix)) {
      dynamicPathMap.set(prefix, [])
    }
    dynamicPathMap.get(prefix)!.push(mapping)
  } else {
    // 静态路由：精确匹配
    pathMap.set(mapping.path, mapping)
  }
}

// ===== 3. 查找路由 =====
function findRouteMapping(path: string): RouteMapping | null {
  // 1. 精确匹配
  if (pathMap.has(path)) {
    return pathMap.get(path)!
  }
  
  // 2. 动态匹配
  for (const [prefix, mappings] of dynamicPathMap) {
    if (path.startsWith(prefix + '/') || path === prefix) {
      // 尝试匹配动态路由
      for (const mapping of mappings) {
        const pattern = new RegExp(
          '^' + mapping.path
            .replace(/:[^/]+/g, '([^/]+)') // /user/:id → /user/([^/]+)
            .replace(/\//g, '\\/') + '$'
        )
        if (pattern.test(path)) {
          return mapping
        }
      }
    }
  }
  
  return null
}

// ===== 4. 获取组件 =====
function getComponent(path: string): () => Promise<any> {
  const mapping = findRouteMapping(path)
  if (mapping) {
    return mapping.component
  }

  // 找不到则使用通用页面
  console.warn(`[路由] 未找到 ${path} 对应的组件，使用通用页面`)
  return () => import('@/pages/generic-page.vue')
}

// ===== 4.1 获取路由 meta（含 keep-alive 组件名） =====
function getRouteMeta(path: string): Record<string, any> {
  const mapping = findRouteMapping(path)
  return mapping?.meta ?? {}
}

// ===== 5. 注册动态路由 =====
export function registerDynamicRoutes(router: Router, items: MenuItem2[]) {
  const routeConfigs: RouteRecordRaw[] = []

  function collectRoutes(list: MenuItem2[], parentPath = '') {
    for (const item of list) {
      const fullPath = item.path 
        ? (item.path.startsWith('/') ? item.path : `${parentPath}/${item.path}`)
        : parentPath || '/'
      
      // 标准化路径
      const normalizedPath = fullPath.replace(/\/+/g, '/')
      
      if (item.children && item.children.length > 0) {
        // 有子菜单，继续递归
        collectRoutes(item.children, normalizedPath)
      } else {
        // 叶子节点，注册为路由
        const component = getComponent(normalizedPath)
        const mappingMeta = getRouteMeta(normalizedPath)

        routeConfigs.push({
          path: normalizedPath,
          name: item.name,
          component: component,
          meta: {
            auth: true,
            title: item.name,
            i18nKey: item.name_tree ? `menu.${item.name_tree}` : undefined,
            cacheName: mappingMeta.cacheName,
            originalPath: normalizedPath,
          },
        })
      }
    }
  }

  collectRoutes(items)

  // 使用 setupLayouts 包裹
  const wrapped = setupLayouts(routeConfigs)

  for (const route of wrapped) {
    if (route.children?.[0]?.name) {
      // 包裹了 Layouts 路由，name 在子路由上，把 name 提到上级路由去，后续才能正常清除路由
      route.name = route.children[0].name
      // 为子路由 name 重命名，防止和父级路由 name 一样
      route.children[0].name = `${route.children[0].name as String}Index`
    }
    route.meta = { ...route.meta, dynamic: true }
    router.addRoute(route)
    console.log(`✅ 注册路由: ${route.path} → ${route.name as string}`)
  }
}

// ===== 6. 工具函数：生成带参数的路由路径 =====
export function generateRoutePath(
  routeKey: string,
  params?: Record<string, string | number>
): string {
  const mapping = findRouteMapping(routeKey)
  if (!mapping) {
    console.warn(`[路由] 未找到 ${routeKey} 对应的路由`)
    return routeKey
  }
  
  let path = mapping.path
  
  if (params && mapping.dynamic) {
    // 替换动态参数
    const paramName = mapping.paramName || 'id'
    if (params[paramName] !== undefined) {
      path = path.replace(`:${paramName}`, String(params[paramName]))
    }
  }
  
  return path
}

export function clearDynamicRoutes(router: Router, item: MenuItem2) {
  if (item.children) {
    for (const child of item.children) {
      clearDynamicRoutes(router, child)
    }
  } else {
    router.removeRoute(item.name)
  }
}


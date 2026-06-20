// router/dynamic-routes.ts
import type { Router, RouteRecordRaw } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import type { MenuItem } from '@/api/menu/types'

// ===== 1. 路由映射表（手动维护） =====
interface RouteMapping {
  path: string
  component: () => Promise<any>
  // 是否支持动态参数
  dynamic?: boolean
  // 参数名称（默认 'id'）
  paramName?: string
  // 路由元信息
  meta?: Record<string, any>
}

// 路由映射表
const routeMap: RouteMapping[] = [
  // ===== 用户管理 =====
  { 
    path: '/user', 
    component: () => import('@/pages/generic-page.vue'),
    meta: { title: '用户管理' }
  },
  // ✅ 动态参数：/user/123 → 匹配 /user/:id
  { 
    path: '/user/:id', 
    component: () => import('@/pages/user/index.vue'),
    dynamic: true,
    paramName: 'id',
    meta: { title: '用户详情' }
  },
  
  // ===== 任务管理 =====
  { 
    path: '/task', 
    component: () => import('@/pages/tasks/index.vue'),
    meta: { title: '任务管理' }
  },
  // ✅ 动态参数：/task/456 → 匹配 /task/:id
  { 
    path: '/task/:id', 
    component: () => import('@/pages/tasks/index.vue'),
    dynamic: true,
    paramName: 'id',
    meta: { title: '任务详情' }
  },
  
  // ===== 仪表盘 =====
  { 
    path: '/dashboard', 
    component: () => import('@/pages/dashboard/dashboard.vue'),
    meta: { title: '仪表盘' }
  },
  // ===== 通用 =====
  { 
    path: '/404', 
    component: () => import('@/pages/errors/404.vue'),
    meta: { title: '页面不存在' }
  },
]

// ===== 2. 构建快速查找索引 =====
const pathMap = new Map<string, RouteMapping>()
const dynamicPathMap = new Map<string, RouteMapping[]>()

// 构建索引
for (const mapping of routeMap) {
  if (mapping.dynamic) {
    // 动态路由：按前缀分组
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

// ===== 5. 注册动态路由 =====
export function registerDynamicRoutes(router: Router, items: MenuItem[]) {
  const routeConfigs: RouteRecordRaw[] = []

  function collectRoutes(list: MenuItem[], parentPath = '') {
    for (const item of list) {
      const fullPath = item.url 
        ? (item.url.startsWith('/') ? item.url : `${parentPath}/${item.url}`)
        : parentPath || '/'
      
      // 标准化路径
      const normalizedPath = fullPath.replace(/\/+/g, '/')
      
      if (item.items && item.items.length > 0) {
        // 有子菜单，继续递归
        collectRoutes(item.items, normalizedPath)
      } else {
        // 叶子节点，注册为路由
        const component = getComponent(normalizedPath)
        
        routeConfigs.push({
          path: normalizedPath,
          name: item.title,
          component: component,
          meta: { 
            auth: true, 
            title: item.title,
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

export function clearDynamicRoutes(router: Router, item: MenuItem) {
  if (item.items) {
    for (const child of item.items) {
      clearDynamicRoutes(router, child)
    }
  } else {
    router.removeRoute(item.title)
  }
}


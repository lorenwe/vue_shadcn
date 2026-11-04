/**
 * 路由映射配置项，仅做定义，不写注册逻辑
 */
export interface RouteMapping {
  path: string
  component: () => Promise<any>
  /** 是否动态参数路由，如 /user/:id */
  dynamic?: boolean
  /** 参数名，默认 id */
  paramName?: string
  meta?: Record<string, any>
}

/**
 * 【手动维护路由映射表】
 * 只在这里维护页面path、组件、meta、动态标记
 */
export const routeMap: RouteMapping[] = [
  // ===== 用户管理 =====
  {
    path: '/user',
    component: () => import('@/pages/generic-page.vue'),
    meta: { title: '用户管理' }
  },
  // ✅ 动态参数：/user/123 → /user/:id
  {
    path: '/user/:id',
    component: () => import('@/pages/user/index.vue'),
    dynamic: true,
    paramName: 'id',
    meta: { title: '用户详情' }
  },
  {
    path: '/table',
    component: () => import('@/pages/table/index.vue'),
    meta: { title: '表格实例' }
  },
  {
    path: '/tableTree',
    component: () => import('@/pages/table-tree/index.vue'),
    meta: { title: '树形表格' }
  },
  // ===== 任务管理 =====
  {
    path: '/task',
    component: () => import('@/pages/tasks/index.vue'),
    meta: { title: '任务管理' }
  },
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
  // ===== 系统设置-菜单管理 =====
  {
    path: '/system/menu-management',
    component: () => import('@/pages/system/menu-management/index.vue'),
    meta: { title: '菜单管理' }
  }
]
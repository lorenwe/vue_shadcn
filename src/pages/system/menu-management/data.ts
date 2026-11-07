import type { MenuListItem } from '@/api/menu/types'

/**
 * 树形表格展示节点
 */
export interface MenuNode {
  id: string
  title: string
  url?: string
  subRows?: MenuNode[]
}

/**
 * 从后端菜单项派生展示名称：
 * 权限标识最后一段 → 路径最后一段 → 组件名 → id
 * 例：system:menu-management → menu-management
 */
function deriveTitle(item: MenuListItem): string {
  if (item.permission) {
    const seg = item.permission.split(':').pop()
    if (seg) return seg
  }
  if (item.path) {
    const seg = item.path.split('/').filter(Boolean).pop()
    if (seg) return seg
  }
  if (item.component) {
    const seg = item.component.split('/').pop()
    if (seg) return seg
  }
  return `#${item.id}`
}

/**
 * 后端菜单列表 → 树形展示节点（递归）
 */
export function toMenuNodes(items: MenuListItem[]): MenuNode[] {
  return items.map((item) => ({
    id: String(item.id),
    title: deriveTitle(item),
    url: item.path ?? undefined,
    subRows: item.children?.length ? toMenuNodes(item.children) : undefined,
  }))
}

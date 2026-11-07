import type { MenuListItem } from '@/api/menu/types'
import type { Language } from '@/api/i18n/types'
import { DEFAULT_LOCALE } from '@/constants/i18n'

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
 * 优先取当前语言的翻译字段（如 item['zh-CN']），
 * 为空时回退到：权限标识最后一段 → 路径最后一段 → 组件名 → id
 * 例：system:menu-management → menu-management
 */
function deriveTitle(item: MenuListItem, locale: Language): string {
  const translated = item[locale]
  if (translated && translated.trim()) return translated
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
 * 后端菜单列表 → 树形展示节点（递归），按当前语言解析名称
 */
export function toMenuNodes(items: MenuListItem[], locale: Language = DEFAULT_LOCALE): MenuNode[] {
  return items.map((item) => ({
    id: String(item.id),
    title: deriveTitle(item, locale),
    url: item.path ?? undefined,
    subRows: item.children?.length ? toMenuNodes(item.children, locale) : undefined,
  }))
}

/**
 * 按 id 在菜单树中查找原始后端菜单项（用于编辑回填）
 */
export function findMenuItemById(items: MenuListItem[], id: number): MenuListItem | null {
  for (const item of items) {
    if (item.id === id) return item
    if (item.children?.length) {
      const found = findMenuItemById(item.children, id)
      if (found) return found
    }
  }
  return null
}

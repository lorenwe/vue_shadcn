import type { LanguageListItem } from '@/api/i18n/types'

/** 页面展示用的多语言词条节点 */
export interface LanguageNode {
  id: string
  name: string
  zhCN: string | null
  enUS: string | null
  jaJP: string | null
  zhTW: string | null
  sort: number
  children?: LanguageNode[]
}

/** 后端树 → 展示节点：兄弟节点按 sort、id 升序 */
export function toLanguageNodes(items: LanguageListItem[]): LanguageNode[] {
  return [...items]
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.id - b.id)
    .map(item => ({
      id: String(item.id),
      name: item.name,
      zhCN: item.zhCN ?? null,
      enUS: item.enUS ?? null,
      jaJP: item.jaJP ?? null,
      zhTW: item.zhTW ?? null,
      sort: item.sort ?? 0,
      children: item.children?.length ? toLanguageNodes(item.children) : undefined,
    }))
}

function matchKeyword(node: LanguageNode, keyword: string): boolean {
  const fields = [node.name, node.zhCN, node.enUS, node.jaJP, node.zhTW]
  return fields.some((field) => (field ?? '').toLowerCase().includes(keyword))
}

/**
 * 按关键字过滤树：命中节点保留，命中节点的祖先也保留（保证层级完整）
 */
export function filterLanguageNodes(nodes: LanguageNode[], keyword: string): LanguageNode[] {
  const normalized = keyword.trim().toLowerCase()
  if (!normalized) {
    return nodes
  }

  const result: LanguageNode[] = []
  for (const node of nodes) {
    const children = node.children ? filterLanguageNodes(node.children, normalized) : []
    if (matchKeyword(node, normalized) || children.length > 0) {
      result.push({ ...node, children: children.length > 0 ? children : undefined })
    }
  }
  return result
}

/** 所有含子节点的节点 id（用于全部展开/收起） */
export function collectParentIds(nodes: LanguageNode[]): string[] {
  const ids: string[] = []
  for (const node of nodes) {
    if (node.children?.length) {
      ids.push(node.id)
      ids.push(...collectParentIds(node.children))
    }
  }
  return ids
}

/** 树中节点总数 */
export function countNodes(nodes: LanguageNode[]): number {
  return nodes.reduce((total, node) => total + 1 + (node.children ? countNodes(node.children) : 0), 0)
}

/** 树中叶子节点数 */
export function countLeaves(nodes: LanguageNode[]): number {
  return nodes.reduce(
    (total, node) => total + (node.children?.length ? countLeaves(node.children) : 1),
    0,
  )
}

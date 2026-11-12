import type { LanguageListItem } from '@/api/i18n/types'

/** 页面展示用的多语言词条节点 */
export interface LanguageNode {
  id: string
  parentId: number
  name: string
  zhCN: string | null
  enUS: string | null
  jaJP: string | null
  zhTW: string | null
  remark?: string
  sort: number
  /** 真实子节点是否存在（搜索过滤后仍保留，用于删除限制） */
  hasChildren: boolean
  children?: LanguageNode[]
}

/** 新增/编辑表单的父级下拉选项 */
export interface ParentOption {
  id: number
  name: string
  depth: number
}

/** 后端树 → 展示节点：兄弟节点按 sort、id 升序 */
export function toLanguageNodes(items: LanguageListItem[]): LanguageNode[] {
  return [...items]
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.id - b.id)
    .map(item => ({
      id: String(item.id),
      parentId: item.parent_id ?? 0,
      name: item.name,
      zhCN: item.zhCN ?? null,
      enUS: item.enUS ?? null,
      jaJP: item.jaJP ?? null,
      zhTW: item.zhTW ?? null,
      remark: item.remark ?? undefined,
      sort: item.sort ?? 0,
      hasChildren: !!item.children?.length,
      children: item.children?.length ? toLanguageNodes(item.children) : undefined,
    }))
}

/** 树 → 父级下拉选项（含层级，供缩进展示） */
export function toParentOptions(nodes: LanguageNode[]): ParentOption[] {
  const options: ParentOption[] = []
  const walk = (list: LanguageNode[], depth: number) => {
    for (const node of list) {
      options.push({ id: Number(node.id), name: node.name, depth })
      if (node.children?.length) {
        walk(node.children, depth + 1)
      }
    }
  }
  walk(nodes, 0)
  return options
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

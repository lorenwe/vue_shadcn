
import type { AdminApiListItem } from '@/api/system/api-management/types'
import type { CascaderOption } from '@/components/cascader/types'

/** 页面展示用的多语言词条节点 */
export interface AdminApiNode {
  id: string
  parentId: number
  method: string | null
  sort?: number
  api_name: string
  status: number
  api_path: string | null
  api_type: string | null
  /** 真实子节点是否存在（搜索过滤后仍保留，用于删除限制） */
  hasChildren: boolean
  children?: AdminApiNode[]
}

/** 后端树 → Cascader 父级选项（label 使用国际化字段名 name） */
export function toParentTree(nodes: AdminApiNode[]): CascaderOption[] {
  return nodes.map(node => ({
    value: Number(node.id),
    label: node.api_name,
    children: node.children?.length ? toParentTree(node.children) : undefined,
  }))
}

/** 后端树 → 展示节点：兄弟节点按 sort、id 升序 */
export function toAdminApiNodes(items: AdminApiListItem[]): AdminApiNode[] {
  return [...items]
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.id - b.id)
    .map(item => ({
      id: String(item.id),
      parentId: item.parent_id ?? 0,
      method: item.method,
      sort: item.sort ?? 0,
      api_name: item.api_name,
      status: item.status,
      api_path: item.api_path ?? null,
      api_type: item.api_type ?? null,
      hasChildren: !!item.children?.length,
      children: item.children?.length ? toAdminApiNodes(item.children) : undefined,
    }))
}

function matchKeyword(node: AdminApiNode, keyword: string): boolean {
  const fields = [node.api_name, node.method, node.api_path, node.api_type]
  return fields.some((field) => (field ?? '').toLowerCase().includes(keyword))
}

/**
 * 按关键字过滤树：命中节点保留，命中节点的祖先也保留（保证层级完整）
 */
export function filterAdminApiNodes(nodes: AdminApiNode[], keyword: string): AdminApiNode[] {
  const normalized = keyword.trim().toLowerCase()
  if (!normalized) {
    return nodes
  }

  const result: AdminApiNode[] = []
  for (const node of nodes) {
    const children = node.children ? filterAdminApiNodes(node.children, normalized) : []
    if (matchKeyword(node, normalized) || children.length > 0) {
      result.push({ ...node, children: children.length > 0 ? children : undefined })
    }
  }
  return result
}

/** 所有含子节点的节点 id（用于全部展开/收起） */
export function collectParentIds(nodes: AdminApiNode[]): string[] {
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
export function countNodes(nodes: AdminApiNode[]): number {
  return nodes.reduce((total, node) => total + 1 + (node.children ? countNodes(node.children) : 0), 0)
}

/** 树中叶子节点数 */
export function countLeaves(nodes: AdminApiNode[]): number {
  return nodes.reduce(
    (total, node) => total + (node.children?.length ? countLeaves(node.children) : 1),
    0,
  )
}

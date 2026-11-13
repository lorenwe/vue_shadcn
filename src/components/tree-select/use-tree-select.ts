// composables/useTreeSelect.ts
import { computed, reactive, ref } from 'vue'
import type { TreeNode } from './types'

export function useTreeSelect(options: {
  data: () => TreeNode[]
  onLoadChildren?: (node: TreeNode) => Promise<TreeNode[]>
}) {
  const searchQuery = ref('')
  // 使用 reactive Set，保证增删能触发 TreeNode 的 isLoading 更新
  const loadingValues = reactive(new Set<string | number>())

  // ---- 搜索：递归过滤，保留父级路径 ----
  const filteredTree = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    if (!query) return options.data()

    function filterNodes(nodes: TreeNode[]): TreeNode[] {
      const result: TreeNode[] = []
      for (const node of nodes) {
        const selfMatch = node.label.toLowerCase().includes(query)
        const childrenMatch = node.children ? filterNodes(node.children) : []

        if (selfMatch) {
          // 自身匹配：保留完整子树，便于用户看到上下文
          result.push({ ...node, children: node.children })
        } else if (childrenMatch.length > 0) {
          // 子级匹配：保留当前节点，但只挂载匹配的子树
          result.push({ ...node, children: childrenMatch })
        }
      }
      return result
    }

    return filterNodes(options.data())
  })

  // ---- 远程加载子级 ----
  async function loadChildren(node: TreeNode) {
    if (!options.onLoadChildren || loadingValues.has(node.value)) return

    loadingValues.add(node.value)
    try {
      const children = await options.onLoadChildren(node)
      node.children = children
      node.isLeaf = children.length === 0 // 标记空子级，避免反复请求
    } finally {
      loadingValues.delete(node.value)
    }
  }

  return {
    searchQuery,
    loadingValues,
    filteredTree,
    loadChildren,
  }
}

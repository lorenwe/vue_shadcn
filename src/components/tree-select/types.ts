export interface TreeNode {
  value: string | number
  label: string
  /** 禁用的节点不可选择，但仍可展开查看子级 */
  disabled?: boolean
  children?: TreeNode[]
  /** 远程加载时标识是否已无子节点 */
  isLeaf?: boolean
  [key: string]: any
}

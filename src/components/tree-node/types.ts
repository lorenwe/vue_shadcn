export interface TreeNode {
  /** 稳定唯一标识，建议使用后端 id，避免同名节点冲突 */
  id: string | number
  title: string
  icon?: string
  children?: TreeNode[]
  disabled?: boolean
}

export interface CascaderOption {
  value: string | number
  label: string
  children?: CascaderOption[]
  disabled?: boolean
  /** 懒加载场景可标记叶子 */
  isLeaf?: boolean
  [key: string]: any
}

export type CascaderPath = CascaderOption[]

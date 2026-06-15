/**
 * 服务端统一响应包装
 * @template T — data 字段的实际类型
 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

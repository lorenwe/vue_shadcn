import { z } from 'zod'

// 排序方向枚举
const SortOrderSchema = z.enum(['asc', 'desc'])

// 排序字段项
export const OrderByItemSchema = z.object({
  field: z.string().min(1, '排序字段不能为空'),
  order: SortOrderSchema,
})
export type OrderByItem = z.infer<typeof OrderByItemSchema>

// TaskListParams Zod Schema
export const TaskListParamsSchema = z.object({
  pageNum: z.number().int().min(1, '页码最小为1'),
  pageSize: z.number().int().min(1, '每页条数最小为1'),
  keyword: z.string().optional(),
  status: z.union([z.string(), z.number()]).optional(),
  priority: z.union([z.string(), z.number()]).optional(),
  assignee: z.string().optional(),
  orderBy: z.array(OrderByItemSchema).optional(),
})

// 导出TS类型（等价原 TaskListParams）
export type TaskListParams = z.infer<typeof TaskListParamsSchema>

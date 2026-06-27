import { pageResponseSchema } from '@/types/api'
import z from 'zod'

// ===== 任务状态枚举 =====
export const TaskStatusSchema = z.enum([
  'backlog',
  'todo',
  'in progress',
  'done',
  'canceled',
])
export type TaskStatus = z.infer<typeof TaskStatusSchema>

// ===== 任务优先级枚举 =====
export const TaskPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
])
export type TaskPriority = z.infer<typeof TaskPrioritySchema>

// ===== 任务 Schema =====
export const TaskSchema = z.object({
  id: z.string().min(1, '任务ID不能为空'),
  title: z.string().min(1, '任务标题不能为空'),
  label: z.string().min(1, '任务label不能为空'),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
})

export type Task = z.infer<typeof TaskSchema>

// 任务分页Schema
export const TaskPageResponseSchema = pageResponseSchema(TaskSchema)
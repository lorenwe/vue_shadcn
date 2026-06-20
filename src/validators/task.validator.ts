import z from 'zod'

// ===== 任务状态枚举 =====
export const TaskStatusSchema = z.enum([
  'backlog',
  'todo',
  'in-progress',
  'done',
  'cancelled',
  'archived',
])
export type TaskStatus = z.infer<typeof TaskStatusSchema>

// ===== 任务标签枚举 =====
export const TaskLabelSchema = z.enum([
  'bug',
  'feature',
  'improvement',
  'documentation',
  'test',
  'task',
  'epic',
])
export type TaskLabel = z.infer<typeof TaskLabelSchema>

// ===== 任务优先级枚举 =====
export const TaskPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent',
  'critical',
])
export type TaskPriority = z.infer<typeof TaskPrioritySchema>

// ===== 任务 Schema =====
export const TaskSchema = z.object({
  id: z.string().min(1, '任务ID不能为空'),
  title: z.string().min(1, '任务标题不能为空'),
  status: TaskStatusSchema,
  label: TaskLabelSchema,
  priority: TaskPrioritySchema,
})

export type Task = z.infer<typeof TaskSchema>
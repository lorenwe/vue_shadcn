import { useApiFetch } from '@/composables/use-fetch'
import { TaskListParamsSchema, type TaskListParams } from './types'
import { ApiResponseSchema, type PageResponse } from '@/types/api'
import { TaskPageResponseSchema, type Task } from '@/validators/task.validator'

type TaskPageResponse  = PageResponse<Task>

/**
 * 获取任务列表
 */
export async function fetchTasks(params: TaskListParams): Promise<TaskPageResponse > {
  const { apiFetch } = useApiFetch()

  // 1. Zod 校验查询参数
  const parseParamsResult = TaskListParamsSchema.safeParse(params)
  if (!parseParamsResult.success) {
    console.error('任务列表查询参数校验失败', parseParamsResult.error.issues)
    throw new Error('查询参数格式不合法')
  }
  const validParams = parseParamsResult.data
  
  const rawResponse = await apiFetch('/tasks', {
    method: 'POST',
    body: {
      page: validParams.page,
      pageSize: validParams.pageSize,
      keyword: validParams.keyword,
      status: validParams.status,
      priority: validParams.priority,
      assignee: validParams.assignee,
      sortBy: validParams.sortBy,
      sortOrder: validParams.sortOrder,
    },
  })

  // 3. 校验后端统一外层包装 + 内部分页数据
  const fullSchema = ApiResponseSchema(TaskPageResponseSchema)
  const parseResult = fullSchema.safeParse(rawResponse)
  if (!parseResult.success) {
    console.error('接口返回数据格式错误', parseResult.error.issues)
    throw new Error('服务端返回数据异常')
  }

  const parsed = parseResult.data
  // 业务状态码判断
  if (parsed.code !== 0) {
    throw new Error(parsed.message || '获取任务列表失败')
  }

  // 返回分页数据
  return parsed.data
}

// /**
//  * 获取单个任务
//  */
// export async function fetchTask(id: string): Promise<TaskDetailResponse> {
//   const { apiFetch } = useApiFetch()
//   return apiFetch<TaskDetailResponse>(`/tasks/${id}`)
// }

// /**
//  * 创建任务
//  */
// export async function createTask(data: Partial<Task>): Promise<Task> {
//   const { apiFetch } = useApiFetch()
//   return apiFetch<Task>('/tasks', {
//     method: 'POST',
//     body: data,
//   })
// }

// /**
//  * 更新任务
//  */
// export async function updateTask(id: string, data: Partial<Task>): Promise<Task> {
//   const { apiFetch } = useApiFetch()
//   return apiFetch<Task>(`/tasks/${id}`, {
//     method: 'PUT',
//     body: data,
//   })
// }

// /**
//  * 删除任务
//  */
// export async function deleteTask(id: string): Promise<void> {
//   const { apiFetch } = useApiFetch()
//   await apiFetch(`/tasks/${id}`, {
//     method: 'DELETE',
//   })
// }

// /**
//  * 批量删除任务
//  */
// export async function deleteTasks(ids: string[]): Promise<void> {
//   const { apiFetch } = useApiFetch()
//   await apiFetch('/tasks/batch-delete', {
//     method: 'POST',
//     body: { ids },
//   })
// }
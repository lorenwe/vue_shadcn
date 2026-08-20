import { useApiFetch } from '@/composables/use-fetch'
import { parseApiResponse } from '@/api/response'
import { TaskListParamsSchema, type TaskListParams } from './types'
import type { PageResponse } from '@/types/api'
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
      pageNum: validParams.pageNum,
      pageSize: validParams.pageSize,
      keyword: validParams.keyword,
      status: validParams.status,
      priority: validParams.priority,
      assignee: validParams.assignee,
      orderBy: validParams.orderBy,
    },
  })

  // 3. 两步验证 + 登录失效判断统一在 parseApiResponse 中处理
  return parseApiResponse(rawResponse, TaskPageResponseSchema, {
    successCode: 0,
    errorMessage: '获取任务列表失败',
  })
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
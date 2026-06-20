import { useApiFetch } from '@/composables/use-fetch'
import type { Task, TaskListParams, TaskListResponse, TaskDetailResponse } from ''

/**
 * 获取任务列表
 */
export async function fetchTasks(params: TaskListParams): Promise<TaskListResponse> {
  const { apiFetch } = useApiFetch()
  
  const response = await apiFetch<TaskListResponse>('/tasks', {
    params: {
      page: params.page,
      pageSize: params.pageSize,
      keyword: params.keyword || undefined,
      status: params.status || undefined,
      priority: params.priority || undefined,
      assignee: params.assignee || undefined,
      sortBy: params.sortBy || undefined,
      sortOrder: params.sortOrder || undefined,
    },
  })
  
  return response
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
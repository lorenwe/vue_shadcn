import { fetchTasks } from "@/api/task/task"
import type { TaskListParams } from "@/api/task/types"
import { useQuery } from '@tanstack/vue-query'

type UseTaskListQueryOptions = {
  params: Ref<TaskListParams> | TaskListParams
  enabled?: Ref<boolean> | boolean
}

export function useTaskListQuery(options: UseTaskListQueryOptions) {
  const { params, enabled = true } = options
  // 转为响应式
  const reactiveParams = isRef(params) ? params : ref(params)
  const reactiveEnabled = isRef(enabled) ? enabled : ref(enabled)

   const { isPending, isFetching, isError, data, error } = useQuery({
    // 查询 key：参数变化自动重新请求
    queryKey: ['taskList', reactiveParams],
    queryFn: () => fetchTasks(reactiveParams.value),
    enabled: reactiveEnabled,
  })

  return { isPending, isError, isFetching, data, error }
}
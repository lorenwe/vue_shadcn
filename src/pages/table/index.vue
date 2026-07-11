<script setup lang="ts">
import { columns } from './columns'
import DataTable from './components/table.vue'

import { useTaskListQuery } from '@/query/task/useTask'
import type { TaskListParams } from '@/api/task/types'
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination'
import { getCoreRowModel, getSortedRowModel, useVueTable, type SortingState, type TableOptionsWithReactiveData } from '@tanstack/vue-table'
import type { Task } from '@/validators/task.validator.ts'
import { valueUpdater } from '@/lib/utils.ts'

// 1. 查询分页参数（与后端接口字段对齐）
const searchParams = ref<TaskListParams>({
  pageNum: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  keyword: '',
  status: undefined,
  orderBy: [{ field: 'title', order: 'desc' }],
})
// 3. 服务端排序
function handleSortingChange(orderBy: Array<{ field: string, order: 'asc' | 'desc' }>) {
  searchParams.value.orderBy = orderBy.length > 0 ? orderBy : undefined
  searchParams.value.pageNum = 1 // 排序后回到第一页
}
const useServerSorting = computed(() => ({
  orderBy: searchParams.value.orderBy ?? [],
  onSortingChange: handleSortingChange,
}))
const rowSelection = ref({})
const sorting = ref<SortingState>([])
watchEffect(() => {
  // 访问 .value 自动依赖追踪，一变就执行
  console.log('选中行更新：', rowSelection.value)
  console.log('排序字段更新：', sorting.value)
})

// 查询任务列表
const { isPending, isFetching, data } = useTaskListQuery({
  params: searchParams,
})
// const data2 = ref(data.value?.list)
const tableData = computed(() => data.value?.list ?? [])
const tableConfig: TableOptionsWithReactiveData<Task> = {
    get data() { return tableData.value },
    get columns() { return columns },
    state: {
      get rowSelection() { return rowSelection.value },
      get sorting() {
        return sorting.value
      },
    },
    onSortingChange: (updaterOrValue) => {
      console.log("onSortingChange", updaterOrValue, sorting)
      valueUpdater(updaterOrValue, sorting)
    },
    onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableMultiSort: true,
    // 关键：永远触发多列追加排序，不用 Shift/Ctrl
    isMultiSortEvent: () => true,
  }
const table = useVueTable<Task>(tableConfig)


// 数据与总数
const taskList = computed(() => data.value?.list ?? [])
</script>

<template>
  <div class="overflow-x-auto">
    <DataTable
    :data="taskList"
    :columns="columns"
    :table="table"
    />
  </div>
</template>

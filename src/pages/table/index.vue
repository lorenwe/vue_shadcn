<script setup lang="ts">
import { columns } from './columns'
import DataTable from './components/table.vue'
import { useTaskListQuery } from '@/query/task/useTask'
import type { TaskListParams } from '@/api/task/types'
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination'
import { getCoreRowModel, getSortedRowModel, useVueTable, type SortingState } from '@tanstack/vue-table'
import type { Task } from '@/validators/task.validator'
import { valueUpdater } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDownIcon } from '@lucide/vue'

const searchParams = ref<TaskListParams>({
  pageNum: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  keyword: '',
  status: undefined,
  orderBy: [{ field: 'title', order: 'desc' }],
})

// 从 searchParams.orderBy 初始化排序状态，确保表头图标与初始排序一致
const sorting = ref<SortingState>(
  searchParams.value.orderBy?.map(o => ({ id: o.field, desc: o.order === 'desc' })) ?? [],
)

// 排序变更 → 同步到服务端查询参数，自动触发重新请求
watch(sorting, (newSorting) => {
  searchParams.value.orderBy = newSorting.length > 0
    ? newSorting.map(s => ({ field: s.id, order: s.desc ? 'desc' as const : 'asc' as const }))
    : undefined
  searchParams.value.pageNum = 1
}, { deep: true })

const rowSelection = ref({})

const { data } = useTaskListQuery({
  params: searchParams,
})

const taskList = computed(() => data.value?.list ?? [])

// 选中的行数据
const selectedRows = computed(() => {
  return table.getSelectedRowModel().rows.map(row => row.original)
})

// 是否有选中行
const hasSelection = computed(() => Object.keys(rowSelection.value).length > 0)

// 批量操作
function handleBatchAction(action: string) {
  const ids = selectedRows.value.map(row => row.id)
  console.log('批量操作:', action)
  console.log('选中的行id:', ids)
}

const table = useVueTable<Task>({
  get data() { return taskList.value },
  get columns() { return columns },
  state: {
    get sorting() { return sorting.value },
    get rowSelection() { return rowSelection.value },
  },
  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  enableMultiSort: true,  // 开启多列排序
  isMultiSortEvent: () => true, // 多列排序不需要按住shift按键
  manualSorting: true, // 服务端排序，数据已排好序
})
</script>

<template>
  <div class="overflow-x-auto">
    <DataTable
      :data="taskList"
      :columns="columns"
      :table="table"
    >
      <template #toolbar>
        <div class="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                variant="outline"
                :disabled="!hasSelection"
              >
                批量操作
                <ChevronDownIcon class="ml-1 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem @click="handleBatchAction('delete')">
                删除
              </DropdownMenuItem>
              <DropdownMenuItem @click="handleBatchAction('hide')">
                隐藏
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </template>
    </DataTable>
  </div>
</template>

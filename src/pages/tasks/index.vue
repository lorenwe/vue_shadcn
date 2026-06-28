<script setup lang="ts">
import { BasicPage } from '@/components/main-layout'

import { columns } from './components/columns'
import DataTable from './components/data-table.vue'

import { useTaskListQuery } from '@/query/task/useTask'
import type { TaskListParams } from '@/api/task/types'
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination'

// 1. 查询分页参数（与后端接口字段对齐）
const searchParams = ref<TaskListParams>({
  pageNum: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  keyword: '',
  status: undefined,
  orderBy: [{ field: 'createTime', order: 'desc' }],
})

// 查询任务列表
const { isPending, isFetching, data } = useTaskListQuery({
  params: searchParams,
})

// 2. 服务端分页
const serverPagination = computed(() => ({
  page: searchParams.value.pageNum,
  pageSize: searchParams.value.pageSize,
  total: data.value?.total ?? 0,
  onPageChange: (newPage: number) => {
    searchParams.value.pageNum = newPage
  },
  onPageSizeChange: (newSize: number) => {
    searchParams.value.pageSize = newSize
    searchParams.value.pageNum = 1
  },
}))

// 3. 服务端排序
function handleSortingChange(orderBy: Array<{ field: string, order: 'asc' | 'desc' }>) {
  searchParams.value.orderBy = orderBy.length > 0 ? orderBy : undefined
  searchParams.value.pageNum = 1 // 排序后回到第一页
}

const serverSorting = computed(() => ({
  orderBy: searchParams.value.orderBy ?? [],
  onSortingChange: handleSortingChange,
}))

// 数据与总数
const taskList = computed(() => data.value?.list ?? [])
</script>

<template>
  <BasicPage
    title="Tasks"
    description="Tasks description"
    sticky
  >
    <template #actions>
      <!-- <TaskImport />
      <TaskCreate /> -->
    </template>
    <div class="overflow-x-auto">
      <DataTable
        :data="taskList"
        :columns="columns"
        :loading="isPending || isFetching"
        :server-pagination="serverPagination"
        :server-sorting="serverSorting"
      />
    </div>
  </BasicPage>
</template>

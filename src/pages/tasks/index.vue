<script setup lang="ts">
import { BasicPage } from '@/components/main-layout'

import { columns } from './components/columns'
import DataTable from './components/data-table.vue'

import { useTaskListQuery } from '@/query/task/useTask'
import type { TaskListParams } from '@/api/task/types'
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination'

// 1. 查询分页参数
const searchParams = ref<TaskListParams>({
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  keyword: '',
  status: undefined,
  sortBy: 'createTime',
  sortOrder: 'desc',
})

// 查询任务列表
const { isPending, isFetching, data } = useTaskListQuery({
  params: searchParams,
})

// 2. 服务端分页
const serverPagination = computed(() => ({
  page: searchParams.value.page,
  pageSize: searchParams.value.pageSize,
  total: data.value?.total ?? 0,
  onPageChange: (newPage: number) => {
    searchParams.value.page = newPage
  },
  onPageSizeChange: (newSize: number) => {
    searchParams.value.pageSize = newSize
    searchParams.value.page = 1
  },
}))

// 3. 服务端排序
function handleSortingChange(sortBy: string, sortOrder: 'asc' | 'desc') {
  searchParams.value.sortBy = sortBy || undefined
  searchParams.value.sortOrder = sortOrder
  searchParams.value.page = 1 // 排序后回到第一页
}

const serverSorting = computed(() => ({
  sortBy: searchParams.value.sortBy ?? '',
  sortOrder: (searchParams.value.sortOrder ?? 'desc') as 'asc' | 'desc',
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

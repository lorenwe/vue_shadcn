<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import { Trash2Icon } from '@lucide/vue'

import type { ServerPagination, ServerSorting } from '@/components/data-table'

import { DataTable, DataTableBulkActions, useGenerateVueTable } from '@/components/data-table'

import type { Task } from '@/validators/task.validator'

// import DataTableToolbar from './data-table-toolbar.vue'
// import TaskDeleteBatch from './task-delete-batch.vue'

// 组件有多个根节点，禁用自动 attribute 继承避免 Vue 警告
defineOptions({ inheritAttrs: false })

// 内联声明 props 类型，确保 Vue 编译器能可靠解析所有 prop 名称
const props = defineProps<{
  loading?: boolean
  columns: ColumnDef<Task, any>[]
  data: Task[]
  serverPagination?: ServerPagination
  serverSorting?: ServerSorting
}>()

const table = useGenerateVueTable<Task>(props)

const taskDeleteBatchOpen = ref(false)
</script>

<template>
  <DataTableBulkActions entity-name="task" :table="table">
    <UiTooltip>
      <UiTooltipTrigger as-child>
        <UiButton
          variant="destructive"
          size="icon"
          class="size-8"
          aria-label="Delete selected tasks"
          title="Delete selected tasks"
          @click="taskDeleteBatchOpen = true"
        >
          <Trash2Icon />
          <span class="sr-only">Delete selected tasks</span>
        </UiButton>
      </UiTooltipTrigger>
      <UiTooltipContent>
        <p>Delete selected tasks</p>
      </UiTooltipContent>
    </UiTooltip>

    <!-- <TaskDeleteBatch
      v-model:open="taskDeleteBatchOpen"
      :table
    /> -->
  </DataTableBulkActions>

  <DataTable :columns :table :data :loading :server-pagination="serverPagination">
    <template #toolbar>
      <!-- <DataTableToolbar :table="table" class="w-full overflow-x-auto" /> -->
    </template>
  </DataTable>
</template>

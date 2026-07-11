<script setup lang="ts" generic="T">
import type { Table as VueTable } from '@tanstack/vue-table'
import { FlexRender } from '@tanstack/vue-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import type { DataTableProps } from './types'

const props = defineProps<DataTableProps<T> & {
  table: VueTable<T>
  isLoading?: boolean
}>()
</script>

<template>
  <div class="space-y-4">
    <slot name="toolbar" />
    <div class="border rounded-md relative">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id" :class="{'bg-background': header.column.getIsPinned()}" >
              <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- 进度条高度始终预留，避免加载时列表跳动 -->
          <TableRow>
            <TableCell :colspan="table.getAllColumns().length" class="p-0">
              <Progress v-if="props.isLoading" :model-value="100" class="h-0.5 rounded-none loading-progress" />
              <div v-else class="h-0.5" />
            </TableCell>
          </TableRow>
          <template v-if="props.isLoading == false && table.getRowModel().rows?.length == 0">
            <TableRow>
              <TableCell :colspan="table.getAllColumns().length" class="py-8 text-center text-muted-foreground">
                暂无数据
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow v-for="row in table.getRowModel().rows" :key="row.id" :data-state="row.getIsSelected() && 'selected'" >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id" :class="{'bg-background': cell.column.getIsPinned()}" >
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
      <!-- loading 遮罩层，显示在原内容之上 -->
      <div v-if="props.isLoading" class="absolute inset-0 flex items-center justify-center gap-2 rounded-md bg-background/50">
        <Spinner />
        <span class="text-sm text-muted-foreground">加载中...</span>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes indeterminate-bar {
  0% { transform: translateX(-100%) scaleX(0.5); }
  50% { transform: translateX(0%) scaleX(1); }
  100% { transform: translateX(100%) scaleX(0.5); }
}
.loading-progress [data-slot="progress-indicator"] {
  animation: indeterminate-bar 1.2s ease-in-out infinite;
}
</style>
<script setup lang="ts" generic="T">
import type { Table as VueTable } from '@tanstack/vue-table'
import { FlexRender } from '@tanstack/vue-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
          <!-- 加载进度条，位于表头与表内容之间 -->
          <TableRow v-if="props.isLoading">
            <TableCell :colspan="table.getAllColumns().length" class="p-0">
              <div class="h-0.5 w-full overflow-hidden bg-muted">
                <div class="h-full animate-progress bg-primary" />
              </div>
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
      <div
        v-if="props.isLoading"
        class="absolute inset-0 flex items-center justify-center rounded-md bg-background/50"
      >
        <span class="text-sm text-muted-foreground">加载中...</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes progress {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(-30%); }
  100% { transform: translateX(100%); }
}
.animate-progress {
  animation: progress 1.2s ease-in-out infinite;
}
</style>
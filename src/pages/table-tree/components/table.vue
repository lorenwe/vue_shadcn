<script setup lang="ts" generic="T">
import type { Table as VueTable, Row, Header } from '@tanstack/vue-table'
import { FlexRender } from '@tanstack/vue-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

defineProps<{
  table: VueTable<T>
}>()

function getRowClasses(row: Row<T>): string {
  const depth = row.depth
  if (depth === 0) return ''
  return cn(
    'border-l-2 border-muted',
    depth > 1 && 'bg-muted/20',
  )
}

/**
 * 取列宽：size = 9999 表示"贪婪撑满"，不设死宽度；
 * 其余列按实际 size 返回 px 值。
 */
function getColStyle(header: Header<T, unknown>) {
  const size = header.getSize()
  // size 远大于合理列宽 → 算作弹性列，不设死
  if (size >= 9999) return undefined
  return { width: `${size}px` }
}
</script>

<template>
  <div class="rounded-md border">
    <Table class="table-fixed">
      <!-- 🔑 table-fixed 必须配合 colgroup 才有意义 -->
      <colgroup>
        <col
          v-for="header in table.getLeafHeaders()"
          :key="header.id"
          :style="getColStyle(header)"
        />
      </colgroup>

      <TableHeader>
        <TableRow
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <TableHead
            v-for="header in headerGroup.headers"
            :key="header.id"
          >
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="table.getRowModel().rows?.length">
          <TableRow
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            :data-state="row.getIsSelected() && 'selected'"
            :class="getRowClasses(row)"
          >
            <TableCell
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
            >
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow>
            <TableCell
              :colspan="table.getAllColumns().length"
              class="h-24 text-center"
            >
              <div class="flex flex-col items-center gap-2 text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="size-8 opacity-40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                  <polyline points="13 2 13 9 20 9" />
                </svg>
                <span class="text-sm">暂无菜单数据</span>
              </div>
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>

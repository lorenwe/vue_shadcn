<script setup lang="ts">
import type { Header, Row, Table as VueTable } from '@tanstack/vue-table'
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
import type { LanguageNode } from '../data'

const props = withDefaults(defineProps<{
  table: VueTable<LanguageNode>
  loading?: boolean
  loadingText?: string
  emptyText?: string
}>(), {
  loadingText: '…',
  emptyText: '—',
})

function getRowClasses(depth: number): string {
  if (depth === 0) return ''
  return cn(
    'shadow-[inset_2px_0_0_hsl(var(--border))]',
    depth > 1 && 'bg-muted/20',
  )
}

function getRowClass(row: Row<LanguageNode>): string {
  return cn(
    getRowClasses(row.depth),
    row.getCanExpand() && 'cursor-pointer hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
  )
}

/** 点击整行展开 / 收起；叶子节点无操作 */
function toggleRow(row: Row<LanguageNode>) {
  if (!row.getCanExpand()) return
  row.toggleExpanded()
}

/**
 * 取列宽：size = 9999 表示「贪婪撑满」，不设死宽度；
 * 其余列按实际 size 返回 px 值。
 */
function getColStyle(header: Header<LanguageNode, unknown>) {
  const size = header.getSize()
  if (size >= 9999) return undefined
  return { width: `${size}px` }
}
</script>

<template>
  <div class="rounded-md border">
    <Table class="table-fixed">
      <colgroup>
        <col
          v-for="header in props.table.getLeafHeaders()"
          :key="header.id"
          :style="getColStyle(header)"
        >
      </colgroup>

      <TableHeader>
        <TableRow
          v-for="headerGroup in props.table.getHeaderGroups()"
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
        <TableRow v-if="props.loading">
          <TableCell
            :colspan="props.table.getAllColumns().length"
            class="h-24 text-center text-sm text-muted-foreground"
          >
            {{ props.loadingText }}
          </TableCell>
        </TableRow>

        <template v-else-if="props.table.getRowModel().rows?.length">
          <TableRow
            v-for="row in props.table.getRowModel().rows"
            :key="row.id"
            :data-state="row.getIsSelected() && 'selected'"
            :tabindex="row.getCanExpand() ? 0 : undefined"
            :class="getRowClass(row)"
            @click="toggleRow(row)"
            @keydown.enter="toggleRow(row)"
            @keydown.space.prevent="toggleRow(row)"
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

        <TableRow v-else>
          <TableCell
            :colspan="props.table.getAllColumns().length"
            class="h-24 text-center text-sm text-muted-foreground"
          >
            {{ props.emptyText }}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

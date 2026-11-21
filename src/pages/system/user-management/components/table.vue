<script setup lang="ts">
import type { Header, Table as VueTable } from '@tanstack/vue-table'
import { FlexRender } from '@tanstack/vue-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { UserItem } from '@/api/system/user-management/types'

const props = withDefaults(defineProps<{
  table: VueTable<UserItem>
  loading?: boolean
  loadingText?: string
  emptyText?: string
}>(), {
  loadingText: '…',
  emptyText: '—',
})

function getColStyle(header: Header<UserItem, unknown>) {
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
            :colspan="table.getAllColumns().length"
            class="h-24 text-center text-sm text-muted-foreground"
          >
            {{ props.loading ? props.loadingText : props.emptyText }}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

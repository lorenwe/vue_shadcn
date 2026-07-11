<script setup lang="ts" generic="T">
import type { Table as VueTable } from '@tanstack/vue-table'
import { FlexRender } from '@tanstack/vue-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { DataTableProps } from './types'

defineProps<DataTableProps<T> & {
  table: VueTable<T>
}>()


</script>

<template>
  <div class="space-y-4">
    <slot name="toolbar" />
    <div class="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id" :class="{'bg-background': header.column.getIsPinned()}" >
              <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <TableRow v-for="row in table.getRowModel().rows" :key="row.id" :data-state="row.getIsSelected() && 'selected'" >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id" :class="{'bg-background': cell.column.getIsPinned()}" >
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
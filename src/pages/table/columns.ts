import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

// import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import DataTableRowActions from './components/data-table-row-actions.vue'
import DataTableColumnHeader from './components/column-header.vue'
import { Badge } from '@/components/ui/badge'

import type { Task } from '@/validators/task.validator'

import { labels, priorities, statuses } from './data'
import { SelectColumn } from './components/table-columns'

export const columns: ColumnDef<Task>[] = [
  SelectColumn as ColumnDef<Task>,
  {
    accessorKey: 'id',
    // header: ({ column }) => h(DataTableColumnHeader<Task>, { column, title: 'Task' }),
    header: () => "Task",
    cell: ({ row }) => h('div', { class: 'w-20' }, row.getValue('id')),
  },
  {
    accessorKey: 'title',
    header: ({ column }) => h(DataTableColumnHeader<Task>, { column, title: 'Title' }),
    enableSorting: true, // 开启字段排序
    enableMultiSort: true, // 开启多列排序
    // header: () => 'Title',
    cell: ({ row }) => {
      const label = labels.find(label => label.value === row.original.label)

      return h('div', { class: 'flex space-x-2' }, [
        label ? h(Badge, { variant: 'outline' }, () => label.label) : null,
        h('span', { class: 'max-w-[500px] truncate font-medium' }, row.getValue('title')),
      ])
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<Task>, { column, title: 'Status' }),
    // header: () => 'Status',
    enableSorting: true, // 开启字段排序
    enableMultiSort: true, // 开启多列排序
    cell: ({ row }) => {
      const status = statuses.find(
        status => status.value === row.getValue('status'),
      )

      if (!status)
        return null

      return h('div', { class: 'flex w-[100px] items-center' }, [
        status.icon && h(status.icon, { class: 'mr-2 h-4 w-4 text-muted-foreground' }),
        h('span', status.label),
      ])
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'priority',
    // header: ({ column }) => h(DataTableColumnHeader<Task>, { column, title: 'Priority' }),
    header: () => 'Priority',
    cell: ({ row }) => {
      const priority = priorities.find(
        priority => priority.value === row.getValue('priority'),
      )

      if (!priority)
        return null

      return h('div', { class: 'flex items-center' }, [
        priority.icon && h(priority.icon, { class: 'mr-2 h-4 w-4 text-muted-foreground' }),
        h('span', {}, priority.label),
      ])
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    header: () => 'Actions',
    cell: ({ row }) => h(DataTableRowActions, { row }),
  },
]

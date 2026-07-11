import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import DataTableColumnHeader from './components/column-header.vue'
import { Badge } from '@/components/ui/badge'
import type { Task } from '@/validators/task.validator'
import { labels, priorities, statuses } from './data'
import { SelectColumn } from './components/table-columns.ts'

export const columns: ColumnDef<Task>[] = [
  SelectColumn as ColumnDef<Task>,
  {
    accessorKey: 'id',
    header: () => 'Task',
    cell: ({ row }) => h('div', { class: 'w-20' }, row.getValue('id')),
  },
  {
    accessorKey: 'title',
    header: ({ column }) => h(DataTableColumnHeader<Task>, { column, title: 'Title' }),
    enableSorting: true,
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
    enableSorting: true,
    cell: ({ row }) => {
      const status = statuses.find(status => status.value === row.getValue('status'))
      if (!status) return null
      return h('div', { class: 'flex w-[100px] items-center' }, [
        status.icon && h(status.icon, { class: 'mr-2 h-4 w-4 text-muted-foreground' }),
        h('span', status.label),
      ])
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => h(DataTableColumnHeader<Task>, { column, title: 'Priority' }),
    enableSorting: true,
    cell: ({ row }) => {
      const priority = priorities.find(priority => priority.value === row.getValue('priority'))
      if (!priority) return null
      return h('div', { class: 'flex items-center' }, [
        priority.icon && h(priority.icon, { class: 'mr-2 h-4 w-4 text-muted-foreground' }),
        h('span', {}, priority.label),
      ])
    },
  },
]

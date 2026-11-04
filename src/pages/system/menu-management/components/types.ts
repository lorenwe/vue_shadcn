import type { ColumnDef } from '@tanstack/vue-table'

export interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
}

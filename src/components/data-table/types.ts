import type { ColumnDef } from '@tanstack/vue-table'

export interface FacetedFilterOption {
  label: string
  value: string
  icon?: Component
}

export interface ServerPagination {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export interface ServerSorting {
  orderBy: Array<{ field: string, order: 'asc' | 'desc' }>
  onSortingChange: (orderBy: Array<{ field: string, order: 'asc' | 'desc' }>) => void
}

export interface DataTableProps<T> {
  loading?: boolean
  columns: ColumnDef<T, any>[]
  data: T[]
  serverPagination?: ServerPagination
  serverSorting?: ServerSorting
}

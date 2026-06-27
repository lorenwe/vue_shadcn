import type { ColumnFiltersState, ColumnPinningState, PaginationState, SortingState, TableOptionsWithReactiveData, VisibilityState } from '@tanstack/vue-table'

import { getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useVueTable } from '@tanstack/vue-table'

import { DEFAULT_PAGE_SIZE } from '@/constants/pagination'
import { valueUpdater } from '@/lib/utils'

import type { DataTableProps } from './types'

export function useGenerateVueTable<T>(props: DataTableProps<T>) {
  const sorting = ref<SortingState>([])
  const columnFilters = ref<ColumnFiltersState>([])
  const columnVisibility = ref<VisibilityState>({})
  const columnPinning = ref<ColumnPinningState>({ left: [], right: [] })
  const rowSelection = ref({})
  const pagination = ref<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })

  const useServerPagination = !!props.serverPagination
  const useServerSorting = !!props.serverSorting

  const pageIndex = computed(() => {
    if (useServerPagination && props.serverPagination) {
      return props.serverPagination.page - 1
    }
    return 0
  })

  const pageSize = computed(() => {
    if (useServerPagination && props.serverPagination) {
      return props.serverPagination.pageSize
    }
    return DEFAULT_PAGE_SIZE
  })

  const pageCount = computed(() => {
    if (useServerPagination && props.serverPagination) {
      return Math.ceil(props.serverPagination.total / props.serverPagination.pageSize)
    }
    return -1
  })

  const tableConfig: TableOptionsWithReactiveData<T> = {
    get data() { return props.data },
    get columns() { return props.columns },
    state: {
      get sorting() {
        if (useServerSorting && props.serverSorting) {
          const { sortBy, sortOrder } = props.serverSorting
          return sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []
        }
        return sorting.value
      },
      get columnFilters() { return columnFilters.value },
      get columnVisibility() { return columnVisibility.value },
      get columnPinning() { return columnPinning.value },
      get rowSelection() { return rowSelection.value },
      get pagination() {
        if (useServerPagination) {
          return {
            pageIndex: pageIndex.value,
            pageSize: pageSize.value,
          }
        }
        return pagination.value
      },
    },
    enableRowSelection: true,
    onSortingChange: (updaterOrValue) => {
      if (useServerSorting && props.serverSorting) {
        // 根据当前服务端排序状态构造 SortingState，供 updater 函数计算新值
        const currentSorting: SortingState = props.serverSorting.sortBy
          ? [{ id: props.serverSorting.sortBy, desc: props.serverSorting.sortOrder === 'desc' }]
          : []
        const newSorting = typeof updaterOrValue === 'function'
          ? updaterOrValue(currentSorting)
          : updaterOrValue

        // 同步本地 ref（表头图标需要）
        sorting.value = newSorting

        // 通知父组件发起请求
        const sort = newSorting[0]
        if (sort) {
          props.serverSorting.onSortingChange(sort.id, sort.desc ? 'desc' : 'asc')
        }
        else {
          props.serverSorting.onSortingChange('', 'asc')
        }
      }
      else {
        valueUpdater(updaterOrValue, sorting)
      }
    },
    onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
    onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
    onColumnPinningChange: updaterOrValue => valueUpdater(updaterOrValue, columnPinning),
    onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
    onPaginationChange: updaterOrValue => valueUpdater(updaterOrValue, pagination),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  }

  if (useServerPagination) {
    // 使用 getter 保持响应式，total/pageSize 变化时 pageCount 自动更新
    Object.defineProperty(tableConfig, 'pageCount', {
      get() {
        return pageCount.value
      },
      enumerable: true,
      configurable: true,
    })
    tableConfig.manualPagination = true
  }
  else {
    tableConfig.getPaginationRowModel = getPaginationRowModel()
  }

  if (useServerSorting) {
    tableConfig.manualSorting = true
  }

  const table = useVueTable<T>(tableConfig)

  return table
}

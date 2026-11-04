<script setup lang="ts">
import { Icon } from '@iconify/vue'
import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  useVueTable,
  type ExpandedState,
} from '@tanstack/vue-table'
import { ref, h, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { ChevronRightIcon, ChevronsDownIcon, ChevronsUpIcon } from '@lucide/vue'
import DataTable from './components/table.vue'
import { menuTreeData, type MenuNode } from './data'

defineOptions({ name: 'MenuManagement' })

function collectAllRows(nodes: MenuNode[]): MenuNode[] {
  const result: MenuNode[] = []
  for (const node of nodes) {
    result.push(node)
    if (node.subRows && node.subRows.length > 0) {
      result.push(...collectAllRows(node.subRows))
    }
  }
  return result
}

function collectParentIds(nodes: MenuNode[]): string[] {
  const ids: string[] = []
  for (const node of nodes) {
    if (node.subRows && node.subRows.length > 0) {
      ids.push(node.id)
      ids.push(...collectParentIds(node.subRows))
    }
  }
  return ids
}

const columnHelper = createColumnHelper<MenuNode>()

const columns = [
  columnHelper.display({
    id: 'expander',
    header: () => null,
    size: 40,
    minSize: 40,
    maxSize: 40,
    enableResizing: false,
    cell: ({ row }) => {
      const canExpand = row.getCanExpand()
      return h('div', { class: 'flex items-center' }, [
        canExpand
          ? h(Button, {
              variant: 'ghost',
              size: 'icon',
              class: 'size-7',
              onClick: row.getToggleExpandedHandler(),
            }, [
              h(ChevronRightIcon, {
                class: `size-4 transition-transform duration-200 ${row.getIsExpanded() ? 'rotate-90' : ''}`,
              }),
            ])
          : h('span', { class: 'w-7' }),
      ])
    },
  }),
  columnHelper.accessor('title', {
    header: '菜单名称',
    size: 280,
    minSize: 160,
    maxSize: 400,
    cell: ({ row }) => {
      const canExpand = row.getCanExpand()
      const isExpanded = row.getIsExpanded()
      const depth = row.depth
      let typeIcon = 'lucide:file'
      let typeIconClass = 'text-gray-400'
      if (canExpand) {
        typeIcon = isExpanded ? 'lucide:folder-open' : 'lucide:folder'
        typeIconClass = 'text-amber-500'
      }
      return h('div', {
        class: 'flex items-center gap-2 min-w-0',
        style: { paddingLeft: `${depth * 1.5}rem` },
      }, [
        canExpand
          ? h(Icon, { icon: typeIcon, class: `size-4 shrink-0 ${typeIconClass}` })
          : row.original.icon || h(Icon, { icon: typeIcon, class: `size-4 shrink-0 ${typeIconClass}` }),
        h('span', {
          class: canExpand ? 'font-semibold truncate' : 'font-normal truncate',
        }, row.getValue('title')),
      ])
    },
  }),
  columnHelper.accessor('url', {
    header: '路由地址',
    size: 9999,
    minSize: 100,
    cell: ({ row }) => {
      const url = row.getValue('url')
      if (!url) {
        return h('span', { class: 'text-muted-foreground text-sm' }, '-')
      }
      return h('code', {
        class: 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] text-sm font-mono font-semibold truncate block',
      }, url as string)
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: () => h('div', { class: 'text-right' }, '操作'),
    size: 120,
    minSize: 100,
    maxSize: 120,
    cell: ({ row }) => {
      const canExpand = row.getCanExpand()
      return h('div', { class: 'flex justify-end gap-1' }, [
        h(Button, {
          variant: 'ghost',
          size: 'sm',
          class: 'h-8 text-xs',
        }, '编辑'),
        canExpand
          ? null
          : h(Button, {
              variant: 'ghost',
              size: 'sm',
              class: 'h-8 text-xs text-destructive hover:text-destructive',
            }, '删除'),
      ])
    },
  }),
]

const expanded = ref<ExpandedState>({})

const allParentIds = collectParentIds(menuTreeData)
const isAllExpanded = computed(() => {
  const expandedKeys = Object.keys(expanded.value as Record<string, boolean>)
  return allParentIds.every(id => expandedKeys.includes(id))
})

function expandAll() {
  const obj: Record<string, true> = {}
  for (const id of allParentIds) {
    obj[id] = true
  }
  expanded.value = obj
}

function collapseAll() {
  expanded.value = {}
}

const table = useVueTable({
  get data() {
    return menuTreeData
  },
  state: {
    get expanded() {
      return expanded.value
    },
  },
  columns,
  getRowId: (row) => row.id,
  getSubRows: (row) => row.subRows,
  getRowCanExpand: (row) => !!(row.subRows && row.subRows.length > 0),
  getCoreRowModel: getCoreRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  onExpandedChange: (updaterOrValue) => {
    expanded.value =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(expanded.value)
        : updaterOrValue
  },
})

const totalRows = computed(() => collectAllRows(menuTreeData).length)
const topLevelCount = computed(() => menuTreeData.length)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold">菜单列表</h2>
        <p class="text-sm text-muted-foreground">
          {{ topLevelCount }} 个一级菜单，共 {{ totalRows }} 个菜单项
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" @click="isAllExpanded ? collapseAll() : expandAll()">
          <component :is="isAllExpanded ? ChevronsUpIcon : ChevronsDownIcon" class="size-4" />
          <span class="ml-1">{{ isAllExpanded ? '全部收起' : '全部展开' }}</span>
        </Button>
      </div>
    </div>

    <DataTable
      :columns="columns"
      :table="table"
    />
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  useVueTable,
  type ExpandedState,
} from '@tanstack/vue-table'
import { ref, h, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { ChevronRightIcon, ChevronsDownIcon, ChevronsUpIcon, PlusIcon } from '@lucide/vue'
import DataTable from './components/table.vue'
import MenuFormSheet from './components/menu-form-sheet.vue'
import { toMenuNodes, findMenuItemById, type MenuNode } from './data'
import { fetchMenuListApi } from '@/api/menu/menu'
import type { MenuListItem } from '@/api/menu/types'
import type { Language } from '@/api/i18n/types'

defineOptions({ name: 'MenuManagement' })

const { locale, t } = useI18n()

const menuList = ref<MenuListItem[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

async function loadMenuList() {
  isLoading.value = true
  error.value = null
  try {
    menuList.value = await fetchMenuListApi()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadMenuList)

/** 后端数据 → 树形展示节点（跟随当前语言） */
const menuTree = computed<MenuNode[]>(() => toMenuNodes(menuList.value, locale.value as Language))

const drawerOpen = ref(false)
const editingMenu = ref<MenuListItem | null>(null)

function openCreate() {
  editingMenu.value = null
  drawerOpen.value = true
}

function openEdit(id: string) {
  editingMenu.value = findMenuItemById(menuList.value, Number(id))
  drawerOpen.value = true
}

function onSubmitted() {
  loadMenuList()
}

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
            }, 
            () => [
              h(ChevronRightIcon, {
                class: `size-4 transition-transform duration-200 ${row.getIsExpanded() ? 'rotate-90' : ''}`,
              }),
            ])
          : h('span', { class: 'w-7' }),
      ])
    },
  }),
  columnHelper.accessor('title', {
    header: () => t('pages.system.menu-management.name'),
    size: 280,
    minSize: 160,
    maxSize: 400,
    cell: ({ row }) => {
      const canExpand = row.getCanExpand()
      const isExpanded = row.getIsExpanded()
      const depth = row.depth
      const typeIcon = canExpand
        ? (isExpanded ? 'lucide:folder-open' : 'lucide:folder')
        : 'lucide:file'
      const typeIconClass = canExpand ? 'text-amber-500' : 'text-gray-400'
      return h('div', {
        class: 'flex items-center gap-2 min-w-0',
        style: { paddingLeft: `${depth * 1.5}rem` },
      }, [
        h(Icon, { icon: typeIcon, class: `size-4 shrink-0 ${typeIconClass}` }),
        h('span', { class: canExpand ? 'font-semibold truncate' : 'font-normal truncate', }, row.getValue('title')),
      ])
    },
  }),
  columnHelper.accessor('url', {
    header: () => t('pages.system.menu-management.path'),
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
    header: () => h('div', { class: 'text-right' }, t('global.table.operation')),
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
          onClick: () => openEdit(row.original.id),
        }, () => '编辑'),
        canExpand
          ? null
          : h(Button, {
              variant: 'ghost',
              size: 'sm',
              class: 'h-8 text-xs text-destructive hover:text-destructive',
            }, () => '删除'),
      ])
    },
  }),
]

const expanded = ref<ExpandedState>({})

const allParentIds = computed(() => collectParentIds(menuTree.value))
const isAllExpanded = computed(() => {
  const expandedKeys = Object.keys(expanded.value as Record<string, boolean>)
  return allParentIds.value.length > 0 && allParentIds.value.every(id => expandedKeys.includes(id))
})

function expandAll() {
  const obj: Record<string, true> = {}
  for (const id of allParentIds.value) {
    obj[id] = true
  }
  expanded.value = obj
}

function collapseAll() {
  expanded.value = {}
}

const table = useVueTable({
  get data() {
    return menuTree.value
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

const totalRows = computed(() => collectAllRows(menuTree.value).length)
const topLevelCount = computed(() => menuTree.value.length)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold">菜单列表</h2>
        <p class="text-sm text-muted-foreground">
          <template v-if="isLoading">正在加载…</template>
          <template v-else>{{ topLevelCount }} 个一级菜单，共 {{ totalRows }} 个菜单项</template>
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button size="sm" :disabled="isLoading" @click="openCreate">
          <PlusIcon class="size-4" />
          <span class="ml-1">新增</span>
        </Button>
        <Button variant="outline" size="sm" :disabled="isLoading" @click="isAllExpanded ? collapseAll() : expandAll()">
          <component :is="isAllExpanded ? ChevronsUpIcon : ChevronsDownIcon" class="size-4" />
          <span class="ml-1">{{ isAllExpanded ? '全部收起' : '全部展开' }}</span>
        </Button>
      </div>
    </div>

    <div v-if="error" class="text-sm text-destructive">
      加载失败：{{ error }}
    </div>

    <DataTable
      :columns="columns"
      :table="table"
    />

    <MenuFormSheet
      v-model:open="drawerOpen"
      :menu="editingMenu"
      @submitted="onSubmitted"
    />
  </div>
</template>

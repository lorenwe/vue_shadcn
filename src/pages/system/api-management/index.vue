<script setup lang="ts">
import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  useVueTable,
  type ExpandedState,
} from '@tanstack/vue-table'
import { computed, h, onMounted, ref, watch } from 'vue'
import {
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
  RefreshCwIcon,
} from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DataTable from './components/table.vue'
import {
  collectParentIds,
  countLeaves,
  countNodes,
  filterAdminApiNodes,
  toAdminApiNodes,
  type AdminApiNode,
} from './data'
import { usePageText } from './use-page-text.ts'
import { fetchAdminApiListApi } from '@/api/system/api-management/admin-api.ts'

defineOptions({ name: 'ApiManagement' })

const { t, te, tr, locale } = usePageText()

const items = ref<AdminApiNode[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const keyword = ref('')

async function loadList() {
  isLoading.value = true
  error.value = null
  try {
    const list = await fetchAdminApiListApi()
    items.value = toAdminApiNodes(list)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    isLoading.value = false
  }
}

/** 词条增删改后，刷新运行时 /language/allLocales 语言包 */
// async function refreshRuntimePack() {
//   try {
//     await useI18nLoader().loadLocaleMessages(getI18nInstance())
//   } catch (e) {
//     console.warn('[i18n] 刷新运行时语言包失败', e)
//   }
// }

// async function onSubmitted() {
//   await loadList()
//   await refreshRuntimePack()
// }

onMounted(loadList)

const tree = computed(() => filterAdminApiNodes(items.value, keyword.value))
const allParentIds = computed(() => collectParentIds(tree.value))
const total = computed(() => countNodes(items.value))
const leafCount = computed(() => countLeaves(items.value))

const summaryText = computed(() => {
  const key = 'pages.system.api-management.summary'
  return te(key)
    ? t(key, { total: total.value, leaf: leafCount.value })
    : `共 ${total.value} 个接口，${leafCount.value} 个叶子节点`
})

const expanded = ref<ExpandedState>({})

// 搜索时自动展开命中节点的祖先，保证结果可见
watch(tree, (nodes) => {
  if (!keyword.value.trim()) return
  const next: Record<string, true> = {}
  for (const id of collectParentIds(nodes)) {
    next[id] = true
  }
  expanded.value = next
})

const isAllExpanded = computed(() => {
  const keys = Object.keys(expanded.value as Record<string, boolean>)
  return allParentIds.value.length > 0 && allParentIds.value.every(id => keys.includes(id))
})

function expandAll() {
  const next: Record<string, true> = {}
  for (const id of allParentIds.value) {
    next[id] = true
  }
  expanded.value = next
}

function collapseAll() {
  expanded.value = {}
}

const columnHelper = createColumnHelper<AdminApiNode>()

function renderTranslation(value: string | null) {
  return h(
    'span',
    {
      class: value ? 'block truncate text-sm' : 'block text-sm text-muted-foreground',
      title: value ?? undefined,
    },
    value || '-',
  )
}

// 列定义依赖当前界面语言：locale 变化时重建表头，保证表头跟随多语言切换
const columns = computed(() => {
  // 显式读取 locale，建立响应式依赖
  void locale.value

  return [
    columnHelper.accessor('api_name', {
      header: () => t('pages.system.api-management.api_name'),
      size: 260,
      minSize: 180,
      maxSize: 360,
      cell: ({ row }) => {
        const node = row.original
        const canExpand = row.getCanExpand()
        const icon = canExpand
          ? (row.getIsExpanded() ? FolderOpenIcon : FolderIcon)
          : FileIcon

        return h(
          'div',
          {
            class: 'flex min-w-0 items-center gap-1.5',
            style: { paddingLeft: `${row.depth * 1.25}rem` },
          },
          [
            // 展开图标放在行图标前面，并跟随层级缩进
            canExpand
              ? h(ChevronRightIcon, {
                  class: `size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${row.getIsExpanded() ? 'rotate-90' : ''}`,
                })
              : h('span', { class: 'size-3.5 shrink-0' }),
            h(icon, {
              class: `size-4 shrink-0 ${canExpand ? 'text-primary' : 'text-muted-foreground'}`,
            }),
            h('span', { class: 'truncate font-mono text-xs', title: node.api_name }, node.api_name),
          ],
        )
      },
    }),
    columnHelper.accessor('method', {
      header: () => t('pages.system.api-management.method'),
      size: 9999,
      minSize: 160,
      cell: ({ getValue }) => renderTranslation(getValue()),
    }),
    columnHelper.accessor('status', {
      header: () => t('global.status'),
      size: 9999,
      minSize: 160,
      cell: ({ getValue }) => h(
        'span',
        { class: 'block text-right text-sm tabular-nums text-muted-foreground' },
        String(getValue()),
      ),
    }),
    columnHelper.accessor('api_path', {
      header: () => t('pages.system.api-management.api_path'),
      size: 9999,
      minSize: 160,
      cell: ({ getValue }) => renderTranslation(getValue()),
    }),
    columnHelper.accessor('api_type', {
      header: () => t('pages.system.api-management.api_type'),
      size: 9999,
      minSize: 160,
      cell: ({ getValue }) => renderTranslation(getValue()),
    }),
    columnHelper.accessor('sort', {
      header: () => t('global.table.sort'),
      size: 80,
      minSize: 64,
      maxSize: 100,
      cell: ({ getValue }) => h(
        'span',
        { class: 'block text-right text-sm tabular-nums text-muted-foreground' },
        String(getValue()),
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => tr('global.table.operation', '操作'),
      size: 130,
      minSize: 110,
      maxSize: 160,
      cell: ({ row }) => {
        const node = row.original
        const hasChildren = node.hasChildren
        return h('div', { class: 'flex justify-end gap-1' }, [
          h(
            Button,
            {
              variant: 'ghost',
              size: 'sm',
              class: 'h-8 px-2 text-xs',
              onClick: (event: MouseEvent) => {
                event.stopPropagation()
                // openEdit(node)
              },
              onKeydown: (event: KeyboardEvent) => event.stopPropagation(),
            },
            () => tr('menu.system.internationalization.edit', '编辑'),
          ),
          h(
            Button,
            {
              variant: 'ghost',
              size: 'sm',
              class: 'h-8 px-2 text-xs text-destructive hover:text-destructive',
              disabled: hasChildren,
              title: hasChildren
                ? tr('pages.system.internationalization.hasChildren', '请先删除该节点的所有子节点')
                : undefined,
              onClick: (event: MouseEvent) => {
                event.stopPropagation()
                // askDelete(node)
              },
              onKeydown: (event: KeyboardEvent) => event.stopPropagation(),
            },
            () => tr('menu.system.internationalization.delete', '删除'),
          ),
        ])
      },
    }),
  ]
})

const table = useVueTable({
  get data() {
    return tree.value
  },
  get columns() {
    return columns.value
  },
  state: {
    get expanded() {
      return expanded.value
    },
  },
  getRowId: row => row.id,
  getSubRows: row => row.children,
  getRowCanExpand: row => !!row.original.children?.length,
  getCoreRowModel: getCoreRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  onExpandedChange: (updaterOrValue) => {
    expanded.value = typeof updaterOrValue === 'function'
      ? updaterOrValue(expanded.value)
      : updaterOrValue
  },
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold">
          {{ tr('pages.system.api-management', t('menu.system.api-management')) }}
        </h2>
        <p class="text-sm text-muted-foreground">
          <template v-if="isLoading">
            {{ tr('pages.system.api-management.loading', '…') }}
          </template>
          <template v-else>
            {{ summaryText }}
          </template>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- <Button size="sm" :disabled="isLoading" @click="openCreate">
          <PlusIcon class="size-4" />
          <span class="ml-1">{{ tr('menu.system.api-management.add', '新增') }}</span>
        </Button> -->
        <Input
          v-model="keyword"
          :placeholder="tr('pages.system.api-management.searchPlaceholder', t('global.form.placeholder'))"
          class="h-8 w-56"
        />
        <Button
          variant="outline"
          size="sm"
          :disabled="isLoading"
          @click="isAllExpanded ? collapseAll() : expandAll()"
        >
          {{ isAllExpanded
            ? tr('pages.system.api-management.collapseAll', '全部收起')
            : tr('pages.system.api-management.expandAll', '全部展开') }}
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="isLoading"
          @click="loadList"
        >
          <RefreshCwIcon class="size-4" :class="{ 'animate-spin': isLoading }" />
          <span class="ml-1">
            {{ tr('pages.system.api-management.refresh', t('components.TabsLayout.refresh')) }}
          </span>
        </Button>
      </div>
    </div>

    <div
      v-if="error"
      class="flex items-center justify-between gap-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
    >
      <span>{{ error }}</span>
      <Button variant="outline" size="sm" @click="loadList">
        {{ tr('pages.system.api-management.retry', t('components.TabsLayout.refresh')) }}
      </Button>
    </div>

    <DataTable
      :table="table"
      :loading="isLoading"
      :loading-text="tr('pages.system.api-management.loading', '…')"
      :empty-text="tr('pages.system.api-management.empty', '—')"
    />

    <!-- <LanguageFormSheet
      v-model:open="formOpen"
      :node="editingNode"
      :parent-tree="parentTree"
      @submitted="onSubmitted"
    /> -->

    <!-- <Dialog :open="deleteOpen" @update:open="(v: boolean) => deleteOpen = v">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {{ tr('pages.system.api-management.deleteTitle', '删除词条') }}
          </DialogTitle>
          <DialogDescription>
            {{ tr('pages.system.api-management.deleteDescription', '删除后不可恢复，确定删除该词条吗？') }}
            <span v-if="deleteTarget" class="mt-1 block font-mono text-xs text-foreground">
              {{ deleteTarget.name }}
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex-row justify-end gap-2">
          <Button variant="outline" :disabled="deleting" @click="deleteOpen = false">
            {{ tr('pages.system.api-management.cancel', '取消') }}
          </Button>
          <Button variant="destructive" :disabled="deleting" @click="confirmDelete">
            {{ deleting
              ? tr('pages.system.api-management.deleting', '删除中…')
              : tr('menu.system.api-management.delete', '删除') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog> -->
  </div>
</template>

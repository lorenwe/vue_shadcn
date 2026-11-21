<script setup lang="ts">
import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  useVueTable,
  type ExpandedState,
} from '@tanstack/vue-table'
import { computed, h, onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import {
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
  PlusIcon,
  RefreshCwIcon,
} from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import DataTable from './components/table.vue'
import LanguageFormSheet from './components/form-sheet.vue'
import {
  collectParentIds,
  countLeaves,
  countNodes,
  filterLanguageNodes,
  toLanguageNodes,
  toParentTree,
  type LanguageNode,
} from './data'
import { usePageText } from './use-page-text'
import { deleteLanguageApi, fetchLanguageListApi } from '@/api/i18n/i18n'
import { getI18nInstance } from '@/plugins/i18n/setup'
import { useI18nLoader } from '@/composables/use-i18n-loader'

defineOptions({ name: 'Internationalization' })

const { t, te, tr, locale } = usePageText()

const items = ref<LanguageNode[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const keyword = ref('')

const formOpen = ref(false)
const editingNode = ref<LanguageNode | null>(null)
const parentTree = computed(() => toParentTree(items.value))

const deleteOpen = ref(false)
const deleteTarget = ref<LanguageNode | null>(null)
const deleting = ref(false)

async function loadList() {
  isLoading.value = true
  error.value = null
  try {
    const list = await fetchLanguageListApi()
    items.value = toLanguageNodes(list)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    isLoading.value = false
  }
}

/** 词条增删改后，刷新运行时 /language/allLocales 语言包 */
async function refreshRuntimePack() {
  try {
    await useI18nLoader().loadLocaleMessages(getI18nInstance())
  } catch (e) {
    console.warn('[i18n] 刷新运行时语言包失败', e)
  }
}

async function onSubmitted() {
  await loadList()
  await refreshRuntimePack()
}

onMounted(loadList)

const tree = computed(() => filterLanguageNodes(items.value, keyword.value))
const allParentIds = computed(() => collectParentIds(tree.value))
const total = computed(() => countNodes(items.value))
const leafCount = computed(() => countLeaves(items.value))

const summaryText = computed(() => {
  const key = 'pages.system.internationalization.summary'
  return te(key)
    ? t(key, { total: total.value, leaf: leafCount.value })
    : `共 ${total.value} 个词条，${leafCount.value} 个叶子节点`
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

function openCreate() {
  editingNode.value = null
  formOpen.value = true
}

function openEdit(node: LanguageNode) {
  editingNode.value = node
  formOpen.value = true
}

/** 有子节点时禁止删除 */
function askDelete(node: LanguageNode) {
  if (node.hasChildren) {
    toast.error(tr('pages.system.internationalization.hasChildren', '请先删除该节点的所有子节点'))
    return
  }
  deleteTarget.value = node
  deleteOpen.value = true
}

async function confirmDelete() {
  const target = deleteTarget.value
  if (!target) return

  deleting.value = true
  try {
    await deleteLanguageApi(Number(target.id))
    toast.success(tr('pages.system.internationalization.deleteSuccess', '删除成功'))
    deleteOpen.value = false
    deleteTarget.value = null
    await loadList()
    await refreshRuntimePack()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : String(e))
  } finally {
    deleting.value = false
  }
}

const columnHelper = createColumnHelper<LanguageNode>()

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
    columnHelper.accessor('name', {
      header: () => t('pages.system.internationalization.name'),
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
            canExpand
              ? h(ChevronRightIcon, {
                  class: `size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${row.getIsExpanded() ? 'rotate-90' : ''}`,
                })
              : h('span', { class: 'size-3.5 shrink-0' }),
            h(icon, {
              class: `size-4 shrink-0 ${canExpand ? 'text-primary' : 'text-muted-foreground'}`,
            }),
            h('span', { class: 'truncate font-mono text-xs', title: node.name }, node.name),
          ],
        )
      },
    }),
    columnHelper.accessor('zhCN', {
      header: () => t('pages.system.internationalization.zh-CN'),
      size: 9999,
      minSize: 160,
      cell: ({ getValue }) => renderTranslation(getValue()),
    }),
    columnHelper.accessor('enUS', {
      header: () => t('pages.system.internationalization.en-US'),
      size: 9999,
      minSize: 160,
      cell: ({ getValue }) => renderTranslation(getValue()),
    }),
    columnHelper.accessor('jaJP', {
      header: () => t('pages.system.internationalization.ja-JP'),
      size: 9999,
      minSize: 160,
      cell: ({ getValue }) => renderTranslation(getValue()),
    }),
    columnHelper.accessor('zhTW', {
      header: () => t('pages.system.internationalization.zh-TW'),
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
                openEdit(node)
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
                askDelete(node)
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
          {{ tr('pages.system.internationalization.pageTitle', t('menu.system.internationalization')) }}
        </h2>
        <p class="text-sm text-muted-foreground">
          <template v-if="isLoading">
            {{ tr('pages.system.internationalization.loading', '…') }}
          </template>
          <template v-else>
            {{ summaryText }}
          </template>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <Button size="sm" :disabled="isLoading" @click="openCreate">
          <PlusIcon class="size-4" />
          <span class="ml-1">{{ tr('menu.system.internationalization.add', '新增') }}</span>
        </Button>
        <Input
          v-model="keyword"
          :placeholder="tr('pages.system.internationalization.searchPlaceholder', t('global.form.placeholder'))"
          class="h-8 w-56"
        />
        <Button
          variant="outline"
          size="sm"
          :disabled="isLoading"
          @click="isAllExpanded ? collapseAll() : expandAll()"
        >
          {{ isAllExpanded
            ? tr('pages.system.internationalization.collapseAll', '全部收起')
            : tr('pages.system.internationalization.expandAll', '全部展开') }}
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="isLoading"
          @click="loadList"
        >
          <RefreshCwIcon class="size-4" :class="{ 'animate-spin': isLoading }" />
          <span class="ml-1">
            {{ tr('pages.system.internationalization.refresh', t('components.TabsLayout.refresh')) }}
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
        {{ tr('pages.system.internationalization.retry', t('components.TabsLayout.refresh')) }}
      </Button>
    </div>

    <DataTable
      :table="table"
      :loading="isLoading"
      :loading-text="tr('pages.system.internationalization.loading', '…')"
      :empty-text="tr('pages.system.internationalization.empty', '—')"
    />

    <LanguageFormSheet
      v-model:open="formOpen"
      :node="editingNode"
      :parent-tree="parentTree"
      @submitted="onSubmitted"
    />

    <Dialog :open="deleteOpen" @update:open="(v: boolean) => deleteOpen = v">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {{ tr('pages.system.internationalization.deleteTitle', '删除词条') }}
          </DialogTitle>
          <DialogDescription>
            {{ tr('pages.system.internationalization.deleteDescription', '删除后不可恢复，确定删除该词条吗？') }}
            <span v-if="deleteTarget" class="mt-1 block font-mono text-xs text-foreground">
              {{ deleteTarget.name }}
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex-row justify-end gap-2">
          <Button variant="outline" :disabled="deleting" @click="deleteOpen = false">
            {{ tr('pages.system.internationalization.cancel', '取消') }}
          </Button>
          <Button variant="destructive" :disabled="deleting" @click="confirmDelete">
            {{ deleting
              ? tr('pages.system.internationalization.deleting', '删除中…')
              : tr('menu.system.internationalization.delete', '删除') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  useVueTable,
  type ExpandedState,
} from '@tanstack/vue-table'
import { computed, h, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
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
  filterLanguageNodes,
  toLanguageNodes,
  type LanguageNode,
} from './data'
import { fetchLanguageListApi } from '@/api/i18n/i18n'

defineOptions({ name: 'Internationalization' })

const { t, te, locale } = useI18n()

/**
 * 页面 chrome 文案优先取接口语言包；接口尚未提供该 key 时回退到传入的默认值。
 * 不把多语言写进 src/plugins/i18n/lang（那些静态文件只服务未登录场景）。
 */
function tr(key: string, fallback: string) {
  return te(key) ? t(key) : fallback
}

const items = ref<LanguageNode[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const keyword = ref('')

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
    columnHelper.display({
      id: 'expander',
      header: () => null,
      size: 40,
      minSize: 40,
      maxSize: 40,
      enableResizing: false,
      cell: ({ row }) => {
        if (!row.getCanExpand()) {
          return h('span', { class: 'block w-6' })
        }
        return h(
          Button,
          {
            variant: 'ghost',
            size: 'icon',
            class: 'size-6',
            'aria-label': row.getIsExpanded()
              ? tr('pages.system.internationalization.collapse', '收起')
              : tr('pages.system.internationalization.expand', '展开'),
            onClick: row.getToggleExpandedHandler(),
          },
          () => [
            h(ChevronRightIcon, {
              class: `size-3.5 transition-transform duration-200 ${row.getIsExpanded() ? 'rotate-90' : ''}`,
            }),
          ],
        )
      },
    }),
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
            class: 'flex min-w-0 items-center gap-2',
            style: { paddingLeft: `${row.depth * 1.25}rem` },
          },
          [
            h(icon, {
              class: `size-4 shrink-0 ${canExpand ? 'text-amber-500' : 'text-muted-foreground'}`,
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
  </div>
</template>

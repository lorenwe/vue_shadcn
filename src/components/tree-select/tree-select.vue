<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { ChevronsUpDownIcon, SearchIcon, XIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Command, CommandGroup, CommandList } from '@/components/ui/command'
import TreeNode from './tree-node.vue'
import { useTreeSelect } from './use-tree-select'
import type { TreeNode as TreeNodeType } from './types'

const props = withDefaults(defineProps<{
  modelValue?: string | number | null
  data: TreeNodeType[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  clearable?: boolean
  clearText?: string
  disabled?: boolean
  loadChildren?: (node: TreeNodeType) => Promise<TreeNodeType[]>
}>(), {
  placeholder: '请选择父级节点...',
  searchPlaceholder: '搜索节点...',
  emptyText: '未找到匹配的节点',
  clearText: '清除选择',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
}>()

const open = ref(false)
const triggerRef = ref<any>(null)
const searchInputRef = ref<any>(null)
const triggerWidth = ref<number>()

// 受控展开：父组件（本组件）统一维护，搜索/回显时自动展开祖先
const expandedValues = reactive(new Set<string | number>())

const { searchQuery, loadingValues, filteredTree, loadChildren: loadNodeChildren } = useTreeSelect({
  data: () => props.data,
  onLoadChildren: props.loadChildren,
})

function findNode(nodes: TreeNodeType[], value: string | number): TreeNodeType | undefined {
  for (const node of nodes) {
    if (node.value === value) return node
    if (node.children) {
      const found = findNode(node.children, value)
      if (found) return found
    }
  }
}

function findPath(
  nodes: TreeNodeType[],
  value: string | number,
  path: TreeNodeType[] = [],
): TreeNodeType[] {
  for (const node of nodes) {
    const nextPath = [...path, node]
    if (node.value === value) return nextPath
    if (node.children) {
      const found = findPath(node.children, value, nextPath)
      if (found.length > 0) return found
    }
  }
  return []
}

function expandAncestors(value: string | number) {
  for (const node of findPath(props.data, value)) {
    expandedValues.add(node.value)
  }
}

function collectParentValues(nodes: TreeNodeType[]): Array<string | number> {
  const values: Array<string | number> = []
  for (const node of nodes) {
    if (node.children?.length) {
      values.push(node.value)
      values.push(...collectParentValues(node.children))
    }
  }
  return values
}

const selectedLabel = computed(() => {
  if (props.modelValue == null) return null
  return findNode(props.data, props.modelValue)?.label
})

const canLoadRemote = computed(() => !!props.loadChildren)

function handleSelect(node: TreeNodeType) {
  if (node.disabled) return
  emit('update:modelValue', node.value)
  open.value = false
}

function handleToggle(node: TreeNodeType, nextOpen: boolean) {
  if (nextOpen) {
    expandedValues.add(node.value)
  } else {
    expandedValues.delete(node.value)
  }
}

function handleClear() {
  emit('update:modelValue', null)
  open.value = false
}

// 搜索时自动展开命中的父级，保证匹配结果可见
watch(
  filteredTree,
  (nodes) => {
    if (!searchQuery.value.trim()) return
    for (const value of collectParentValues(nodes)) {
      expandedValues.add(value)
    }
  },
  { immediate: true },
)

// 回显时自动展开当前选中节点的祖先路径
watch(
  () => props.modelValue,
  (value) => {
    if (value != null) expandAncestors(value)
  },
  { immediate: true },
)

watch(
  () => props.data,
  () => {
    if (props.modelValue != null) expandAncestors(props.modelValue)
  },
)

watch(open, async (visible) => {
  if (visible) {
    if (props.modelValue != null) expandAncestors(props.modelValue)
    await nextTick()
    const el = triggerRef.value?.$el as HTMLElement | undefined
    if (el) triggerWidth.value = el.offsetWidth
    searchInputRef.value?.$el?.focus()
  } else {
    searchQuery.value = ''
  }
})
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        ref="triggerRef"
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        :disabled="disabled"
        class="w-full justify-between font-normal"
      >
        <span class="truncate">
          {{ selectedLabel ?? placeholder }}
        </span>
        <ChevronsUpDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>

    <PopoverContent
      class="min-w-[240px] p-0"
      align="start"
      :style="triggerWidth ? { width: `${triggerWidth}px` } : undefined"
    >
      <Command :should-filter="false">
        <div class="flex h-9 items-center gap-2 border-b px-3">
          <SearchIcon class="size-4 shrink-0 opacity-50" />
          <Input
            ref="searchInputRef"
            v-model="searchQuery"
            :placeholder="searchPlaceholder"
            autofocus
            class="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>

        <div v-if="clearable && modelValue != null" class="border-b p-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="w-full justify-start text-muted-foreground"
            @click="handleClear"
          >
            <XIcon class="mr-2 size-4" />
            {{ clearText }}
          </Button>
        </div>

        <CommandList>
          <!-- CommandItem 依赖 CommandGroup 上下文，必须包一层 CommandGroup -->
          <CommandGroup>
            <TreeNode
              v-for="node in filteredTree"
              :key="node.value"
              :node="node"
              :selected-value="modelValue"
              :expanded-values="expandedValues"
              :loading-values="loadingValues"
              :loadable="canLoadRemote"
              @select="handleSelect"
              @expand="loadNodeChildren"
              @toggle="handleToggle"
            />

            <div
              v-if="filteredTree.length === 0"
              class="py-6 text-center text-sm text-muted-foreground"
            >
              {{ emptyText }}
            </div>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { TreeItem, TreeRoot } from 'reka-ui'
import { computed, ref } from 'vue'
import { Check, Minus } from '@lucide/vue'
import DynamicIcon from '@/components/dynamic-Icon.vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { TreeNode } from './types'

defineOptions({ name: 'TreeCheckbox' })

const props = withDefaults(defineProps<{
  items: TreeNode[]
  /** 受控选中值 */
  modelValue?: Array<string | number>
  /** 非受控初始值 */
  defaultChecked?: Array<string | number>
  showToolbar?: boolean
  checkAllText?: string
  uncheckAllText?: string
  selectedText?: string
  emptyText?: string
  maxHeight?: string
}>(), {
  showToolbar: true,
  checkAllText: '全选',
  uncheckAllText: '取消全选',
  selectedText: '已选',
  emptyText: '暂无数据',
  maxHeight: '18rem',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Array<string | number>): void
  (e: 'update:checked', value: Array<string | number>): void
  (e: 'change', value: Array<string | number>, item: TreeNode): void
}>()

const uncontrolledValue = ref<Set<string | number>>(new Set(props.defaultChecked ?? []))

const isControlled = computed(() => props.modelValue !== undefined)

const checkedSet = computed(
  () => new Set(isControlled.value ? (props.modelValue ?? []) : uncontrolledValue.value),
)

type CheckState = 'checked' | 'half' | 'unchecked'

/**
 * 由选中集合和树结构推导每个节点的显示状态。
 * 这样编辑回填时，父级会根据子级选中情况自动变成半选/全选，
 * 不再依赖 toggle 时维护的临时 half 集合。
 */
const nodeStates = computed<Map<string | number, CheckState>>(() => {
  const states = new Map<string | number, CheckState>()

  function walk(nodes: TreeNode[]): CheckState[] {
    return nodes.map((node) => {
      const explicit = checkedSet.value.has(node.id)
      const children = node.children ?? []

      let state: CheckState
      if (!children.length) {
        state = explicit ? 'checked' : 'unchecked'
      } else {
        const childStates = walk(children)
        if (explicit || childStates.every(child => child === 'checked')) {
          state = 'checked'
        } else if (childStates.some(child => child === 'checked' || child === 'half')) {
          state = 'half'
        } else {
          state = 'unchecked'
        }
      }

      states.set(node.id, state)
      return state
    })
  }

  walk(props.items)
  return states
})

function getNodeState(id: string | number): CheckState {
  return nodeStates.value.get(id) ?? 'unchecked'
}

function collectIds(node: TreeNode): Array<string | number> {
  const ids: Array<string | number> = []

  function walk(current: TreeNode) {
    ids.push(current.id)
    for (const child of current.children ?? []) {
      if (!child.disabled) walk(child)
    }
  }

  walk(node)
  return ids
}

function setChecked(next: Set<string | number>, item?: TreeNode) {
  const values = Array.from(next)

  if (isControlled.value) {
    emit('update:modelValue', values)
  } else {
    uncontrolledValue.value = next
  }

  emit('update:checked', values)
  if (item) emit('change', values, item)
}

function toggleCheck(node: TreeNode) {
  if (node.disabled) return

  const next = new Set(checkedSet.value)
  const ids = collectIds(node)
  const checked = getNodeState(node.id) === 'checked'

  for (const id of ids) {
    if (checked) next.delete(id)
    else next.add(id)
  }

  setChecked(next, node)
}

function checkAll() {
  const next = new Set<string | number>()

  function walk(nodes: TreeNode[]) {
    for (const node of nodes) {
      if (!node.disabled) next.add(node.id)
      if (node.children?.length) walk(node.children)
    }
  }

  walk(props.items)
  setChecked(next)
}

function uncheckAll() {
  setChecked(new Set())
}

const halfCheckedKeys = computed(() =>
  [...nodeStates.value.entries()]
    .filter(([, state]) => state === 'half')
    .map(([id]) => id),
)

const checkedLeafKeys = computed(() => {
  const keys: Array<string | number> = []

  function walk(nodes: TreeNode[]) {
    for (const node of nodes) {
      if (!node.children?.length) {
        if (checkedSet.value.has(node.id)) keys.push(node.id)
      } else {
        walk(node.children)
      }
    }
  }

  walk(props.items)
  return keys
})

defineExpose({
  checkedSet,
  halfCheckedKeys,
  checkedLeafKeys,
  checkAll,
  uncheckAll,
  toggleCheck,
})
</script>

<template>
  <div class="w-full">
    <div v-if="showToolbar" class="mb-2 flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" class="h-7 px-2 text-xs" @click="checkAll">
        {{ checkAllText }}
      </Button>
      <Button variant="outline" size="sm" class="h-7 px-2 text-xs" @click="uncheckAll">
        {{ uncheckAllText }}
      </Button>
      <span class="text-xs text-muted-foreground">
        {{ selectedText }}: {{ checkedLeafKeys.length }}
      </span>
    </div>

    <div
      v-if="items.length"
      class="overflow-y-auto rounded-md border bg-background p-2"
      :style="{ maxHeight }"
    >
      <TreeRoot
        v-slot="{ flattenItems }"
        :items="items"
        :get-key="(item) => String(item.id)"
        :propagate-select="false"
        class="w-full list-none select-none text-sm"
      >
        <TreeItem
          v-for="item in flattenItems"
          v-slot="{ isExpanded, handleToggle }"
          :key="item._id"
          v-bind="item.bind"
          :style="{ paddingLeft: `${(item.level - 1) * 1.25 + 0.25}rem` }"
          class="flex items-center gap-1.5 rounded px-2 py-1 outline-none transition-colors hover:bg-muted/50"
          :class="{ 'pointer-events-none opacity-50': item.value.disabled }"
        >
          <span class="flex shrink-0 items-center" @click.stop>
            <Checkbox
              :model-value="getNodeState(item.value.id) === 'checked'
                ? true
                : getNodeState(item.value.id) === 'half'
                  ? 'indeterminate'
                  : false"
              :disabled="item.value.disabled"
              :aria-label="item.value.title"
              @update:model-value="() => toggleCheck(item.value)"
            >
              <Minus
                v-if="getNodeState(item.value.id) === 'half'"
                class="size-3"
              />
              <Check v-else class="size-3" />
            </Checkbox>
          </span>

          <DynamicIcon
            v-if="item.hasChildren"
            :name="isExpanded ? 'folder-open' : 'folder'"
            class="size-4 shrink-0 text-primary"
          />
          <DynamicIcon
            v-else
            :name="item.value.icon || 'file'"
            class="size-4 shrink-0 text-muted-foreground"
          />

          <span class="min-w-0 flex-1 truncate">
            {{ item.value.title }}
          </span>

          <button
            v-if="item.hasChildren"
            type="button"
            class="flex size-5 shrink-0 items-center justify-center rounded transition-transform duration-200 hover:bg-muted"
            :class="{ 'rotate-90': isExpanded }"
            @click.stop="handleToggle"
          >
            <DynamicIcon name="chevron-right" class="size-4" />
          </button>
        </TreeItem>
      </TreeRoot>
    </div>

    <p v-else class="rounded-md border py-6 text-center text-sm text-muted-foreground">
      {{ emptyText }}
    </p>
  </div>
</template>

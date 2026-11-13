<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRightIcon, CheckIcon, Loader2Icon } from '@lucide/vue'
import { CommandItem } from '@/components/ui/command'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { TreeNode } from './types'

const props = defineProps<{
  node: TreeNode
  selectedValue?: string | number | null
  expandedValues: Set<string | number>
  loadingValues: Set<string | number>
  level?: number
  /** 是否允许远程加载子级；静态数据传 false，避免叶子节点出现展开箭头 */
  loadable?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', node: TreeNode): void
  (e: 'expand', node: TreeNode): void
  (e: 'toggle', node: TreeNode, open: boolean): void
}>()

const level = computed(() => props.level ?? 0)
const isLoading = computed(() => props.loadingValues.has(props.node.value))
const isDisabled = computed(() => !!props.node.disabled)
const isOpen = computed(() => props.expandedValues.has(props.node.value))
const hasChildren = computed(() => {
  if (props.node.children) return props.node.children.length > 0
  // 只有启用远程加载时，未加载 children 的节点才视为“可能有子节点”
  return !!props.loadable && props.node.isLeaf !== true
})
const isSelected = computed(() => props.selectedValue === props.node.value)

function handleExpand(openState: boolean) {
  emit('toggle', props.node, openState)
  if (openState && !props.node.children && props.loadable && props.node.isLeaf !== true) {
    emit('expand', props.node) // 触发远程加载
  }
}

function handleSelect() {
  if (isLoading.value || isDisabled.value) return
  emit('select', props.node)
}
</script>

<template>
  <Collapsible v-if="hasChildren" :open="isOpen" @update:open="handleExpand">
    <div class="flex items-center">
      <CollapsibleTrigger as-child>
        <button
          type="button"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm hover:bg-accent"
          @click.stop
        >
          <Loader2Icon v-if="isLoading" class="h-4 w-4 animate-spin" />
          <ChevronRightIcon
            v-else
            class="h-4 w-4 transition-transform"
            :class="{ 'rotate-90': isOpen }"
          />
        </button>
      </CollapsibleTrigger>

      <CommandItem
        :value="String(node.value)"
        :disabled="isLoading || isDisabled"
        class="flex-1 cursor-pointer"
        :data-selected="isSelected ? 'true' : undefined"
        :style="{ paddingLeft: `${level * 16 + 8}px` }"
        @select="handleSelect"
      >
        <CheckIcon
          :class="cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')"
        />
        <span class="truncate">{{ node.label }}</span>
      </CommandItem>
    </div>

    <CollapsibleContent>
      <TreeNode
        v-for="child in node.children"
        :key="child.value"
        :node="child"
        :selected-value="selectedValue"
        :expanded-values="expandedValues"
        :loading-values="loadingValues"
        :level="level + 1"
        :loadable="loadable"
        @select="emit('select', $event)"
        @expand="emit('expand', $event)"
        @toggle="(childNode: TreeNode, open: boolean) => emit('toggle', childNode, open)"
      />
    </CollapsibleContent>
  </Collapsible>

  <!-- 叶子节点或不可展开的节点 -->
  <CommandItem
    v-else
    :value="String(node.value)"
    :disabled="isLoading || isDisabled"
    class="cursor-pointer"
    :data-selected="isSelected ? 'true' : undefined"
    :style="{ paddingLeft: `${level * 16 + 8}px` }"
    @select="handleSelect"
  >
    <Loader2Icon v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
    <CheckIcon
      v-else
      :class="cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')"
    />
    <span class="truncate">{{ node.label }}</span>
  </CommandItem>
</template>

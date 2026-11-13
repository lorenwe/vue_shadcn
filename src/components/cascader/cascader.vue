<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useBreakpoints } from '@vueuse/core'
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  SearchIcon,
  XIcon,
} from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import type { CascaderOption, CascaderPath } from './types'

const props = withDefaults(defineProps<{
  modelValue?: string | number | null
  options: CascaderOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  separator?: string
  disabled?: boolean
  clearable?: boolean
  searchable?: boolean
  /** 是否允许选择非叶子节点；false 时点击父节点只展开 */
  changeOnSelect?: boolean
  /** 展开下一列的方式 */
  expandTrigger?: 'click' | 'hover'
  /** 触发器是否展示完整路径；false 时只展示最后一级名称 */
  showPath?: boolean
  /** 移动端「选择当前层级」按钮文案 */
  selectCurrentText?: string
}>(), {
  placeholder: '请选择',
  searchPlaceholder: '搜索选项...',
  emptyText: '暂无匹配项',
  separator: ' / ',
  disabled: false,
  clearable: true,
  searchable: false,
  changeOnSelect: false,
  expandTrigger: 'click',
  showPath: true,
  selectCurrentText: '选择当前',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
  (e: 'change', value: string | number | null, selectedOptions: CascaderPath): void
}>()

const open = ref(false)
const searchQuery = ref('')
const searchInputRef = ref<any>(null)
const activePath = ref<CascaderPath>([])

// 移动端：Sheet（底部抽屉）+ 单列逐级下钻
const breakpoints = useBreakpoints({ md: 768 })
const isMobile = breakpoints.smaller('md')
const mobileLevel = ref(0)
const mobilePath = ref<CascaderPath>([])

function findPath(
  options: CascaderOption[],
  value: string | number,
  path: CascaderPath = [],
): CascaderPath {
  for (const option of options) {
    const nextPath = [...path, option]
    if (option.value === value) return nextPath
    if (option.children?.length) {
      const found = findPath(option.children, value, nextPath)
      if (found.length > 0) return found
    }
  }
  return []
}

function collectPaths(
  options: CascaderOption[],
  base: CascaderPath = [],
): CascaderPath[] {
  const paths: CascaderPath[] = []
  for (const option of options) {
    if (option.disabled) continue
    const path = [...base, option]
    if (option.children?.length) {
      paths.push(...collectPaths(option.children, path))
      if (props.changeOnSelect) paths.push(path)
    } else {
      paths.push(path)
    }
  }
  return paths
}

const selectedPath = computed<CascaderPath>(() => {
  if (props.modelValue == null) return []
  return findPath(props.options, props.modelValue)
})

const displayText = computed(() => {
  if (!selectedPath.value.length) return ''
  if (!props.showPath) {
    return selectedPath.value[selectedPath.value.length - 1]?.label ?? ''
  }
  return selectedPath.value.map(option => option.label).join(props.separator)
})

const selectedKey = computed(() =>
  selectedPath.value.map(option => option.value).join('\u0000'),
)

function pathKey(path: CascaderPath) {
  return path.map(option => option.value).join('\u0000')
}

function isSelected(option: CascaderOption, columnPath: CascaderPath) {
  return pathKey([...columnPath, option]) === selectedKey.value
}

/** 是否为当前展开/待选择的最后一级节点 */
function isActive(option: CascaderOption, columnPath: CascaderPath) {
  if (activePath.value.length === 0) return false
  const path = [...columnPath, option]
  return path.length === activePath.value.length
    && path.every((item, index) => item.value === activePath.value[index]?.value)
}

/** 是否位于当前展开路径上（祖先节点） */
function isInActivePath(option: CascaderOption, columnPath: CascaderPath) {
  if (activePath.value.length === 0) return false
  const path = [...columnPath, option]
  if (path.length > activePath.value.length) return false
  return path.every((item, index) => item.value === activePath.value[index]?.value)
}

const activeOption = computed(() => activePath.value[activePath.value.length - 1] ?? null)

/**
 * 当前展开的列：
 * [根选项] + [activePath[0].children] + [activePath[1].children]...
 */
const columns = computed<{ options: CascaderOption[]; path: CascaderPath }[]>(() => {
  const result: { options: CascaderOption[]; path: CascaderPath }[] = [
    { options: props.options, path: [] },
  ]

  for (const option of activePath.value) {
    if (!option.children?.length) break
    const parentPath = result[result.length - 1].path
    result.push({
      options: option.children,
      path: [...parentPath, option],
    })
  }

  return result
})

const searchResults = computed<CascaderPath[]>(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return []
  return collectPaths(props.options)
    .filter(path => path.some(option => option.label.toLowerCase().includes(query)))
    .slice(0, 50)
})

const mobileOptions = computed<CascaderOption[]>(() => {
  let current = props.options
  for (let index = 0; index < mobileLevel.value; index++) {
    const value = mobilePath.value[index]?.value
    const found = current.find(option => option.value === value)
    if (!found?.children?.length) return []
    current = found.children
  }
  return current
})

const mobileTitle = computed(() => {
  if (mobileLevel.value === 0) return props.placeholder
  return mobilePath.value[mobileLevel.value - 1]?.label ?? props.placeholder
})

function isMobileSelected(option: CascaderOption) {
  return pathKey([...mobilePath.value.slice(0, mobileLevel.value), option]) === selectedKey.value
}

function handleMobileSelect(option: CascaderOption) {
  if (option.disabled) return

  const path = [...mobilePath.value.slice(0, mobileLevel.value), option]

  // 移动端：父节点始终逐级下钻；选择父级用抽屉头部的「选择当前」
  if (option.children?.length) {
    mobilePath.value = path
    mobileLevel.value++
    return
  }

  selectPath(path)
  mobileLevel.value = 0
  mobilePath.value = []
}

function mobileSelectCurrent() {
  if (mobileLevel.value === 0) return
  selectPath(mobilePath.value.slice(0, mobileLevel.value))
  mobileLevel.value = 0
  mobilePath.value = []
}

function mobileBack() {
  if (mobileLevel.value > 0) mobileLevel.value--
}

function selectPath(path: CascaderPath) {
  const option = path[path.length - 1]
  if (!option) return

  emit('update:modelValue', option.value)
  emit('change', option.value, path)
  open.value = false
  searchQuery.value = ''
}

function handleOptionClick(option: CascaderOption, columnPath: CascaderPath) {
  if (option.disabled) return

  const path = [...columnPath, option]
  activePath.value = path

  if (option.children?.length) {
    // 悬停模式：changeOnSelect 时点击父级直接选中
    if (props.changeOnSelect && props.expandTrigger === 'hover') {
      selectPath(path)
    }
    // 点击模式：只展开下一列，父级选中由「选择当前」按钮完成
    return
  }

  selectPath(path)
}

const showSelectCurrent = computed(() =>
  props.changeOnSelect
  && props.expandTrigger === 'click'
  && activePath.value.length > 0
  && !searchQuery.value.trim(),
)

function selectActivePath() {
  if (!activePath.value.length) return
  selectPath([...activePath.value])
}

function handleOptionHover(option: CascaderOption, columnPath: CascaderPath) {
  if (props.expandTrigger !== 'hover' || option.disabled) return
  // 悬停到叶子时也更新 path，右侧多余列会被移除
  activePath.value = [...columnPath, option]
}

function handleClear() {
  emit('update:modelValue', null)
  emit('change', null, [])
  open.value = false
}

watch(open, async (visible) => {
  if (!visible) {
    activePath.value = []
    mobileLevel.value = 0
    mobilePath.value = []
    searchQuery.value = ''
    return
  }

  searchQuery.value = ''

  if (isMobile.value) {
    mobileLevel.value = 0
    mobilePath.value = []
    return
  }

  activePath.value = [...selectedPath.value]
  await nextTick()
  searchInputRef.value?.$el?.focus()
})

// 断点切换时关闭，避免 Popover / Sheet 同时处于打开状态
watch(isMobile, () => {
  open.value = false
})

watch(
  () => props.modelValue,
  () => {
    if (open.value) activePath.value = [...selectedPath.value]
  },
)
</script>

<template>
  <component :is="isMobile ? Sheet : Popover" v-model:open="open">
    <component :is="isMobile ? SheetTrigger : PopoverTrigger" as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        :disabled="disabled"
        class="w-full justify-between font-normal"
      >
        <span
          class="truncate"
          :class="!displayText && 'text-muted-foreground'"
        >
          {{ displayText || placeholder }}
        </span>

        <span class="ml-2 flex shrink-0 items-center gap-1">
          <span
            v-if="clearable && modelValue != null"
            class="flex items-center rounded-sm p-0.5 opacity-60 hover:bg-accent hover:opacity-100"
            @click.stop="handleClear"
          >
            <XIcon class="size-3.5" />
          </span>
          <ChevronsUpDownIcon class="size-4 opacity-50" />
        </span>
      </Button>
    </component>

    <!-- 移动端：底部抽屉，单列逐级下钻 -->
    <SheetContent v-if="isMobile" side="bottom" class="max-h-[75vh] rounded-t-xl p-0">
      <SheetHeader class="border-b px-4 py-3 pr-12 text-left">
        <div class="flex items-center gap-2">
          <Button
            v-if="mobileLevel > 0"
            variant="ghost"
            size="icon"
            class="size-7"
            @click="mobileBack"
          >
            <ArrowLeftIcon class="size-4" />
          </Button>
          <SheetTitle class="text-base">
            {{ mobileTitle }}
          </SheetTitle>
          <Button
            v-if="changeOnSelect && mobileLevel > 0"
            variant="outline"
            size="sm"
            class="ml-auto h-7 text-xs"
            @click="mobileSelectCurrent"
          >
            {{ selectCurrentText }}
          </Button>
        </div>
        <SheetDescription class="sr-only">
          选择层级
        </SheetDescription>
      </SheetHeader>

      <div class="max-h-[60vh] overflow-y-auto p-1 pb-4">
        <button
          v-for="option in mobileOptions"
          :key="String(option.value)"
          type="button"
          :disabled="option.disabled"
          class="flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2.5 text-left text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          :class="isMobileSelected(option) && 'bg-accent font-medium'"
          @click="handleMobileSelect(option)"
        >
          <span class="truncate">{{ option.label }}</span>
          <span class="flex shrink-0 items-center gap-2">
            <CheckIcon
              v-if="isMobileSelected(option)"
              class="size-4 text-primary"
            />
            <ChevronRightIcon
              v-if="option.children?.length"
              class="size-4 text-muted-foreground"
            />
          </span>
        </button>

        <div v-if="!mobileOptions.length" class="py-6 text-center text-sm text-muted-foreground">
          {{ emptyText }}
        </div>
      </div>
    </SheetContent>

    <PopoverContent v-else class="w-auto max-w-none p-0" align="start">
      <div v-if="searchable" class="flex items-center gap-2 border-b px-3 py-2">
        <SearchIcon class="size-4 shrink-0 opacity-50" />
        <Input
          ref="searchInputRef"
          v-model="searchQuery"
          :placeholder="searchPlaceholder"
          class="h-8 w-40 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>

      <!-- 搜索结果：平铺完整路径（仅 searchable 时出现） -->
      <div v-if="searchQuery.trim()" class="max-h-[300px] w-72 overflow-y-auto p-1">
        <template v-if="searchResults.length">
          <button
            v-for="(path, index) in searchResults"
            :key="index"
            type="button"
            class="flex w-full flex-col items-start gap-0.5 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
            @click="selectPath(path)"
          >
            <span class="w-full truncate font-medium">
              {{ path[path.length - 1]?.label }}
            </span>
            <span class="w-full truncate text-xs text-muted-foreground">
              {{ path.map(option => option.label).join(separator) }}
            </span>
          </button>
        </template>
        <div v-else class="py-6 text-center text-sm text-muted-foreground">
          {{ emptyText }}
        </div>
      </div>

      <!-- 级联列：点击/悬停展开右侧下一列；宽度由内容决定，首列保持窄 -->
      <div v-else class="inline-flex max-h-[300px] max-w-[calc(100vw-2rem)] overflow-x-auto">
        <div
          v-for="(column, columnIndex) in columns"
          :key="columnIndex"
          class="min-w-[140px] max-h-[300px] overflow-y-auto border-r last:border-r-0"
        >
          <button
            v-for="option in column.options"
            :key="String(option.value)"
            type="button"
            :disabled="option.disabled"
            class="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            :class="[
              isSelected(option, column.path) && 'bg-accent font-medium',
              !isSelected(option, column.path)
                && isActive(option, column.path)
                && 'bg-accent/70 font-medium ring-1 ring-inset ring-primary/30',
              !isSelected(option, column.path)
                && !isActive(option, column.path)
                && isInActivePath(option, column.path)
                && 'bg-muted/40',
            ]"
            @click="handleOptionClick(option, column.path)"
            @mouseenter="handleOptionHover(option, column.path)"
          >
            <span class="truncate">{{ option.label }}</span>
            <span class="flex shrink-0 items-center gap-1">
              <CheckIcon
                v-if="isSelected(option, column.path)"
                class="size-3.5 text-primary"
              />
              <ChevronRightIcon
                v-if="option.children?.length"
                class="size-3.5 text-muted-foreground"
              />
            </span>
          </button>
        </div>
      </div>

      <div v-if="showSelectCurrent" class="border-t p-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="w-full justify-start"
          @click="selectActivePath"
        >
          <CheckIcon class="mr-2 size-4 shrink-0" />
          <span class="truncate">
            {{ selectCurrentText }}<template v-if="activeOption">：{{ activeOption.label }}</template>
          </span>
        </Button>
      </div>
    </PopoverContent>
  </component>
</template>

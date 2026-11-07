<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDownIcon } from '@lucide/vue'
import DynamicIcon from '@/components/dynamic-Icon.vue'
import { LUCIDE_ICON_NAMES } from '@/utils/lucide-icons'

defineOptions({ name: 'IconPicker' })

const props = withDefaults(defineProps<{
  modelValue?: string
}>(), {
  modelValue: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const open = ref(false)
const search = ref('')

const filteredIcons = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return LUCIDE_ICON_NAMES
  return LUCIDE_ICON_NAMES.filter((name) => name.includes(q))
})

// 无搜索时图标数量庞大，限制渲染数量，提示用户用关键字缩小范围
const MAX_DISPLAY = 300
const displayedIcons = computed(() => filteredIcons.value.slice(0, MAX_DISPLAY))

function select(name: string) {
  emit('update:modelValue', name)
  open.value = false
}

function clear() {
  emit('update:modelValue', '')
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <button
      type="button"
      class="border-input flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3"
      @click="open = true"
    >
      <span class="flex min-w-0 items-center gap-2">
        <DynamicIcon v-if="modelValue" :name="modelValue" class="size-4 shrink-0" />
        <span v-if="modelValue" class="truncate">{{ modelValue }}</span>
        <span v-else class="text-muted-foreground">选择图标</span>
      </span>
      <ChevronDownIcon class="text-muted-foreground size-4 shrink-0" />
    </button>

    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>选择图标</DialogTitle>
        <DialogDescription>点击图标即可选中，支持按名称搜索。</DialogDescription>
      </DialogHeader>

      <div class="space-y-3">
        <Input v-model="search" placeholder="搜索图标，如 folder / home / settings" />

        <div class="h-[55vh] overflow-y-auto rounded-md border p-3">
          <div
            v-if="displayedIcons.length"
            class="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1"
          >
            <button
              v-for="name in displayedIcons"
              :key="name"
              type="button"
              class="text-muted-foreground hover:bg-accent hover:text-foreground flex aspect-square items-center justify-center rounded-md border border-transparent transition-colors"
              :class="{ 'border-primary bg-accent text-foreground': name === modelValue }"
              :title="name"
              @click="select(name)"
            >
              <DynamicIcon :name="name" class="size-5" />
            </button>
          </div>
          <p v-else class="text-muted-foreground py-10 text-center text-sm">未找到匹配的图标</p>
        </div>

        <p class="text-muted-foreground text-xs">
          共 {{ filteredIcons.length }} 个图标
          <template v-if="filteredIcons.length > MAX_DISPLAY">（输入关键字缩小范围）</template>
        </p>
      </div>

      <div class="flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" :disabled="!modelValue" @click="clear">
          清除
        </Button>
        <Button type="button" variant="outline" size="sm" @click="open = false">
          关闭
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

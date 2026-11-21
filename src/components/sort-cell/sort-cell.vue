<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { toast } from 'vue-sonner'
import { Input } from '@/components/ui/input'
import type { SortUpdateFn } from './types'

const props = withDefaults(defineProps<{
  id: string | number
  value: number
  /** 当前页面配置的排序保存接口 */
  update: SortUpdateFn
  min?: number
  disabled?: boolean
  successMessage?: string
  invalidMessage?: string
  hint?: string
}>(), {
  min: 0,
  disabled: false,
  successMessage: '排序修改成功',
  invalidMessage: '排序值必须为大于等于 0 的整数',
  hint: '点击修改排序',
})

const emit = defineEmits<{
  (e: 'saved', value: number): void
}>()

const editing = ref(false)
const saving = ref(false)
const draft = ref(0)
const inputRef = ref<any>(null)

function beginEdit() {
  if (props.disabled || saving.value) return
  draft.value = props.value
  editing.value = true
  nextTick(() => {
    const input = inputRef.value?.$el as HTMLInputElement | undefined
    input?.focus()
    input?.select()
  })
}

function cancelEdit() {
  if (saving.value) return
  editing.value = false
}

async function commit() {
  if (!editing.value || saving.value) return

  const value = Number(draft.value)
  if (!Number.isInteger(value) || value < props.min) {
    toast.error(props.invalidMessage)
    return
  }

  if (value === props.value) {
    editing.value = false
    return
  }

  saving.value = true
  try {
    await props.update({ id: props.id, sort: value })
    toast.success(props.successMessage)
    editing.value = false
    emit('saved', value)
  } catch (e) {
    toast.error(e instanceof Error ? e.message : String(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex justify-end">
    <Input
      v-if="editing"
      ref="inputRef"
      v-model.number="draft"
      type="number"
      :min="min"
      step="1"
      class="h-7 w-16 px-1 text-right text-sm"
      :disabled="saving"
      :aria-label="hint"
      @keydown.enter.prevent="commit"
      @keydown.esc.prevent="cancelEdit"
      @blur="commit"
    />
    <button
      v-else
      type="button"
      class="ml-auto block text-right text-sm tabular-nums text-muted-foreground transition-colors hover:text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="disabled"
      :title="hint"
      @click="beginEdit"
    >
      {{ value }}
    </button>
  </div>
</template>

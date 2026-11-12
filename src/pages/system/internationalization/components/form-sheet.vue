<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createLanguageApi, updateLanguageApi } from '@/api/i18n/i18n'
import type { LanguageSavePayload } from '@/api/i18n/types'
import { usePageText } from '../use-page-text'
import type { LanguageNode, ParentOption } from '../data'

defineOptions({ name: 'LanguageFormSheet' })

const props = defineProps<{
  open: boolean
  node: LanguageNode | null
  parentOptions: ParentOption[]
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'submitted'): void
}>()

const { tr } = usePageText()
const isEdit = computed(() => !!props.node)
const saving = ref(false)

// 列表接口可能不返回 remark；此时编辑不改动备注，避免用空字符串覆盖原值
const remarkAvailable = computed(() => !isEdit.value || props.node?.remark !== undefined)

interface LanguageFormValues {
  parentId: number
  name: string
  sort: number
  zhCN: string
  enUS: string
  jaJP: string
  zhTW: string
  remark: string
}

function toFormValues(node: LanguageNode | null): LanguageFormValues {
  return {
    parentId: node?.parentId ?? 0,
    name: node?.name ?? '',
    sort: node?.sort ?? 0,
    zhCN: node?.zhCN ?? '',
    enUS: node?.enUS ?? '',
    jaJP: node?.jaJP ?? '',
    zhTW: node?.zhTW ?? '',
    remark: node?.remark ?? '',
  }
}

const parentOptionsWithRoot = computed(() => [
  { id: 0, name: tr('pages.system.internationalization.root', '根节点'), depth: 0 },
  ...props.parentOptions.map(option => ({
    ...option,
    name: `${'\u3000'.repeat(option.depth)}${option.name}`,
  })),
])

const form = useForm({
  defaultValues: toFormValues(null),
  onSubmit: async ({ value }) => {
    const name = value.name.trim()
    if (!name) {
      toast.error(tr('pages.system.internationalization.nameRequired', '请输入词条名称'))
      return
    }
    if (name.includes('.')) {
      toast.error(tr('pages.system.internationalization.nameDot', '词条名称不能包含 "."'))
      return
    }

    const payload: LanguageSavePayload = {
      parentId: value.parentId,
      sort: Number(value.sort) || 0,
      name,
      zhCN: value.zhCN.trim(),
      enUS: value.enUS.trim(),
      jaJP: value.jaJP.trim(),
      zhTW: value.zhTW.trim(),
    }

    if (remarkAvailable.value) {
      payload.remark = value.remark.trim()
    }

    if (isEdit.value && props.node) {
      payload.id = Number(props.node.id)
    }

    saving.value = true
    try {
      if (isEdit.value) {
        await updateLanguageApi(payload)
        toast.success(tr('pages.system.internationalization.saveSuccess', '保存成功'))
      } else {
        await createLanguageApi(payload)
        toast.success(tr('pages.system.internationalization.createSuccess', '新增成功'))
      }
      emit('submitted')
      emit('update:open', false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e))
    } finally {
      saving.value = false
    }
  },
})

// 打开抽屉或切换编辑目标时，用对应数据重置表单
watch(
  () => [props.open, props.node] as const,
  () => {
    if (props.open) {
      form.reset(toFormValues(props.node))
    }
  },
  { immediate: true },
)
</script>

<template>
  <Sheet :open="open" @update:open="(v: boolean) => emit('update:open', v)">
    <SheetContent side="right" class="sm:max-w-lg">
      <form
        class="flex h-full flex-col"
        @submit.prevent="form.handleSubmit()"
      >
        <SheetHeader>
          <SheetTitle>
            {{ isEdit
              ? tr('pages.system.internationalization.editTitle', '编辑词条')
              : tr('pages.system.internationalization.createTitle', '新增词条') }}
          </SheetTitle>
          <SheetDescription>
            {{ isEdit
              ? tr('pages.system.internationalization.editDescription', '修改词条信息，保存后立即生效。')
              : tr('pages.system.internationalization.createDescription', '填写词条信息，创建新的多语言词条。') }}
          </SheetDescription>
        </SheetHeader>

        <div class="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="language-form-parent">
                {{ tr('global.form.parent_id', '父级') }}
              </Label>
              <form.Field name="parentId" v-slot="{ field }">
                <Select
                  :model-value="field.state.value"
                  :disabled="isEdit"
                  @update:model-value="(v) => field.handleChange(Number(v))"
                >
                  <SelectTrigger id="language-form-parent" class="w-full">
                    <SelectValue :placeholder="tr('pages.system.internationalization.parentPlaceholder', '请选择父级')" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="option in parentOptionsWithRoot"
                      :key="option.id"
                      :value="option.id"
                    >
                      {{ option.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </form.Field>
            </div>

            <div class="space-y-2">
              <Label for="language-form-sort">
                {{ tr('global.table.sort', '排序') }}
              </Label>
              <form.Field name="sort" v-slot="{ field }">
                <Input
                  id="language-form-sort"
                  type="number"
                  :model-value="field.state.value"
                  @update:model-value="(v) => field.handleChange(v === '' ? 0 : Number(v))"
                />
              </form.Field>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="language-form-name">
              {{ tr('pages.system.internationalization.name', '国际化字段') }}
            </Label>
            <form.Field name="name" v-slot="{ field }">
              <Input
                id="language-form-name"
                :model-value="field.state.value"
                :placeholder="tr('pages.system.internationalization.namePlaceholder', '如：menu-management')"
                @update:model-value="(v) => field.handleChange(v as string)"
              />
            </form.Field>
          </div>

          <div class="space-y-3 rounded-md border p-3">
            <p class="text-sm font-medium">
              {{ tr('pages.system.internationalization.translations', '多语言文案') }}
            </p>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="language-form-zh-cn">
                  {{ tr('pages.system.internationalization.zh-CN', '简体中文') }}
                </Label>
                <form.Field name="zhCN" v-slot="{ field }">
                  <Textarea
                    id="language-form-zh-cn"
                    :model-value="field.state.value"
                    rows="2"
                    @update:model-value="(v) => field.handleChange(v as string)"
                  />
                </form.Field>
              </div>
              <div class="space-y-2">
                <Label for="language-form-en-us">
                  {{ tr('pages.system.internationalization.en-US', 'English') }}
                </Label>
                <form.Field name="enUS" v-slot="{ field }">
                  <Textarea
                    id="language-form-en-us"
                    :model-value="field.state.value"
                    rows="2"
                    @update:model-value="(v) => field.handleChange(v as string)"
                  />
                </form.Field>
              </div>
              <div class="space-y-2">
                <Label for="language-form-ja-jp">
                  {{ tr('pages.system.internationalization.ja-JP', '日本語') }}
                </Label>
                <form.Field name="jaJP" v-slot="{ field }">
                  <Textarea
                    id="language-form-ja-jp"
                    :model-value="field.state.value"
                    rows="2"
                    @update:model-value="(v) => field.handleChange(v as string)"
                  />
                </form.Field>
              </div>
              <div class="space-y-2">
                <Label for="language-form-zh-tw">
                  {{ tr('pages.system.internationalization.zh-TW', '繁體中文') }}
                </Label>
                <form.Field name="zhTW" v-slot="{ field }">
                  <Textarea
                    id="language-form-zh-tw"
                    :model-value="field.state.value"
                    rows="2"
                    @update:model-value="(v) => field.handleChange(v as string)"
                  />
                </form.Field>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="language-form-remark">
              {{ tr('pages.system.internationalization.remark', '备注') }}
            </Label>
            <form.Field name="remark" v-slot="{ field }">
              <Textarea
                id="language-form-remark"
                :model-value="field.state.value"
                rows="2"
                :disabled="!remarkAvailable"
                @update:model-value="(v) => field.handleChange(v as string)"
              />
            </form.Field>
            <p v-if="!remarkAvailable" class="text-xs text-muted-foreground">
              {{ tr('pages.system.internationalization.remarkUnavailable', '列表未返回备注，保存时保持原值不变。') }}
            </p>
          </div>
        </div>

        <SheetFooter class="flex-row justify-end">
          <Button
            type="button"
            variant="outline"
            :disabled="saving"
            @click="emit('update:open', false)"
          >
            {{ tr('pages.system.internationalization.cancel', '取消') }}
          </Button>
          <Button type="submit" :disabled="saving">
            {{ saving
              ? tr('pages.system.internationalization.saving', '保存中…')
              : tr('pages.system.internationalization.save', '保存') }}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>

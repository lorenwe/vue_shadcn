<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import Cascader from '@/components/cascader/cascader.vue'
import type { CascaderOption } from '@/components/cascader/types'
import {
  createAdminApiApi,
  updateAdminApiApi,
} from '@/api/system/api-management/admin-api'
import type {
  AdminApiSavePayload,
  AdminApiType,
} from '@/api/system/api-management/types'
import { usePageText } from '../use-page-text'
import type { AdminApiNode } from '../data'

defineOptions({ name: 'AdminApiFormSheet' })

const props = defineProps<{
  open: boolean
  node: AdminApiNode | null
  parentTree: CascaderOption[]
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'submitted'): void
}>()

const { tr } = usePageText()

const isEdit = computed(() => !!props.node)
const isEditDir = computed(() => isEdit.value && form.apiType === 'dir')
const showApiFields = computed(() => form.apiType === 'api')

interface FormValues {
  parentId: number
  apiName: string
  apiType: AdminApiType
  apiPath: string
  method: string
  sort: number
}

const form = reactive<FormValues>({
  parentId: 0,
  apiName: '',
  apiType: 'dir',
  apiPath: '',
  method: 'POST',
  sort: 0,
})

const saving = ref(false)

const methodOptions = computed(() => {
  const standard = ['POST', 'GET', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
  return form.method && !standard.includes(form.method)
    ? [form.method, ...standard]
    : standard
})

const treeData = computed<CascaderOption[]>(() => [
  { value: 0, label: tr('pages.system.api-management.root', '根节点') },
  ...props.parentTree,
])

function toFormValues(node: AdminApiNode | null): FormValues {
  return {
    parentId: node?.parentId ?? 0,
    apiName: node?.api_name ?? '',
    apiType: node?.api_type === 'api' ? 'api' : 'dir',
    apiPath: node?.api_path ?? '',
    method: node?.method ?? 'POST',
    sort: node?.sort ?? 0,
  }
}

function resetForm() {
  Object.assign(form, toFormValues(props.node))
}

watch(
  () => [props.open, props.node] as const,
  () => {
    if (props.open) resetForm()
  },
  { immediate: true },
)

function close() {
  emit('update:open', false)
}

async function submit() {
  const apiName = form.apiName.trim()
  if (!apiName) {
    toast.error(tr('pages.system.api-management.nameRequired', '请输入接口名称'))
    return
  }

  const apiPath = form.apiPath.trim()
  if (form.apiType === 'api' && !apiPath) {
    toast.error(tr('pages.system.api-management.pathRequired', '请输入接口地址'))
    return
  }

  const payload: AdminApiSavePayload = {
    parent_id: form.parentId,
    api_name: apiName,
    api_type: form.apiType,
    sort: Number(form.sort) || 0,
  }

  if (form.apiType === 'api') {
    payload.api_path = apiPath
    payload.method = form.method
  }

  if (isEdit.value && props.node) {
    payload.id = Number(props.node.id)
  }

  saving.value = true
  try {
    if (isEdit.value) {
      await updateAdminApiApi(payload)
      toast.success(tr('pages.system.api-management.saveSuccess', '保存成功'))
    } else {
      await createAdminApiApi(payload)
      toast.success(tr('pages.system.api-management.createSuccess', '新增成功'))
    }
    emit('submitted')
    close()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : String(e))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Sheet :open="open" @update:open="(v: boolean) => emit('update:open', v)">
    <SheetContent side="right" class="sm:max-w-lg">
      <form class="flex h-full flex-col" @submit.prevent="submit">
        <SheetHeader>
          <SheetTitle>
            {{ isEdit
              ? tr('pages.system.api-management.editTitle', '编辑接口')
              : tr('pages.system.api-management.createTitle', '新增接口') }}
          </SheetTitle>
          <SheetDescription>
            {{ isEditDir
              ? tr('pages.system.api-management.editDirDescription', '目录类型仅支持修改名称。')
              : isEdit
                ? tr('pages.system.api-management.editDescription', '修改接口信息，保存后立即生效。')
                : tr('pages.system.api-management.createDescription', '填写接口信息，创建新的接口或目录。') }}
          </SheetDescription>
        </SheetHeader>

        <div class="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
          <div v-if="!isEditDir" class="space-y-2">
            <Label for="admin-api-form-parent">
              {{ tr('global.form.parent_id', '父级') }}
            </Label>
            <Cascader
              :model-value="form.parentId"
              :options="treeData"
              :disabled="isEditDir"
              :clearable="false"
              :show-path="false"
              change-on-select
              expand-trigger="click"
              :placeholder="tr('pages.system.api-management.parentPlaceholder', '请选择父级')"
              :search-placeholder="tr('pages.system.api-management.searchNode', '搜索节点...')"
              :empty-text="tr('pages.system.api-management.emptyNode', '未找到匹配节点')"
              :select-current-text="tr('pages.system.api-management.selectCurrent', '选择当前')"
              @update:model-value="(v) => form.parentId = Number(v ?? 0)"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="admin-api-form-name">
                {{ tr('pages.system.api-management.api_name', '接口名称') }}
              </Label>
              <Input
                id="admin-api-form-name"
                v-model="form.apiName"
                :placeholder="tr('pages.system.api-management.namePlaceholder', '请输入接口名称')"
              />
            </div>

            <div class="space-y-2">
              <Label>{{ tr('pages.system.api-management.api_type', '接口类型') }}</Label>
              <Select
                :model-value="form.apiType"
                :disabled="isEdit"
                @update:model-value="(v) => form.apiType = String(v) as AdminApiType"
              >
                <SelectTrigger class="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dir">
                    {{ tr('pages.system.api-management.api_type.dir', '目录') }}
                  </SelectItem>
                  <SelectItem value="api">
                    {{ tr('pages.system.api-management.api_type.api', '接口') }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div v-if="showApiFields" class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>{{ tr('pages.system.api-management.method', '请求方式') }}</Label>
              <Select v-model="form.method">
                <SelectTrigger class="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="method in methodOptions" :key="method" :value="method">
                    {{ method }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label for="admin-api-form-path">
                {{ tr('pages.system.api-management.api_path', '接口地址') }}
              </Label>
              <Input
                id="admin-api-form-path"
                v-model="form.apiPath"
                placeholder="/admin/api/list"
              />
            </div>
          </div>

          <div v-if="!isEditDir" class="space-y-2">
            <Label for="admin-api-form-sort">
              {{ tr('global.table.sort', '排序') }}
            </Label>
            <Input
              id="admin-api-form-sort"
              v-model.number="form.sort"
              type="number"
              min="0"
            />
          </div>

          <p v-if="isEditDir" class="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {{ tr('pages.system.api-management.dirOnlyName', '目录类型只能修改名称，其他字段不可编辑。') }}
          </p>
        </div>

        <SheetFooter class="flex-row justify-end">
          <Button type="button" variant="outline" :disabled="saving" @click="close">
            {{ tr('pages.system.api-management.cancel', '取消') }}
          </Button>
          <Button type="submit" :disabled="saving">
            {{ saving
              ? tr('pages.system.api-management.saving', '保存中…')
              : tr('pages.system.api-management.save', '保存') }}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>

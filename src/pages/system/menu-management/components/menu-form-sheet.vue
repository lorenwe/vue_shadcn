<script setup lang="ts">
import { computed, watch } from 'vue'
import { useForm } from '@tanstack/vue-form'
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
import type { MenuListItem } from '@/api/menu/types'
import type { FocusOutsideEvent, PointerDownOutsideEvent } from 'reka-ui'
import IconPicker from '@/components/icon-picker.vue'

defineOptions({ name: 'MenuFormSheet' })

const props = defineProps<{
  open: boolean
  menu: MenuListItem | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'submitted'): void
}>()

const isEdit = computed(() => !!props.menu)

// 点击抽屉外部（遮罩/页面）不关闭，仅通过「取消/保存」按钮关闭
function preventOutsideClose(event: PointerDownOutsideEvent | FocusOutsideEvent) {
  event.preventDefault()
}

/** 表单字段与后端 sys_menu 表对齐（翻译字段由 language_id 指向的语言表存储） */
interface MenuFormValues {
  parent_id: number
  menu_type: string
  menu_api: string
  component: string
  path: string
  icon: string
  permission: string
  sort: number
  status: number
  redirect: string
  target: string
  language_id?: number
  'en-US': string
  'ja-JP': string
  'zh-CN': string
  'zh-TW': string
}

function toFormValues(item: MenuListItem | null): MenuFormValues {
  return {
    parent_id: item?.parent_id ?? 0,
    menu_type: item?.menu_type ?? 'menu',
    menu_api: item?.menu_api ?? '',
    component: item?.component ?? '',
    path: item?.path ?? '',
    icon: item?.icon ?? '',
    permission: item?.permission ?? '',
    sort: item?.sort ?? 0,
    status: item?.status ?? 1,
    redirect: item?.redirect ?? '',
    target: item?.target ?? '',
    language_id: item?.language_id ?? undefined,
    'en-US': item?.['en-US'] ?? '',
    'ja-JP': item?.['ja-JP'] ?? '',
    'zh-CN': item?.['zh-CN'] ?? '',
    'zh-TW': item?.['zh-TW'] ?? '',
  }
}

const form = useForm({
  defaultValues: toFormValues(null),
  onSubmit: async ({ value }) => {
    // 组装提交数据：菜单表字段 + 翻译字段（编辑时带上主键 id，用于更新）
    const payload = {
      ...value,
      ...(isEdit.value && props.menu?.id ? { id: props.menu.id } : {}),
    }

    // TODO: 调用后端新增/编辑接口，替换为真实的 create/update 请求
    toast(isEdit.value ? '编辑菜单' : '新增菜单', {
      description: JSON.stringify(payload, null, 2),
    })
    emit('submitted')
    emit('update:open', false)
  },
})

// 打开抽屉（或切换编辑目标）时，用对应数据重置表单
watch(
  () => [props.open, props.menu] as const,
  () => {
    if (props.open) {
      form.reset(toFormValues(props.menu))
    }
  },
)

const menuTypeOptions = [
  { value: 'dir', label: '目录' },
  { value: 'menu', label: '菜单' },
  { value: 'button', label: '按钮' },
]

const statusOptions = [
  { value: 1, label: '启用' },
  { value: 0, label: '禁用' },
]
</script>

<template>
  <Sheet :open="open" @update:open="(v: boolean) => emit('update:open', v)">
    <SheetContent side="right" class="sm:max-w-lg" @interact-outside="preventOutsideClose">
      <form
        class="flex h-full flex-col"
        @submit.prevent="form.handleSubmit()"
      >
        <SheetHeader>
          <SheetTitle>{{ isEdit ? '编辑菜单' : '新增菜单' }}</SheetTitle>
          <SheetDescription>
            {{ isEdit ? '修改菜单信息，保存后立即生效。' : '填写菜单信息，创建新的菜单项。' }}
          </SheetDescription>
        </SheetHeader>

        <div class="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="menu-form-type">菜单类型</Label>
              <form.Field name="menu_type" v-slot="{ field }">
                <Select
                  :model-value="field.state.value"
                  @update:model-value="(v) => field.handleChange(v as string)"
                >
                  <SelectTrigger id="menu-form-type" class="w-full">
                    <SelectValue placeholder="请选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="opt in menuTypeOptions"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </form.Field>
            </div>

            <div class="space-y-2">
              <Label for="menu-form-parent">父级 ID</Label>
              <form.Field name="parent_id" v-slot="{ field }">
                <Input
                  id="menu-form-parent"
                  type="number"
                  :model-value="field.state.value"
                  placeholder="0 表示顶级菜单"
                  @update:model-value="(v) => field.handleChange(v === '' ? 0 : Number(v))"
                />
              </form.Field>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="menu-form-path">路由地址</Label>
              <form.Field name="path" v-slot="{ field }">
                <Input
                  id="menu-form-path"
                  :model-value="field.state.value"
                  placeholder="/system/menu-management"
                  @update:model-value="(v) => field.handleChange(v as string)"
                />
              </form.Field>
            </div>

            <div class="space-y-2">
              <Label for="menu-form-redirect">重定向</Label>
              <form.Field name="redirect" v-slot="{ field }">
                <Input
                  id="menu-form-redirect"
                  :model-value="field.state.value"
                  placeholder="/system/menu-management/list"
                  @update:model-value="(v) => field.handleChange(v as string)"
                />
              </form.Field>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="menu-form-component">组件</Label>
              <form.Field name="component" v-slot="{ field }">
                <Input
                  id="menu-form-component"
                  :model-value="field.state.value"
                  placeholder="system/menu-management/index"
                  @update:model-value="(v) => field.handleChange(v as string)"
                />
              </form.Field>
            </div>

            <div class="space-y-2">
              <Label for="menu-form-api">菜单依赖接口</Label>
              <form.Field name="menu_api" v-slot="{ field }">
                <Input
                  id="menu-form-api"
                  :model-value="field.state.value"
                  placeholder="POST:/menu/list"
                  @update:model-value="(v) => field.handleChange(v as string)"
                />
              </form.Field>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="menu-form-permission">权限标识</Label>
              <form.Field name="permission" v-slot="{ field }">
                <Input
                  id="menu-form-permission"
                  :model-value="field.state.value"
                  placeholder="system:menu-management"
                  @update:model-value="(v) => field.handleChange(v as string)"
                />
              </form.Field>
            </div>

            <div class="space-y-2">
              <Label for="menu-form-icon">图标</Label>
              <form.Field name="icon" v-slot="{ field }">
                <IconPicker
                  :model-value="field.state.value"
                  @update:model-value="(v) => field.handleChange(v as string)"
                />
              </form.Field>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="menu-form-sort">排序</Label>
              <form.Field name="sort" v-slot="{ field }">
                <Input
                  id="menu-form-sort"
                  type="number"
                  :model-value="field.state.value"
                  @update:model-value="(v) => field.handleChange(v === '' ? 0 : Number(v))"
                />
              </form.Field>
            </div>

            <div class="space-y-2">
              <Label for="menu-form-status">状态</Label>
              <form.Field name="status" v-slot="{ field }">
                <Select
                  :model-value="field.state.value"
                  @update:model-value="(v) => field.handleChange(Number(v))"
                >
                  <SelectTrigger id="menu-form-status" class="w-full">
                    <SelectValue placeholder="请选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="opt in statusOptions"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </form.Field>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="menu-form-target">窗口打开方式</Label>
            <form.Field name="target" v-slot="{ field }">
              <Input
                id="menu-form-target"
                :model-value="field.state.value"
                placeholder="_self / _blank"
                @update:model-value="(v) => field.handleChange(v as string)"
              />
            </form.Field>
          </div>

          <div class="space-y-3 rounded-md border p-3">
            <p class="text-sm font-medium">多语言名称</p>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="menu-form-zh-cn">简体中文 (zh-CN)</Label>
                <form.Field name="zh-CN" v-slot="{ field }">
                  <Input
                    id="menu-form-zh-cn"
                    :model-value="field.state.value"
                    @update:model-value="(v) => field.handleChange(v as string)"
                  />
                </form.Field>
              </div>
              <div class="space-y-2">
                <Label for="menu-form-zh-tw">繁體中文 (zh-TW)</Label>
                <form.Field name="zh-TW" v-slot="{ field }">
                  <Input
                    id="menu-form-zh-tw"
                    :model-value="field.state.value"
                    @update:model-value="(v) => field.handleChange(v as string)"
                  />
                </form.Field>
              </div>
              <div class="space-y-2">
                <Label for="menu-form-en-us">English (en-US)</Label>
                <form.Field name="en-US" v-slot="{ field }">
                  <Input
                    id="menu-form-en-us"
                    :model-value="field.state.value"
                    @update:model-value="(v) => field.handleChange(v as string)"
                  />
                </form.Field>
              </div>
              <div class="space-y-2">
                <Label for="menu-form-ja-jp">日本語 (ja-JP)</Label>
                <form.Field name="ja-JP" v-slot="{ field }">
                  <Input
                    id="menu-form-ja-jp"
                    :model-value="field.state.value"
                    @update:model-value="(v) => field.handleChange(v as string)"
                  />
                </form.Field>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter class="flex-row justify-end">
          <Button
            type="button"
            variant="outline"
            @click="emit('update:open', false)"
          >
            取消
          </Button>
          <Button type="submit">保存</Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>

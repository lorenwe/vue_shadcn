<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
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
import TreeCheckbox from '@/components/tree-node/tree-node.vue'
import type { TreeNode as TreeCheckboxNode } from '@/components/tree-node/types'
import {
  createRoleApi,
  updateRoleApi,
} from '@/api/system/role-management/role-api'
import type { RoleItem, RoleSavePayload } from '@/api/system/role-management/types'
import { usePageText } from '../use-page-text'

defineOptions({ name: 'RoleFormSheet' })

const props = defineProps<{
  open: boolean
  role: RoleItem | null
  menus: TreeCheckboxNode[]
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'submitted'): void
}>()

const { tr } = usePageText()
const isEdit = computed(() => !!props.role)
const saving = ref(false)

interface FormValues {
  roleName: string
  roleCode: string
  roleMenu: number[]
  sort: number
  status: number
  remark: string
}

const form = reactive<FormValues>({
  roleName: '',
  roleCode: '',
  roleMenu: [],
  sort: 0,
  status: 1,
  remark: '',
})

function resetForm() {
  form.roleName = props.role?.role_name ?? ''
  form.roleCode = props.role?.role_code ?? ''
  form.roleMenu = [...(props.role?.role_menu ?? [])]
  form.sort = props.role?.sort ?? 0
  form.status = props.role?.status === 0 ? 0 : 1
  form.remark = props.role?.remark ?? ''
}

watch(
  () => [props.open, props.role] as const,
  () => {
    if (props.open) resetForm()
  },
  { immediate: true },
)

function close() {
  emit('update:open', false)
}

async function submit() {
  const roleName = form.roleName.trim()
  const roleCode = form.roleCode.trim()

  if (!roleName) {
    toast.error(tr('pages.system.role-management.roleNameRequired', '请输入角色名称'))
    return
  }
  if (!roleCode) {
    toast.error(tr('pages.system.role-management.roleCodeRequired', '请输入角色代码'))
    return
  }
  if (!form.roleMenu.length) {
    toast.error(tr('pages.system.role-management.menuRequired', '请选择菜单权限'))
    return
  }

  const payload: RoleSavePayload = {
    role_name: roleName,
    role_code: roleCode,
    role_menu: [...form.roleMenu],
    sort: Number(form.sort) || 0,
    status: form.status,
    remark: form.remark.trim() || undefined,
  }

  if (isEdit.value && props.role) {
    payload.id = Number(props.role.id)
  }

  saving.value = true
  try {
    if (isEdit.value) {
      await updateRoleApi(payload)
      toast.success(tr('pages.system.role-management.saveSuccess', '保存成功'))
    } else {
      await createRoleApi(payload)
      toast.success(tr('pages.system.role-management.createSuccess', '新增成功'))
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
    <SheetContent
      side="right"
      class="sm:max-w-lg"
      @interact-outside="(event: Event) => event.preventDefault()"
    >
      <form class="flex h-full flex-col" @submit.prevent="submit">
        <SheetHeader>
          <SheetTitle>
            {{ isEdit
              ? tr('pages.system.role-management.editTitle', '编辑角色')
              : tr('pages.system.role-management.createTitle', '新增角色') }}
          </SheetTitle>
          <SheetDescription>
            {{ isEdit
              ? tr('pages.system.role-management.editDescription', '修改角色信息与菜单权限。')
              : tr('pages.system.role-management.createDescription', '填写角色信息并选择菜单权限。') }}
          </SheetDescription>
        </SheetHeader>

        <div class="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="role-form-name">
                {{ tr('pages.system.role-management.role_name', '角色名称') }}
              </Label>
              <Input
                id="role-form-name"
                v-model="form.roleName"
                :placeholder="tr('pages.system.role-management.roleNamePlaceholder', '请输入角色名称')"
              />
            </div>

            <div class="space-y-2">
              <Label for="role-form-code">
                {{ tr('pages.system.role-management.role_code', '角色代码') }}
              </Label>
              <Input
                id="role-form-code"
                v-model="form.roleCode"
                :placeholder="tr('pages.system.role-management.roleCodePlaceholder', '如：operator')"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="role-form-sort">
                {{ tr('global.table.sort', '排序') }}
              </Label>
              <Input
                id="role-form-sort"
                v-model.number="form.sort"
                type="number"
                min="0"
              />
            </div>

            <div class="space-y-2">
              <Label>{{ tr('global.status', '状态') }}</Label>
              <Select
                :model-value="String(form.status)"
                @update:model-value="(v) => form.status = String(v) === '0' ? 0 : 1"
              >
                <SelectTrigger class="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    {{ tr('global.status.enabled', '启用') }}
                  </SelectItem>
                  <SelectItem value="0">
                    {{ tr('global.status.disabled', '禁用') }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="role-form-remark">
              {{ tr('pages.system.role-management.remark', '备注') }}
            </Label>
            <Textarea
              id="role-form-remark"
              v-model="form.remark"
              rows="2"
              :placeholder="tr('pages.system.role-management.remarkPlaceholder', '请输入备注')"
            />
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label>{{ tr('pages.system.role-management.role_menu', '菜单权限') }}</Label>
              <span class="text-xs text-muted-foreground">
                {{ tr('pages.system.role-management.selectedCount', '已选 {count} 项').replace('{count}', String(form.roleMenu.length)) }}
              </span>
            </div>
            <TreeCheckbox
              :items="menus"
              :model-value="form.roleMenu"
              :check-all-text="tr('pages.system.role-management.checkAll', '全选')"
              :uncheck-all-text="tr('pages.system.role-management.uncheckAll', '取消全选')"
              :selected-text="tr('pages.system.role-management.selected', '已选')"
              :empty-text="tr('pages.system.role-management.emptyMenus', '暂无菜单数据')"
              @update:model-value="(value) => form.roleMenu = value.map(Number)"
            />
          </div>
        </div>

        <SheetFooter class="flex-row justify-end">
          <Button type="button" variant="outline" :disabled="saving" @click="close">
            {{ tr('pages.system.role-management.cancel', '取消') }}
          </Button>
          <Button type="submit" :disabled="saving">
            {{ saving
              ? tr('pages.system.role-management.saving', '保存中…')
              : tr('pages.system.role-management.save', '保存') }}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>

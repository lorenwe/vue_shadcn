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
  createUserApi,
  updateUserApi,
} from '@/api/system/user-management/user-api'
import type { UserItem, UserSavePayload } from '@/api/system/user-management/types'
import { usePageText } from '../use-page-text'

defineOptions({ name: 'UserFormSheet' })

const props = defineProps<{
  open: boolean
  user: UserItem | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'submitted'): void
}>()

const { tr } = usePageText()
const isEdit = computed(() => !!props.user)
const saving = ref(false)

interface FormValues {
  username: string
  password: string
  remark: string
  sort: number
}

const form = reactive<FormValues>({
  username: '',
  password: '',
  remark: '',
  sort: 0,
})

function resetForm() {
  form.username = props.user?.username ?? ''
  form.password = ''
  form.remark = props.user?.remark ?? ''
  form.sort = props.user?.sort ?? 0
}

watch(
  () => [props.open, props.user] as const,
  () => {
    if (props.open) resetForm()
  },
  { immediate: true },
)

function close() {
  emit('update:open', false)
}

async function submit() {
  const username = form.username.trim()
  const password = form.password.trim()
  const remark = form.remark.trim()

  if (!username) {
    toast.error(tr('pages.system.user-management.username.required', '请输入用户名'))
    return
  }
  if (username.length > 20) {
    toast.error(tr('pages.system.user-management.username.max', '用户名最多 20 个字符'))
    return
  }
  if (!isEdit.value && !password) {
    toast.error(tr('pages.system.user-management.password.required', '请输入密码'))
    return
  }
  if (password && password.length > 20) {
    toast.error(tr('pages.system.user-management.password.max', '密码最多 20 个字符'))
    return
  }

  const payload: UserSavePayload = {
    username,
    remark: remark || undefined,
    sort: Number(form.sort) || 0,
  }

  if (password) {
    payload.password = password
  }

  if (isEdit.value && props.user) {
    payload.id = Number(props.user.id)
  }

  saving.value = true
  try {
    if (isEdit.value) {
      await updateUserApi(payload)
      toast.success(tr('pages.system.user-management.saveSuccess', '保存成功'))
    } else {
      await createUserApi(payload)
      toast.success(tr('pages.system.user-management.createSuccess', '新增成功'))
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
              ? tr('pages.system.user-management.editTitle', '编辑用户')
              : tr('pages.system.user-management.createTitle', '新增用户') }}
          </SheetTitle>
          <SheetDescription>
            {{ isEdit
              ? tr('pages.system.user-management.editDescription', '修改用户信息，密码留空则保持不变。')
              : tr('pages.system.user-management.createDescription', '填写用户信息，创建新的后台用户。') }}
          </SheetDescription>
        </SheetHeader>

        <div class="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
          <div class="space-y-2">
            <Label for="user-form-username">
              {{ tr('pages.system.user-management.username', '用户名') }}
            </Label>
            <Input
              id="user-form-username"
              v-model="form.username"
              maxlength="20"
              autocomplete="username"
              :placeholder="tr('pages.system.user-management.username.placeholder', '请输入用户名')"
            />
          </div>

          <div class="space-y-2">
            <Label for="user-form-password">
              {{ tr('pages.system.user-management.password', '密码') }}
            </Label>
            <Input
              id="user-form-password"
              v-model="form.password"
              type="password"
              maxlength="20"
              autocomplete="new-password"
              :placeholder="isEdit
                ? tr('pages.system.user-management.password.keep', '留空则不修改密码')
                : tr('pages.system.user-management.password.placeholder', '请输入密码')"
            />
            <p v-if="isEdit" class="text-xs text-muted-foreground">
              {{ tr('pages.system.user-management.password.keepHint', '留空则保持原密码不变。') }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="user-form-remark">
              {{ tr('pages.system.user-management.remark', '备注') }}
            </Label>
            <Textarea
              id="user-form-remark"
              v-model="form.remark"
              rows="3"
              :placeholder="tr('pages.system.user-management.remark.placeholder', '请输入备注')"
            />
          </div>

          <div class="space-y-2">
            <Label for="user-form-sort">
              {{ tr('global.table.sort', '排序') }}
            </Label>
            <Input
              id="user-form-sort"
              v-model.number="form.sort"
              type="number"
              min="0"
            />
          </div>
        </div>

        <SheetFooter class="flex-row justify-end">
          <Button type="button" variant="outline" :disabled="saving" @click="close">
            {{ tr('pages.system.user-management.cancel', '取消') }}
          </Button>
          <Button type="submit" :disabled="saving">
            {{ saving
              ? tr('pages.system.user-management.saving', '保存中…')
              : tr('pages.system.user-management.save', '保存') }}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
